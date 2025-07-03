import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Request validation schema
const dependenciesQuerySchema = z.object({
  format: z.enum(['graph', 'tree', 'flat']).optional().default('graph'),
  include_optional: z.enum(['true', 'false']).optional().default('true'),
  stage_id: z.string().uuid().optional(),
});

// Cache configuration
const CACHE_DURATION = 60 * 15; // 15 minutes in seconds

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryParams = dependenciesQuerySchema.parse(Object.fromEntries(searchParams));
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Get user profile to check premium status
    let isPremiumUser = false;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', user.id)
        .single();
      
      isPremiumUser = profile?.is_verified || false;
    }

    // Fetch all journey stages
    const { data: stages, error: stagesError } = await supabase
      .from('journey_stages')
      .select(`
        id,
        stage_number,
        name,
        short_description,
        category,
        cost_avg_usd,
        duration_weeks_avg,
        is_premium_content,
        is_critical_path,
        display_order,
        complexity_score
      `)
      .order('display_order', { ascending: true });

    if (stagesError) {
      console.error('Stages fetch error:', stagesError);
      return NextResponse.json({ error: 'Failed to fetch stages' }, { status: 500 });
    }

    // Build dependencies query
    let dependenciesQuery = supabase
      .from('stage_dependencies')
      .select(`
        id,
        prerequisite_stage_id,
        dependent_stage_id,
        dependency_type,
        dependency_notes,
        prerequisite_stage:journey_stages!prerequisite_stage_id(
          id,
          stage_number,
          name,
          category,
          is_critical_path
        ),
        dependent_stage:journey_stages!dependent_stage_id(
          id,
          stage_number,
          name,
          category,
          is_critical_path
        )
      `);

    // Filter optional dependencies if requested
    if (queryParams.include_optional === 'false') {
      dependenciesQuery = dependenciesQuery.neq('dependency_type', 'optional');
    }

    // Filter by specific stage if requested
    if (queryParams.stage_id) {
      dependenciesQuery = dependenciesQuery.or(
        `prerequisite_stage_id.eq.${queryParams.stage_id},dependent_stage_id.eq.${queryParams.stage_id}`
      );
    }

    const { data: dependencies, error: depsError } = await dependenciesQuery;

    if (depsError) {
      console.error('Dependencies fetch error:', depsError);
      return NextResponse.json({ error: 'Failed to fetch dependencies' }, { status: 500 });
    }

    // Filter stages based on premium status
    const filteredStages = stages?.filter(stage => {
      // Show all stages to premium users, only non-premium to free users
      return isPremiumUser || !stage.is_premium_content;
    });

    // Build response based on requested format
    let responseData;

    switch (queryParams.format) {
      case 'tree':
        responseData = buildTreeFormat(filteredStages || [], dependencies || []);
        break;
      case 'flat':
        responseData = buildFlatFormat(filteredStages || [], dependencies || []);
        break;
      case 'graph':
      default:
        responseData = buildGraphFormat(filteredStages || [], dependencies || []);
        break;
    }

    // Calculate statistics
    const stats = calculateDependencyStats(filteredStages || [], dependencies || []);

    const response = {
      data: responseData,
      meta: {
        format: queryParams.format,
        total_stages: filteredStages?.length || 0,
        total_dependencies: dependencies?.length || 0,
        dependency_types: {
          blocking: dependencies?.filter(d => d.dependency_type === 'blocking').length || 0,
          parallel: dependencies?.filter(d => d.dependency_type === 'parallel').length || 0,
          optional: dependencies?.filter(d => d.dependency_type === 'optional').length || 0,
        },
        ...stats,
        is_premium_user: isPremiumUser,
        filters_applied: queryParams,
      },
    };

    // Set cache headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CACHE_DURATION}, s-maxage=${CACHE_DURATION}`,
    });

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to build graph format (nodes and edges)
function buildGraphFormat(stages: any[], dependencies: any[]) {
  const nodes = stages.map(stage => ({
    id: stage.id,
    stage_number: stage.stage_number,
    name: stage.name,
    category: stage.category,
    is_critical_path: stage.is_critical_path,
    complexity_score: stage.complexity_score,
    cost_avg_usd: stage.cost_avg_usd,
    duration_weeks_avg: stage.duration_weeks_avg,
  }));

  const edges = dependencies.map(dep => ({
    id: dep.id,
    source: dep.prerequisite_stage_id,
    target: dep.dependent_stage_id,
    type: dep.dependency_type,
    notes: dep.dependency_notes,
    is_critical: dep.prerequisite_stage?.is_critical_path && dep.dependent_stage?.is_critical_path,
  }));

  return { nodes, edges };
}

