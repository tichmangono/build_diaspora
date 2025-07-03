import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Request validation schemas
const progressUpdateSchema = z.object({
  stage_id: z.string().uuid(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled']),
  progress_percentage: z.number().min(0).max(100).optional(),
  actual_cost: z.number().min(0).optional(),
  actual_duration_weeks: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
  start_date: z.string().datetime().optional(),
  completion_date: z.string().datetime().optional(),
});

const progressQuerySchema = z.object({
  stage_id: z.string().uuid().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled']).optional(),
});

// GET - Fetch user's journey progress
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryParams = progressQuerySchema.parse(Object.fromEntries(searchParams));
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Build query for user progress
    let query = supabase
      .from('user_journey_progress')
      .select(`
        id,
        stage_id,
        status,
        progress_percentage,
        actual_cost,
        actual_duration_weeks,
        notes,
        start_date,
        completion_date,
        created_at,
        updated_at,
        stage:journey_stages(
          id,
          stage_number,
          name,
          short_description,
          category,
          cost_avg_usd,
          duration_weeks_avg,
          is_critical_path,
          display_order
        )
      `)
      .eq('user_id', user.id)
      .order('stage(display_order)', { ascending: true });

    // Apply filters
    if (queryParams.stage_id) {
      query = query.eq('stage_id', queryParams.stage_id);
    }

    if (queryParams.status) {
      query = query.eq('status', queryParams.status);
    }

    const { data: progress, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }

    // Calculate overall progress statistics
    const totalStages = progress?.length || 0;
    const completedStages = progress?.filter(p => p.status === 'completed').length || 0;
    const inProgressStages = progress?.filter(p => p.status === 'in_progress').length || 0;
    const onHoldStages = progress?.filter(p => p.status === 'on_hold').length || 0;

    const totalActualCost = progress?.reduce((sum, p) => sum + (p.actual_cost || 0), 0) || 0;
    const totalActualDuration = progress?.reduce((sum, p) => sum + (p.actual_duration_weeks || 0), 0) || 0;
    const averageProgress = progress?.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / totalStages || 0;

    const response = {
      data: progress || [],
      meta: {
        total_stages: totalStages,
        completed_stages: completedStages,
        in_progress_stages: inProgressStages,
        on_hold_stages: onHoldStages,
        overall_completion_percentage: Math.round((completedStages / totalStages) * 100) || 0,
        average_stage_progress: Math.round(averageProgress),
        total_actual_cost: totalActualCost,
        total_actual_duration_weeks: totalActualDuration,
        filters_applied: queryParams,
      },
    };

    return NextResponse.json(response);

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

// POST - Update or create progress entry
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    
    // Validate request body
    const progressData = progressUpdateSchema.parse(body);
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify stage exists
    const { data: stage, error: stageError } = await supabase
      .from('journey_stages')
      .select('id, name, is_critical_path')
      .eq('id', progressData.stage_id)
      .single();

    if (stageError || !stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    // Check if progress entry already exists
    const { data: existingProgress } = await supabase
      .from('user_journey_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('stage_id', progressData.stage_id)
      .single();

    let result;

    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from('user_journey_progress')
        .update({
          status: progressData.status,
          progress_percentage: progressData.progress_percentage,
          actual_cost: progressData.actual_cost,
          actual_duration_weeks: progressData.actual_duration_weeks,
          notes: progressData.notes,
          start_date: progressData.start_date,
          completion_date: progressData.completion_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
      }

      result = data;
    } else {
      // Create new progress entry
      const { data, error } = await supabase
        .from('user_journey_progress')
        .insert({
          user_id: user.id,
          stage_id: progressData.stage_id,
          status: progressData.status,
          progress_percentage: progressData.progress_percentage || 0,
          actual_cost: progressData.actual_cost,
          actual_duration_weeks: progressData.actual_duration_weeks,
          notes: progressData.notes,
          start_date: progressData.start_date,
          completion_date: progressData.completion_date,
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        return NextResponse.json({ error: 'Failed to create progress entry' }, { status: 500 });
      }

      result = data;
    }

    // Log milestone completion for critical path stages
    if (stage.is_critical_path && progressData.status === 'completed') {
      await supabase
        .from('user_journey_milestones')
        .insert({
          user_id: user.id,
          stage_id: progressData.stage_id,
          milestone_type: 'critical_stage_completed',
          achieved_at: new Date().toISOString(),
          actual_cost: progressData.actual_cost,
          actual_duration_weeks: progressData.actual_duration_weeks,
        });
    }

    const response = {
      data: result,
      meta: {
        action: existingProgress ? 'updated' : 'created',
        stage_name: stage.name,
        is_critical_path: stage.is_critical_path,
      },
    };

    return NextResponse.json(response, { status: existingProgress ? 200 : 201 });

  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 