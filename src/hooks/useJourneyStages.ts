import { useState, useEffect } from 'react';
import { JourneyStage, StagesQueryParams } from '@/types/journey';

interface UseJourneyStagesOptions {
  initialData?: JourneyStage[];
}

interface UseJourneyStagesReturn {
  stages: JourneyStage[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useJourneyStages = (
  params?: StagesQueryParams,
  options?: UseJourneyStagesOptions
): UseJourneyStagesReturn => {
  const [stages, setStages] = useState<JourneyStage[] | null>(options?.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = () => {
    // Mock refetch implementation
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  useEffect(() => {
    if (options?.initialData) {
      setStages(options.initialData);
    }
  }, [options?.initialData]);

  return {
    stages,
    loading,
    error,
    refetch
  };
}; 