'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProfileForm from '@/components/profile/ProfileForm'
import { clientAuth } from '@/lib/auth/client'
import { type ProfileUpdateFormData } from '@/lib/validations/auth'

export default function ProfileSetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleProfileSubmit = async (data: ProfileUpdateFormData & { avatarFile?: File }) => {
    setIsLoading(true)
    setError(null)

    try {
      // Get current user
      const { session, error: sessionError } = await clientAuth.getSession()
      
      if (sessionError || !session?.user) {
        throw new Error('You must be logged in to create a profile')
      }

      const userId = session.user.id

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
      const profileData = {
        id: userId,
        full_name: data.fullName,
        phone: data.phone,
        location: data.location,
        profession: data.profession,
        company: data.company,
        bio: data.bio,
        website: data.website,
        linkedin_url: data.linkedinUrl,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }

      // Create/update profile
      const result = await clientAuth.upsertProfile(userId, profileData)
      
      if (result.error) {
        throw result.error
      }

      // Redirect to dashboard on success
      router.push('/dashboard?welcome=true')
      
    } catch (err) {
      console.error('Profile setup error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while setting up your profile'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">
            Welcome to BuildDiaspora Zimbabwe!
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Complete your profile to connect with other Zimbabwean professionals and 
            showcase your expertise to the community.
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
                    Profile Setup Error
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
          mode="create"
          onSubmit={handleProfileSubmit}
          isLoading={isLoading}
        />

        {/* Additional Info */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Why complete your profile?
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Connect with other Zimbabwean professionals</li>
                    <li>Showcase your skills and experience</li>
                    <li>Get discovered by potential collaborators</li>
                    <li>Access exclusive community features</li>
                    <li>Build your professional network</li>
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