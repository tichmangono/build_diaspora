import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/client'

type Profile = Database['public']['Tables']['profiles']['Row']

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

  // Update user profile
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
      console.error('Update profile error:', error)
      return { data: null, error }
    }
  },

  // Get user profile
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

  // Upload avatar
  async updateAvatar(userId: string, avatarFile: File) {
    try {
      // Generate unique filename
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${userId}/avatar.${fileExt}`
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        })
      
      if (uploadError) {
        throw uploadError
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      // Update profile with new avatar URL
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()
      
      if (profileError) {
        throw profileError
      }
      
      return { data: { uploadData, profileData, publicUrl }, error: null }
    } catch (error) {
      console.error('Update avatar error:', error)
      return { data: null, error }
    }
  },

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
          additional_info: additionalInfo,
          status: 'pending',
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

  // Get user verification requests
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

// Rate limiting utilities (client-side)
export const rateLimitUtils = {
  // Check if identifier is rate limited
  isRateLimited(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
    const key = `rate_limit_${identifier}`
    const now = Date.now()
    const stored = localStorage.getItem(key)
    
    if (!stored) {
      localStorage.setItem(key, JSON.stringify({ attempts: 1, firstAttempt: now }))
      return false
    }
    
    const data = JSON.parse(stored)
    
    // Reset if window has passed
    if (now - data.firstAttempt > windowMs) {
      localStorage.setItem(key, JSON.stringify({ attempts: 1, firstAttempt: now }))
      return false
    }
    
    // Check if exceeded max attempts
    if (data.attempts >= maxAttempts) {
      return true
    }
    
    // Increment attempts
    localStorage.setItem(key, JSON.stringify({ attempts: data.attempts + 1, firstAttempt: data.firstAttempt }))
    return false
  },

  // Clear rate limit attempts
  clearAttempts(identifier: string): void {
    const key = `rate_limit_${identifier}`
    localStorage.removeItem(key)
  },
} 