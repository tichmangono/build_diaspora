-- Journey Stages Schema Migration
-- Feature 2: Interactive Build Journey Timeline
-- This migration creates the core schema for managing build journey stages

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for journey stages
CREATE TYPE dependency_type AS ENUM ('blocking', 'parallel', 'optional');
CREATE TYPE stage_category AS ENUM ('planning', 'permits', 'foundation', 'structure', 'utilities', 'finishing', 'inspection', 'compliance');

-- Create journey_stages table
CREATE TABLE public.journey_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_stage_id UUID REFERENCES public.journey_stages(id) ON DELETE SET NULL,
    stage_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    short_description TEXT NOT NULL,
    detailed_description TEXT, -- Premium content
    category stage_category NOT NULL,
    
    -- Cost information
    cost_min_usd DECIMAL(10,2),
    cost_avg_usd DECIMAL(10,2),
    cost_max_usd DECIMAL(10,2),
    cost_notes TEXT,
    
    -- Duration information  
    duration_weeks_min INTEGER,
    duration_weeks_avg INTEGER,
    duration_weeks_max INTEGER,
    duration_notes TEXT,
    
    -- Premium content fields
    seasonal_notes TEXT, -- Premium: seasonal considerations
    risk_factors TEXT[], -- Premium: array of risk factors
    required_permits TEXT[], -- Array of required permits
    best_practices TEXT, -- Premium: detailed best practices
    common_mistakes TEXT, -- Premium: what to avoid
    
    -- Location and variation data
    city_variations JSONB, -- City-specific variations and costs
    regional_considerations TEXT,
    
    -- Meta information
    is_premium_content BOOLEAN DEFAULT FALSE,
    is_critical_path BOOLEAN DEFAULT FALSE,
    display_order INTEGER NOT NULL,
    complexity_score INTEGER CHECK (complexity_score >= 1 AND complexity_score <= 10),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stage_dependencies table
CREATE TABLE public.stage_dependencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prerequisite_stage_id UUID REFERENCES public.journey_stages(id) ON DELETE CASCADE NOT NULL,
    dependent_stage_id UUID REFERENCES public.journey_stages(id) ON DELETE CASCADE NOT NULL,
    dependency_type dependency_type NOT NULL DEFAULT 'blocking',
    dependency_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent self-dependencies and duplicate dependencies
    CONSTRAINT no_self_dependency CHECK (prerequisite_stage_id != dependent_stage_id),
    CONSTRAINT unique_dependency UNIQUE (prerequisite_stage_id, dependent_stage_id)
);

-- Create indexes for optimal performance
CREATE INDEX idx_journey_stages_parent_id ON public.journey_stages(parent_stage_id);
CREATE INDEX idx_journey_stages_stage_number ON public.journey_stages(stage_number);
CREATE INDEX idx_journey_stages_category ON public.journey_stages(category);
CREATE INDEX idx_journey_stages_display_order ON public.journey_stages(display_order);
CREATE INDEX idx_journey_stages_is_premium ON public.journey_stages(is_premium_content);
CREATE INDEX idx_journey_stages_critical_path ON public.journey_stages(is_critical_path);
CREATE INDEX idx_journey_stages_complexity ON public.journey_stages(complexity_score);

CREATE INDEX idx_stage_dependencies_prerequisite ON public.stage_dependencies(prerequisite_stage_id);
CREATE INDEX idx_stage_dependencies_dependent ON public.stage_dependencies(dependent_stage_id);
CREATE INDEX idx_stage_dependencies_type ON public.stage_dependencies(dependency_type);

-- Create composite indexes for common queries
CREATE INDEX idx_journey_stages_category_order ON public.journey_stages(category, display_order);
CREATE INDEX idx_journey_stages_premium_category ON public.journey_stages(is_premium_content, category);

-- Add triggers for updated_at
CREATE TRIGGER update_journey_stages_updated_at 
    BEFORE UPDATE ON public.journey_stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add data validation constraints
ALTER TABLE public.journey_stages ADD CONSTRAINT check_stage_number_positive 
    CHECK (stage_number > 0);

ALTER TABLE public.journey_stages ADD CONSTRAINT check_display_order_positive 
    CHECK (display_order > 0);

