'use client'

import { useState, useMemo } from 'react'
import VerificationBadge, { type VerificationBadgeData } from './VerificationBadge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { CredentialType, VerificationLevel } from '@/lib/validations/verification'

interface VerificationBadgeCollectionProps {
  badges: VerificationBadgeData[]
  title?: string
  showFilters?: boolean
  showStats?: boolean
  layout?: 'grid' | 'list' | 'compact'
  maxDisplay?: number
  showViewAll?: boolean
  onBadgeClick?: (badge: VerificationBadgeData) => void
  onViewAll?: () => void
  className?: string
}

type FilterType = 'all' | CredentialType
type SortType = 'newest' | 'oldest' | 'level' | 'expiry'

function VerificationBadgeCollection({
  badges,
  title = 'Verification Badges',
  showFilters = true,
  showStats = true,
  layout = 'grid',
  maxDisplay,
  showViewAll = true,
  onBadgeClick,
  onViewAll,
  className = ''
}: VerificationBadgeCollectionProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('newest')
  const [showExpired, setShowExpired] = useState(false)

  const filteredAndSortedBadges = useMemo(() => {
    let filtered = badges

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(badge => badge.credentialType === filter)
    }

    // Apply expired filter
    if (!showExpired) {
      filtered = filtered.filter(badge => {
        if (!badge.expiresAt) return true
        return new Date(badge.expiresAt) >= new Date()
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
        case 'oldest':
          return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime()
        case 'level':
          const levelOrder = ['basic', 'verified', 'premium', 'expert', 'authority']
          return levelOrder.indexOf(b.verificationLevel) - levelOrder.indexOf(a.verificationLevel)
        case 'expiry':
          if (!a.expiresAt && !b.expiresAt) return 0
          if (!a.expiresAt) return 1
          if (!b.expiresAt) return -1
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [badges, filter, sortBy, showExpired])

  const displayBadges = maxDisplay 
    ? filteredAndSortedBadges.slice(0, maxDisplay)
    : filteredAndSortedBadges

  const stats = useMemo(() => {
    const total = badges.length
    const verified = badges.filter(b => b.verificationLevel !== 'basic').length
    const expired = badges.filter(b => b.expiresAt && new Date(b.expiresAt) < new Date()).length
    const premium = badges.filter(b => ['premium', 'expert', 'authority'].includes(b.verificationLevel)).length
    
    return { total, verified, expired, premium }
  }, [badges])

  const credentialTypes: FilterType[] = [
    'all',
    'education',
    'employment', 
    'certification',
    'skills',
    'identity',
    'business_registration',
    'professional_license',
    'awards_recognition'
  ]

  const getLayoutClasses = () => {
    switch (layout) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      case 'list':
        return 'space-y-4'
      case 'compact':
        return 'flex flex-wrap gap-2'
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
    }
  }

  if (badges.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="text-slate-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">No Verification Badges</h3>
          <p className="text-slate-500 mb-4">
            Start your verification journey to earn badges that showcase your credentials.
          </p>
          <Button onClick={() => window.location.href = '/verification'}>
            Get Verified
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {showStats && (
            <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
              <span>{stats.total} total</span>
              <span>{stats.verified} verified</span>
              {stats.premium > 0 && <span>{stats.premium} premium</span>}
              {stats.expired > 0 && <span className="text-red-500">{stats.expired} expired</span>}
            </div>
          )}
        </div>
        {showViewAll && maxDisplay && filteredAndSortedBadges.length > maxDisplay && (
          <Button variant="outline" onClick={onViewAll}>
            View All ({filteredAndSortedBadges.length})
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {credentialTypes.map(type => (
              <Button
                key={type}
                variant={filter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(type)}
              >
                {type === 'all' ? 'All Types' : type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-3 py-1 border border-slate-300 rounded-md text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="level">By Level</option>
              <option value="expiry">By Expiry</option>
            </select>
            
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showExpired}
                onChange={(e) => setShowExpired(e.target.checked)}
                className="rounded"
              />
              <span>Show Expired</span>
            </label>
          </div>
        </div>
      )}

      {/* Badges Display */}
      {displayBadges.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No badges match the current filters.
        </div>
      ) : (
        <div className={getLayoutClasses()}>
          {displayBadges.map(badge => (
            <VerificationBadge
              key={badge.id}
              badge={badge}
              size={layout === 'compact' ? 'sm' : 'md'}
              showDetails={layout === 'list'}
              onClick={() => onBadgeClick?.(badge)}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {maxDisplay && filteredAndSortedBadges.length > displayBadges.length && (
        <div className="text-center mt-6">
          <Button variant="outline" onClick={onViewAll}>
            Load More ({filteredAndSortedBadges.length - displayBadges.length} remaining)
          </Button>
        </div>
      )}
    </div>
  )
}

export default VerificationBadgeCollection 