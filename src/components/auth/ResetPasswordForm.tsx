'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Eye, EyeOff, Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth'
import { clientAuth } from '@/lib/auth/client'
import { Button } from '@/components/ui/Button'
import { FormGroup, FormLabel, FormInput, FormError } from '@/components/ui/FormComponents'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')

  // Check if we have a valid reset code
  useEffect(() => {
    if (!code) {
      setAuthError('Invalid or missing reset code. Please request a new password reset link.')
    }
  }, [code])

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true)
      setAuthError(null)
      setSuccessMessage(null)

      if (!code) {
        setAuthError('Invalid or missing reset code. Please request a new password reset link.')
        return
      }

      const { error } = await clientAuth.updatePassword(data.password)

      if (error) {
        console.error('Password reset error:', error)
        
        // Handle specific error types
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('Invalid or expired')) {
          setAuthError('The reset link has expired or is invalid. Please request a new password reset.')
        } else if (errorMessage.includes('Password should be at least')) {
          setError('password', { message: 'Password does not meet requirements' })
        } else if (errorMessage.includes('New password should be different')) {
          setError('password', { message: 'New password must be different from your current password' })
        } else {
          setAuthError('An error occurred while resetting your password. Please try again.')
        }
        return
      }

      // Show success message
      setSuccessMessage('Your password has been successfully reset!')
      
      // Redirect to login page after a delay
      setTimeout(() => {
        router.push('/auth/login?message=Password reset successful. Please sign in with your new password.')
      }, 3000)
    } catch (error) {
      console.error('Unexpected password reset error:', error)
      setAuthError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
    
    return {
      strength,
      label: labels[strength - 1] || 'Very Weak',
      color: colors[strength - 1] || 'bg-red-500'
    }
  }

  const passwordStrength = getPasswordStrength(password)

  if (successMessage) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Password Reset Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              {successMessage}
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to sign in page...
            </p>
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
            Reset Your Password
          </h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 text-sm">{authError}</p>
              {authError.includes('expired') || authError.includes('invalid') ? (
                <Link
                  href="/auth/forgot-password"
                  className="text-red-600 hover:text-red-500 underline text-sm mt-1 inline-block"
                >
                  Request a new reset link
                </Link>
              ) : null}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormGroup>
            <FormLabel htmlFor="password" required>
              New Password
            </FormLabel>
            <div className="relative">
              <FormInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                error={errors.password?.message}
                {...register('password')}
                className="pl-10 pr-10"
                autoComplete="new-password"
                disabled={isLoading || !code}
                autoFocus
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                disabled={isLoading || !code}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength.strength >= 4 ? 'text-green-600' :
                    passwordStrength.strength >= 3 ? 'text-blue-600' :
                    passwordStrength.strength >= 2 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            <FormError error={errors.password} />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="confirmPassword" required>
              Confirm New Password
            </FormLabel>
            <div className="relative">
              <FormInput
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
                className="pl-10 pr-10"
                autoComplete="new-password"
                disabled={isLoading || !code}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                disabled={isLoading || !code}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FormError error={errors.confirmPassword} />
          </FormGroup>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSubmitting || !code}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Resetting password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Remember your password?{' '}
            <Link
              href="/auth/login"
              className="text-primary-600 hover:text-primary-500 font-medium focus:outline-none focus:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 