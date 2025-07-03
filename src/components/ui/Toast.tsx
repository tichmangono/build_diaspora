'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastComponent({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }
  
  const styles = {
    success: 'bg-white border-l-4 border-success shadow-lg',
    error: 'bg-white border-l-4 border-error shadow-lg',
    warning: 'bg-white border-l-4 border-warning shadow-lg',
    info: 'bg-white border-l-4 border-info shadow-lg',
  }
  
  const iconStyles = {
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-info',
  }

  const Icon = icons[toast.type]

  return (
    <div 
      className={`
        ${styles[toast.type]} 
        rounded-lg p-4 mb-3 max-w-sm mx-auto
        animate-slide-down
        transition-all duration-300 ease-out-custom
      `}
      data-testid={`toast-${toast.type}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <Icon className={`w-5 h-5 ${iconStyles[toast.type]} mr-3 mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="text-body-small font-medium text-neutral-900">
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-caption text-neutral-600 mt-1">
              {toast.description}
            </p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="ml-3 p-1 rounded-md hover:bg-neutral-100 transition-colors focus-ring"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 text-neutral-400" />
        </button>
      </div>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-toast pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toastData, id }
    
    setToasts((prev) => [...prev, newToast])

    // Auto-remove after duration
    const duration = toastData.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

// Helper functions for easy usage
export const toast = {
  success: (title: string, description?: string) => {
    if (typeof window !== 'undefined') {
      // This will work if ToastProvider is available
      const event = new CustomEvent('toast', {
        detail: { type: 'success', title, description }
      })
      window.dispatchEvent(event)
    }
  },
  error: (title: string, description?: string) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('toast', {
        detail: { type: 'error', title, description }
      })
      window.dispatchEvent(event)
    }
  },
  warning: (title: string, description?: string) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('toast', {
        detail: { type: 'warning', title, description }
      })
      window.dispatchEvent(event)
    }
  },
  info: (title: string, description?: string) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('toast', {
        detail: { type: 'info', title, description }
      })
      window.dispatchEvent(event)
    }
  },
} 