'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import VerificationBadgeCollection from '@/components/verification/VerificationBadgeCollection'
import { type VerificationBadgeData } from '@/components/verification/VerificationBadge'
import { 
  MapPin, 
  Briefcase, 
  Building, 
  Globe, 
  Linkedin, 
  Mail, 
  Phone,
  Calendar,
  Shield,
  Edit2,
  MessageCircle
} from 'lucide-react'
import { type ProfileUpdateFormData } from '@/lib/validations/auth'

interface ProfileData extends ProfileUpdateFormData {
  id: string
  email: string
  avatarUrl?: string
  isVerified?: boolean
  createdAt: string
  lastActive?: string
  verificationBadges?: VerificationBadgeData[]
}

interface ProfileViewProps {
  profile: ProfileData
  isOwnProfile?: boolean
  onEdit?: () => void
  onMessage?: () => void
  onConnect?: () => void
  onViewAllBadges?: () => void
}

export function ProfileView({ 
  profile, 
  isOwnProfile = false, 
  onEdit, 
  onMessage, 
  onConnect, 
  onViewAllBadges
}: ProfileViewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Cover Area */}
        <div className="h-32 bg-gradient-to-r from-primary-500 to-accent-400"></div>
        
        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-16 left-6">
            <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
              <div className="w-full h-full rounded-full bg-neutral-100 overflow-hidden">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={`${profile.fullName}'s profile`}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-2xl font-semibold">
                    {getInitials(profile.fullName)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 space-x-3">
            {isOwnProfile ? (
              <Button
                variant="primary"
                onClick={onEdit}
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={onMessage}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
                <Button
                  variant="primary"
                  onClick={onConnect}
                  className="flex items-center gap-2"
                >
                  Connect
                </Button>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-neutral-800">
                {profile.fullName}
              </h1>
              {profile.isVerified && (
                <Badge variant="verified" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Professional Info */}
            <div className="flex flex-wrap items-center gap-4 text-neutral-600 mb-4">
              {profile.profession && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{profile.profession}</span>
                </div>
              )}
              {profile.company && (
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  <span>{profile.company}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mb-6">
                <p className="text-neutral-700 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Verification Badges */}
            {profile.verificationBadges && profile.verificationBadges.length > 0 && (
              <div className="mb-6">
                <VerificationBadgeCollection
                  badges={profile.verificationBadges}
                  title="Verification Badges"
                  layout="compact"
                  maxDisplay={6}
                  showFilters={false}
                  showStats={false}
                  onViewAll={onViewAllBadges}
                  className="bg-neutral-50 rounded-lg p-4"
                />
              </div>
            )}

            {/* Contact & Social Links */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-1 text-neutral-600">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-1 text-neutral-600">
                  <Phone className="w-4 h-4" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Website</span>
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-1 text-sm text-neutral-500">
              <Calendar className="w-4 h-4" />
              <span>Member since {formatDate(profile.createdAt)}</span>
              {profile.lastActive && (
                <>
                  <span>•</span>
                  <span>Last active {formatDate(profile.lastActive)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Professional Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">
              Professional Summary
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-neutral-600">Profession:</span>
                  <p className="text-neutral-800">{profile.profession || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-neutral-600">Company:</span>
                  <p className="text-neutral-800">{profile.company || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-neutral-600">Location:</span>
                  <p className="text-neutral-800">{profile.location || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-neutral-600">Status:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={profile.isVerified ? "verified" : "warning"}>
                      {profile.isVerified ? 'Verified Professional' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">
              {isOwnProfile ? 'Profile Actions' : 'Quick Actions'}
            </h2>
            <div className="space-y-3">
              {isOwnProfile ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={onEdit}
                    className="w-full justify-start"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={onConnect}
                    className="w-full justify-start"
                  >
                    Connect
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={onMessage}
                    className="w-full justify-start"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileView 