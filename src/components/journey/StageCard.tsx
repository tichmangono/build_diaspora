import React from 'react';
import { JourneyStage, UserJourneyProgress, StageDependency, ProgressUpdateRequest } from '@/types/journey';
import { cn } from '@/lib/utils';

interface StageCardProps {
  stage: JourneyStage;
  progress?: UserJourneyProgress;
  dependencies?: StageDependency[];
  isPremiumUser?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onProgressUpdate?: (update: ProgressUpdateRequest) => void;
  className?: string;
}

export const StageCard: React.FC<StageCardProps> = ({
  stage,
  progress,
  dependencies,
  isPremiumUser,
  isSelected,
  onClick,
  onProgressUpdate,
  className
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow',
        isSelected && 'ring-2 ring-blue-500',
        className
      )}
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{stage.name}</h3>
      <p className="text-sm text-slate-600 mb-4">{stage.short_description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {stage.category}
          </span>
          {stage.is_premium_content && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
              Premium
            </span>
          )}
        </div>
        
        <div className="text-sm text-slate-500">
          ${stage.estimated_cost_min.toLocaleString()} - ${stage.estimated_cost_max.toLocaleString()}
        </div>
      </div>

      {progress && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Status:</span>
            <span className={cn(
              'text-xs px-2 py-1 rounded',
              progress.status === 'completed' ? 'bg-green-100 text-green-800' :
              progress.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-slate-100 text-slate-800'
            )}>
              {progress.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}; 