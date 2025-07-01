import { NextRequest, NextResponse } from 'next/server'
import { SecurityValidation } from '@/lib/validations/auth'

/**
 * Input sanitization middleware for API routes
 * Sanitizes all incoming request data to prevent injection attacks
 */

interface SanitizationOptions {
  maxBodySize?: number // Maximum request body size in bytes
  allowedMethods?: string[] // Allowed HTTP methods
  skipSanitization?: string[] // Fields to skip sanitization
  strictMode?: boolean // Enable strict security mode
}

const DEFAULT_OPTIONS: SanitizationOptions = {
  maxBodySize: 1024 * 1024, // 1MB
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  skipSanitization: ['password', 'confirmPassword', 'currentPassword', 'newPassword'],
  strictMode: true
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any, options: SanitizationOptions): any {
  if (obj === null || obj === undefined) return obj
  
  if (typeof obj === 'string') {
    return SecurityValidation.sanitizeInput(obj)
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options))
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {}
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip sanitization for specified fields (like passwords)
      if (options.skipSanitization?.includes(key)) {
        sanitized[key] = value
      } else {
        sanitized[key] = sanitizeObject(value, options)
      }
    }
    
    return sanitized
  }
  
  return obj
}

/**
 * Validate request size and content
 */
function validateRequest(request: NextRequest, options: SanitizationOptions): string | null {
  // Check HTTP method
  if (!options.allowedMethods?.includes(request.method)) {
    return `Method ${request.method} not allowed`
  }
  
  // Check content type for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type')
    if (!contentType) {
      return 'Content-Type header is required'
    }
    
    // Only allow JSON and form data
    const allowedContentTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data'
    ]
    
    if (!allowedContentTypes.some(type => contentType.includes(type))) {
      return 'Unsupported content type'
    }
  }
  
  // Check request size
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > (options.maxBodySize || DEFAULT_OPTIONS.maxBodySize!)) {
    return 'Request body too large'
  }
  
  return null
}

/**
 * Rate limiting check
 */
function checkRateLimit(request: NextRequest): boolean {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  // In production, you would use Redis or a database for rate limiting
  // This is a simple in-memory implementation for development
  const rateLimitKey = `api_rate_limit:${ip}`
  
  // For now, just return true (no rate limiting)
  // In production, implement proper rate limiting
  return true
}

/**
 * Security headers for API responses
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent caching of sensitive API responses
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  // Content security
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // API-specific headers
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  response.headers.set('Referrer-Policy', 'no-referrer')
  
  return response
}

/**
 * Main input sanitization middleware
 */
export async function inputSanitizationMiddleware(
  request: NextRequest,
  options: Partial<SanitizationOptions> = {}
): Promise<{ sanitizedRequest: NextRequest; error?: string }> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  
  try {
    // Validate request
    const validationError = validateRequest(request, mergedOptions)
    if (validationError) {
      return { sanitizedRequest: request, error: validationError }
    }
    
    // Check rate limiting
    if (!checkRateLimit(request)) {
      return { sanitizedRequest: request, error: 'Rate limit exceeded' }
    }
    
    // Clone the request to avoid modifying the original
    const clonedRequest = request.clone()
    
    // Sanitize URL parameters
    const url = new URL(request.url)
    const sanitizedSearchParams = new URLSearchParams()
    
    for (const [key, value] of url.searchParams.entries()) {
      const sanitizedKey = SecurityValidation.sanitizeInput(key)
      const sanitizedValue = SecurityValidation.sanitizeInput(value)
      sanitizedSearchParams.set(sanitizedKey, sanitizedValue)
    }
    
    // Create new URL with sanitized parameters
    const sanitizedUrl = new URL(url.pathname, url.origin)
    sanitizedUrl.search = sanitizedSearchParams.toString()
    
    // For requests with body, sanitize the body content
    let sanitizedBody: any = null
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await clonedRequest.json()
        sanitizedBody = sanitizeObject(body, mergedOptions)
      } catch (error) {
        // If JSON parsing fails, try to get as text and sanitize
        try {
          const textBody = await clonedRequest.text()
          sanitizedBody = SecurityValidation.sanitizeInput(textBody)
        } catch {
          // If all else fails, leave body as is
          sanitizedBody = null
        }
      }
    }
    
    // Create new request with sanitized data
    const sanitizedRequest = new NextRequest(sanitizedUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: sanitizedBody ? JSON.stringify(sanitizedBody) : undefined,
    })
    
    return { sanitizedRequest }
    
  } catch (error) {
    console.error('Input sanitization error:', error)
    return { 
      sanitizedRequest: request, 
      error: 'Internal sanitization error' 
    }
  }
}

