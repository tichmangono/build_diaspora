'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { clientAuth } from '@/lib/auth/client'

// Types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  location: string | null
  profession: string | null
  company: string | null
  bio: string | null
  website: string | null
  linkedin_url: string | null
  avatar_url: string | null
  is_verified: boolean
  created_at: string
  last_active: string | null
}

export interface AuthContextType {
  // State
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  initialized: boolean
  
  // Methods
  signUp: (email: string, password: string, userData: {
    fullName: string
    phone?: string
    profession?: string
    location?: string
  }) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (password: string) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: any; error: any }>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        
        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          
          // If we have a user, fetch their profile
          if (initialSession?.user) {
            await fetchProfile(initialSession.user.id)
          }
          
          setLoading(false)
          setInitialized(true)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (event === 'SIGNED_IN' && session?.user) {
            await fetchProfile(session.user.id)
          } else if (event === 'SIGNED_OUT') {
            setProfile(null)
          }
          
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await clientAuth.getProfile(userId)
      
      if (error) {
        console.error('Error fetching profile:', error)
        return
      }
      
      if (data) {
        setProfile({
          id: data.id,
          email: data.email || user?.email || '',
          full_name: data.full_name,
          phone: data.phone,
          location: data.location,
          profession: data.profession,
          company: data.company,
          bio: data.bio,
          website: data.website,
          linkedin_url: data.linkedin_url,
          avatar_url: data.avatar_url,
          is_verified: data.is_verified || false,
          created_at: data.created_at,
          last_active: data.last_active,
        })
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error)
    }
  }

  // Auth methods
  const signUp = async (email: string, password: string, userData: {
    fullName: string
    phone?: string
    profession?: string
    location?: string
  }) => {
    setLoading(true)
    try {
      const result = await clientAuth.signUp(email, password, userData)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await clientAuth.signIn(email, password)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const result = await clientAuth.signOut()
      // Clear local state
      setUser(null)
      setProfile(null)
      setSession(null)
      return result
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    return await clientAuth.resetPassword(email)
  }

  const updatePassword = async (password: string) => {
    return await clientAuth.updatePassword(password)
  }

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) {
      return { data: null, error: new Error('No authenticated user') }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          location: updates.location,
          profession: updates.profession,
          company: updates.company,
          bio: updates.bio,
          website: updates.website,
          linkedin_url: updates.linkedin_url,
          avatar_url: updates.avatar_url,
          last_active: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return { data: null, error }
      }

      // Refresh profile data
      await refreshProfile()
      return { data, error: null }
    } catch (error) {
      console.error('Error in updateProfile:', error)
      return { data: null, error }
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    initialized,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook that requires authentication
export function useRequireAuth() {
  const auth = useAuth()
  
  useEffect(() => {
    if (auth.initialized && !auth.loading && !auth.user) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname)
    }
  }, [auth.initialized, auth.loading, auth.user])
  
  return auth
}

// Hook to get user data with loading state
export function useUser() {
  const { user, profile, loading, initialized } = useAuth()
  
  return {
    user,
    profile,
    loading,
    initialized,
    isAuthenticated: !!user,
    hasProfile: !!profile,
  }
} 