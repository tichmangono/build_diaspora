import { ReactNode } from 'react'
import { AlertTriangle, Bug } from 'lucide-react'
import Button from './Button'

interface ErrorStateProps {
  title: string
  description?: string
  icon?: ReactNode
  error?: Error | string
  showError?: boolean
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
  variant?: 'danger' | 'warning' | 'info'
}

export function ErrorState({
  title,
  description,
  icon,
  error,
  showError = false,
  action,
  secondaryAction,
  className = '',
  size = 'md',
  variant = 'danger'
}: ErrorStateProps) {
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

  const variantClasses = {
    danger: 'text-error',
    warning: 'text-warning',
    info: 'text-info'
  }

  const errorMessage = typeof error === 'string' ? error : error?.message

  return (
    <div className={`text-center ${sizeClasses[size]} ${className}`}>
      {icon && (
        <div className={`${iconSizeClasses[size]} mx-auto mb-6 ${variantClasses[variant]} animate-bounce-subtle`}>
          {icon}
        </div>
      )}
      
      <h3 className="text-heading-2 font-semibold text-neutral-900 mb-2 animate-fade-in">
        {title}
      </h3>
      
      {description && (
        <p className="text-body text-neutral-600 mb-4 max-w-md mx-auto animate-fade-in">
          {description}
        </p>
      )}

      {showError && errorMessage && (
        <details className="mb-6 text-left max-w-md mx-auto">
          <summary className="cursor-pointer text-caption text-neutral-500 hover:text-neutral-700 transition-colors">
            Show error details
          </summary>
          <div className="mt-2 p-3 bg-neutral-50 rounded border text-caption text-neutral-600 font-mono overflow-x-auto">
            {errorMessage}
          </div>
        </details>
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

// Pre-built error state patterns
export function NetworkErrorState({ 
  onRetry,
  onGoBack 
}: {
  onRetry?: () => void
  onGoBack?: () => void
}) {
  return (
    <ErrorState
      variant="warning"
      title="Connection failed"
      description="Unable to connect to the server. Please check your internet connection and try again."
      icon={<AlertTriangle className="w-full h-full" />}
      action={onRetry ? {
        label: "Try again",
        onClick: onRetry,
        variant: 'primary'
      } : undefined}
      secondaryAction={onGoBack ? {
        label: "Go back",
        onClick: onGoBack,
        variant: 'ghost'
      } : undefined}
    />
  )
}

export function NotFoundErrorState({ 
  onGoHome,
  onGoBack,
  resource = "page"
}: {
  onGoHome?: () => void
  onGoBack?: () => void
  resource?: string
}) {
  return (
    <ErrorState
      variant="info"
      title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} not found`}
      description={`The ${resource} you're looking for doesn't exist or has been moved.`}
      icon={
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 12L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 8L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      }
      action={onGoHome ? {
        label: "Go home",
        onClick: onGoHome,
        variant: 'primary'
      } : undefined}
      secondaryAction={onGoBack ? {
        label: "Go back",
        onClick: onGoBack,
        variant: 'ghost'
      } : undefined}
    />
  )
}

export function UnauthorizedErrorState({ 
  onLogin,
  onGoHome 
}: {
  onLogin?: () => void
  onGoHome?: () => void
}) {
  return (
    <ErrorState
      variant="warning"
      title="Access denied"
      description="You don't have permission to view this page. Please sign in with an authorized account."
      icon={
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="16" r="1" fill="currentColor"/>
          <path d="M7 11V7C7 4.79086 9.79086 2 12 2C14.2091 2 17 4.79086 17 7V11" stroke="currentColor" strokeWidth="2"/>
        </svg>
      }
      action={onLogin ? {
        label: "Sign in",
        onClick: onLogin,
        variant: 'primary'
      } : undefined}
      secondaryAction={onGoHome ? {
        label: "Go home",
        onClick: onGoHome,
        variant: 'ghost'
      } : undefined}
    />
  )
}

export function ServerErrorState({ 
  error,
  onRetry,
  onReport 
}: {
  error?: Error | string
  onRetry?: () => void
  onReport?: () => void
}) {
  return (
    <ErrorState
      variant="danger"
      title="Something went wrong"
      description="An unexpected error occurred. Our team has been notified and is working on a fix."
      error={error}
      showError={!!error}
      icon={<Bug className="w-full h-full" />}
      action={onRetry ? {
        label: "Try again",
        onClick: onRetry,
        variant: 'primary'
      } : undefined}
      secondaryAction={onReport ? {
        label: "Report issue",
        onClick: onReport,
        variant: 'ghost'
      } : undefined}
    />
  )
}

export default ErrorState 