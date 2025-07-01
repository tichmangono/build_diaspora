import { Metadata } from 'next'
import AuthLayout from '@/components/auth/AuthLayout'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Join BuildDiaspora | BuildDiaspora Zimbabwe',
  description: 'Join BuildDiaspora to connect with Zimbabwean professionals worldwide and advance your career.',
}

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
} 