import { useState, useEffect } from 'react';
import { StageDependency } from '@/types/journey';

interface UseJourneyDependenciesOptions {
  format?: 'graph' | 'tree' | 'flat';
  initialData?: StageDependency[];
}

interface DependencyGraph {
  edges: StageDependency[];
  nodes?: any[];
}

interface UseJourneyDependenciesReturn {
  dependencies: DependencyGraph | null;
  loading: boolean;
  error?: Error | null;
}

export const useJourneyDependencies = (
  options?: UseJourneyDependenciesOptions
): UseJourneyDependenciesReturn => {
  const [dependencies, setDependencies] = useState<DependencyGraph | null>(
    options?.initialData ? { edges: options.initialData } : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options?.initialData) {
      setDependencies({ edges: options.initialData });
    }
  }, [options?.initialData]);

  return {
    dependencies,
    loading,
    error
  };
}; 