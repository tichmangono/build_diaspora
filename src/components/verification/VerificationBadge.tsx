'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import type { VerificationLevel, CredentialType } from '@/lib/validations/verification'

export interface VerificationBadgeData {
  id: string
  title: string
  description?: string
  credentialType: CredentialType
  verificationLevel: VerificationLevel
  issuedAt: string
  expiresAt?: string
  isPublic: boolean
  verificationScore?: number
  issuerName?: string
  documentCount?: number
}

interface VerificationBadgeProps {
  badge: VerificationBadgeData
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  showDetails?: boolean
  className?: string
  onClick?: () => void
}

const VERIFICATION_LEVEL_CONFIG = {
  basic: {
    label: 'Basic',
    color: 'bg-slate-500',
    icon: '📄',
    description: 'Basic verification completed'
  },
  verified: {
    label: 'Verified',
    color: 'bg-blue-500',
    icon: '✅',
    description: 'Identity and credentials verified'
  },
  premium: {
    label: 'Premium',
    color: 'bg-gradient-to-r from-amber-400 to-orange-400',
    icon: '⭐',
    description: 'Premium verification with enhanced checks'
  },
  expert: {
    label: 'Expert',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    icon: '🏆',
    description: 'Expert-level verification with comprehensive validation'
  },
  authority: {
    label: 'Authority',
    color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    icon: '👑',
    description: 'Authority-verified with institutional backing'
  }
}

const CREDENTIAL_TYPE_CONFIG = {
  education: {
    label: 'Education',
    icon: '🎓',
    color: 'text-blue-600'
  },
  employment: {
    label: 'Employment',
    icon: '💼',
    color: 'text-green-600'
  },
  certification: {
    label: 'Certification',
    icon: '📜',
    color: 'text-purple-600'
  },
  skills: {
    label: 'Skills',
    icon: '🛠️',
    color: 'text-orange-600'
  },
  identity: {
    label: 'Identity',
    icon: '🆔',
    color: 'text-indigo-600'
  },
  business_registration: {
    label: 'Business',
    icon: '🏢',
    color: 'text-emerald-600'
  },
  professional_license: {
    label: 'License',
    icon: '📋',
    color: 'text-red-600'
  },
  awards_recognition: {
    label: 'Awards',
    icon: '🏅',
    color: 'text-yellow-600'
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

function VerificationBadge({
  badge,
  size = 'md',
  showTooltip = true,
  showDetails = false,
  className = '',
  onClick
}: VerificationBadgeProps) {
  const [showTooltipState, setShowTooltipState] = useState(false)
  
  const levelConfig = VERIFICATION_LEVEL_CONFIG[badge.verificationLevel]
  const typeConfig = CREDENTIAL_TYPE_CONFIG[badge.credentialType]
  const expired = isExpired(badge.expiresAt)

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  if (showDetails) {
    return (
      <Card className={`verification-badge-card ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${levelConfig.color} text-white`}>
                <span className="text-xl">{levelConfig.icon}</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{badge.title}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-sm ${typeConfig.color}`}>
                    {typeConfig.icon} {typeConfig.label}
                  </span>
                  <Badge variant={expired ? 'destructive' : 'default'} size="sm">
                    {levelConfig.label}
                  </Badge>
                </div>
              </div>
            </div>
            {badge.verificationScore && (
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {badge.verificationScore}%
                </div>
                <div className="text-xs text-slate-500">Score</div>
              </div>
            )}
          </div>
          
          {badge.description && (
            <p className="text-slate-600 mt-3">{badge.description}</p>
          )}
          
          <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
            <div>
              <span>Issued: {formatDate(badge.issuedAt)}</span>
              {badge.expiresAt && (
                <span className={`ml-4 ${expired ? 'text-red-500' : ''}`}>
                  {expired ? 'Expired' : 'Expires'}: {formatDate(badge.expiresAt)}
                </span>
              )}
            </div>
            {badge.issuerName && (
              <span>By: {badge.issuerName}</span>
            )}
          </div>
          
          {badge.documentCount && (
            <div className="mt-2 text-xs text-slate-400">
              {badge.documentCount} document{badge.documentCount !== 1 ? 's' : ''} verified
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div 
      className={`relative inline-block ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onMouseEnter={() => showTooltip && setShowTooltipState(true)}
      onMouseLeave={() => showTooltip && setShowTooltipState(false)}
      onClick={onClick}
    >
      <div className={`
        inline-flex items-center space-x-1 rounded-full
        ${levelConfig.color} text-white font-medium
        ${sizeClasses[size]}
        ${expired ? 'opacity-60' : ''}
        ${onClick ? 'hover:scale-105 transition-transform' : ''}
      `}>
        <span className={iconSizes[size]}>{typeConfig.icon}</span>
        <span>{typeConfig.label}</span>
        <span className={iconSizes[size]}>{levelConfig.icon}</span>
      </div>
      
      {expired && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
      )}
      
      {showTooltip && showTooltipState && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs">
            <div className="font-semibold">{badge.title}</div>
            <div className="text-slate-300 mt-1">{levelConfig.description}</div>
            <div className="text-slate-400 mt-1">
              Issued: {formatDate(badge.issuedAt)}
            </div>
            {badge.expiresAt && (
              <div className={`text-slate-400 ${expired ? 'text-red-400' : ''}`}>
                {expired ? 'Expired' : 'Expires'}: {formatDate(badge.expiresAt)}
              </div>
            )}
            {badge.verificationScore && (
              <div className="text-green-400 mt-1">
                Score: {badge.verificationScore}%
              </div>
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  )
}

export default VerificationBadge 