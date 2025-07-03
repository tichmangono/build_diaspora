import React from 'react';
import { UserJourneyProgress } from '@/types/journey';
import { cn } from '@/lib/utils';

interface ProgressOverview {
  total_stages: number;
  completed_stages: number;
  in_progress_stages: number;
  not_started_stages: number;
  completion_percentage: number;
  total_estimated_cost: number;
  total_actual_cost: number;
  estimated_duration_weeks: number;
  actual_duration_weeks: number;
}

interface ProgressTrackerProps {
  progress: UserJourneyProgress[];
  overview?: ProgressOverview;
  className?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  overview,
  className
}) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-md p-6', className)}>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Progress Overview</h3>
      
      {overview && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Overall Progress</span>
              <span className="text-sm font-medium text-slate-900">
                {overview.completion_percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overview.completion_percentage}%` }}
              />
            </div>
          </div>

          {/* Stage counts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {overview.completed_stages}
              </div>
              <div className="text-xs text-slate-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {overview.in_progress_stages}
              </div>
              <div className="text-xs text-slate-600">In Progress</div>
            </div>
          </div>

          {/* Cost tracking */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Budget</span>
              <span className="text-sm font-medium text-slate-900">
                ${overview.total_actual_cost.toLocaleString()} / ${overview.total_estimated_cost.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (overview.total_actual_cost / overview.total_estimated_cost) * 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-slate-900 mb-3">Recent Activity</h4>
        <div className="space-y-2">
          {progress.slice(0, 3).map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              <div className={cn(
                'w-2 h-2 rounded-full',
                item.status === 'completed' ? 'bg-green-500' :
                item.status === 'in_progress' ? 'bg-blue-500' :
                'bg-slate-400'
              )} />
              <span className="text-slate-600 flex-1">
                Stage {item.stage_id.slice(-4)} - {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 