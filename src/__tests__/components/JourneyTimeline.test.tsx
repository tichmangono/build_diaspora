import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { JourneyTimeline } from '@/components/journey/JourneyTimeline';
import { JourneyStage, UserJourneyProgress, StageDependency } from '@/types/journey';

// Mock the hooks
jest.mock('@/hooks/useJourneyStages');
jest.mock('@/hooks/useJourneyProgress');
jest.mock('@/hooks/useJourneyDependencies');

// Mock the child components
jest.mock('@/components/journey/StageCard', () => ({
  StageCard: ({ stage, onClick, onProgressUpdate }: any) => (
    <div 
      data-testid={`stage-card-${stage.id}`}
      onClick={() => onClick(stage)}
      className="stage-card"
    >
      <h3>{stage.name}</h3>
      <p>{stage.short_description}</p>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onProgressUpdate({ stage_id: stage.id, status: 'in_progress' });
        }}
        data-testid={`update-progress-${stage.id}`}
      >
        Update Progress
      </button>
    </div>
  )
}));

jest.mock('@/components/journey/StageDetails', () => ({
  StageDetails: ({ stage, isOpen, onClose, onProgressUpdate }: any) => (
    isOpen ? (
      <div data-testid="stage-details-modal" className="modal">
        <h2>{stage?.name}</h2>
        <button onClick={onClose} data-testid="close-modal">Close</button>
        <button 
          onClick={() => onProgressUpdate({ stage_id: stage.id, status: 'completed' })}
          data-testid="modal-update-progress"
        >
          Complete Stage
        </button>
      </div>
    ) : null
  )
}));

jest.mock('@/components/journey/ProgressTracker', () => ({
  ProgressTracker: ({ progress, overview }: any) => (
    <div data-testid="progress-tracker">
      <div>Progress: {progress?.length || 0} stages</div>
      {overview && (
        <div data-testid="progress-overview">
          {overview.completed_stages} of {overview.total_stages} completed
        </div>
      )}
    </div>
  )
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Grid3x3: () => <div data-testid="grid-icon" />,
  RotateCcw: () => <div data-testid="reset-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
}));

