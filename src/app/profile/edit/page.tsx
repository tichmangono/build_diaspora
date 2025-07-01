'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProfileForm from '@/components/profile/ProfileForm'
import { clientAuth } from '@/lib/auth/client'
import { type ProfileUpdateFormData } from '@/lib/validations/auth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function ProfileEditPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<Partial<ProfileUpdateFormData> | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Load current profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get current user
        const { session, error: sessionError } = await clientAuth.getSession()
        
        if (sessionError || !session?.user) {
          router.push('/auth/login')
          return
        }

        const currentUserId = session.user.id
        setUserId(currentUserId)

        // Get user profile
        const { data: profile, error: profileError } = await clientAuth.getProfile(currentUserId)
        
        if (profileError) {
          console.error('Error loading profile:', profileError)
          // Continue with empty profile data for new users
        }
        
        if (profile) {
          setProfileData({
            fullName: profile.full_name || '',
            phone: profile.phone || '',
            location: profile.location || '',
            profession: profile.profession || '',
            company: profile.company || '',
            bio: profile.bio || '',
            website: profile.website || '',
            linkedinUrl: profile.linkedin_url || '',
          })
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Failed to load profile data')
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadProfile()
  }, [router])

  const handleProfileSubmit = async (data: ProfileUpdateFormData & { avatarFile?: File }) => {
    if (!userId) {
      setError('User not authenticated')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Handle avatar upload if present
      let avatarUrl = undefined
      if (data.avatarFile) {
        try {
          const result = await clientAuth.updateAvatar(userId, data.avatarFile)
          if (result.data) {
            avatarUrl = result.data.publicUrl
          }
        } catch (avatarError) {
          console.warn('Avatar upload failed:', avatarError)
          // Continue without avatar - not a critical error
        }
      }

      // Create profile data
      const profileUpdateData = {
        full_name: data.fullName,
        phone: data.phone,
        location: data.location,
        profession: data.profession,
        company: data.company,
        bio: data.bio,
        website: data.website,
        linkedin_url: data.linkedinUrl,
        ...(avatarUrl && { avatar_url: avatarUrl }),
        updated_at: new Date().toISOString(),
      }

      // Update profile
      const result = await clientAuth.upsertProfile(userId, profileUpdateData)
      
      if (result.error) {
        throw result.error
      }

      // Redirect to profile view on success
      router.push(`/profile/${userId}`)
      
    } catch (err) {
      console.error('Profile update error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating your profile'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">
            Edit Your Profile
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Keep your profile up to date to help other professionals find and connect with you.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Profile Update Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <ProfileForm
          mode="edit"
          initialData={profileData || undefined}
          onSubmit={handleProfileSubmit}
          isLoading={isLoading}
        />

        {/* Tips */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Profile Tips
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Add a professional photo to increase profile views</li>
                    <li>Write a compelling bio that highlights your expertise</li>
                    <li>Include your location to connect with local professionals</li>
                    <li>Add your website and LinkedIn to showcase your work</li>
                    <li>Keep your information current and accurate</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 