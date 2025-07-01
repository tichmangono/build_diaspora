'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Mail, AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'
import { clientAuth, rateLimitUtils } from '@/lib/auth/client'
import { Button } from '@/components/ui/Button'
import { FormGroup, FormLabel, FormInput, FormError } from '@/components/ui/FormComponents'

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true)
      setAuthError(null)
      setSuccessMessage(null)

      // Check rate limiting
      const clientIP = 'client-forgot-password' // In production, get actual IP
      if (rateLimitUtils.isRateLimited(clientIP, 3, 15 * 60 * 1000)) {
        setAuthError('Too many password reset attempts. Please try again in 15 minutes.')
        return
      }

      const { error } = await clientAuth.resetPassword(data.email)

      if (error) {
        console.error('Password reset error:', error)
        
        // Handle specific error types
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('Invalid email')) {
          setError('email', { message: 'Please enter a valid email address' })
        } else if (errorMessage.includes('User not found')) {
          // For security, we don't reveal if email exists or not
          setSuccessMessage(
            'If an account with that email exists, we&apos;ve sent you a password reset link.'
          )
        } else if (errorMessage.includes('Too many requests')) {
          setAuthError('Too many password reset attempts. Please try again later.')
        } else {
          setAuthError('An error occurred while sending the reset email. Please try again.')
        }
        return
      }

      // Clear rate limit on successful request
      rateLimitUtils.clearAttempts(clientIP)
      
      // Show success message (always show this for security)
      setSuccessMessage(
        'If an account with that email exists, we&apos;ve sent you a password reset link. Please check your email and follow the instructions to reset your password.'
      )
    } catch (error) {
      console.error('Unexpected password reset error:', error)
      setAuthError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (successMessage) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h1>
            <p className="text-gray-600 mb-6">
              {successMessage}
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <Button
                onClick={() => {
                  setSuccessMessage(null)
                  setAuthError(null)
                }}
                variant="secondary"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-primary-600 hover:text-primary-500 font-medium focus:outline-none focus:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-600 mb-6">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormGroup>
            <FormLabel htmlFor="email" required>
              Email Address
            </FormLabel>
            <div className="relative">
              <FormInput
                id="email"
                type="email"
                placeholder="Enter your email address"
                error={errors.email?.message}
                {...register('email')}
                className="pl-10"
                autoComplete="email"
                disabled={isLoading}
                autoFocus
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <FormError error={errors.email} />
          </FormGroup>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending reset link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-primary-600 hover:text-primary-500 font-medium focus:outline-none focus:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>
          
          <div className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-primary-600 hover:text-primary-500 font-medium focus:outline-none focus:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 