const mockStages: JourneyStage[] = [
  {
    id: 'stage-1',
    name: 'Site Preparation',
    short_description: 'Prepare the building site',
    long_description: 'Clear and level the building site for construction',
    category: 'planning',
    display_order: 1,
    estimated_duration_weeks: 2,
    estimated_cost_min: 1000,
    estimated_cost_max: 2000,
    complexity_score: 3,
    risk_factors: ['weather'],
    required_permits: ['site_permit'],
    is_critical_path: true,
    is_premium_content: false,
    tips: ['Check weather conditions'],
    common_issues: ['Drainage problems'],
    success_criteria: ['Site is level'],
    resources: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'stage-2',
    name: 'Foundation',
    short_description: 'Build the foundation',
    long_description: 'Excavate and pour the foundation',
    category: 'foundation',
    display_order: 2,
    estimated_duration_weeks: 3,
    estimated_cost_min: 5000,
    estimated_cost_max: 8000,
    complexity_score: 7,
    risk_factors: ['soil_conditions'],
    required_permits: ['building_permit'],
    is_critical_path: true,
    is_premium_content: true,
    tips: ['Test soil composition'],
    common_issues: ['Poor soil conditions'],
    success_criteria: ['Foundation is level and cured'],
    resources: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockProgress: UserJourneyProgress[] = [
  {
    id: 'progress-1',
    user_id: 'user-1',
    stage_id: 'stage-1',
    status: 'completed',
    start_date: '2024-01-01',
    completion_date: '2024-01-15',
    actual_duration_weeks: 2,
    actual_cost: 1500,
    notes: 'Went smoothly',
    milestones: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

const mockDependencies: StageDependency[] = [
  {
    id: 'dep-1',
    stage_id: 'stage-2',
    depends_on_stage_id: 'stage-1',
    dependency_type: 'required',
    description: 'Foundation requires site preparation',
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockOverview = {
  total_stages: 2,
  completed_stages: 1,
  in_progress_stages: 0,
  not_started_stages: 1,
  completion_percentage: 50,
  total_estimated_cost: 10000,
  total_actual_cost: 1500,
  estimated_duration_weeks: 5,
  actual_duration_weeks: 2
};

describe('JourneyTimeline', () => {
  const mockUseJourneyStages = require('@/hooks/useJourneyStages').useJourneyStages as jest.Mock;
  const mockUseJourneyProgress = require('@/hooks/useJourneyProgress').useJourneyProgress as jest.Mock;
  const mockUseJourneyDependencies = require('@/hooks/useJourneyDependencies').useJourneyDependencies as jest.Mock;

  const defaultHookReturns = {
    stages: mockStages,
    loading: false,
    error: null,
    refetch: jest.fn()
  };

  const defaultProgressReturns = {
    progress: mockProgress,
    overview: mockOverview,
    loading: false,
    updateProgress: jest.fn(),
    refetch: jest.fn()
  };

  const defaultDependenciesReturns = {
    dependencies: { edges: mockDependencies },
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseJourneyStages.mockReturnValue(defaultHookReturns);
    mockUseJourneyProgress.mockReturnValue(defaultProgressReturns);
    mockUseJourneyDependencies.mockReturnValue(defaultDependenciesReturns);

    // Mock WebGL support
    HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
      if (contextType === 'webgl' || contextType === 'experimental-webgl') {
        return {}; // Mock WebGL context
      }
      return null;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the timeline with basic elements', () => {
      render(<JourneyTimeline />);
      
      expect(screen.getByText('Build Journey Timeline')).toBeInTheDocument();
      expect(screen.getByTestId('stage-card-stage-1')).toBeInTheDocument();
      expect(screen.getByTestId('stage-card-stage-2')).toBeInTheDocument();
      expect(screen.getByTestId('progress-tracker')).toBeInTheDocument();
    });

    it('shows premium badge for premium users', () => {
      render(<JourneyTimeline isPremiumUser={true} />);
      
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
    });

    it('hides premium badge for non-premium users', () => {
      render(<JourneyTimeline isPremiumUser={false} />);
      
      expect(screen.queryByText('Premium')).not.toBeInTheDocument();
    });

    it('displays progress overview when available', () => {
      render(<JourneyTimeline />);
      
      expect(screen.getByText('1 of 2 stages completed')).toBeInTheDocument();
      expect(screen.getByText('50% complete')).toBeInTheDocument();
      expect(screen.getByText('$1,500 spent')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<JourneyTimeline className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('View Mode Controls', () => {
    it('renders view mode toggles', () => {
      render(<JourneyTimeline />);
      
      expect(screen.getByText('2D')).toBeInTheDocument();
      expect(screen.getByText('3D')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
      expect(screen.getByTestId('grid-icon')).toBeInTheDocument();
    });

    it('starts in 2D timeline mode by default', () => {
      render(<JourneyTimeline />);
      
      const twoDButton = screen.getByText('2D');
      const timelineButton = screen.getByText('Timeline');
      
      expect(twoDButton).toHaveClass('bg-white', 'text-slate-900', 'shadow-sm');
      expect(timelineButton).toHaveClass('bg-white', 'text-slate-900', 'shadow-sm');
    });

    it('switches to grid layout when grid button is clicked', async () => {
      const user = userEvent.setup();
      render(<JourneyTimeline />);
      
      const gridButton = screen.getByTestId('grid-icon').closest('button');
      await user.click(gridButton!);
      
      expect(gridButton).toHaveClass('bg-white', 'text-slate-900', 'shadow-sm');
    });

    it('switches to 3D mode when 3D button is clicked and WebGL is supported', async () => {
      const user = userEvent.setup();
      render(<JourneyTimeline />);
      
      const threeDButton = screen.getByText('3D');
      await user.click(threeDButton);
      
      expect(threeDButton).toHaveClass('bg-white', 'text-slate-900', 'shadow-sm');
    });

    it('falls back to 2D when 3D is requested but WebGL is not supported', async () => {
      // Mock WebGL as not supported
      HTMLCanvasElement.prototype.getContext = jest.fn(() => null);
      
      const user = userEvent.setup();
      render(<JourneyTimeline />);
      
      const threeDButton = screen.getByText('3D');
      const twoDButton = screen.getByText('2D');
      
      await user.click(threeDButton);
      
      // Should remain in 2D mode
      expect(twoDButton).toHaveClass('bg-white', 'text-slate-900', 'shadow-sm');
    });

    it('disables 3D button when WebGL is not supported', () => {
      HTMLCanvasElement.prototype.getContext = jest.fn(() => null);
      
      render(<JourneyTimeline />);
      
      const threeDButton = screen.getByText('3D');
      expect(threeDButton).toBeDisabled();
      expect(threeDButton).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('Filter System', () => {
    it('toggles filter panel when filter button is clicked', async () => {
      const user = userEvent.setup();
      render(<JourneyTimeline />);
      
      const filterButton = screen.getByTestId('filter-icon').closest('button');
      
      // Filter panel should be hidden initially
      expect(screen.queryByText('Search stages...')).not.toBeInTheDocument();
      
      // Click to show filters
      await user.click(filterButton!);
      expect(screen.getByPlaceholderText('Search stages...')).toBeInTheDocument();
      
      // Click to hide filters
      await user.click(filterButton!);
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search stages...')).not.toBeInTheDocument();
      });
    });

    it('filters stages by search term', async () => {
      const user = userEvent.setup();
      render(<JourneyTimeline />);
      
      // Open filter panel
      const filterButton = screen.getByTestId('filter-icon').closest('button');
      await user.click(filterButton!);
      
      // Search for "foundation"
      const searchInput = screen.getByPlaceholderText('Search stages...');
      await user.type(searchInput, 'foundation');
      
      // Should only show foundation stage
      expect(screen.getByTestId('stage-card-stage-2')).toBeInTheDocument();
      expect(screen.queryByTestId('stage-card-stage-1')).not.toBeInTheDocument();
    });

    it('filters stages by category', async () => {
      const user = userEvent.setup();
      render(<JourneyTimeline />);
      
      // Open filter panel
      const filterButton = screen.getByTestId('filter-icon').closest('button');
      await user.click(filterButton!);
      
      // Click on "Planning" category
      const planningButton = screen.getByText('Planning');
      await user.click(planningButton);
      
      // Wait for filtering to take effect
      await waitFor(() => {
        expect(screen.getByTestId('stage-card-stage-1')).toBeInTheDocument();
        expect(screen.queryByTestId('stage-card-stage-2')).not.toBeInTheDocument();
      });
    });

    it('resets all filters when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<JourneyTimeline />);
      
      // Open filter panel
      const filterButton = screen.getByTestId('filter-icon').closest('button');
      await user.click(filterButton!);
      
      // Apply some filters
      const searchInput = screen.getByPlaceholderText('Search stages...');
      await user.type(searchInput, 'foundation');
      
      const criticalPathCheckbox = screen.getByLabelText('Critical Path Only');
      await user.click(criticalPathCheckbox);
      
      // Reset filters
      const resetButton = screen.getByTestId('reset-icon').closest('button');
      await user.click(resetButton!);
      
      // Should show all stages again and clear search
      expect(screen.getByTestId('stage-card-stage-1')).toBeInTheDocument();
      expect(screen.getByTestId('stage-card-stage-2')).toBeInTheDocument();
      expect(searchInput).toHaveValue('');
      expect(criticalPathCheckbox).not.toBeChecked();
    });

    it('shows "No stages found" when filters match no stages', async () => {
      const user = userEvent.setup();
      render(<JourneyTimeline />);
      
      // Open filter panel and search for non-existent stage
      const filterButton = screen.getByTestId('filter-icon').closest('button');
      await user.click(filterButton!);
      
      const searchInput = screen.getByPlaceholderText('Search stages...');
      await user.type(searchInput, 'nonexistent');
      
      expect(screen.getByText('No stages found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or search terms')).toBeInTheDocument();
    });
  });

  describe('Stage Interaction', () => {
    it('opens stage details modal when stage is clicked', async () => {
      const user = userEvent.setup();
      render(<JourneyTimeline />);
      
      const stageCard = screen.getByTestId('stage-card-stage-1');
      await user.click(stageCard);
      
      expect(screen.getByTestId('stage-details-modal')).toBeInTheDocument();
      // Use more specific selector to avoid ambiguity
      expect(screen.getByTestId('stage-details-modal')).toHaveTextContent('Site Preparation');
    });

    it('closes stage details modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<JourneyTimeline />);
      
      // Open modal
      const stageCard = screen.getByTestId('stage-card-stage-1');
      await user.click(stageCard);
      
      // Close modal
      const closeButton = screen.getByTestId('close-modal');
      await user.click(closeButton);
      
      expect(screen.queryByTestId('stage-details-modal')).not.toBeInTheDocument();
    });

    it('calls onStageClick callback when provided', async () => {
      const mockOnStageClick = jest.fn();
      const user = userEvent.setup();
      
      render(<JourneyTimeline onStageClick={mockOnStageClick} />);
      
      const stageCard = screen.getByTestId('stage-card-stage-1');
      await user.click(stageCard);
      
      expect(mockOnStageClick).toHaveBeenCalledWith(mockStages[0]);
    });

    it('updates progress when update button is clicked', async () => {
      const mockUpdateProgress = jest.fn().mockResolvedValue({});
      const mockRefetchProgress = jest.fn();
      
      mockUseJourneyProgress.mockReturnValue({
        ...defaultProgressReturns,
        updateProgress: mockUpdateProgress,
        refetch: mockRefetchProgress
      });
      
      const user = userEvent.setup();
      render(<JourneyTimeline />);
      
      const updateButton = screen.getByTestId('update-progress-stage-1');
      await user.click(updateButton);
      
      expect(mockUpdateProgress).toHaveBeenCalledWith({
        stage_id: 'stage-1',
        status: 'in_progress'
      });
      expect(mockRefetchProgress).toHaveBeenCalled();
    });

    it('calls onProgressUpdate callback when provided', async () => {
      const mockOnProgressUpdate = jest.fn();
      const mockUpdateProgress = jest.fn().mockResolvedValue({});
      
      mockUseJourneyProgress.mockReturnValue({
        ...defaultProgressReturns,
        updateProgress: mockUpdateProgress
      });
      
      const user = userEvent.setup();
      render(<JourneyTimeline onProgressUpdate={mockOnProgressUpdate} />);
      
      const updateButton = screen.getByTestId('update-progress-stage-1');
      await user.click(updateButton);
      
      await waitFor(() => {
        expect(mockOnProgressUpdate).toHaveBeenCalledWith({
          stage_id: 'stage-1',
          status: 'in_progress'
        });
      });
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading spinner when data is loading', () => {
      mockUseJourneyStages.mockReturnValue({
        ...defaultHookReturns,
        loading: true
      });
      
      render(<JourneyTimeline />);
      
      // Look for the loading spinner by class name
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('shows error state when stages fail to load', () => {
      const mockRefetch = jest.fn();
      mockUseJourneyStages.mockReturnValue({
        ...defaultHookReturns,
        loading: false,
        error: new Error('Failed to fetch'),
        refetch: mockRefetch
      });
      
      render(<JourneyTimeline />);
      
      expect(screen.getByText('Failed to load journey stages')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('retries loading when try again button is clicked', async () => {
      const mockRefetch = jest.fn();
      mockUseJourneyStages.mockReturnValue({
        ...defaultHookReturns,
        loading: false,
        error: new Error('Failed to fetch'),
        refetch: mockRefetch
      });
      
      const user = userEvent.setup();
      render(<JourneyTimeline />);
      
      const tryAgainButton = screen.getByText('Try Again');
      await user.click(tryAgainButton);
      
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('shows 3D placeholder when in 3D mode', async () => {
      const user = userEvent.setup();
      render(<JourneyTimeline />);
      
      // Switch to 3D mode
      const threeDButton = screen.getByText('3D');
      await user.click(threeDButton);
      
      expect(screen.getByText('3D Timeline view coming soon...')).toBeInTheDocument();
      expect(screen.getByText('This will render the interactive 3D timeline visualization')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('hides progress tracker on mobile screens', () => {
      render(<JourneyTimeline />);
      
      const progressTracker = screen.getByTestId('progress-tracker').parentElement?.parentElement;
      expect(progressTracker).toHaveClass('hidden', 'lg:block');
    });

    it('stacks header elements on mobile screens', () => {
      render(<JourneyTimeline />);
      
      // Look for the specific header container with the responsive classes
      const headerContainer = document.querySelector('.flex.flex-col.lg\\:flex-row');
      expect(headerContainer).toBeInTheDocument();
      expect(headerContainer).toHaveClass('flex-col', 'lg:flex-row');
    });
  });

  describe('Props Integration', () => {
    it('uses initial data props when provided', () => {
      const customStages = [mockStages[0]];
      const customProgress = [mockProgress[0]];
      const customDependencies = [mockDependencies[0]];
      
      render(
        <JourneyTimeline 
          initialStages={customStages}
          userProgress={customProgress}
          dependencies={customDependencies}
        />
      );
      
      expect(mockUseJourneyStages).toHaveBeenCalledWith(
        expect.any(Object),
        { initialData: customStages }
      );
      expect(mockUseJourneyProgress).toHaveBeenCalledWith(
        { initialData: customProgress }
      );
      expect(mockUseJourneyDependencies).toHaveBeenCalledWith(
        { format: 'graph', initialData: customDependencies }
      );
    });

    it('handles empty initial data gracefully', () => {
      mockUseJourneyStages.mockReturnValue({
        stages: [],
        loading: false,
        error: null,
        refetch: jest.fn()
      });
      
      render(<JourneyTimeline initialStages={[]} />);
      
      expect(screen.getByText('No stages found')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<JourneyTimeline />);
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Build Journey Timeline');
    });

    it('has accessible form controls', async () => {
      const user = userEvent.setup();
      render(<JourneyTimeline />);
      
      // Open filter panel
      const filterButton = screen.getByTestId('filter-icon').closest('button');
      await user.click(filterButton!);
      
      // Check form elements
      expect(screen.getByLabelText('Critical Path Only')).toBeInTheDocument();
      expect(screen.getByLabelText('Premium Content')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search stages...')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(<JourneyTimeline />);
      
      // Tab through interactive elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });
}); 