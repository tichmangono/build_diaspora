'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth, useUser } from '@/lib/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'

// Hook for handling authentication redirects
export function useAuthRedirect() {
  const { user, initialized } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const returnTo = searchParams.get('returnTo')

  useEffect(() => {
    if (initialized && user) {
      // User is authenticated, redirect to intended destination
      const destination = returnTo || redirectTo
      router.push(destination)
    }
  }, [user, initialized, router, redirectTo, returnTo])

  return { redirectTo, returnTo }
}

// Hook for protecting routes that require authentication
export function useProtectedRoute(redirectTo: string = '/auth/login') {
  const { user, loading, initialized } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (initialized && !loading) {
      if (!user) {
        // Not authenticated, redirect to login
        const currentPath = window.location.pathname
        const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`
        router.push(redirectUrl)
        setIsAuthorized(false)
      } else {
        setIsAuthorized(true)
      }
    }
  }, [user, loading, initialized, router, redirectTo])

  return {
    isAuthorized,
    loading: loading || !initialized,
    user,
  }
}

// Hook for checking if user has completed profile setup
export function useProfileCompletion() {
  const { profile, user } = useUser()

  const isProfileComplete = useCallback(() => {
    if (!profile || !user) return false

    // Check required fields for a complete profile
    const requiredFields = [
      profile.full_name,
      profile.profession,
      profile.location,
    ]

    return requiredFields.every(field => field && field.trim().length > 0)
  }, [profile, user])

  const missingFields = useCallback(() => {
    if (!profile) return []

    const fields = []
    if (!profile.full_name?.trim()) fields.push('Full Name')
    if (!profile.profession?.trim()) fields.push('Profession')
    if (!profile.location?.trim()) fields.push('Location')

    return fields
  }, [profile])

  return {
    isComplete: isProfileComplete(),
    missingFields: missingFields(),
    profile,
    hasProfile: !!profile,
  }
}

// Hook for authentication form state management
export function useAuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError(error.message)
    } else if (typeof error === 'string') {
      setError(error)
    } else {
      setError('An unexpected error occurred')
    }
    setSuccess(null)
  }, [])

  const handleSuccess = useCallback((message: string) => {
    setSuccess(message)
    setError(null)
  }, [])

  return {
    isLoading,
    setIsLoading,
    error,
    success,
    clearMessages,
    handleError,
    handleSuccess,
  }
}

// Hook for user avatar management
export function useUserAvatar() {
  const { profile, updateProfile } = useAuth()
  const [uploading, setUploading] = useState(false)

  const uploadAvatar = useCallback(async (file: File) => {
    if (!profile) return { error: 'No user profile found' }

    setUploading(true)
    try {
      // This would integrate with your avatar upload utility
      // For now, we'll just update the profile with a placeholder
      const result = await updateProfile({
        avatar_url: `https://placeholder.avatar.url/${file.name}`,
      })

      return result
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Upload failed' }
    } finally {
      setUploading(false)
    }
  }, [profile, updateProfile])

  const removeAvatar = useCallback(async () => {
    if (!profile) return { error: 'No user profile found' }

    return await updateProfile({
      avatar_url: null,
    })
  }, [profile, updateProfile])

  return {
    avatar: profile?.avatar_url,
    uploading,
    uploadAvatar,
    removeAvatar,
  }
}

// Hook for checking user verification status
export function useUserVerification() {
  const { profile } = useUser()

  return {
    isVerified: profile?.is_verified || false,
    canApplyForVerification: !!profile?.profession && !!profile?.full_name,
    verificationLevel: profile?.is_verified ? 'verified' : 'unverified',
  }
}

// Hook for user activity tracking
export function useUserActivity() {
  const { updateProfile } = useAuth()

  const updateLastActive = useCallback(async () => {
    try {
      await updateProfile({
        last_active: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to update last active:', error)
    }
  }, [updateProfile])

  // Update activity on mount and periodically
  useEffect(() => {
    updateLastActive()

    // Update every 5 minutes while user is active
    const interval = setInterval(updateLastActive, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [updateLastActive])

  return { updateLastActive }
}

// Hook for handling authentication state in forms
export function useAuthFormState() {
  const { signIn, signUp, resetPassword, updatePassword } = useAuth()
  const { isLoading, setIsLoading, error, success, handleError, handleSuccess, clearMessages } = useAuthForm()

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    clearMessages()

    try {
      const { error } = await signIn(email, password)
      if (error) {
        handleError(error.message)
        return { success: false, error }
      }
      
      handleSuccess('Successfully signed in!')
      return { success: true, error: null }
    } catch (err) {
      handleError(err)
      return { success: false, error: err }
    } finally {
      setIsLoading(false)
    }
  }, [signIn, setIsLoading, clearMessages, handleError, handleSuccess])

  const handleSignUp = useCallback(async (
    email: string, 
    password: string, 
    userData: { fullName: string; phone?: string; profession?: string; location?: string }
  ) => {
    setIsLoading(true)
    clearMessages()

    try {
      const { error } = await signUp(email, password, userData)
      if (error) {
        handleError(error.message)
        return { success: false, error }
      }
      
      handleSuccess('Account created successfully! Please check your email to verify your account.')
      return { success: true, error: null }
    } catch (err) {
      handleError(err)
      return { success: false, error: err }
    } finally {
      setIsLoading(false)
    }
  }, [signUp, setIsLoading, clearMessages, handleError, handleSuccess])

  const handlePasswordReset = useCallback(async (email: string) => {
    setIsLoading(true)
    clearMessages()

    try {
      const { error } = await resetPassword(email)
      if (error) {
        handleError(error.message)
        return { success: false, error }
      }
      
      handleSuccess('Password reset instructions sent to your email!')
      return { success: true, error: null }
    } catch (err) {
      handleError(err)
      return { success: false, error: err }
    } finally {
      setIsLoading(false)
    }
  }, [resetPassword, setIsLoading, clearMessages, handleError, handleSuccess])

  const handlePasswordUpdate = useCallback(async (password: string) => {
    setIsLoading(true)
    clearMessages()

    try {
      const { error } = await updatePassword(password)
      if (error) {
        handleError(error.message)
        return { success: false, error }
      }
      
      handleSuccess('Password updated successfully!')
      return { success: true, error: null }
    } catch (err) {
      handleError(err)
      return { success: false, error: err }
    } finally {
      setIsLoading(false)
    }
  }, [updatePassword, setIsLoading, clearMessages, handleError, handleSuccess])

  return {
    isLoading,
    error,
    success,
    clearMessages,
    handleSignIn,
    handleSignUp,
    handlePasswordReset,
    handlePasswordUpdate,
  }
}

// Hook for session management
export function useSession() {
  const { session, user, loading, initialized } = useAuth()

  const isSessionValid = useCallback(() => {
    if (!session) return false
    
    const now = new Date().getTime() / 1000
    return session.expires_at ? session.expires_at > now : true
  }, [session])

  const getSessionTimeLeft = useCallback(() => {
    if (!session?.expires_at) return null
    
    const now = new Date().getTime() / 1000
    const timeLeft = session.expires_at - now
    
    return Math.max(0, timeLeft)
  }, [session])

  return {
    session,
    user,
    loading,
    initialized,
    isValid: isSessionValid(),
    timeLeft: getSessionTimeLeft(),
    expiresAt: session?.expires_at ? new Date(session.expires_at * 1000) : null,
  }
} 