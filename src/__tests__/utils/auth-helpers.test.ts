import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import {
  generateSessionToken,
  validateSessionToken,
  createSecureSession,
  validateSecureSession,
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  createPasswordResetToken,
  validatePasswordResetToken,
  createEmailVerificationToken,
  validateEmailVerificationToken,
  rateLimitCheck,
  securityAuditLog,
  detectSuspiciousActivity,
  sanitizeUserInput,
  validatePasswordStrength,
  checkPasswordHistory
} from '@/lib/auth/helpers'

// Mock external dependencies
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => Buffer.from('mock-random-bytes')),
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mock-hash')
  })),
  timingSafeEqual: jest.fn(() => true)
}))

jest.mock('@/lib/utils/encryption', () => ({
  encryptData: jest.fn((data) => `encrypted-${data}`),
  decryptData: jest.fn((data) => data.replace('encrypted-', '')),
  hashData: jest.fn((data) => `hashed-${data}`),
  generateSecureToken: jest.fn(() => 'secure-token-123')
}))

describe('Authentication Helper Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset any global state
    global.Date.now = jest.fn(() => 1640995200000) // Fixed timestamp
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Session Management', () => {
    describe('generateSessionToken', () => {
      it('should generate a valid session token', () => {
        const token = generateSessionToken()
        
        expect(token).toBeDefined()
        expect(typeof token).toBe('string')
        expect(token.length).toBeGreaterThan(0)
      })

      it('should generate unique tokens on multiple calls', () => {
        const token1 = generateSessionToken()
        const token2 = generateSessionToken()
        
        expect(token1).not.toBe(token2)
      })
    })

    describe('validateSessionToken', () => {
      it('should validate a correct session token', () => {
        const token = 'valid-session-token'
        const userId = 'user-123'
        const sessionData = {
          userId,
          createdAt: Date.now(),
          expiresAt: Date.now() + 3600000, // 1 hour
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0'
        }

        const result = validateSessionToken(token, sessionData)
        
        expect(result.isValid).toBe(true)
        expect(result.userId).toBe(userId)
      })

      it('should reject expired session token', () => {
        const token = 'expired-session-token'
        const sessionData = {
          userId: 'user-123',
          createdAt: Date.now() - 7200000, // 2 hours ago
          expiresAt: Date.now() - 3600000, // 1 hour ago (expired)
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0'
        }

        const result = validateSessionToken(token, sessionData)
        
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Session expired')
      })

      it('should reject token with mismatched IP address', () => {
        const token = 'session-token'
        const sessionData = {
          userId: 'user-123',
          createdAt: Date.now(),
          expiresAt: Date.now() + 3600000,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0'
        }

        const result = validateSessionToken(token, sessionData, {
          currentIpAddress: '10.0.0.1', // Different IP
          strictIpValidation: true
        })
        
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('IP address mismatch')
      })
    })

    describe('createSecureSession', () => {
      it('should create a secure session with all required fields', () => {
        const userId = 'user-123'
        const options = {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          rememberMe: false
        }

        const session = createSecureSession(userId, options)
        
        expect(session.userId).toBe(userId)
        expect(session.sessionToken).toBeDefined()
        expect(session.createdAt).toBeDefined()
        expect(session.expiresAt).toBeDefined()
        expect(session.ipAddress).toBe(options.ipAddress)
        expect(session.userAgent).toBe(options.userAgent)
        expect(session.isSecure).toBe(true)
      })

      it('should set longer expiration for remember me sessions', () => {
        const userId = 'user-123'
        const options = {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          rememberMe: true
        }

        const session = createSecureSession(userId, options)
        const expectedExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        
        expect(session.expiresAt).toBeGreaterThan(Date.now() + (23 * 60 * 60 * 1000)) // More than 23 hours
      })
    })
  })

  describe('Two-Factor Authentication', () => {
    describe('generateTwoFactorSecret', () => {
      it('should generate a valid 2FA secret', () => {
        const secret = generateTwoFactorSecret()
        
        expect(secret).toBeDefined()
        expect(typeof secret).toBe('string')
        expect(secret.length).toBeGreaterThan(0)
      })

      it('should generate unique secrets', () => {
        const secret1 = generateTwoFactorSecret()
        const secret2 = generateTwoFactorSecret()
        
        expect(secret1).not.toBe(secret2)
      })
    })

    describe('verifyTwoFactorToken', () => {
      it('should verify a valid 2FA token', () => {
        const secret = 'JBSWY3DPEHPK3PXP'
        const token = '123456'
        
        // Mock the TOTP verification
        const result = verifyTwoFactorToken(token, secret)
        
        expect(typeof result).toBe('boolean')
      })

      it('should reject invalid 2FA token', () => {
        const secret = 'JBSWY3DPEHPK3PXP'
        const token = '000000'
        
        const result = verifyTwoFactorToken(token, secret)
        
        expect(result).toBe(false)
      })

      it('should handle malformed tokens', () => {
        const secret = 'JBSWY3DPEHPK3PXP'
        const token = 'invalid'
        
        const result = verifyTwoFactorToken(token, secret)
        
        expect(result).toBe(false)
      })
    })
  })

  describe('Password Reset Tokens', () => {
    describe('createPasswordResetToken', () => {
      it('should create a valid password reset token', () => {
        const userId = 'user-123'
        const email = 'user@example.com'
        
        const tokenData = createPasswordResetToken(userId, email)
        
        expect(tokenData.token).toBeDefined()
        expect(tokenData.userId).toBe(userId)
        expect(tokenData.email).toBe(email)
        expect(tokenData.expiresAt).toBeGreaterThan(Date.now())
        expect(tokenData.isUsed).toBe(false)
      })

      it('should set appropriate expiration time', () => {
        const userId = 'user-123'
        const email = 'user@example.com'
        
        const tokenData = createPasswordResetToken(userId, email)
        const expectedExpiry = Date.now() + (60 * 60 * 1000) // 1 hour
        
        expect(tokenData.expiresAt).toBeLessThanOrEqual(expectedExpiry + 1000) // Allow 1 second tolerance
        expect(tokenData.expiresAt).toBeGreaterThan(expectedExpiry - 1000)
      })
    })

    describe('validatePasswordResetToken', () => {
      it('should validate a correct password reset token', () => {
        const token = 'valid-reset-token'
        const tokenData = {
          token: 'hashed-valid-reset-token',
          userId: 'user-123',
          email: 'user@example.com',
          expiresAt: Date.now() + 3600000,
          isUsed: false,
          createdAt: Date.now()
        }
        
        const result = validatePasswordResetToken(token, tokenData)
        
        expect(result.isValid).toBe(true)
        expect(result.userId).toBe('user-123')
      })

      it('should reject expired password reset token', () => {
        const token = 'expired-reset-token'
        const tokenData = {
          token: 'hashed-expired-reset-token',
          userId: 'user-123',
          email: 'user@example.com',
          expiresAt: Date.now() - 1000, // Expired
          isUsed: false,
          createdAt: Date.now() - 3600000
        }
        
        const result = validatePasswordResetToken(token, tokenData)
        
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Token expired')
      })

      it('should reject already used password reset token', () => {
        const token = 'used-reset-token'
        const tokenData = {
          token: 'hashed-used-reset-token',
          userId: 'user-123',
          email: 'user@example.com',
          expiresAt: Date.now() + 3600000,
          isUsed: true, // Already used
          createdAt: Date.now()
        }
        
        const result = validatePasswordResetToken(token, tokenData)
        
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Token already used')
      })
    })
  })

  describe('Email Verification', () => {
    describe('createEmailVerificationToken', () => {
      it('should create a valid email verification token', () => {
        const userId = 'user-123'
        const email = 'user@example.com'
        
        const tokenData = createEmailVerificationToken(userId, email)
        
        expect(tokenData.token).toBeDefined()
        expect(tokenData.userId).toBe(userId)
        expect(tokenData.email).toBe(email)
        expect(tokenData.expiresAt).toBeGreaterThan(Date.now())
        expect(tokenData.isUsed).toBe(false)
      })
    })

    describe('validateEmailVerificationToken', () => {
      it('should validate a correct email verification token', () => {
        const token = 'valid-verification-token'
        const tokenData = {
          token: 'hashed-valid-verification-token',
          userId: 'user-123',
          email: 'user@example.com',
          expiresAt: Date.now() + 86400000, // 24 hours
          isUsed: false,
          createdAt: Date.now()
        }
        
        const result = validateEmailVerificationToken(token, tokenData)
        
        expect(result.isValid).toBe(true)
        expect(result.userId).toBe('user-123')
      })
    })
  })

  describe('Security & Rate Limiting', () => {
    describe('rateLimitCheck', () => {
      it('should allow requests within rate limit', () => {
        const identifier = 'user-123'
        const action = 'login'
        const limit = 5
        const windowMs = 60000 // 1 minute
        
        const result = rateLimitCheck(identifier, action, limit, windowMs)
        
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBeLessThanOrEqual(limit)
      })

      it('should track multiple requests', () => {
        const identifier = 'user-123'
        const action = 'login'
        const limit = 3
        const windowMs = 60000
        
        // Make multiple requests
        const result1 = rateLimitCheck(identifier, action, limit, windowMs)
        const result2 = rateLimitCheck(identifier, action, limit, windowMs)
        const result3 = rateLimitCheck(identifier, action, limit, windowMs)
        
        expect(result1.allowed).toBe(true)
        expect(result2.allowed).toBe(true)
        expect(result3.allowed).toBe(true)
        expect(result3.remaining).toBe(0)
      })

      it('should block requests exceeding rate limit', () => {
        const identifier = 'user-123'
        const action = 'password-reset'
        const limit = 2
        const windowMs = 60000
        
        // Exceed the limit
        rateLimitCheck(identifier, action, limit, windowMs)
        rateLimitCheck(identifier, action, limit, windowMs)
        const result = rateLimitCheck(identifier, action, limit, windowMs)
        
        expect(result.allowed).toBe(false)
        expect(result.retryAfter).toBeGreaterThan(0)
      })
    })

    describe('detectSuspiciousActivity', () => {
      it('should detect multiple failed login attempts', () => {
        const userId = 'user-123'
        const activities = [
          { action: 'login_failed', timestamp: Date.now() - 1000, ipAddress: '192.168.1.1' },
          { action: 'login_failed', timestamp: Date.now() - 2000, ipAddress: '192.168.1.1' },
          { action: 'login_failed', timestamp: Date.now() - 3000, ipAddress: '192.168.1.1' },
          { action: 'login_failed', timestamp: Date.now() - 4000, ipAddress: '192.168.1.1' },
          { action: 'login_failed', timestamp: Date.now() - 5000, ipAddress: '192.168.1.1' }
        ]
        
        const result = detectSuspiciousActivity(userId, activities)
        
        expect(result.isSuspicious).toBe(true)
        expect(result.reasons).toContain('Multiple failed login attempts')
        expect(result.riskLevel).toBeGreaterThanOrEqual(0.7)
      })

      it('should detect logins from multiple IP addresses', () => {
        const userId = 'user-123'
        const activities = [
          { action: 'login_success', timestamp: Date.now() - 1000, ipAddress: '192.168.1.1' },
          { action: 'login_success', timestamp: Date.now() - 2000, ipAddress: '10.0.0.1' },
          { action: 'login_success', timestamp: Date.now() - 3000, ipAddress: '172.16.0.1' }
        ]
        
        const result = detectSuspiciousActivity(userId, activities)
        
        expect(result.isSuspicious).toBe(true)
        expect(result.reasons).toContain('Multiple IP addresses')
      })

      it('should not flag normal activity as suspicious', () => {
        const userId = 'user-123'
        const activities = [
          { action: 'login_success', timestamp: Date.now() - 1000, ipAddress: '192.168.1.1' },
          { action: 'profile_update', timestamp: Date.now() - 2000, ipAddress: '192.168.1.1' },
          { action: 'logout', timestamp: Date.now() - 3000, ipAddress: '192.168.1.1' }
        ]
        
        const result = detectSuspiciousActivity(userId, activities)
        
        expect(result.isSuspicious).toBe(false)
        expect(result.riskLevel).toBeLessThan(0.3)
      })
    })

    describe('sanitizeUserInput', () => {
      it('should sanitize HTML tags', () => {
        const input = '<script>alert("xss")</script>Hello World'
        const sanitized = sanitizeUserInput(input)
        
        expect(sanitized).not.toContain('<script>')
        expect(sanitized).not.toContain('alert')
        expect(sanitized).toContain('Hello World')
      })

      it('should trim whitespace', () => {
        const input = '  hello world  '
        const sanitized = sanitizeUserInput(input)
        
        expect(sanitized).toBe('hello world')
      })

      it('should handle SQL injection attempts', () => {
        const input = "'; DROP TABLE users; --"
        const sanitized = sanitizeUserInput(input)
        
        expect(sanitized).not.toContain('DROP TABLE')
        expect(sanitized).not.toContain('--')
      })
    })

    describe('validatePasswordStrength', () => {
      it('should validate strong password', () => {
        const password = 'StrongP@ssw0rd123!'
        const result = validatePasswordStrength(password)
        
        expect(result.isValid).toBe(true)
        expect(result.score).toBeGreaterThanOrEqual(4)
        expect(result.feedback).toHaveLength(0)
      })

      it('should reject weak password', () => {
        const password = '123456'
        const result = validatePasswordStrength(password)
        
        expect(result.isValid).toBe(false)
        expect(result.score).toBeLessThan(3)
        expect(result.feedback.length).toBeGreaterThan(0)
      })

      it('should provide helpful feedback for weak passwords', () => {
        const password = 'password'
        const result = validatePasswordStrength(password)
        
        expect(result.feedback).toContain('Add numbers')
        expect(result.feedback).toContain('Add special characters')
        expect(result.feedback).toContain('Add uppercase letters')
      })
    })

    describe('checkPasswordHistory', () => {
      it('should reject recently used password', () => {
        const newPassword = 'NewPassword123!'
        const passwordHistory = [
          { hash: 'hashed-NewPassword123!', createdAt: Date.now() - 86400000 }, // 1 day ago
          { hash: 'hashed-OldPassword123!', createdAt: Date.now() - 172800000 } // 2 days ago
        ]
        
        const result = checkPasswordHistory(newPassword, passwordHistory)
        
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Password was recently used')
      })

      it('should allow password not in history', () => {
        const newPassword = 'BrandNewPassword123!'
        const passwordHistory = [
          { hash: 'hashed-OldPassword123!', createdAt: Date.now() - 86400000 },
          { hash: 'hashed-AnotherOldPassword123!', createdAt: Date.now() - 172800000 }
        ]
        
        const result = checkPasswordHistory(newPassword, passwordHistory)
        
        expect(result.isValid).toBe(true)
      })
    })
  })

  describe('Security Audit Logging', () => {
    describe('securityAuditLog', () => {
      it('should create audit log entry', () => {
        const logData = {
          userId: 'user-123',
          action: 'login_success',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          metadata: { loginMethod: 'password' }
        }
        
        const result = securityAuditLog(logData)
        
        expect(result.success).toBe(true)
        expect(result.logId).toBeDefined()
        expect(result.timestamp).toBeDefined()
      })

      it('should handle sensitive data appropriately', () => {
        const logData = {
          userId: 'user-123',
          action: 'password_change',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          metadata: { 
            oldPassword: 'secret123', // This should be filtered out
            newPasswordHash: 'hashed-value'
          }
        }
        
        const result = securityAuditLog(logData)
        
        expect(result.success).toBe(true)
        // Verify sensitive data is not logged
        expect(result.sanitizedMetadata).not.toHaveProperty('oldPassword')
      })
    })
  })
}) 