import { ReactNode } from 'react'
import Button from './Button'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost'
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  className = '',
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-8 px-4',
    md: 'py-12 px-6',
    lg: 'py-16 px-8'
  }

  const iconSizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  }

  return (
    <div className={`text-center ${sizeClasses[size]} ${className}`}>
      {icon && (
        <div className={`${iconSizeClasses[size]} mx-auto mb-6 text-neutral-400 animate-fade-in`}>
          {icon}
        </div>
      )}
      
      <h3 className="text-heading-2 font-semibold text-neutral-900 mb-2 animate-fade-in">
        {title}
      </h3>
      
      {description && (
        <p className="text-body text-neutral-600 mb-6 max-w-md mx-auto animate-fade-in">
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || 'ghost'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Pre-built empty state patterns
export function NoDataEmptyState({ 
  title = "No data found",
  description = "There's no data to show here yet.",
  onRefresh 
}: {
  title?: string
  description?: string
  onRefresh?: () => void
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <path
            d="M9 17H7C4.79086 17 3 15.2091 3 13V8C3 5.79086 4.79086 4 7 4H17C19.2091 4 21 5.79086 21 8V13C21 15.2091 19.2091 17 17 17H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 20L9 17H15L12 20Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      action={onRefresh ? {
        label: "Refresh",
        onClick: onRefresh,
        variant: 'primary'
      } : undefined}
    />
  )
}

export function NoSearchResultsEmptyState({ 
  searchQuery,
  onClearSearch 
}: {
  searchQuery?: string
  onClearSearch?: () => void
}) {
  return (
    <EmptyState
      title="No results found"
      description={
        searchQuery 
          ? `We couldn't find anything matching "${searchQuery}". Try adjusting your search.`
          : "No results match your current filters."
      }
      icon={
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <circle
            cx="11"
            cy="11"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="m21 21-4.35-4.35"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 11H14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      }
      action={onClearSearch ? {
        label: "Clear search",
        onClick: onClearSearch,
        variant: 'primary'
      } : undefined}
    />
  )
}

export function NoNetworkEmptyState({ 
  onRetry 
}: {
  onRetry?: () => void
}) {
  return (
    <EmptyState
      title="Connection issue"
      description="Unable to load data. Please check your internet connection and try again."
      icon={
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <path
            d="M3 7L9 13L15 7L21 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 17L9 11L15 17L21 11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2 2"
          />
        </svg>
      }
      action={onRetry ? {
        label: "Try again",
        onClick: onRetry,
        variant: 'primary'
      } : undefined}
    />
  )
}

export default EmptyState 