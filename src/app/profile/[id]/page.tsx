import React from 'react'
import { notFound } from 'next/navigation'
import ProfileView from '@/components/profile/ProfileView'
import { requireAuth } from '@/lib/auth/utils'
import { createClient } from '@/lib/supabase/server'

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

async function getProfile(profileId: string) {
  const supabase = await createClient()
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    
    return profile
  } catch (error) {
    console.error('Error in getProfile:', error)
    return null
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params
  const profileId = resolvedParams.id
  
  // Get current user
  const currentUser = await requireAuth()
  
  // Get the profile to display
  const profile = await getProfile(profileId)
  
  if (!profile) {
    notFound()
  }
  
  // Check if this is the current user's profile
  const isOwnProfile = currentUser.id === profileId
  
  // Transform database profile to component format
  const profileData = {
    id: profile.id,
    fullName: profile.full_name || '',
    email: profile.email || currentUser.email || '',
    phone: profile.phone || '',
    location: profile.location || '',
    profession: profile.profession || '',
    company: profile.company || '',
    bio: profile.bio || '',
    website: profile.website || '',
    linkedinUrl: profile.linkedin_url || '',
    avatarUrl: profile.avatar_url || '',
    isVerified: profile.is_verified || false,
    createdAt: profile.created_at || new Date().toISOString(),
    lastActive: profile.last_active || undefined,
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4">
        <ProfileView
          profile={profileData}
          isOwnProfile={isOwnProfile}
          onEdit={() => {
            // This will be handled client-side
            if (typeof window !== 'undefined') {
              window.location.href = '/profile/edit'
            }
          }}
          onMessage={() => {
            // This will be handled client-side
            if (typeof window !== 'undefined') {
              console.log('Message functionality to be implemented')
            }
          }}
          onConnect={() => {
            // This will be handled client-side
            if (typeof window !== 'undefined') {
              console.log('Connect functionality to be implemented')
            }
          }}
        />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const resolvedParams = await params
  const profileId = resolvedParams.id
  
  const profile = await getProfile(profileId)
  
  if (!profile) {
    return {
      title: 'Profile Not Found - BuildDiaspora Zimbabwe',
      description: 'The requested profile could not be found.',
    }
  }
  
  return {
    title: `${profile.full_name || 'User'} - BuildDiaspora Zimbabwe`,
    description: profile.bio || `View ${profile.full_name || 'User'}'s professional profile on BuildDiaspora Zimbabwe.`,
    openGraph: {
      title: `${profile.full_name || 'User'} - BuildDiaspora Zimbabwe`,
      description: profile.bio || `View ${profile.full_name || 'User'}'s professional profile.`,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  }
} 