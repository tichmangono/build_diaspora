import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Request validation schema
const stagesQuerySchema = z.object({
  category: z.enum(['planning', 'permits', 'foundation', 'structure', 'utilities', 'finishing', 'inspection', 'compliance']).optional(),
  premium: z.enum(['true', 'false']).optional(),
  critical_path: z.enum(['true', 'false']).optional(),
  limit: z.string().transform(val => parseInt(val, 10)).optional(),
  offset: z.string().transform(val => parseInt(val, 10)).optional(),
});

// Cache configuration
const CACHE_DURATION = 60 * 5; // 5 minutes in seconds

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryParams = stagesQuerySchema.parse(Object.fromEntries(searchParams));
    
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

    // Build the query
    let query = supabase
      .from('journey_stages')
      .select(`
        id,
        stage_number,
        name,
        short_description,
        category,
        cost_min_usd,
        cost_avg_usd,
        cost_max_usd,
        cost_notes,
        duration_weeks_min,
        duration_weeks_avg,
        duration_weeks_max,
        duration_notes,
        required_permits,
        is_premium_content,
        is_critical_path,
        display_order,
        complexity_score,
        created_at,
        updated_at,
        ${isPremiumUser ? `
          detailed_description,
          seasonal_notes,
          risk_factors,
          best_practices,
          common_mistakes,
          city_variations,
          regional_considerations
        ` : ''}
      `)
      .order('display_order', { ascending: true });

    // Apply filters
    if (queryParams.category) {
      query = query.eq('category', queryParams.category);
    }

    if (queryParams.premium === 'true') {
      query = query.eq('is_premium_content', true);
    } else if (queryParams.premium === 'false') {
      query = query.eq('is_premium_content', false);
    }

    if (queryParams.critical_path === 'true') {
      query = query.eq('is_critical_path', true);
    } else if (queryParams.critical_path === 'false') {
      query = query.eq('is_critical_path', false);
    }

    // Apply pagination
    if (queryParams.limit) {
      query = query.limit(queryParams.limit);
    }

    if (queryParams.offset) {
      query = query.range(queryParams.offset, (queryParams.offset + (queryParams.limit || 20)) - 1);
    }

    // Execute query
    const { data: stages, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch stages' }, { status: 500 });
    }

    // Filter out premium content for non-premium users
    const filteredStages = stages?.map(stage => ({
      ...(stage as any),
      // Remove premium fields for non-premium users
      detailed_description: isPremiumUser ? (stage as any).detailed_description : null,
      seasonal_notes: isPremiumUser ? (stage as any).seasonal_notes : null,
      risk_factors: isPremiumUser ? (stage as any).risk_factors : null,
      best_practices: isPremiumUser ? (stage as any).best_practices : null,
      common_mistakes: isPremiumUser ? (stage as any).common_mistakes : null,
      city_variations: isPremiumUser ? (stage as any).city_variations : null,
      regional_considerations: isPremiumUser ? (stage as any).regional_considerations : null,
    }));

    // Calculate total cost and duration
    const totalCost = filteredStages?.reduce((sum, stage) => sum + (stage.cost_avg_usd || 0), 0) || 0;
    const totalDuration = filteredStages?.reduce((sum, stage) => sum + (stage.duration_weeks_avg || 0), 0) || 0;

    const response = {
      data: filteredStages || [],
      meta: {
        total_stages: filteredStages?.length || 0,
        total_cost_usd: totalCost,
        total_duration_weeks: totalDuration,
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