// Helper function to build tree format (hierarchical)
function buildTreeFormat(stages: any[], dependencies: any[]) {
  const stageMap = new Map(stages.map(s => [s.id, { ...s, children: [] }]));
  const rootStages: any[] = [];

  // Build dependency relationships
  dependencies.forEach(dep => {
    if (dep.dependency_type === 'blocking') {
      const prerequisite = stageMap.get(dep.prerequisite_stage_id);
      const dependent = stageMap.get(dep.dependent_stage_id);
      
      if (prerequisite && dependent) {
        prerequisite.children.push({
          ...dependent,
          dependency_type: dep.dependency_type,
          dependency_notes: dep.dependency_notes,
        });
      }
    }
  });

  // Find root stages (stages with no prerequisites)
  const dependentStageIds = new Set(dependencies
    .filter(d => d.dependency_type === 'blocking')
    .map(d => d.dependent_stage_id)
  );

  stages.forEach(stage => {
    if (!dependentStageIds.has(stage.id)) {
      rootStages.push(stageMap.get(stage.id));
    }
  });

  return rootStages;
}

// Helper function to build flat format (simple list with dependencies)
function buildFlatFormat(stages: any[], dependencies: any[]) {
  return stages.map(stage => {
    const stageDependencies = dependencies.filter(d => 
      d.dependent_stage_id === stage.id || d.prerequisite_stage_id === stage.id
    );

    const prerequisites = stageDependencies
      .filter(d => d.dependent_stage_id === stage.id)
      .map(d => ({
        stage_id: d.prerequisite_stage_id,
        stage_name: d.prerequisite_stage?.name,
        dependency_type: d.dependency_type,
        notes: d.dependency_notes,
      }));

    const dependents = stageDependencies
      .filter(d => d.prerequisite_stage_id === stage.id)
      .map(d => ({
        stage_id: d.dependent_stage_id,
        stage_name: d.dependent_stage?.name,
        dependency_type: d.dependency_type,
        notes: d.dependency_notes,
      }));

    return {
      ...stage,
      prerequisites,
      dependents,
      dependency_count: prerequisites.length + dependents.length,
    };
  });
}

// Helper function to calculate dependency statistics
function calculateDependencyStats(stages: any[], dependencies: any[]) {
  const criticalPathStages = stages.filter(s => s.is_critical_path);
  const totalCriticalCost = criticalPathStages.reduce((sum, s) => sum + (s.cost_avg_usd || 0), 0);
  const totalCriticalDuration = criticalPathStages.reduce((sum, s) => sum + (s.duration_weeks_avg || 0), 0);

  // Find stages with no dependencies (can start immediately)
  const dependentStageIds = new Set(dependencies.map(d => d.dependent_stage_id));
  const independentStages = stages.filter(s => !dependentStageIds.has(s.id));

  // Find stages with most dependencies
  const dependencyCount = stages.map(stage => {
    const count = dependencies.filter(d => 
      d.dependent_stage_id === stage.id || d.prerequisite_stage_id === stage.id
    ).length;
    return { stage_id: stage.id, stage_name: stage.name, dependency_count: count };
  }).sort((a, b) => b.dependency_count - a.dependency_count);

  return {
    critical_path: {
      stage_count: criticalPathStages.length,
      total_cost_usd: totalCriticalCost,
      total_duration_weeks: totalCriticalDuration,
    },
    independent_stages: independentStages.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
    })),
    most_connected_stages: dependencyCount.slice(0, 5),
    parallel_opportunities: dependencies.filter(d => d.dependency_type === 'parallel').length,
  };
} 