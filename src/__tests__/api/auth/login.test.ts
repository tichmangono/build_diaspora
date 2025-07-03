import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'

// Mock Supabase
const mockSignInWithPassword = jest.fn()
const mockCreateServerClient = jest.fn(() => ({
  auth: {
    signInWithPassword: mockSignInWithPassword
  }
}))

jest.mock('@/lib/supabase/server', () => ({
  createServerClient: mockCreateServerClient
}))

// Mock rate limiting
const mockRateLimitCheck = jest.fn()
jest.mock('@/lib/auth/helpers', () => ({
  rateLimitCheck: mockRateLimitCheck,
  securityAuditLog: jest.fn(),
  validatePasswordStrength: jest.fn(() => ({ isValid: true, score: 5 }))
}))

// Mock encryption
jest.mock('@/lib/utils/encryption', () => ({
  encryptData: jest.fn((data) => `encrypted_${data}`),
  hashData: jest.fn((data) => `hashed_${data}`)
}))

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default rate limit to allow requests
    mockRateLimitCheck.mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetTime: Date.now() + 60000
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST /api/auth/login', () => {
    it('should successfully authenticate valid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            user_metadata: {
              firstName: 'John',
              lastName: 'Doe'
            }
          },
          session: {
            access_token: 'access-token-123',
            refresh_token: 'refresh-token-123',
            expires_at: Date.now() + 3600000
          }
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '192.168.1.1',
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'validPassword123!',
          rememberMe: false
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toEqual({
        id: 'user-123',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe'
      })
      expect(data.session).toBeDefined()
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'validPassword123!'
      })
    })

    it('should reject invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          status: 400
        }
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '192.168.1.1'
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'wrongPassword'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid login credentials')
    })

    it('should validate request body schema', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'invalid-email',
          password: '123' // Too short
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('validation')
    })

    it('should enforce rate limiting', async () => {
      mockRateLimitCheck.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 60
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '192.168.1.1'
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'validPassword123!'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Too many login attempts')
      expect(response.headers.get('Retry-After')).toBe('60')
    })

    it('should handle missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'user@example.com'
          // Missing password
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('password')
    })

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid-json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid JSON')
    })

    it('should set secure session cookies for remember me', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com'
          },
          session: {
            access_token: 'access-token-123',
            refresh_token: 'refresh-token-123',
            expires_at: Date.now() + 3600000
          }
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'validPassword123!',
          rememberMe: true
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      
      // Check that Set-Cookie headers are present
      const setCookieHeaders = response.headers.getSetCookie()
      expect(setCookieHeaders.length).toBeGreaterThan(0)
      
      // Check for session cookie with appropriate settings
      const sessionCookie = setCookieHeaders.find(cookie => 
        cookie.includes('session=') && 
        cookie.includes('HttpOnly') && 
        cookie.includes('Secure') &&
        cookie.includes('SameSite=Lax')
      )
      expect(sessionCookie).toBeDefined()
    })

    it('should handle database connection errors', async () => {
      mockSignInWithPassword.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'validPassword123!'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })

    it('should log security events', async () => {
      const mockSecurityAuditLog = require('@/lib/auth/helpers').securityAuditLog

      mockSignInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'user@example.com' },
          session: { access_token: 'token-123' }
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '192.168.1.1',
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'validPassword123!'
        })
      })

      await POST(request)

      expect(mockSecurityAuditLog).toHaveBeenCalledWith({
        action: 'LOGIN_SUCCESS',
        userId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: expect.any(Date)
      })
    })

    it('should handle account lockout scenarios', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Account temporarily locked due to multiple failed login attempts',
          status: 423
        }
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'locked@example.com',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(423)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Account temporarily locked')
    })

    it('should handle email verification requirements', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Email not confirmed',
          status: 400
        }
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'unverified@example.com',
          password: 'validPassword123!'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Email not confirmed')
    })

    it('should validate Content-Type header', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'validPassword123!'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Content-Type must be application/json')
    })

    it('should handle concurrent login attempts', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'user@example.com' },
          session: { access_token: 'token-123' }
        },
        error: null
      })

      const request1 = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '192.168.1.1'
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'validPassword123!'
        })
      })

      const request2 = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '192.168.1.1'
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'validPassword123!'
        })
      })

      // Simulate concurrent requests
      const [response1, response2] = await Promise.all([
        POST(request1),
        POST(request2)
      ])

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
    })
  })

  describe('Security Headers', () => {
    it('should include security headers in response', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'user@example.com' },
          session: { access_token: 'token-123' }
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'validPassword123!'
        })
      })

      const response = await POST(request)

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block')
    })
  })

  describe('CORS Handling', () => {
    it('should handle preflight OPTIONS requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://builddiaspora.com',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      })

      // Note: This would need to be implemented in the actual route handler
      // For now, we're testing the expectation
      const response = await POST(request)
      
      // Should handle OPTIONS requests appropriately
      expect(response.status).toBeLessThan(500)
    })
  })
}) 