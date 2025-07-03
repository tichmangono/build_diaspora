import { Metadata } from 'next'
import { PrivacyDashboard } from '@/components/privacy/PrivacyDashboard'
import { RequireAuth } from '@/components/auth/AuthGuard'

export const metadata: Metadata = {
  title: 'Privacy Settings - BuildDiaspora Zimbabwe',
  description: 'Manage your privacy settings, consent preferences, and data rights in compliance with GDPR and CCPA.',
}

export default function PrivacyPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <PrivacyDashboard />
      </div>
    </RequireAuth>
  )
} 