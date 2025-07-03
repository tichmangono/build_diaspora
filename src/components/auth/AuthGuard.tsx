'use client'

import React, { ReactNode } from 'react'
import { useProtectedRoute, useUser } from '@/lib/hooks'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, Lock } from 'lucide-react'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
  requireVerification?: boolean
  requireCompleteProfile?: boolean
  loadingComponent?: ReactNode
  unauthorizedComponent?: ReactNode
}

export function AuthGuard({
  children,
  fallback,
  redirectTo = '/auth/login',
  requireVerification = false,
  requireCompleteProfile = false,
  loadingComponent,
  unauthorizedComponent,
}: AuthGuardProps) {
  const { isAuthorized, loading, user } = useProtectedRoute(redirectTo)
  const { profile } = useUser()

  // Show loading state while checking authentication
  if (loading) {
    return loadingComponent || <AuthGuardLoading />
  }

  // If not authorized, show fallback or unauthorized component
  if (!isAuthorized) {
    return unauthorizedComponent || fallback || <AuthGuardUnauthorized redirectTo={redirectTo} />
  }

  // Check for verification requirement
  if (requireVerification && user && profile && !profile.is_verified) {
    return <AuthGuardVerificationRequired />
  }

  // Check for complete profile requirement
  if (requireCompleteProfile && user && profile) {
    const isProfileComplete = !!(
      profile.full_name?.trim() &&
      profile.profession?.trim() &&
      profile.location?.trim()
    )

    if (!isProfileComplete) {
      return <AuthGuardProfileIncomplete />
    }
  }

  // All checks passed, render children
  return <>{children}</>
}

// Default loading component
function AuthGuardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-slate-600">Checking authentication...</p>
      </div>
    </div>
  )
}

// Default unauthorized component
function AuthGuardUnauthorized({ redirectTo }: { redirectTo: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center">
          <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Authentication Required
          </h3>
          <p className="text-slate-600 mb-6">
            You need to be signed in to access this content.
          </p>
          <Button 
            onClick={() => window.location.href = redirectTo}
            className="w-full"
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Verification required component
function AuthGuardVerificationRequired() {
  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Verification Required
          </h3>
          <p className="text-slate-600 mb-6">
            This content requires a verified account. Please complete the verification process to continue.
          </p>
          <Button 
            onClick={() => window.location.href = '/verification/apply'}
            className="w-full"
          >
            Apply for Verification
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Profile completion required component
function AuthGuardProfileIncomplete() {
  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Complete Your Profile
          </h3>
          <p className="text-slate-600 mb-6">
            Please complete your profile with required information to access this content.
          </p>
          <Button 
            onClick={() => window.location.href = '/profile/setup'}
            className="w-full"
          >
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Specific guard for admin content
export function AdminGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  // Add admin check logic here based on your user roles system
  const isAdmin = false // Placeholder - implement your admin check logic

  if (!isAdmin) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Access Denied
            </h3>
            <p className="text-slate-600">
              You don&apos;t have permission to access this content.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

// Guard for verified professionals only
export function VerifiedProfessionalGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <AuthGuard 
      requireVerification={true}
      requireCompleteProfile={true}
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  )
}

// Simple auth requirement guard
export function RequireAuth({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <AuthGuard fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

// Verification requirement guard
export function RequireVerification({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <AuthGuard 
      requireVerification={true}
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  )
}

// Complete profile requirement guard
export function RequireCompleteProfile({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <AuthGuard 
      requireCompleteProfile={true}
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  )
} 