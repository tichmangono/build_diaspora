'use client'

import React, { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@/lib/hooks'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
  requireVerification?: boolean
  requireCompleteProfile?: boolean
  allowedRoles?: string[]
  fallbackComponent?: ReactNode
}

export function ProtectedRoute({
  children,
  redirectTo = '/auth/login',
  requireVerification = false,
  requireCompleteProfile = false,
  allowedRoles = [],
  fallbackComponent,
}: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth()
  const { profile } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!initialized || loading) return

    // Not authenticated - redirect to login
    if (!user) {
      const currentPath = window.location.pathname + window.location.search
      const loginUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`
      router.push(loginUrl)
      return
    }

    // Check verification requirement
    if (requireVerification && profile && !profile.is_verified) {
      router.push('/verification/required')
      return
    }

    // Check profile completion requirement
    if (requireCompleteProfile && profile) {
      const isProfileComplete = !!(
        profile.full_name?.trim() &&
        profile.profession?.trim() &&
        profile.location?.trim()
      )

      if (!isProfileComplete) {
        router.push('/profile/setup?required=true')
        return
      }
    }

    // Check role-based access (if roles are implemented)
    if (allowedRoles.length > 0 && profile) {
      // Placeholder for role checking - implement based on your role system
      // const userRoles = profile.roles || []
      // const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role))
      // if (!hasRequiredRole) {
      //   router.push('/unauthorized')
      //   return
      // }
    }
  }, [
    user,
    profile,
    loading,
    initialized,
    router,
    redirectTo,
    requireVerification,
    requireCompleteProfile,
    allowedRoles,
  ])

  // Show loading while checking authentication
  if (!initialized || loading) {
    return fallbackComponent || <ProtectedRouteLoading />
  }

  // Don't render children if not authenticated (redirect is in progress)
  if (!user) {
    return fallbackComponent || <ProtectedRouteLoading />
  }

  // Additional checks for verification and profile completion
  if (requireVerification && profile && !profile.is_verified) {
    return fallbackComponent || <ProtectedRouteLoading />
  }

  if (requireCompleteProfile && profile) {
    const isProfileComplete = !!(
      profile.full_name?.trim() &&
      profile.profession?.trim() &&
      profile.location?.trim()
    )

    if (!isProfileComplete) {
      return fallbackComponent || <ProtectedRouteLoading />
    }
  }

  // All checks passed, render the protected content
  return <>{children}</>
}

// Default loading component for protected routes
function ProtectedRouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-slate-600">Verifying access...</p>
      </div>
    </div>
  )
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  const WrappedComponent = (props: P) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Specific protected route variants
export function VerifiedRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireVerification'>) {
  return (
    <ProtectedRoute requireVerification={true} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function CompleteProfileRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireCompleteProfile'>) {
  return (
    <ProtectedRoute requireCompleteProfile={true} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={['admin']} {...props}>
      {children}
    </ProtectedRoute>
  )
}

// Hook for programmatic route protection
export function useRouteProtection(
  options: {
    requireAuth?: boolean
    requireVerification?: boolean
    requireCompleteProfile?: boolean
    allowedRoles?: string[]
    redirectTo?: string
  } = {}
) {
  const { user, loading, initialized } = useAuth()
  const { profile } = useUser()
  const router = useRouter()

  const {
    requireAuth = true,
    requireVerification = false,
    requireCompleteProfile = false,
    allowedRoles = [],
    redirectTo = '/auth/login',
  } = options

  useEffect(() => {
    if (!initialized || loading) return

    if (requireAuth && !user) {
      const currentPath = window.location.pathname + window.location.search
      const loginUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`
      router.push(loginUrl)
      return
    }

    if (requireVerification && profile && !profile.is_verified) {
      router.push('/verification/required')
      return
    }

    if (requireCompleteProfile && profile) {
      const isProfileComplete = !!(
        profile.full_name?.trim() &&
        profile.profession?.trim() &&
        profile.location?.trim()
      )

      if (!isProfileComplete) {
        router.push('/profile/setup?required=true')
        return
      }
    }

    // Role-based protection (placeholder)
    if (allowedRoles.length > 0 && profile) {
      // Implement role checking logic here
    }
  }, [
    user,
    profile,
    loading,
    initialized,
    router,
    requireAuth,
    requireVerification,
    requireCompleteProfile,
    allowedRoles,
    redirectTo,
  ])

  return {
    isAuthorized: !!user,
    loading: loading || !initialized,
    user,
    profile,
  }
} 