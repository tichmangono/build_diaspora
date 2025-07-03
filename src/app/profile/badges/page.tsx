'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VerificationBadgeCollection from '@/components/verification/VerificationBadgeCollection'
import VerificationStatusIndicator, { calculateVerificationStatus } from '@/components/verification/VerificationStatusIndicator'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Plus, Award, TrendingUp, Calendar } from 'lucide-react'
import { verificationClient } from '@/lib/verification/client'
import { useAuth } from '@/lib/hooks'
import { toast } from '@/lib/toast'
import type { VerificationBadgeData } from '@/components/verification/VerificationBadge'

export default function VerificationBadgesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [badges, setBadges] = useState<VerificationBadgeData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBadges: 0,
    expertLevel: 0,
    premiumLevel: 0,
    basicLevel: 0,
    pendingRequests: 0
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadBadges()
    loadStats()
  }, [user, router])

  const loadBadges = async () => {
    try {
      setIsLoading(true)
      // For now, using mock data - in production this would fetch from API
      const mockBadges: VerificationBadgeData[] = [
        {
          id: '1',
          title: 'Software Engineer',
          description: 'Verified professional software engineer with 5+ years experience',
          credentialType: 'employment',
          verificationLevel: 'premium',
          issuedAt: '2024-01-15T10:00:00Z',
          isPublic: true,
          verificationScore: 95,
          issuerName: 'BuildDiaspora Verification',
          documentCount: 3
        },
        {
          id: '2',
          title: 'Computer Science Degree',
          description: 'Bachelor of Science in Computer Science from University of Zimbabwe',
          credentialType: 'education',
          verificationLevel: 'expert',
          issuedAt: '2024-02-01T14:30:00Z',
          isPublic: true,
          verificationScore: 98,
          issuerName: 'BuildDiaspora Verification',
          documentCount: 2
        },
        {
          id: '3',
          title: 'AWS Solutions Architect',
          description: 'AWS Certified Solutions Architect - Professional',
          credentialType: 'certification',
          verificationLevel: 'expert',
          issuedAt: '2024-02-15T09:15:00Z',
          isPublic: true,
          verificationScore: 92,
          issuerName: 'BuildDiaspora Verification',
          documentCount: 1
        },
        {
          id: '4',
          title: 'React Development',
          description: 'Advanced React development skills assessment',
          credentialType: 'skills',
          verificationLevel: 'basic',
          issuedAt: '2024-03-01T16:45:00Z',
          isPublic: true,
          verificationScore: 88,
          issuerName: 'BuildDiaspora Verification',
          documentCount: 1
        }
      ]
      
      setBadges(mockBadges)
    } catch (error) {
      console.error('Error loading badges:', error)
      toast.error('Failed to load verification badges')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const mockStats = {
        totalBadges: 4,
        expertLevel: 2,
        premiumLevel: 1,
        basicLevel: 1,
        pendingRequests: 1
      }
      setStats(mockStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleStartVerification = () => {
    router.push('/verification')
  }

  const handleBadgeClick = (badge: VerificationBadgeData) => {
    // In production, this could open a detailed badge view or share modal
    console.log('Badge clicked:', badge)
    toast.success(`Viewing ${badge.title} badge details`)
  }

  const verificationStatus = calculateVerificationStatus(
    badges,
    stats.pendingRequests,
    true
  )

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-neutral-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-neutral-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">
            My Verification Badges
          </h1>
          <p className="text-neutral-600">
            Showcase your verified credentials and professional achievements
          </p>
        </div>
        <Button
          onClick={handleStartVerification}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Verification
        </Button>
      </div>

      {/* Verification Status */}
      <div className="mb-8">
        <VerificationStatusIndicator
          status={verificationStatus}
          size="lg"
          showDetails={true}
          className="justify-center md:justify-start"
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Badges</p>
                <p className="text-2xl font-bold text-neutral-800">{stats.totalBadges}</p>
              </div>
              <Award className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Expert Level</p>
                <p className="text-2xl font-bold text-green-600">{stats.expertLevel}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Premium Level</p>
                <p className="text-2xl font-bold text-blue-600">{stats.premiumLevel}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pendingRequests}</p>
              </div>
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Verification Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <VerificationBadgeCollection
              badges={badges}
              showFilters={true}
              showStats={true}
              layout="grid"
              onBadgeClick={handleBadgeClick}
              className="min-h-[400px]"
            />
          ) : (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-800 mb-2">
                No verification badges yet
              </h3>
              <p className="text-neutral-600 mb-6">
                Start your verification journey to showcase your credentials and expertise.
              </p>
              <Button onClick={handleStartVerification}>
                <Plus className="w-4 h-4 mr-2" />
                Start Verification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
