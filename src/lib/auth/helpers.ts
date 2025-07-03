import crypto from 'crypto'
import { encryptData, decryptData, hashData, generateSecureToken } from '@/lib/utils/encryption'

// Session Management
export function generateSessionToken(): string {
  return generateSecureToken()
}

export function validateSessionToken(
  token: string, 
  sessionData: {
    userId: string
    createdAt: number
    expiresAt: number
    ipAddress: string
    userAgent: string
  },
  options?: {
    currentIpAddress?: string
    strictIpValidation?: boolean
  }
): { isValid: boolean; userId?: string; error?: string } {
  // Check if session is expired
  if (Date.now() > sessionData.expiresAt) {
    return { isValid: false, error: 'Session expired' }
  }

  // Check IP address if strict validation is enabled
  if (options?.strictIpValidation && options.currentIpAddress !== sessionData.ipAddress) {
    return { isValid: false, error: 'IP address mismatch' }
  }

  return { isValid: true, userId: sessionData.userId }
}

export function createSecureSession(
  userId: string,
  options: {
    ipAddress: string
    userAgent: string
    rememberMe: boolean
  }
) {
  const now = Date.now()
  const expiresAt = options.rememberMe 
    ? now + (30 * 24 * 60 * 60 * 1000) // 30 days
    : now + (24 * 60 * 60 * 1000) // 24 hours

  return {
    userId,
    sessionToken: generateSessionToken(),
    createdAt: now,
    expiresAt,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    isSecure: true
  }
}

export function validateSecureSession(sessionData: any): boolean {
  return sessionData?.isSecure === true && Date.now() < sessionData.expiresAt
}

// Two-Factor Authentication
export function generateTwoFactorSecret(): string {
  return crypto.randomBytes(20).toString('base32')
}

export function verifyTwoFactorToken(token: string, secret: string): boolean {
  // Simple mock implementation for testing
  if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) {
    return false
  }
  // In real implementation, would use TOTP library
  return token !== '000000' // Mock: reject obvious invalid tokens
}

// Password Reset Tokens
export function createPasswordResetToken(userId: string): { token: string; expiresAt: number } {
  return {
    token: generateSecureToken(),
    expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour
  }
}

export function validatePasswordResetToken(token: string, tokenData: { expiresAt: number }): boolean {
  return Date.now() < tokenData.expiresAt
}

// Email Verification
export function createEmailVerificationToken(email: string): { token: string; expiresAt: number } {
  return {
    token: generateSecureToken(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }
}

export function validateEmailVerificationToken(token: string, tokenData: { expiresAt: number }): boolean {
  return Date.now() < tokenData.expiresAt
}

// Rate Limiting
export function rateLimitCheck(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  // Mock implementation for testing
  return { allowed: true, remaining: limit - 1 }
}

// Security Audit
export function securityAuditLog(event: string, userId?: string, metadata?: any): void {
  // Mock implementation for testing
  console.log(`Security Event: ${event}`, { userId, metadata })
}

export function detectSuspiciousActivity(userId: string, activityData: any): boolean {
  // Mock implementation for testing
  return false
}

// Input Sanitization
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>\"'&]/g, (match) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }
      return entities[match] || match
    })
}

// Password Validation
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required')
    return { isValid: false, errors }
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return { isValid: errors.length === 0, errors }
}

export function checkPasswordHistory(userId: string, newPassword: string): Promise<boolean> {
  // Mock implementation for testing
  return Promise.resolve(true) // Allow password (not in history)
} 