'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Briefcase, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { clientAuth, rateLimitUtils } from '@/lib/auth/client'
import { Button } from '@/components/ui/Button'
import { FormGroup, FormLabel, FormInput, FormError } from '@/components/ui/FormComponents'

export default function RegisterForm() {
  const router = useRouter()
  
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
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      profession: '',
      location: '',
      acceptTerms: false,
    },
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      setAuthError(null)
      setSuccessMessage(null)

      // Check rate limiting
      const clientIP = 'client-register' // In production, get actual IP
      if (rateLimitUtils.isRateLimited(clientIP, 3, 15 * 60 * 1000)) {
        setAuthError('Too many registration attempts. Please try again in 15 minutes.')
        return
      }

      const { data: authData, error } = await clientAuth.signUp(
        data.email,
        data.password,
        {
          fullName: data.fullName,
          phone: data.phone,
          profession: data.profession,
          location: data.location,
        }
      )

      if (error) {
        console.error('Registration error:', error)
        
        // Handle specific error types
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('User already registered')) {
          setError('email', { message: 'An account with this email already exists' })
        } else if (errorMessage.includes('Password should be at least')) {
          setError('password', { message: 'Password does not meet requirements' })
        } else if (errorMessage.includes('Invalid email')) {
          setError('email', { message: 'Please enter a valid email address' })
        } else if (errorMessage.includes('Signup requires a valid password')) {
          setError('password', { message: 'Please enter a valid password' })
        } else {
          setAuthError('An error occurred during registration. Please try again.')
        }
        return
      }

      if (authData?.user) {
        // Clear rate limit on successful registration
        rateLimitUtils.clearAttempts(clientIP)
        
        // Show success message
        setSuccessMessage(
          'Registration successful! Please check your email for a confirmation link before signing in.'
        )
        
        // Redirect to login page after a delay
        setTimeout(() => {
          router.push('/auth/login?message=Please check your email to confirm your account')
        }, 3000)
      }
    } catch (error) {
      console.error('Unexpected registration error:', error)
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
              Registration Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              {successMessage}
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
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
            Join BuildDiaspora
          </h1>
          <p className="text-gray-600">
            Connect with Zimbabwean professionals worldwide
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
            <FormLabel htmlFor="fullName" required>
              Full Name
            </FormLabel>
            <div className="relative">
              <FormInput
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                error={errors.fullName?.message}
                {...register('fullName')}
                className="pl-10"
                autoComplete="name"
                disabled={isLoading}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <FormError error={errors.fullName} />
          </FormGroup>

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
            <FormLabel htmlFor="phone">
              Phone Number
              <span className="text-gray-500 text-sm ml-1">(optional)</span>
            </FormLabel>
            <div className="relative">
              <FormInput
                id="phone"
                type="tel"
                placeholder="+263 77 123 4567"
                error={errors.phone?.message}
                {...register('phone')}
                className="pl-10"
                autoComplete="tel"
                disabled={isLoading}
              />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <FormError error={errors.phone} />
          </FormGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup>
              <FormLabel htmlFor="profession">
                Profession
                <span className="text-gray-500 text-sm ml-1">(optional)</span>
              </FormLabel>
              <div className="relative">
                <FormInput
                  id="profession"
                  type="text"
                  placeholder="e.g. Software Engineer"
                  error={errors.profession?.message}
                  {...register('profession')}
                  className="pl-10"
                  disabled={isLoading}
                />
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <FormError error={errors.profession} />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="location">
                Location
                <span className="text-gray-500 text-sm ml-1">(optional)</span>
              </FormLabel>
              <div className="relative">
                <FormInput
                  id="location"
                  type="text"
                  placeholder="e.g. Harare, Zimbabwe"
                  error={errors.location?.message}
                  {...register('location')}
                  className="pl-10"
                  disabled={isLoading}
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <FormError error={errors.location} />
            </FormGroup>
          </div>

          <FormGroup>
            <FormLabel htmlFor="password" required>
              Password
            </FormLabel>
            <div className="relative">
              <FormInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                error={errors.password?.message}
                {...register('password')}
                className="pl-10 pr-10"
                autoComplete="new-password"
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
              Confirm Password
            </FormLabel>
            <div className="relative">
              <FormInput
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
                className="pl-10 pr-10"
                autoComplete="new-password"
                disabled={isLoading}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                disabled={isLoading}
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

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="acceptTerms"
                type="checkbox"
                {...register('acceptTerms')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                disabled={isLoading}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="acceptTerms" className="text-gray-700">
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="text-primary-600 hover:text-primary-500 underline"
                  target="_blank"
                >
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link
                  href="/privacy"
                  className="text-primary-600 hover:text-primary-500 underline"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
          <FormError error={errors.acceptTerms} />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
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