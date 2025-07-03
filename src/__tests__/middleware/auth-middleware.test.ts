import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest, NextResponse } from 'next/server'
import {
  authMiddleware,
  requireAuth,
  requireRole,
  rateLimitMiddleware,
  securityHeadersMiddleware,
  csrfProtectionMiddleware,
  sessionValidationMiddleware
} from '@/middleware/auth'

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(() => ({ status: 200, headers: new Map() })),
    redirect: jest.fn((url) => ({ status: 302, headers: new Map([['Location', url]]) })),
    json: jest.fn((data, options) => ({ 
      status: options?.status || 200, 
      body: JSON.stringify(data),
      headers: new Map([['Content-Type', 'application/json']])
    }))
  }
}))

// Mock authentication utilities
jest.mock('@/lib/auth/helpers', () => ({
  validateSessionToken: jest.fn(),
  rateLimitCheck: jest.fn(),
  securityAuditLog: jest.fn(),
  generateCSRFToken: jest.fn(() => 'csrf-token-123'),
  validateCSRFToken: jest.fn(() => true)
}))

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn()
    }
  }))
}))

describe('Authentication Middleware', () => {
  let mockRequest: Partial<NextRequest>
  let mockResponse: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockRequest = {
      method: 'GET',
      url: 'http://localhost:3000/dashboard',
      headers: new Map([
        ['user-agent', 'Mozilla/5.0'],
        ['x-forwarded-for', '192.168.1.1'],
        ['cookie', 'session=valid-session-token']
      ]),
      cookies: {
        get: jest.fn((name) => {
          if (name === 'session') return { value: 'valid-session-token' }
          if (name === 'csrf-token') return { value: 'csrf-token-123' }
          return undefined
        })
      },
      nextUrl: {
        pathname: '/dashboard',
        searchParams: new URLSearchParams()
      }
    }

    mockResponse = {
      status: 200,
      headers: new Map(),
      cookies: {
        set: jest.fn(),
        delete: jest.fn()
      }
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('authMiddleware', () => {
    it('should allow access to public routes without authentication', async () => {
      mockRequest.nextUrl!.pathname = '/login'
      
      const result = await authMiddleware(mockRequest as NextRequest)
      
      expect(result.status).toBe(200)
    })

    it('should redirect unauthenticated users to login page', async () => {
      mockRequest.cookies!.get = jest.fn(() => undefined) // No session cookie
      
      const result = await authMiddleware(mockRequest as NextRequest)
      
      expect(result.status).toBe(302)
      expect(result.headers.get('Location')).toContain('/login')
    })

    it('should allow authenticated users to access protected routes', async () => {
      const { validateSessionToken } = require('@/lib/auth/helpers')
      validateSessionToken.mockReturnValue({ isValid: true, userId: 'user-123' })
      
      const result = await authMiddleware(mockRequest as NextRequest)
      
      expect(result.status).toBe(200)
      expect(validateSessionToken).toHaveBeenCalledWith('valid-session-token', expect.any(Object))
    })

    it('should handle expired session tokens', async () => {
      const { validateSessionToken } = require('@/lib/auth/helpers')
      validateSessionToken.mockReturnValue({ isValid: false, error: 'Session expired' })
      
      const result = await authMiddleware(mockRequest as NextRequest)
      
      expect(result.status).toBe(302)
      expect(result.headers.get('Location')).toContain('/login')
    })

    it('should log security events', async () => {
      const { securityAuditLog } = require('@/lib/auth/helpers')
      
      await authMiddleware(mockRequest as NextRequest)
      
      expect(securityAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        action: expect.any(String),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      }))
    })
  })

  describe('requireAuth', () => {
    it('should return user data for authenticated requests', async () => {
      const { validateSessionToken } = require('@/lib/auth/helpers')
      validateSessionToken.mockReturnValue({ 
        isValid: true, 
        userId: 'user-123',
        user: { id: 'user-123', email: 'user@example.com' }
      })
      
      const result = await requireAuth(mockRequest as NextRequest)
      
      expect(result.success).toBe(true)
      expect(result.user).toEqual({ id: 'user-123', email: 'user@example.com' })
    })

    it('should return error for unauthenticated requests', async () => {
      mockRequest.cookies!.get = jest.fn(() => undefined)
      
      const result = await requireAuth(mockRequest as NextRequest)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication required')
    })

    it('should handle invalid session tokens', async () => {
      const { validateSessionToken } = require('@/lib/auth/helpers')
      validateSessionToken.mockReturnValue({ isValid: false, error: 'Invalid token' })
      
      const result = await requireAuth(mockRequest as NextRequest)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid session')
    })
  })

  describe('requireRole', () => {
    it('should allow access for users with required role', async () => {
      const user = { 
        id: 'user-123', 
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['read', 'write', 'admin']
      }
      
      const result = await requireRole(['admin'])(user)
      
      expect(result.hasAccess).toBe(true)
    })

    it('should deny access for users without required role', async () => {
      const user = { 
        id: 'user-123', 
        email: 'user@example.com',
        role: 'user',
        permissions: ['read']
      }
      
      const result = await requireRole(['admin'])(user)
      
      expect(result.hasAccess).toBe(false)
      expect(result.error).toBe('Insufficient permissions')
    })

    it('should allow access for users with any of multiple required roles', async () => {
      const user = { 
        id: 'user-123', 
        email: 'moderator@example.com',
        role: 'moderator',
        permissions: ['read', 'write', 'moderate']
      }
      
      const result = await requireRole(['admin', 'moderator'])(user)
      
      expect(result.hasAccess).toBe(true)
    })

    it('should handle users without role property', async () => {
      const user = { 
        id: 'user-123', 
        email: 'user@example.com'
        // No role property
      }
      
      const result = await requireRole(['admin'])(user)
      
      expect(result.hasAccess).toBe(false)
    })
  })

  describe('rateLimitMiddleware', () => {
    it('should allow requests within rate limit', async () => {
      const { rateLimitCheck } = require('@/lib/auth/helpers')
      rateLimitCheck.mockReturnValue({ allowed: true, remaining: 4 })
      
      const result = await rateLimitMiddleware({
        identifier: '192.168.1.1',
        limit: 5,
        windowMs: 60000
      })(mockRequest as NextRequest)
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('should block requests exceeding rate limit', async () => {
      const { rateLimitCheck } = require('@/lib/auth/helpers')
      rateLimitCheck.mockReturnValue({ 
        allowed: false, 
        remaining: 0,
        retryAfter: 30000
      })
      
      const result = await rateLimitMiddleware({
        identifier: '192.168.1.1',
        limit: 5,
        windowMs: 60000
      })(mockRequest as NextRequest)
      
      expect(result.allowed).toBe(false)
      expect(result.retryAfter).toBe(30000)
    })

    it('should use IP address as default identifier', async () => {
      const { rateLimitCheck } = require('@/lib/auth/helpers')
      rateLimitCheck.mockReturnValue({ allowed: true, remaining: 4 })
      
      await rateLimitMiddleware({
        limit: 5,
        windowMs: 60000
      })(mockRequest as NextRequest)
      
      expect(rateLimitCheck).toHaveBeenCalledWith(
        '192.168.1.1',
        expect.any(String),
        5,
        60000
      )
    })

    it('should handle different rate limit actions', async () => {
      const { rateLimitCheck } = require('@/lib/auth/helpers')
      rateLimitCheck.mockReturnValue({ allowed: true, remaining: 4 })
      
      await rateLimitMiddleware({
        identifier: 'user-123',
        limit: 3,
        windowMs: 60000,
        action: 'login'
      })(mockRequest as NextRequest)
      
      expect(rateLimitCheck).toHaveBeenCalledWith(
        'user-123',
        'login',
        3,
        60000
      )
    })
  })

  describe('securityHeadersMiddleware', () => {
    it('should add security headers to response', async () => {
      const response = NextResponse.next()
      
      const result = await securityHeadersMiddleware(response)
      
      expect(result.headers.get('X-Frame-Options')).toBe('DENY')
      expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(result.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
      expect(result.headers.get('X-XSS-Protection')).toBe('1; mode=block')
    })

    it('should add Content Security Policy header', async () => {
      const response = NextResponse.next()
      
      const result = await securityHeadersMiddleware(response)
      
      const csp = result.headers.get('Content-Security-Policy')
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("script-src 'self'")
      expect(csp).toContain("style-src 'self'")
    })

    it('should add Strict Transport Security header for HTTPS', async () => {
      mockRequest.url = 'https://example.com/dashboard'
      const response = NextResponse.next()
      
      const result = await securityHeadersMiddleware(response)
      
      expect(result.headers.get('Strict-Transport-Security')).toBe(
        'max-age=31536000; includeSubDomains; preload'
      )
    })
  })

  describe('csrfProtectionMiddleware', () => {
    it('should allow GET requests without CSRF token', async () => {
      mockRequest.method = 'GET'
      
      const result = await csrfProtectionMiddleware(mockRequest as NextRequest)
      
      expect(result.isValid).toBe(true)
    })

    it('should validate CSRF token for POST requests', async () => {
      mockRequest.method = 'POST'
      mockRequest.headers!.set('x-csrf-token', 'csrf-token-123')
      
      const { validateCSRFToken } = require('@/lib/auth/helpers')
      validateCSRFToken.mockReturnValue(true)
      
      const result = await csrfProtectionMiddleware(mockRequest as NextRequest)
      
      expect(result.isValid).toBe(true)
      expect(validateCSRFToken).toHaveBeenCalledWith('csrf-token-123')
    })

    it('should reject POST requests without CSRF token', async () => {
      mockRequest.method = 'POST'
      mockRequest.headers!.delete('x-csrf-token')
      
      const result = await csrfProtectionMiddleware(mockRequest as NextRequest)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('CSRF token missing')
    })

    it('should reject POST requests with invalid CSRF token', async () => {
      mockRequest.method = 'POST'
      mockRequest.headers!.set('x-csrf-token', 'invalid-token')
      
      const { validateCSRFToken } = require('@/lib/auth/helpers')
      validateCSRFToken.mockReturnValue(false)
      
      const result = await csrfProtectionMiddleware(mockRequest as NextRequest)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid CSRF token')
    })

    it('should handle CSRF token from cookies', async () => {
      mockRequest.method = 'POST'
      // No header token, but cookie token exists
      
      const result = await csrfProtectionMiddleware(mockRequest as NextRequest)
      
      expect(result.isValid).toBe(true)
    })
  })

  describe('sessionValidationMiddleware', () => {
    it('should validate active session', async () => {
      const { validateSessionToken } = require('@/lib/auth/helpers')
      validateSessionToken.mockReturnValue({ 
        isValid: true, 
        userId: 'user-123',
        sessionData: {
          createdAt: Date.now() - 1800000, // 30 minutes ago
          lastActivity: Date.now() - 300000, // 5 minutes ago
          ipAddress: '192.168.1.1'
        }
      })
      
      const result = await sessionValidationMiddleware(mockRequest as NextRequest)
      
      expect(result.isValid).toBe(true)
      expect(result.userId).toBe('user-123')
    })

    it('should detect session hijacking attempts', async () => {
      const { validateSessionToken } = require('@/lib/auth/helpers')
      validateSessionToken.mockReturnValue({ 
        isValid: true, 
        userId: 'user-123',
        sessionData: {
          createdAt: Date.now() - 1800000,
          lastActivity: Date.now() - 300000,
          ipAddress: '10.0.0.1' // Different IP
        }
      })
      
      const result = await sessionValidationMiddleware(mockRequest as NextRequest, {
        strictIpValidation: true
      })
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Session security violation')
    })

    it('should handle inactive sessions', async () => {
      const { validateSessionToken } = require('@/lib/auth/helpers')
      validateSessionToken.mockReturnValue({ 
        isValid: true, 
        userId: 'user-123',
        sessionData: {
          createdAt: Date.now() - 7200000, // 2 hours ago
          lastActivity: Date.now() - 3600000, // 1 hour ago (inactive)
          ipAddress: '192.168.1.1'
        }
      })
      
      const result = await sessionValidationMiddleware(mockRequest as NextRequest, {
        maxInactivity: 1800000 // 30 minutes
      })
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Session inactive too long')
    })

    it('should update session activity', async () => {
      const { validateSessionToken } = require('@/lib/auth/helpers')
      validateSessionToken.mockReturnValue({ 
        isValid: true, 
        userId: 'user-123',
        sessionData: {
          createdAt: Date.now() - 1800000,
          lastActivity: Date.now() - 300000,
          ipAddress: '192.168.1.1'
        }
      })
      
      const result = await sessionValidationMiddleware(mockRequest as NextRequest, {
        updateActivity: true
      })
      
      expect(result.isValid).toBe(true)
      expect(result.sessionUpdated).toBe(true)
    })
  })

  describe('Middleware Chain Integration', () => {
    it('should handle multiple middleware functions in sequence', async () => {
      const { validateSessionToken, rateLimitCheck } = require('@/lib/auth/helpers')
      
      validateSessionToken.mockReturnValue({ isValid: true, userId: 'user-123' })
      rateLimitCheck.mockReturnValue({ allowed: true, remaining: 4 })
      
      // Simulate middleware chain
      const authResult = await requireAuth(mockRequest as NextRequest)
      expect(authResult.success).toBe(true)
      
      const rateLimitResult = await rateLimitMiddleware({
        identifier: authResult.user!.id,
        limit: 5,
        windowMs: 60000
      })(mockRequest as NextRequest)
      expect(rateLimitResult.allowed).toBe(true)
      
      const csrfResult = await csrfProtectionMiddleware(mockRequest as NextRequest)
      expect(csrfResult.isValid).toBe(true)
    })

    it('should fail gracefully when one middleware fails', async () => {
      const { validateSessionToken } = require('@/lib/auth/helpers')
      validateSessionToken.mockReturnValue({ isValid: false, error: 'Invalid session' })
      
      const authResult = await requireAuth(mockRequest as NextRequest)
      expect(authResult.success).toBe(false)
      
      // Subsequent middleware should not be called for failed auth
      // This would be handled by the middleware chain logic
    })
  })

  describe('Error Handling', () => {
    it('should handle middleware errors gracefully', async () => {
      const { validateSessionToken } = require('@/lib/auth/helpers')
      validateSessionToken.mockImplementation(() => {
        throw new Error('Database connection failed')
      })
      
      const result = await requireAuth(mockRequest as NextRequest)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Authentication error')
    })

    it('should log middleware errors for debugging', async () => {
      const { securityAuditLog } = require('@/lib/auth/helpers')
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const { validateSessionToken } = require('@/lib/auth/helpers')
      validateSessionToken.mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      
      await requireAuth(mockRequest as NextRequest)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Authentication middleware error'),
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })
}) 