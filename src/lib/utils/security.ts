/**
 * Get the CSP nonce from middleware headers
 * Used for inline scripts that need to bypass CSP
 * Server-side only function
 */
export async function getNonce(): Promise<string | null> {
  try {
    // Only run on server-side
    if (typeof window === 'undefined') {
      const { headers } = await import('next/headers');
      const headersList = await headers();
      return headersList.get('X-Nonce');
    }
    return null;
  } catch (error) {
    console.warn('Failed to get nonce from headers:', error);
    return null;
  }
}

/**
 * Security utilities for content sanitization
 */
export const SecurityUtils = {
  /**
   * Sanitize HTML content to prevent XSS
   * Basic implementation - in production, use a library like DOMPurify
   */
  sanitizeHtml: (html: string): string => {
    // Basic HTML sanitization - remove script tags and dangerous attributes
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
  },

  /**
   * Validate file upload security
   */
  validateFileUpload: (file: File): { isValid: boolean; error?: string } => {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 10MB limit' }
    }

    // Check file type for images
    const allowedImageTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ]

    // Check file type for documents
    const allowedDocTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    const allowedTypes = [...allowedImageTypes, ...allowedDocTypes]
    
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not allowed' }
    }

    // Check file extension matches MIME type
    const extension = file.name.split('.').pop()?.toLowerCase()
    const mimeToExtension: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
      'application/pdf': ['pdf'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx']
    }

    const expectedExtensions = mimeToExtension[file.type]
    if (!expectedExtensions || !extension || !expectedExtensions.includes(extension)) {
      return { isValid: false, error: 'File extension does not match file type' }
    }

    return { isValid: true }
  },

  /**
   * Generate secure random string
   */
  generateSecureToken: (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  /**
   * Validate URL safety
   */
  isValidUrl: (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      // Only allow HTTP and HTTPS protocols
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  },

  /**
   * Rate limiting helper (client-side)
   */
  checkRateLimit: (key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
    const now = Date.now()
    const attempts = JSON.parse(localStorage.getItem(`rl_${key}`) || '[]') as number[]
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs)
    
    // Check if under limit
    if (validAttempts.length >= maxAttempts) {
      return false
    }
    
    // Add current attempt
    validAttempts.push(now)
    localStorage.setItem(`rl_${key}`, JSON.stringify(validAttempts))
    
    return true
  }
}

/**
 * Content Security Policy utilities
 */
export const CSPUtils = {
  /**
   * Check if inline styles are allowed by CSP
   */
  canUseInlineStyles: (): boolean => {
    // In our CSP, we allow unsafe-inline for styles due to Tailwind
    return true
  },

  /**
   * Generate nonce-based script tag
   */
  createNonceScript: async (scriptContent: string): Promise<string> => {
    const nonce = await getNonce()
    if (!nonce) {
      console.warn('No nonce available for script')
      return ''
    }
    return `<script nonce="${nonce}">${scriptContent}</script>`
  }
}

/**
 * Input validation and sanitization
 */
export const InputValidator = {
  /**
   * Validate email format with additional security checks
   */
  validateEmail: (email: string): { isValid: boolean; error?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' }
    }
    
    // Check for suspicious patterns
    if (email.includes('..') || email.includes('+')) {
      return { isValid: false, error: 'Email contains suspicious patterns' }
    }
    
    // Check length
    if (email.length > 254) {
      return { isValid: false, error: 'Email too long' }
    }
    
    return { isValid: true }
  },

  /**
   * Validate phone number
   */
  validatePhone: (phone: string): { isValid: boolean; error?: string } => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Check length (7-15 digits for international numbers)
    if (cleaned.length < 7 || cleaned.length > 15) {
      return { isValid: false, error: 'Phone number must be 7-15 digits' }
    }
    
    return { isValid: true }
  },

  /**
   * Validate password strength
   */
  validatePassword: (password: string): { 
    isValid: boolean
    score: number
    feedback: string[]
    error?: string 
  } => {
    const feedback: string[] = []
    let score = 0
    
    if (password.length < 8) {
      return { 
        isValid: false, 
        score: 0, 
        feedback: [], 
        error: 'Password must be at least 8 characters long' 
      }
    }
    
    // Length score
    if (password.length >= 12) score += 2
    else if (password.length >= 8) score += 1
    
    // Character variety
    if (/[a-z]/.test(password)) {
      score += 1
      feedback.push('Contains lowercase letters')
    }
    if (/[A-Z]/.test(password)) {
      score += 1
      feedback.push('Contains uppercase letters')
    }
    if (/[0-9]/.test(password)) {
      score += 1
      feedback.push('Contains numbers')
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 2
      feedback.push('Contains special characters')
    }
    
    // Common patterns check
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i
    ]
    
    if (commonPatterns.some(pattern => pattern.test(password))) {
      score -= 2
      feedback.push('Avoid common patterns')
    }
    
    return {
      isValid: score >= 3,
      score: Math.max(0, Math.min(5, score)),
      feedback
    }
  },
}

/**
 * Sanitize input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return '';
  
  return input
    .toString()
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
} 