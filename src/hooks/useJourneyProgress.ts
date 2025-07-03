import { useState, useEffect } from 'react';
import { UserJourneyProgress, ProgressUpdateRequest } from '@/types/journey';

interface UseJourneyProgressOptions {
  initialData?: UserJourneyProgress[];
}

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

interface UseJourneyProgressReturn {
  progress: UserJourneyProgress[] | null;
  overview: ProgressOverview | null;
  loading: boolean;
  updateProgress: (update: ProgressUpdateRequest) => Promise<void>;
  refetch: () => void;
}

export const useJourneyProgress = (
  options?: UseJourneyProgressOptions
): UseJourneyProgressReturn => {
  const [progress, setProgress] = useState<UserJourneyProgress[] | null>(options?.initialData || null);
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [loading, setLoading] = useState(false);

  const updateProgress = async (update: ProgressUpdateRequest) => {
    // Mock update implementation
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  const refetch = () => {
    // Mock refetch implementation
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  useEffect(() => {
    if (options?.initialData) {
      setProgress(options.initialData);
    }
  }, [options?.initialData]);

  return {
    progress,
    overview,
    loading,
    updateProgress,
    refetch
  };
}; 