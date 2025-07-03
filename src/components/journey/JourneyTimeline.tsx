'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter, Grid3x3, RotateCcw, Settings, Sparkles } from 'lucide-react';
import { 
  JourneyStage, 
  UserJourneyProgress, 
  StageDependency, 
  UserJourneySettings,
  ProgressUpdateRequest,
  StagesQueryParams,
  JourneyTimelineProps 
} from '@/types/journey';
import { StageCard } from './StageCard';
import { StageDetails } from './StageDetails';
import { ProgressTracker } from './ProgressTracker';
import { useJourneyStages } from '@/hooks/useJourneyStages';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { useJourneyDependencies } from '@/hooks/useJourneyDependencies';
import { cn } from '@/lib/utils';

interface ViewMode {
  type: '3d' | '2d';
  layout: 'timeline' | 'grid' | 'tree';
}

interface FilterState {
  category: string | null;
  criticalPath: boolean | null;
  premium: boolean | null;
  status: string | null;
  searchTerm: string;
}

const CATEGORY_OPTIONS = [
  { value: 'planning', label: 'Planning', icon: '📋', color: 'bg-blue-100 text-blue-800' },
  { value: 'permits', label: 'Permits', icon: '📄', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'foundation', label: 'Foundation', icon: '🏗️', color: 'bg-amber-100 text-amber-800' },
  { value: 'structure', label: 'Structure', icon: '🏠', color: 'bg-orange-100 text-orange-800' },
  { value: 'utilities', label: 'Utilities', icon: '⚡', color: 'bg-green-100 text-green-800' },
  { value: 'finishing', label: 'Finishing', icon: '🎨', color: 'bg-purple-100 text-purple-800' },
  { value: 'inspection', label: 'Inspection', icon: '🔍', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'compliance', label: 'Compliance', icon: '✅', color: 'bg-emerald-100 text-emerald-800' },
];

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  initialStages = [],
  userProgress = [],
  dependencies = [],
  settings,
  isPremiumUser = false,
  onStageClick,
  onProgressUpdate,
  className,
}) => {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>({ type: '2d', layout: 'timeline' });
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    criticalPath: null,
    premium: null,
    status: null,
    searchTerm: '',
  });
  const [selectedStage, setSelectedStage] = useState<JourneyStage | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Query parameters for API calls
  const queryParams = useMemo<StagesQueryParams>(() => ({
    category: filters.category as any,
    premium: filters.premium ? 'true' : undefined,
    critical_path: filters.criticalPath ? 'true' : undefined,
  }), [filters]);

  // Custom hooks for data fetching
  const { 
    stages, 
    loading: stagesLoading, 
    error: stagesError,
    refetch: refetchStages 
  } = useJourneyStages(queryParams, { initialData: initialStages });

  const { 
    progress, 
    overview,
    loading: progressLoading,
    updateProgress,
    refetch: refetchProgress 
  } = useJourneyProgress({ initialData: userProgress });

  const { 
    dependencies: stageDependencies,
    loading: dependenciesLoading 
  } = useJourneyDependencies({ format: 'graph', initialData: dependencies });

  // Filtered and sorted stages
  const filteredStages = useMemo(() => {
    let filtered = stages || [];

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(stage => stage.category === filters.category);
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(stage => 
        stage.name.toLowerCase().includes(searchLower) ||
        stage.short_description.toLowerCase().includes(searchLower) ||
        stage.category.toLowerCase().includes(searchLower)
      );
    }

    // Status filter (based on user progress)
    if (filters.status) {
      const progressMap = new Map(progress?.map(p => [p.stage_id, p]) || []);
      filtered = filtered.filter(stage => {
        const stageProgress = progressMap.get(stage.id);
        return stageProgress?.status === filters.status;
      });
    }

    // Sort by display order
    return filtered.sort((a, b) => a.display_order - b.display_order);
  }, [stages, progress, filters]);

  // WebGL detection for 3D mode
  const [webGLSupported, setWebGLSupported] = useState(false);
  
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebGLSupported(!!gl);
    } catch (e) {
      setWebGLSupported(false);
    }
  }, []);

  // Event handlers
  const handleStageClick = useCallback((stage: JourneyStage) => {
    setSelectedStage(stage);
    setIsDetailsOpen(true);
    onStageClick?.(stage);
  }, [onStageClick]);

  const handleProgressUpdate = useCallback(async (update: ProgressUpdateRequest) => {
    try {
      await updateProgress(update);
      await refetchProgress();
      onProgressUpdate?.(update);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }, [updateProgress, refetchProgress, onProgressUpdate]);

  const handleViewModeChange = useCallback((newViewMode: ViewMode) => {
    if (newViewMode.type === '3d' && !webGLSupported) {
      // Fallback to 2D if WebGL not supported
      setViewMode({ ...newViewMode, type: '2d' });
      return;
    }
    setViewMode(newViewMode);
  }, [webGLSupported]);

  const resetFilters = useCallback(() => {
    setFilters({
      category: null,
      criticalPath: null,
      premium: null,
      status: null,
      searchTerm: '',
    });
  }, []);

  const handleCategoryFilter = useCallback((category: string | null) => {
    setFilters(prev => ({ ...prev, category }));
  }, []);

  // Loading state
  const isLoading = stagesLoading || progressLoading || dependenciesLoading;

  return (
    <div className={cn('journey-timeline w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50', className)}>
      {/* Header with controls */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Title and Progress Overview */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                  Build Journey Timeline
                </h1>
                {isPremiumUser && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-medium rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Premium
                  </span>
                )}
              </div>
              {overview && (
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>
                    {overview.completed_stages} of {overview.total_stages} stages completed
                  </span>
                  <span className="text-emerald-600 font-medium">
                    {overview.completion_percentage}% complete
                  </span>
                  {overview.total_actual_cost > 0 && (
                    <span>
                      ${overview.total_actual_cost.toLocaleString()} spent
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* View Mode Controls */}
            <div className="flex items-center gap-2">
              {/* 3D/2D Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange({ ...viewMode, type: '2d' })}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    viewMode.type === '2d'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  2D
                </button>
                <button
                  onClick={() => handleViewModeChange({ ...viewMode, type: '3d' })}
                  disabled={!webGLSupported}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    viewMode.type === '3d'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900',
                    !webGLSupported && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  3D
                </button>
              </div>

              {/* Layout Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange({ ...viewMode, layout: 'timeline' })}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    viewMode.layout === 'timeline'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  Timeline
                </button>
                <button
                  onClick={() => handleViewModeChange({ ...viewMode, layout: 'grid' })}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    viewMode.layout === 'grid'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  showFilters
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                )}
              >
                <Filter className="w-4 h-4" />
              </button>

              {/* Settings */}
              <button className="p-2 bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                  {/* Search */}
                  <div>
                    <input
                      type="text"
                      placeholder="Search stages..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCategoryFilter(null)}
                        className={cn(
                          'px-3 py-1.5 text-sm rounded-lg transition-colors',
                          filters.category === null
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        )}
                      >
                        All Categories
                      </button>
                      {CATEGORY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleCategoryFilter(option.value)}
                          className={cn(
                            'px-3 py-1.5 text-sm rounded-lg transition-colors border flex items-center gap-1.5',
                            filters.category === option.value
                              ? option.color + ' border-current'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          )}
                        >
                          <span>{option.icon}</span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.criticalPath === true}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          criticalPath: e.target.checked ? true : null 
                        }))}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Critical Path Only</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.premium === true}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          premium: e.target.checked ? true : null 
                        }))}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Premium Content</span>
                    </label>

                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Progress Tracker Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <ProgressTracker 
                progress={progress || []}
                overview={overview}
                className="mb-6"
              />
            </div>
          </div>

          {/* Timeline Content */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : stagesError ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load journey stages</p>
                <button
                  onClick={() => refetchStages()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : viewMode.type === '3d' ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center py-12">
                  <p className="text-slate-600 mb-4">3D Timeline view coming soon...</p>
                  <p className="text-sm text-slate-500">This will render the interactive 3D timeline visualization</p>
                </div>
              </div>
            ) : (
              <div className={cn(
                'space-y-4',
                viewMode.layout === 'grid' && 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 space-y-0'
              )}>
                {filteredStages.map((stage, index) => {
                  const stageProgress = progress?.find(p => p.stage_id === stage.id);
                  const stageDeps = stageDependencies?.edges?.filter(
                    edge => edge.source === stage.id || edge.target === stage.id
                  ) || [];

                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <StageCard
                        stage={stage}
                        progress={stageProgress}
                        dependencies={stageDeps}
                        isPremiumUser={isPremiumUser}
                        isSelected={selectedStage?.id === stage.id}
                        onClick={() => handleStageClick(stage)}
                        onProgressUpdate={handleProgressUpdate}
                        className={viewMode.layout === 'timeline' ? 'mb-4' : ''}
                      />
                    </motion.div>
                  );
                })}

                {filteredStages.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                    <p className="text-slate-600 mb-2">No stages found</p>
                    <p className="text-sm text-slate-500">Try adjusting your filters or search terms</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stage Details Modal */}
      <StageDetails
        stage={selectedStage}
        progress={progress?.find(p => p.stage_id === selectedStage?.id)}
        dependencies={stageDependencies?.edges?.filter(
          edge => edge.source === selectedStage?.id || edge.target === selectedStage?.id
        ) || []}
        isPremiumUser={isPremiumUser}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedStage(null);
        }}
        onProgressUpdate={handleProgressUpdate}
      />
    </div>
  );
}; 