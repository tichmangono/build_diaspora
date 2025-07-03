-- User Progress Tracking Tables
-- Feature 2: Interactive Build Journey Timeline
-- Tables for tracking user progress through journey stages

-- Create custom types for user progress
CREATE TYPE user_progress_status AS ENUM ('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled');
CREATE TYPE milestone_type AS ENUM ('critical_stage_completed', 'category_completed', 'journey_started', 'journey_completed', 'budget_milestone', 'time_milestone');

-- Create user_journey_progress table
CREATE TABLE public.user_journey_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stage_id UUID REFERENCES public.journey_stages(id) ON DELETE CASCADE NOT NULL,
    status user_progress_status NOT NULL DEFAULT 'not_started',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    actual_cost DECIMAL(10,2) CHECK (actual_cost >= 0),
    actual_duration_weeks DECIMAL(5,2) CHECK (actual_duration_weeks >= 0),
    notes TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique user-stage combination
    CONSTRAINT unique_user_stage UNIQUE (user_id, stage_id),
    
    -- Logical constraints
    CONSTRAINT check_completion_date_after_start CHECK (
        completion_date IS NULL OR start_date IS NULL OR completion_date >= start_date
    ),
    CONSTRAINT check_completed_status_has_completion_date CHECK (
        status != 'completed' OR completion_date IS NOT NULL
    ),
    CONSTRAINT check_completed_status_has_100_percent CHECK (
        status != 'completed' OR progress_percentage = 100
    )
);

-- Create user_journey_milestones table
CREATE TABLE public.user_journey_milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stage_id UUID REFERENCES public.journey_stages(id) ON DELETE CASCADE,
    milestone_type milestone_type NOT NULL,
    milestone_name TEXT,
    milestone_description TEXT,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actual_cost DECIMAL(10,2) CHECK (actual_cost >= 0),
    actual_duration_weeks DECIMAL(5,2) CHECK (actual_duration_weeks >= 0),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_journey_settings table
CREATE TABLE public.user_journey_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    preferred_currency TEXT DEFAULT 'USD',
    budget_limit DECIMAL(12,2) CHECK (budget_limit > 0),
    target_completion_date TIMESTAMP WITH TIME ZONE,
    notification_preferences JSONB DEFAULT '{"email": true, "milestone_alerts": true, "budget_alerts": true, "deadline_alerts": true}',
    city_preference TEXT,
    risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high')),
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for optimal performance
CREATE INDEX idx_user_journey_progress_user_id ON public.user_journey_progress(user_id);
CREATE INDEX idx_user_journey_progress_stage_id ON public.user_journey_progress(stage_id);
CREATE INDEX idx_user_journey_progress_status ON public.user_journey_progress(status);
CREATE INDEX idx_user_journey_progress_completion_date ON public.user_journey_progress(completion_date);

CREATE INDEX idx_user_journey_milestones_user_id ON public.user_journey_milestones(user_id);
CREATE INDEX idx_user_journey_milestones_stage_id ON public.user_journey_milestones(stage_id);
CREATE INDEX idx_user_journey_milestones_type ON public.user_journey_milestones(milestone_type);
CREATE INDEX idx_user_journey_milestones_achieved_at ON public.user_journey_milestones(achieved_at);

CREATE INDEX idx_user_journey_settings_user_id ON public.user_journey_settings(user_id);

-- Create composite indexes for common queries
CREATE INDEX idx_user_progress_user_status ON public.user_journey_progress(user_id, status);
CREATE INDEX idx_user_milestones_user_type ON public.user_journey_milestones(user_id, milestone_type);

-- Add triggers for updated_at
CREATE TRIGGER update_user_journey_progress_updated_at 
    BEFORE UPDATE ON public.user_journey_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_journey_settings_updated_at 
    BEFORE UPDATE ON public.user_journey_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add data validation constraints
ALTER TABLE public.user_journey_progress ADD CONSTRAINT check_notes_length 
    CHECK (notes IS NULL OR LENGTH(notes) <= 1000);

ALTER TABLE public.user_journey_milestones ADD CONSTRAINT check_milestone_name_length 
    CHECK (milestone_name IS NULL OR LENGTH(milestone_name) <= 200);

ALTER TABLE public.user_journey_milestones ADD CONSTRAINT check_milestone_description_length 
    CHECK (milestone_description IS NULL OR LENGTH(milestone_description) <= 500);

-- Add RLS policies
ALTER TABLE public.user_journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_journey_progress
CREATE POLICY "Users can view their own progress" ON public.user_journey_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_journey_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own progress" ON public.user_journey_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" ON public.user_journey_progress
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user_journey_milestones
CREATE POLICY "Users can view their own milestones" ON public.user_journey_milestones
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert milestones for users" ON public.user_journey_milestones
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_journey_settings
CREATE POLICY "Users can view their own settings" ON public.user_journey_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_journey_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own settings" ON public.user_journey_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Create helpful views for common queries
CREATE VIEW public.user_journey_overview AS
SELECT 
    p.user_id,
    COUNT(*) as total_stages,
    COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed_stages,
    COUNT(CASE WHEN up.status = 'in_progress' THEN 1 END) as in_progress_stages,
    COUNT(CASE WHEN up.status = 'on_hold' THEN 1 END) as on_hold_stages,
    ROUND(
        (COUNT(CASE WHEN up.status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 
        2
    ) as completion_percentage,
    SUM(up.actual_cost) as total_actual_cost,
    SUM(up.actual_duration_weeks) as total_actual_duration,
    MIN(up.start_date) as journey_start_date,
    MAX(up.completion_date) as latest_completion_date
FROM public.profiles p
LEFT JOIN public.user_journey_progress up ON p.id = up.user_id
GROUP BY p.user_id;

-- Create function to automatically create progress entries for new users
CREATE OR REPLACE FUNCTION public.initialize_user_journey_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert progress entries for all journey stages
    INSERT INTO public.user_journey_progress (user_id, stage_id, status)
    SELECT NEW.id, js.id, 'not_started'
    FROM public.journey_stages js
    WHERE js.parent_stage_id IS NULL; -- Only main stages initially
    
    -- Create default user settings
    INSERT INTO public.user_journey_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize progress for new users
CREATE TRIGGER on_user_created_initialize_journey
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.initialize_user_journey_progress();

-- Add comments for documentation
COMMENT ON TABLE public.user_journey_progress IS 'User progress tracking through journey stages';
COMMENT ON TABLE public.user_journey_milestones IS 'Milestone achievements and important events in user journey';
COMMENT ON TABLE public.user_journey_settings IS 'User preferences and settings for their journey';

COMMENT ON COLUMN public.user_journey_progress.progress_percentage IS 'Progress percentage (0-100) for the current stage';
COMMENT ON COLUMN public.user_journey_progress.actual_cost IS 'Actual cost incurred by user for this stage';
COMMENT ON COLUMN public.user_journey_progress.actual_duration_weeks IS 'Actual time taken to complete this stage';
COMMENT ON COLUMN public.user_journey_progress.start_date IS 'When user started working on this stage';
COMMENT ON COLUMN public.user_journey_progress.completion_date IS 'When user completed this stage';

COMMENT ON COLUMN public.user_journey_milestones.milestone_type IS 'Type of milestone achieved';
COMMENT ON COLUMN public.user_journey_milestones.achieved_at IS 'When the milestone was achieved';
COMMENT ON COLUMN public.user_journey_milestones.metadata IS 'Additional milestone data in JSON format';

COMMENT ON VIEW public.user_journey_overview IS 'Summary view of user journey progress statistics'; 