import { Suspense } from 'react'
import { Metadata } from 'next'
import AuthLayout from '@/components/auth/AuthLayout'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export const metadata: Metadata = {
  title: 'Reset Password | BuildDiaspora Zimbabwe',
  description: 'Set a new password for your BuildDiaspora account.',
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  )
} 