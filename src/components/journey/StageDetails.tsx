import React from 'react';
import { JourneyStage, UserJourneyProgress, StageDependency, ProgressUpdateRequest } from '@/types/journey';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface StageDetailsProps {
  stage: JourneyStage | null;
  progress?: UserJourneyProgress;
  dependencies?: StageDependency[];
  isPremiumUser?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onProgressUpdate?: (update: ProgressUpdateRequest) => void;
}

export const StageDetails: React.FC<StageDetailsProps> = ({
  stage,
  progress,
  dependencies,
  isPremiumUser,
  isOpen,
  onClose,
  onProgressUpdate
}) => {
  if (!isOpen || !stage) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">{stage.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-600">{stage.long_description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Category:</span>
                    <span className="font-medium">{stage.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Duration:</span>
                    <span className="font-medium">{stage.estimated_duration_weeks} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cost Range:</span>
                    <span className="font-medium">
                      ${stage.estimated_cost_min.toLocaleString()} - ${stage.estimated_cost_max.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Complexity:</span>
                    <span className="font-medium">{stage.complexity_score}/10</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Status</h3>
                {progress ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        progress.status === 'completed' ? 'bg-green-100 text-green-800' :
                        progress.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      )}>
                        {progress.status}
                      </span>
                    </div>
                    {progress.actual_cost && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Actual Cost:</span>
                        <span className="font-medium">${progress.actual_cost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Not started</p>
                )}
              </div>
            </div>

            {stage.tips && stage.tips.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Tips</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                  {stage.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => onProgressUpdate?.({ stage_id: stage.id, status: 'in_progress' })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Stage
              </button>
              <button
                onClick={() => onProgressUpdate?.({ stage_id: stage.id, status: 'completed' })}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 