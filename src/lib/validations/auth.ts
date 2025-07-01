import { z } from 'zod'
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'

// Base email validation
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()

// Password validation with strong requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// Phone number validation
const phoneSchema = z
  .string()
  .optional()
  .refine(
    (phone) => {
      if (!phone) return true // Optional field
      try {
        return isValidPhoneNumber(phone, 'ZW') // Default to Zimbabwe
      } catch {
        return false
      }
    },
    {
      message: 'Please enter a valid phone number',
    }
  )
  .transform((phone) => {
    if (!phone) return undefined
    try {
      const phoneNumber = parsePhoneNumber(phone, 'ZW')
      return phoneNumber.formatInternational()
    } catch {
      return phone
    }
  })

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

// Registration form validation
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters long')
      .max(100, 'Full name must not exceed 100 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes'),
    phone: phoneSchema,
    profession: z
      .string()
      .min(2, 'Profession must be at least 2 characters long')
      .max(100, 'Profession must not exceed 100 characters')
      .optional(),
    location: z
      .string()
      .min(2, 'Location must be at least 2 characters long')
      .max(100, 'Location must not exceed 100 characters')
      .optional(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Forgot password form validation
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// Reset password form validation
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Profile update validation
export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters long')
    .max(100, 'Full name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes'),
  phone: phoneSchema,
  location: z
    .string()
    .min(2, 'Location must be at least 2 characters long')
    .max(100, 'Location must not exceed 100 characters')
    .optional(),
  profession: z
    .string()
    .min(2, 'Profession must be at least 2 characters long')
    .max(100, 'Profession must not exceed 100 characters')
    .optional(),
  company: z
    .string()
    .max(100, 'Company name must not exceed 100 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional(),
  website: z
    .string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  linkedinUrl: z
    .string()
    .url('Please enter a valid LinkedIn URL')
    .optional()
    .or(z.literal('')),
})

// Change password validation
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

// Professional verification request validation
export const verificationRequestSchema = z.object({
  verificationType: z.enum(['professional', 'identity', 'business'], {
    required_error: 'Please select a verification type',
  }),
  documents: z
    .array(z.string())
    .min(1, 'Please upload at least one document')
    .max(5, 'You can upload up to 5 documents'),
  additionalInfo: z
    .string()
    .max(1000, 'Additional information must not exceed 1000 characters')
    .optional(),
})

// Type exports for form data
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type VerificationRequestFormData = z.infer<typeof verificationRequestSchema> 