import { Suspense } from 'react'
import { Metadata } from 'next'
import AuthLayout from '@/components/auth/AuthLayout'
import LoginForm from '@/components/auth/LoginForm'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export const metadata: Metadata = {
  title: 'Sign In | BuildDiaspora Zimbabwe',
  description: 'Sign in to your BuildDiaspora account to connect with Zimbabwean professionals worldwide.',
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
} 