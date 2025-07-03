import { Metadata } from 'next'
import AdminVerificationDashboard from '@/components/verification/AdminVerificationDashboard'

export const metadata: Metadata = {
  title: 'Verification Management | BuildDiaspora Zimbabwe',
  description: 'Admin dashboard for managing professional verification requests',
}

export default function AdminVerificationPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verification Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and manage professional verification requests from users.
        </p>
      </div>
      
      <AdminVerificationDashboard />
    </div>
  )
} 