ALTER TABLE public.journey_stages ADD CONSTRAINT check_cost_ranges 
    CHECK (
        (cost_min_usd IS NULL OR cost_min_usd >= 0) AND
        (cost_avg_usd IS NULL OR cost_avg_usd >= 0) AND
        (cost_max_usd IS NULL OR cost_max_usd >= 0) AND
        (cost_min_usd IS NULL OR cost_avg_usd IS NULL OR cost_min_usd <= cost_avg_usd) AND
        (cost_avg_usd IS NULL OR cost_max_usd IS NULL OR cost_avg_usd <= cost_max_usd)
    );

ALTER TABLE public.journey_stages ADD CONSTRAINT check_duration_ranges 
    CHECK (
        (duration_weeks_min IS NULL OR duration_weeks_min > 0) AND
        (duration_weeks_avg IS NULL OR duration_weeks_avg > 0) AND
        (duration_weeks_max IS NULL OR duration_weeks_max > 0) AND
        (duration_weeks_min IS NULL OR duration_weeks_avg IS NULL OR duration_weeks_min <= duration_weeks_avg) AND
        (duration_weeks_avg IS NULL OR duration_weeks_max IS NULL OR duration_weeks_avg <= duration_weeks_max)
    );

ALTER TABLE public.journey_stages ADD CONSTRAINT check_name_not_empty 
    CHECK (LENGTH(TRIM(name)) > 0);

ALTER TABLE public.journey_stages ADD CONSTRAINT check_short_description_not_empty 
    CHECK (LENGTH(TRIM(short_description)) > 0);

ALTER TABLE public.journey_stages ADD CONSTRAINT check_short_description_length 
    CHECK (LENGTH(short_description) <= 200);

-- Add comments for documentation
COMMENT ON TABLE public.journey_stages IS 'Build journey stages with hierarchical structure, cost data, and premium content';
COMMENT ON TABLE public.stage_dependencies IS 'Dependencies and prerequisites between journey stages';

COMMENT ON COLUMN public.journey_stages.parent_stage_id IS 'Parent stage for hierarchical organization';
COMMENT ON COLUMN public.journey_stages.stage_number IS 'Sequential number for ordering stages';
COMMENT ON COLUMN public.journey_stages.name IS 'Stage name/title';
COMMENT ON COLUMN public.journey_stages.short_description IS 'Brief description for cards and lists';
COMMENT ON COLUMN public.journey_stages.detailed_description IS 'Comprehensive description (premium content)';
COMMENT ON COLUMN public.journey_stages.category IS 'Stage category for grouping and filtering';
COMMENT ON COLUMN public.journey_stages.cost_min_usd IS 'Minimum estimated cost in USD';
COMMENT ON COLUMN public.journey_stages.cost_avg_usd IS 'Average estimated cost in USD';
COMMENT ON COLUMN public.journey_stages.cost_max_usd IS 'Maximum estimated cost in USD';
COMMENT ON COLUMN public.journey_stages.duration_weeks_min IS 'Minimum duration in weeks';
COMMENT ON COLUMN public.journey_stages.duration_weeks_avg IS 'Average duration in weeks';
COMMENT ON COLUMN public.journey_stages.duration_weeks_max IS 'Maximum duration in weeks';
COMMENT ON COLUMN public.journey_stages.seasonal_notes IS 'Seasonal considerations (premium)';
COMMENT ON COLUMN public.journey_stages.risk_factors IS 'Array of potential risks (premium)';
COMMENT ON COLUMN public.journey_stages.required_permits IS 'Array of required permits and approvals';
COMMENT ON COLUMN public.journey_stages.city_variations IS 'City-specific data and variations';
COMMENT ON COLUMN public.journey_stages.is_premium_content IS 'Whether stage contains premium-only content';
COMMENT ON COLUMN public.journey_stages.is_critical_path IS 'Whether stage is on the critical path';
COMMENT ON COLUMN public.journey_stages.display_order IS 'Order for displaying stages';
COMMENT ON COLUMN public.journey_stages.complexity_score IS 'Complexity rating from 1-10';

COMMENT ON COLUMN public.stage_dependencies.prerequisite_stage_id IS 'Stage that must be completed first';
COMMENT ON COLUMN public.stage_dependencies.dependent_stage_id IS 'Stage that depends on the prerequisite';
COMMENT ON COLUMN public.stage_dependencies.dependency_type IS 'Type of dependency relationship';
COMMENT ON COLUMN public.stage_dependencies.dependency_notes IS 'Additional notes about the dependency'; 