/**
 * Wrapper function for API route handlers
 */
export function withInputSanitization(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: Partial<SanitizationOptions> = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Apply input sanitization
      const { sanitizedRequest, error } = await inputSanitizationMiddleware(request, options)
      
      if (error) {
        const response = NextResponse.json(
          { error: error, code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
        return addSecurityHeaders(response)
      }
      
      // Call the original handler with sanitized request
      const response = await handler(sanitizedRequest)
      
      // Add security headers to response
      return addSecurityHeaders(response)
      
    } catch (error) {
      console.error('API handler error:', error)
      
      const response = NextResponse.json(
        { error: 'Internal server error', code: 'INTERNAL_ERROR' },
        { status: 500 }
      )
      
      return addSecurityHeaders(response)
    }
  }
}

/**
 * Specific sanitization functions for different data types
 */
export const DataSanitizers = {
  /**
   * Sanitize email addresses
   */
  email: (email: string): string => {
    const sanitized = SecurityValidation.sanitizeInput(email)
    return sanitized.toLowerCase().trim()
  },
  
  /**
   * Sanitize phone numbers
   */
  phone: (phone: string): string => {
    const sanitized = SecurityValidation.sanitizeInput(phone)
    // Remove all non-digit, non-space, non-plus, non-parentheses, non-hyphen characters
    return sanitized.replace(/[^\d\s\+\-\(\)]/g, '')
  },
  
  /**
   * Sanitize names
   */
  name: (name: string): string => {
    const sanitized = SecurityValidation.sanitizeInput(name)
    // Only allow letters, spaces, hyphens, and apostrophes
    return sanitized.replace(/[^a-zA-Z\s'-]/g, '').trim()
  },
  
  /**
   * Sanitize URLs
   */
  url: (url: string): string => {
    const sanitized = SecurityValidation.sanitizeInput(url)
    try {
      const urlObj = new URL(sanitized)
      return urlObj.toString()
    } catch {
      return ''
    }
  },
  
  /**
   * Sanitize search queries
   */
  search: (query: string): string => {
    const sanitized = SecurityValidation.sanitizeInput(query)
    // Remove special characters that could be used for injection
    return sanitized.replace(/[<>'"\\;]/g, '').trim()
  },
  
  /**
   * Sanitize file names
   */
  filename: (filename: string): string => {
    const sanitized = SecurityValidation.sanitizeInput(filename)
    // Remove path traversal and dangerous characters
    return sanitized
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\.\./g, '')
      .trim()
  }
}

/**
 * Validation helpers
 */
export const ValidationHelpers = {
  /**
   * Check if string contains only allowed characters for names
   */
  isValidName: (name: string): boolean => {
    return /^[a-zA-Z\s'-]+$/.test(name) && name.trim().length >= 2
  },
  
  /**
   * Check if email format is valid
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && !email.includes('..')
  },
  
  /**
   * Check if URL is safe
   */
  isSafeUrl: (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return ['http:', 'https:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  },
  
  /**
   * Check if string contains potential injection patterns
   */
  containsMaliciousPatterns: (input: string): boolean => {
    return Object.values(SecurityValidation.SECURITY_PATTERNS).some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(input)
      }
      return false
    })
  }
}

export default inputSanitizationMiddleware 