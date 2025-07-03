import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Request validation schema
const stageParamsSchema = z.object({
  id: z.string().uuid(),
});

// Cache configuration
const CACHE_DURATION = 60 * 10; // 10 minutes in seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Await and validate parameters
    const resolvedParams = await params;
    const { id } = stageParamsSchema.parse(resolvedParams);
    
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

    // Fetch stage details
    const { data: stage, error } = await supabase
      .from('journey_stages')
      .select(`
        id,
        stage_number,
        name,
        short_description,
        detailed_description,
        category,
        cost_min_usd,
        cost_avg_usd,
        cost_max_usd,
        cost_notes,
        duration_weeks_min,
        duration_weeks_avg,
        duration_weeks_max,
        duration_notes,
        seasonal_notes,
        risk_factors,
        required_permits,
        best_practices,
        common_mistakes,
        city_variations,
        regional_considerations,
        is_premium_content,
        is_critical_path,
        display_order,
        complexity_score,
        parent_stage_id,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch stage' }, { status: 500 });
    }

    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    // Get stage dependencies
    const { data: dependencies } = await supabase
      .from('stage_dependencies')
      .select(`
        id,
        dependency_type,
        dependency_notes,
        prerequisite_stage:journey_stages!prerequisite_stage_id(
          id,
          stage_number,
          name,
          category
        ),
        dependent_stage:journey_stages!dependent_stage_id(
          id,
          stage_number,
          name,
          category
        )
      `)
      .or(`prerequisite_stage_id.eq.${id},dependent_stage_id.eq.${id}`);

    // Get parent and child stages
    const { data: parentStage } = stage.parent_stage_id 
      ? await supabase
          .from('journey_stages')
          .select('id, stage_number, name, category')
          .eq('id', stage.parent_stage_id)
          .single()
      : { data: null };

    const { data: childStages } = await supabase
      .from('journey_stages')
      .select('id, stage_number, name, category, display_order')
      .eq('parent_stage_id', id)
      .order('display_order', { ascending: true });

    // Filter premium content for non-premium users
    const filteredStage = {
      ...stage,
      detailed_description: isPremiumUser ? stage.detailed_description : null,
      seasonal_notes: isPremiumUser ? stage.seasonal_notes : null,
      risk_factors: isPremiumUser ? stage.risk_factors : null,
      best_practices: isPremiumUser ? stage.best_practices : null,
      common_mistakes: isPremiumUser ? stage.common_mistakes : null,
      city_variations: isPremiumUser ? stage.city_variations : null,
      regional_considerations: isPremiumUser ? stage.regional_considerations : null,
    };

    // Check if user has premium content gated
    const hasGatedContent = !isPremiumUser && stage.is_premium_content;

    const response = {
      data: {
        stage: filteredStage,
        dependencies: dependencies || [],
        parent_stage: parentStage,
        child_stages: childStages || [],
        premium_upgrade_required: hasGatedContent,
      },
      meta: {
        is_premium_user: isPremiumUser,
        premium_content_available: stage.is_premium_content,
        stage_complexity: stage.complexity_score,
        estimated_cost_range: {
          min: stage.cost_min_usd,
          avg: stage.cost_avg_usd,
          max: stage.cost_max_usd,
        },
        estimated_duration_range: {
          min: stage.duration_weeks_min,
          avg: stage.duration_weeks_avg,
          max: stage.duration_weeks_max,
        },
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
        { error: 'Invalid stage ID', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 