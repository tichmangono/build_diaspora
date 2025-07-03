'use client'

import { Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { VerificationLevel } from '@/lib/validations/verification'

export interface VerificationStatus {
  level: VerificationLevel | 'none'
  badgeCount: number
  pendingCount: number
  isProfileVerified: boolean
  overallScore?: number
}

interface VerificationStatusIndicatorProps {
  status: VerificationStatus
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  className?: string
}

const STATUS_CONFIG = {
  expert: {
    label: 'Expert Verified',
    icon: Shield,
    variant: 'verified' as const
  },
  premium: {
    label: 'Premium Verified',
    icon: CheckCircle,
    variant: 'success' as const
  },
  basic: {
    label: 'Basic Verified',
    icon: CheckCircle,
    variant: 'info' as const
  },
  none: {
    label: 'Unverified',
    icon: AlertCircle,
    variant: 'warning' as const
  }
}

export default function VerificationStatusIndicator({
  status,
  size = 'md',
  showDetails = false,
  className = ''
}: VerificationStatusIndicatorProps) {
  const config = STATUS_CONFIG[status.level]
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Badge variant={config.variant} className="flex items-center gap-1.5">
        <Icon className="w-4 h-4" />
        <span>{config.label}</span>
        {status.overallScore && (
          <span className="opacity-75">({status.overallScore}%)</span>
        )}
      </Badge>
      
      {showDetails && (
        <div className="text-sm text-neutral-600">
          {status.badgeCount} badges • {status.pendingCount} pending
        </div>
      )}
    </div>
  )
}

// Helper function to calculate verification status from badges
export function calculateVerificationStatus(
  badges: Array<{ verificationLevel: VerificationLevel }>,
  pendingRequests: number = 0,
  isProfileVerified: boolean = false
): VerificationStatus {
  if (!badges.length) {
    return {
      level: 'none',
      badgeCount: 0,
      pendingCount: pendingRequests,
      isProfileVerified: false
    }
  }

  // Determine highest verification level
  const levels = badges.map(b => b.verificationLevel)
  const hasExpert = levels.includes('expert')
  const hasPremium = levels.includes('premium')
  const hasBasic = levels.includes('basic')

  const level = hasExpert ? 'expert' : hasPremium ? 'premium' : 'basic'
  
  // Calculate overall score based on badge types and count
  const expertCount = levels.filter(l => l === 'expert').length
  const premiumCount = levels.filter(l => l === 'premium').length
  const basicCount = levels.filter(l => l === 'basic').length
  
  const overallScore = Math.min(100, 
    (expertCount * 40) + (premiumCount * 25) + (basicCount * 15)
  )

  return {
    level,
    badgeCount: badges.length,
    pendingCount: pendingRequests,
    isProfileVerified,
    overallScore
  }
}
