'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { clientAuth, rateLimitUtils } from '@/lib/auth/client'
import { Button } from '@/components/ui/Button'
import { FormGroup, FormLabel, FormInput, FormError } from '@/components/ui/FormComponents'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setAuthError(null)

      // Check rate limiting
      const clientIP = 'client-login' // In production, get actual IP
      if (rateLimitUtils.isRateLimited(clientIP, 5, 15 * 60 * 1000)) {
        setAuthError('Too many login attempts. Please try again in 15 minutes.')
        return
      }

      const { data: authData, error } = await clientAuth.signIn(data.email, data.password)

      if (error) {
        console.error('Login error:', error)
        
        // Handle specific error types
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('Invalid login credentials')) {
          setError('email', { message: 'Invalid email or password' })
          setError('password', { message: 'Invalid email or password' })
        } else if (errorMessage.includes('Email not confirmed')) {
          setAuthError('Please check your email and click the confirmation link before signing in.')
        } else if (errorMessage.includes('Too many requests')) {
          setAuthError('Too many login attempts. Please try again later.')
        } else {
          setAuthError('An error occurred during sign in. Please try again.')
        }
        return
      }

      if (authData?.user) {
        // Clear rate limit on successful login
        rateLimitUtils.clearAttempts(clientIP)
        
        // Redirect to intended page or dashboard
        router.push(redirectTo)
        router.refresh()
      }
    } catch (error) {
      console.error('Unexpected login error:', error)
      setAuthError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your BuildDiaspora account
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
                placeholder="Enter your email"
                error={errors.email?.message}
                {...register('email')}
                className="pl-10"
                autoComplete="email"
                disabled={isLoading}
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <FormError error={errors.email} />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="password" required>
              Password
            </FormLabel>
            <div className="relative">
              <FormInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
                className="pl-10 pr-10"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FormError error={errors.password} />
          </FormGroup>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-500 focus:outline-none focus:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-primary-600 hover:text-primary-500 font-medium focus:outline-none focus:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 