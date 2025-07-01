import { createClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/client'

type Profile = Database['public']['Tables']['profiles']['Row']

// Server-side authentication check
export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error in getUser:', error)
    return null
  }
}

// Get user profile with authentication check
export async function getUserProfile(): Promise<Profile | null> {
  const user = await getUser()
  
  if (!user) {
    return null
  }
  
  const supabase = await createClient()
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }
    
    return profile
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

// Require authentication for protected pages
export async function requireAuth(): Promise<User> {
  const user = await getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  return user
}

// Require authentication and return profile
export async function requireProfile(): Promise<Profile> {
  await requireAuth() // Ensure user is authenticated
  const profile = await getUserProfile()
  
  if (!profile) {
    // If user exists but no profile, redirect to profile setup
    redirect('/auth/profile-setup')
  }
  
  return profile
}

// Check if user is verified
export async function isUserVerified(): Promise<boolean> {
  const profile = await getUserProfile()
  return profile?.is_verified ?? false
}

// Client-side authentication utilities
export const clientAuth = {
  // Sign up with email and password
  async signUp(email: string, password: string, userData: {
    fullName: string
    phone?: string
    profession?: string
    location?: string
  }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            phone: userData.phone,
            profession: userData.profession,
            location: userData.location,
          },
        },
      })
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  },

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) {
        throw error
      }
      
      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error }
    }
  },

  // Update password
  async updatePassword(password: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })
      
      if (error) {
        throw error
      }
      
      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { error }
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }
      
      return { session, error: null }
    } catch (error) {
      console.error('Get session error:', error)
      return { session: null, error }
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Profile management utilities
export const profileUtils = {
  // Create or update user profile
  async upsertProfile(userId: string, profileData: Partial<Profile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Upsert profile error:', error)
      return { data: null, error }
    }
  },

  // Get profile by user ID
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Get profile error:', error)
      return { data: null, error }
    }
  },

  // Update profile avatar
  async updateAvatar(userId: string, avatarFile: File) {
    try {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      const { data, error } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Update avatar error:', error)
      return { data: null, error }
    }
  },
}

// Verification utilities
export const verificationUtils = {
  // Submit verification request
  async submitVerificationRequest(
    userId: string,
    verificationType: 'professional' | 'identity' | 'business',
    documents: string[],
    additionalInfo?: string
  ) {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: userId,
          verification_type: verificationType,
          documents,
          status: 'pending',
          admin_notes: additionalInfo,
        })
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Submit verification request error:', error)
      return { data: null, error }
    }
  },

  // Get verification requests for user
  async getUserVerificationRequests(userId: string) {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Get verification requests error:', error)
      return { data: null, error }
    }
  },
}

// Rate limiting utilities
export const rateLimitUtils = {
  // Simple in-memory rate limiting (for development)
  // In production, use Redis or database-based rate limiting
  attempts: new Map<string, { count: number; resetTime: number }>(),

  isRateLimited(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs })
      return false
    }

    if (record.count >= maxAttempts) {
      return true
    }

    record.count++
    return false
  },

  clearAttempts(identifier: string): void {
    this.attempts.delete(identifier)
  },
} 