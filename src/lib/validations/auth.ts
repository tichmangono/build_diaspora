import { z } from 'zod'
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'

// Security-focused validation utilities
const SECURITY_PATTERNS = {
  // SQL injection patterns
  SQL_INJECTION: /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript)\b)|(-{2}|\/\*|\*\/|;|\||&)/i,
  
  // XSS patterns
  XSS_PATTERNS: /<script|javascript:|vbscript:|onload|onerror|onclick|onmouseover|<iframe|<object|<embed|<link|<meta/i,
  
  // Path traversal patterns
  PATH_TRAVERSAL: /\.\.|\/\.\.|\\\.\.|\.\.\\/i,
  
  // Command injection patterns
  COMMAND_INJECTION: /(\||&|;|`|\$\(|\${|<|>)/,
  
  // LDAP injection patterns
  LDAP_INJECTION: /(\*|\(|\)|\\|\/|\+|=|<|>|~|!|&|\|)/,
  
  // HTML tag patterns
  HTML_TAGS: /<[^>]*>/g,
  
  // Control characters
  CONTROL_CHARS: /[\x00-\x1F\x7F-\x9F]/g,
  
  // Unicode control characters
  UNICODE_CONTROL: /[\u0000-\u001F\u007F-\u009F\u2000-\u200F\u2028-\u202F\u205F-\u206F\uFEFF]/g
}

// Enhanced sanitization function
const sanitizeInput = (input: string): string => {
  return input
    .replace(SECURITY_PATTERNS.HTML_TAGS, '') // Remove HTML tags
    .replace(SECURITY_PATTERNS.CONTROL_CHARS, '') // Remove control characters
    .replace(SECURITY_PATTERNS.UNICODE_CONTROL, '') // Remove Unicode control chars
    .trim() // Remove leading/trailing whitespace
    .slice(0, 10000) // Limit length to prevent DoS
}

// Security validation function
const validateSecurity = (input: string, fieldName: string) => {
  const sanitized = sanitizeInput(input)
  
  // Check for malicious patterns
  if (SECURITY_PATTERNS.SQL_INJECTION.test(sanitized)) {
    throw new Error(`${fieldName} contains potentially malicious content`)
  }
  
  if (SECURITY_PATTERNS.XSS_PATTERNS.test(sanitized)) {
    throw new Error(`${fieldName} contains potentially malicious content`)
  }
  
  if (SECURITY_PATTERNS.PATH_TRAVERSAL.test(sanitized)) {
    throw new Error(`${fieldName} contains invalid characters`)
  }
  
  if (SECURITY_PATTERNS.COMMAND_INJECTION.test(sanitized)) {
    throw new Error(`${fieldName} contains invalid characters`)
  }
  
  return sanitized
}

// Enhanced base string validation with security checks
const secureStringSchema = (fieldName: string, minLength: number = 1, maxLength: number = 255) =>
  z
    .string()
    .min(minLength, `${fieldName} must be at least ${minLength} characters long`)
    .max(maxLength, `${fieldName} must not exceed ${maxLength} characters`)
    .transform((val) => validateSecurity(val, fieldName))

// Enhanced email validation with additional security checks
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .max(254, 'Email address too long') // RFC 5321 limit
  .email('Please enter a valid email address')
  .refine((email) => {
    // Additional email security checks
    const parts = email.split('@')
    if (parts.length !== 2) return false
    
    const [localPart, domain] = parts
    
    // Check for suspicious patterns in local part
    if (localPart.includes('..') || localPart.startsWith('.') || localPart.endsWith('.')) {
      return false
    }
    
    // Check domain length
    if (domain.length > 253) return false
    
    // Check for suspicious domain patterns
    if (/\d+\.\d+\.\d+\.\d+/.test(domain)) return false // IP addresses
    
    return true
  }, 'Invalid email format')
  .transform((email) => {
    // Normalize email
    const [localPart, domain] = email.toLowerCase().split('@')
    return `${localPart}@${domain}`
  })

// Enhanced password validation with comprehensive security checks
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password too long') // Prevent DoS
  .refine((password) => {
    // Check password strength
    let score = 0
    
    if (password.length >= 12) score += 2
    else if (password.length >= 8) score += 1
    
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 2
    
    // Check for common patterns
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /admin/i,
      /letmein/i,
      /welcome/i
    ]
    
    if (commonPatterns.some(pattern => pattern.test(password))) {
      score -= 2
    }
    
    // Check for sequential characters
    if (/(.)\1{2,}/.test(password)) score -= 1 // Repeated characters
    if (/012|123|234|345|456|567|678|789|890|abc|bcd|cde|def/.test(password.toLowerCase())) {
      score -= 1 // Sequential characters
    }
    
    return score >= 3
  }, 'Password is too weak. Use a mix of uppercase, lowercase, numbers, and special characters')
  .refine((password) => /[A-Z]/.test(password), 'Password must contain at least one uppercase letter')
  .refine((password) => /[a-z]/.test(password), 'Password must contain at least one lowercase letter')
  .refine((password) => /\d/.test(password), 'Password must contain at least one number')
  .refine((password) => /[^A-Za-z0-9]/.test(password), 'Password must contain at least one special character')

// Enhanced phone number validation with security checks
const phoneSchema = z
  .string()
  .optional()
  .refine(
    (phone) => {
      if (!phone) return true // Optional field
      
      // Security check - remove common injection patterns
      const cleaned = phone.replace(/[^\d\s\+\-\(\)]/g, '')
      if (cleaned !== phone) return false
      
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

// Enhanced name validation with security checks
const nameSchema = secureStringSchema('Name', 2, 100)
  .refine((name) => /^[a-zA-Z\s'-]+$/.test(name), 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .refine((name) => {
    // Additional name security checks
    const words = name.trim().split(/\s+/)
    if (words.length > 10) return false // Prevent excessively long names
    
    // Check for suspicious patterns
    if (words.some(word => word.length > 50)) return false
    
    return true
  }, 'Invalid name format')

// Enhanced URL validation with security checks
const urlSchema = z
  .string()
  .optional()
  .refine((url) => {
    if (!url || url === '') return true
    
    try {
      const urlObj = new URL(url)
      
      // Only allow HTTP and HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false
      }
      
      // Block localhost and private IPs in production
      if (process.env.NODE_ENV === 'production') {
        const hostname = urlObj.hostname.toLowerCase()
        if (
          hostname === 'localhost' ||
          hostname.startsWith('127.') ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
        ) {
          return false
        }
      }
      
      return true
    } catch {
      return false
    }
  }, 'Invalid URL format')
  .transform((url) => {
    if (!url || url === '') return undefined
    return url.trim()
  })

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128, 'Password too long'),
  rememberMe: z.boolean().optional(),
})

// Registration form validation
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password').max(128, 'Password too long'),
    fullName: nameSchema,
    phone: phoneSchema,
    profession: secureStringSchema('Profession', 2, 100).optional(),
    location: secureStringSchema('Location', 2, 100).optional(),
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
    confirmPassword: z.string().min(1, 'Please confirm your password').max(128, 'Password too long'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Profile update validation
export const profileUpdateSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  location: secureStringSchema('Location', 2, 100).optional(),
  profession: secureStringSchema('Profession', 2, 100).optional(),
  company: secureStringSchema('Company', 2, 100).optional(),
  bio: secureStringSchema('Bio', 0, 500).optional(),
  website: urlSchema,
  linkedinUrl: z
    .string()
    .optional()
    .refine((url) => {
      if (!url || url === '') return true
      
      try {
        const urlObj = new URL(url)
        return urlObj.hostname.toLowerCase().includes('linkedin.com')
      } catch {
        return false
      }
    }, 'Please enter a valid LinkedIn URL')
    .transform((url) => {
      if (!url || url === '') return undefined
      return url.trim()
    }),
})

// Change password validation
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(128, 'Password too long'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password').max(128, 'Password too long'),
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
    .array(z.string().max(255, 'Document path too long'))
    .min(1, 'Please upload at least one document')
    .max(5, 'You can upload up to 5 documents'),
  additionalInfo: secureStringSchema('Additional Information', 0, 1000).optional(),
})

// File upload validation schema
export const fileUploadSchema = z.object({
  filename: secureStringSchema('Filename', 1, 255)
    .refine((filename) => {
      // Check file extension
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx']
      const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
      return allowedExtensions.includes(extension)
    }, 'File type not allowed'),
  size: z.number()
    .min(1, 'File cannot be empty')
    .max(10 * 1024 * 1024, 'File size cannot exceed 10MB'), // 10MB limit
  type: z.string()
    .refine((type) => {
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      return allowedTypes.includes(type)
    }, 'File type not allowed'),
})

// Search/filter validation
export const searchSchema = z.object({
  query: secureStringSchema('Search query', 0, 100)
    .refine((query) => {
      // Prevent search injection
      if (query.length === 0) return true
      return query.length >= 2 // Minimum search length
    }, 'Search query must be at least 2 characters long'),
  filters: z.record(z.string().max(100)).optional(),
  page: z.number().min(1).max(1000).default(1),
  limit: z.number().min(1).max(100).default(20),
})

// Contact form validation
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: secureStringSchema('Subject', 5, 200),
  message: secureStringSchema('Message', 10, 2000),
})

// Export security utilities for use in other modules
export const SecurityValidation = {
  sanitizeInput,
  validateSecurity,
  SECURITY_PATTERNS,
}

// Type exports for form data
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type VerificationRequestFormData = z.infer<typeof verificationRequestSchema>
export type FileUploadFormData = z.infer<typeof fileUploadSchema>
export type SearchFormData = z.infer<typeof searchSchema>
export type ContactFormData = z.infer<typeof contactSchema> 