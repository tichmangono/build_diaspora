import { Metadata } from 'next'
import AuthLayout from '@/components/auth/AuthLayout'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password | BuildDiaspora Zimbabwe',
  description: 'Reset your BuildDiaspora account password to regain access to your account.',
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
} 