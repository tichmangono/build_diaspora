export interface Stage {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  estimatedCost: {
    min: number;
    max: number;
  };
  requirements: string[];
  nextStages: string[];
  status: 'not-started' | 'in-progress' | 'completed';
}

export interface Progress {
  userId: string;
  stageId: string;
  status: Stage['status'];
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

// Journey Stage Types
export interface JourneyStage {
  id: string;
  stage_number: number;
  name: string;
  short_description: string;
  detailed_description?: string | null;
  category: 'planning' | 'permits' | 'foundation' | 'structure' | 'utilities' | 'finishing' | 'inspection' | 'compliance';
  cost_min_usd: number;
  cost_avg_usd: number;
  cost_max_usd: number;
  cost_notes?: string;
  duration_weeks_min: number;
  duration_weeks_avg: number;
  duration_weeks_max: number;
  duration_notes?: string;
  seasonal_notes?: string | null;
  risk_factors?: string[] | null;
  required_permits?: string[];
  best_practices?: string[] | null;
  common_mistakes?: string[] | null;
  city_variations?: Record<string, any> | null;
  regional_considerations?: Record<string, any> | null;
  is_premium_content: boolean;
  is_critical_path: boolean;
  display_order: number;
  complexity_score: number;
  parent_stage_id?: string | null;
  created_at: string;
  updated_at: string;
}

// User Progress Types
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export interface UserJourneyProgress {
  id: string;
  user_id: string;
  stage_id: string;
  status: ProgressStatus;
  progress_percentage: number;
  actual_cost?: number | null;
  actual_duration_weeks?: number | null;
  notes?: string | null;
  start_date?: string | null;
  completion_date?: string | null;
  created_at: string;
  updated_at: string;
  stage?: JourneyStage;
}

// Dependency Types
export type DependencyType = 'blocking' | 'parallel' | 'optional';

export interface StageDependency {
  id: string;
  prerequisite_stage_id: string;
  dependent_stage_id: string;
  dependency_type: DependencyType;
  dependency_notes?: string | null;
  prerequisite_stage?: Pick<JourneyStage, 'id' | 'stage_number' | 'name' | 'category' | 'is_critical_path'>;
  dependent_stage?: Pick<JourneyStage, 'id' | 'stage_number' | 'name' | 'category' | 'is_critical_path'>;
}

// Milestone Types
export type MilestoneType = 'critical_stage_completed' | 'category_completed' | 'journey_started' | 'journey_completed' | 'budget_milestone' | 'time_milestone';

export interface UserJourneyMilestone {
  id: string;
  user_id: string;
  stage_id?: string | null;
  milestone_type: MilestoneType;
  milestone_name?: string | null;
  milestone_description?: string | null;
  achieved_at: string;
  actual_cost?: number | null;
  actual_duration_weeks?: number | null;
  metadata?: Record<string, any> | null;
  created_at: string;
}

// API Response Types
export interface StagesApiResponse {
  data: JourneyStage[];
  meta: {
    total_stages: number;
    total_cost_usd: number;
    total_duration_weeks: number;
    is_premium_user: boolean;
    filters_applied: {
      category?: string;
      premium?: string;
      critical_path?: string;
      limit?: number;
      offset?: number;
    };
  };
}

export interface StageDetailApiResponse {
  data: {
    stage: JourneyStage;
    dependencies: StageDependency[];
    parent_stage?: Pick<JourneyStage, 'id' | 'stage_number' | 'name' | 'category'> | null;
    child_stages: Pick<JourneyStage, 'id' | 'stage_number' | 'name' | 'category' | 'display_order'>[];
    premium_upgrade_required: boolean;
  };
  meta: {
    is_premium_user: boolean;
    premium_content_available: boolean;
    stage_complexity: number;
    estimated_cost_range: {
      min: number;
      avg: number;
      max: number;
    };
    estimated_duration_range: {
      min: number;
      avg: number;
      max: number;
    };
  };
}

export interface ProgressApiResponse {
  data: UserJourneyProgress[];
  meta: {
    total_stages: number;
    completed_stages: number;
    in_progress_stages: number;
    on_hold_stages: number;
    overall_completion_percentage: number;
    average_stage_progress: number;
    total_actual_cost: number;
    total_actual_duration_weeks: number;
    filters_applied: {
      stage_id?: string;
      status?: ProgressStatus;
    };
  };
}

export interface ProgressUpdateRequest {
  stage_id: string;
  status: ProgressStatus;
  progress_percentage?: number;
  actual_cost?: number;
  actual_duration_weeks?: number;
  notes?: string;
  start_date?: string;
  completion_date?: string;
}

export interface ProgressUpdateApiResponse {
  data: UserJourneyProgress;
  meta: {
    action: 'created' | 'updated';
    stage_name: string;
    is_critical_path: boolean;
  };
}

// Dependencies Graph Types
export interface DependencyGraphNode {
  id: string;
  stage_number: number;
  name: string;
  category: string;
  is_critical_path: boolean;
  complexity_score: number;
  cost_avg_usd: number;
  duration_weeks_avg: number;
}

export interface DependencyGraphEdge {
  id: string;
  source: string;
  target: string;
  type: DependencyType;
  notes?: string | null;
  is_critical: boolean;
}

export interface DependencyGraphFormat {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
}

export interface DependencyTreeNode extends DependencyGraphNode {
  children: DependencyTreeNode[];
  dependency_type?: DependencyType;
  dependency_notes?: string | null;
}

export interface DependencyFlatFormat extends JourneyStage {
  prerequisites: {
    stage_id: string;
    stage_name: string;
    dependency_type: DependencyType;
    notes?: string | null;
  }[];
  dependents: {
    stage_id: string;
    stage_name: string;
    dependency_type: DependencyType;
    notes?: string | null;
  }[];
  dependency_count: number;
}

export interface DependenciesApiResponse {
  data: DependencyGraphFormat | DependencyTreeNode[] | DependencyFlatFormat[];
  meta: {
    format: 'graph' | 'tree' | 'flat';
    total_stages: number;
    total_dependencies: number;
    dependency_types: {
      blocking: number;
      parallel: number;
      optional: number;
    };
    critical_path: {
      stage_count: number;
      total_cost_usd: number;
      total_duration_weeks: number;
    };
    independent_stages: {
      id: string;
      name: string;
      category: string;
    }[];
    most_connected_stages: {
      stage_id: string;
      stage_name: string;
      dependency_count: number;
    }[];
    parallel_opportunities: number;
    is_premium_user: boolean;
    filters_applied: {
      format: 'graph' | 'tree' | 'flat';
      include_optional: boolean;
      stage_id?: string;
    };
  };
}

// Journey Overview Types
export interface UserJourneyOverview {
  user_id: string;
  total_stages: number;
  completed_stages: number;
  in_progress_stages: number;
  on_hold_stages: number;
  completion_percentage: number;
  total_actual_cost: number;
  total_actual_duration: number;
  journey_start_date?: string | null;
  latest_completion_date?: string | null;
}

// User Journey Settings Types
export interface UserJourneySettings {
  id: string;
  user_id: string;
  preferred_currency: string;
  budget_limit?: number | null;
  target_completion_date?: string | null;
  notification_preferences: {
    email: boolean;
    milestone_alerts: boolean;
    budget_alerts: boolean;
    deadline_alerts: boolean;
  };
  city_preference?: string | null;
  risk_tolerance?: 'low' | 'medium' | 'high' | null;
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | null;
  created_at: string;
  updated_at: string;
}

// Component Props Types (for use in React components)
export interface JourneyTimelineProps {
  initialStages?: JourneyStage[];
  userProgress?: UserJourneyProgress[];
  dependencies?: StageDependency[];
  settings?: UserJourneySettings;
  isPremiumUser?: boolean;
  onStageClick?: (stage: JourneyStage) => void;
  onProgressUpdate?: (update: ProgressUpdateRequest) => void;
  className?: string;
}

export interface StageCardProps {
  stage: JourneyStage;
  progress?: UserJourneyProgress;
  dependencies?: StageDependency[];
  isPremiumUser?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onProgressUpdate?: (update: ProgressUpdateRequest) => void;
  className?: string;
}

export interface StageDetailsProps {
  stage: JourneyStage;
  progress?: UserJourneyProgress;
  dependencies?: StageDependency[];
  parentStage?: Pick<JourneyStage, 'id' | 'stage_number' | 'name' | 'category'> | null;
  childStages?: Pick<JourneyStage, 'id' | 'stage_number' | 'name' | 'category' | 'display_order'>[];
  isPremiumUser?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onProgressUpdate?: (update: ProgressUpdateRequest) => void;
  className?: string;
}

export interface CostRangeDisplayProps {
  costMin: number;
  costAvg: number;
  costMax: number;
  currency?: string;
  actualCost?: number | null;
  className?: string;
}

export interface ProgressTrackerProps {
  progress: UserJourneyProgress[];
  overview?: UserJourneyOverview;
  className?: string;
}

// API Error Types
export interface ApiError {
  error: string;
  details?: any;
}

// Query parameter types for API endpoints
export interface StagesQueryParams {
  category?: 'planning' | 'permits' | 'foundation' | 'structure' | 'utilities' | 'finishing' | 'inspection' | 'compliance';
  premium?: 'true' | 'false';
  critical_path?: 'true' | 'false';
  limit?: number;
  offset?: number;
}

export interface ProgressQueryParams {
  stage_id?: string;
  status?: ProgressStatus;
}

export interface DependenciesQueryParams {
  format?: 'graph' | 'tree' | 'flat';
  include_optional?: 'true' | 'false';
  stage_id?: string;
} 