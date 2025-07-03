import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/verification/request/route'

// Mock Supabase
const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockEq = jest.fn()
const mockOrder = jest.fn()
const mockLimit = jest.fn()
const mockCreateServerClient = jest.fn(() => ({
  from: mockFrom,
  auth: {
    getUser: jest.fn()
  }
}))

jest.mock('@/lib/supabase/server', () => ({
  createServerClient: mockCreateServerClient
}))

// Mock authentication middleware
const mockRequireAuth = jest.fn()
jest.mock('@/middleware/auth', () => ({
  requireAuth: mockRequireAuth
}))

// Mock rate limiting
const mockRateLimitCheck = jest.fn()
jest.mock('@/lib/auth/helpers', () => ({
  rateLimitCheck: mockRateLimitCheck,
  securityAuditLog: jest.fn()
}))

// Mock validation
jest.mock('@/lib/validations/verification', () => ({
  verificationRequestSchema: {
    safeParse: jest.fn()
  }
}))

describe('/api/verification/request', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit
    })
    
    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit
    })
    
    mockInsert.mockReturnValue({
      select: mockSelect
    })
    
    mockEq.mockReturnValue({
      order: mockOrder,
      limit: mockLimit
    })
    
    mockOrder.mockReturnValue({
      limit: mockLimit
    })
    
    mockLimit.mockResolvedValue({
      data: [],
      error: null
    })
    
    // Default auth to authenticated user
    mockRequireAuth.mockResolvedValue({
      success: true,
      user: {
        id: 'user-123',
        email: 'user@example.com'
      }
    })
    
    // Default rate limit to allow requests
    mockRateLimitCheck.mockResolvedValue({
      allowed: true,
      remaining: 4
    })
    
    // Default validation to pass
    const mockVerificationRequestSchema = require('@/lib/validations/verification').verificationRequestSchema
    mockVerificationRequestSchema.safeParse.mockReturnValue({
      success: true,
      data: {
        credentialType: 'education',
        institutionName: 'University of Zimbabwe',
        degreeTitle: 'Bachelor of Computer Science'
      }
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST /api/verification/request', () => {
    it('should successfully create verification request', async () => {
      mockInsert.mockReturnValue({
        select: mockSelect.mockResolvedValue({
          data: [{
            id: 'req-123',
            user_id: 'user-123',
            credential_type: 'education',
            status: 'pending',
            created_at: new Date().toISOString()
          }],
          error: null
        })
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          credentialType: 'education',
          institutionName: 'University of Zimbabwe',
          degreeTitle: 'Bachelor of Computer Science',
          startDate: '2018-09-01',
          endDate: '2022-06-30'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.request).toEqual({
        id: 'req-123',
        user_id: 'user-123',
        credential_type: 'education',
        status: 'pending',
        created_at: expect.any(String)
      })
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 'user-123',
        credential_type: 'education',
        institution_name: 'University of Zimbabwe',
        degree_title: 'Bachelor of Computer Science'
      }))
    })

    it('should reject unauthenticated requests', async () => {
      mockRequireAuth.mockResolvedValue({
        success: false,
        error: 'Authentication required'
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          credentialType: 'education',
          institutionName: 'University of Zimbabwe'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Authentication required')
    })

    it('should validate request body schema', async () => {
      const mockVerificationRequestSchema = require('@/lib/validations/verification').verificationRequestSchema
      mockVerificationRequestSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          issues: [
            { path: ['institutionName'], message: 'Institution name is required' },
            { path: ['degreeTitle'], message: 'Degree title is required' }
          ]
        }
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          credentialType: 'education'
          // Missing required fields
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Validation failed')
      expect(data.details).toEqual({
        institutionName: 'Institution name is required',
        degreeTitle: 'Degree title is required'
      })
    })

    it('should enforce rate limiting', async () => {
      mockRateLimitCheck.mockResolvedValue({
        allowed: false,
        remaining: 0,
        retryAfter: 300
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          credentialType: 'education',
          institutionName: 'University of Zimbabwe',
          degreeTitle: 'Bachelor of Computer Science'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Too many verification requests')
      expect(response.headers.get('Retry-After')).toBe('300')
    })

    it('should check for existing pending requests', async () => {
      // Mock existing pending request
      mockSelect.mockResolvedValue({
        data: [{
          id: 'existing-req',
          credential_type: 'education',
          status: 'pending'
        }],
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          credentialType: 'education',
          institutionName: 'University of Zimbabwe',
          degreeTitle: 'Bachelor of Computer Science'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error).toContain('pending verification request')
    })

    it('should handle database errors gracefully', async () => {
      mockInsert.mockReturnValue({
        select: mockSelect.mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' }
        })
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          credentialType: 'education',
          institutionName: 'University of Zimbabwe',
          degreeTitle: 'Bachelor of Computer Science'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })

    it('should validate credential type', async () => {
      const mockVerificationRequestSchema = require('@/lib/validations/verification').verificationRequestSchema
      mockVerificationRequestSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          issues: [
            { path: ['credentialType'], message: 'Invalid credential type' }
          ]
        }
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          credentialType: 'invalid-type',
          institutionName: 'University of Zimbabwe'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.details.credentialType).toBe('Invalid credential type')
    })

    it('should handle different credential types', async () => {
      const testCases = [
        {
          credentialType: 'employment',
          companyName: 'Tech Company Ltd',
          jobTitle: 'Software Engineer'
        },
        {
          credentialType: 'certification',
          certificationName: 'AWS Solutions Architect',
          issuingOrganization: 'Amazon Web Services'
        },
        {
          credentialType: 'skills',
          skillName: 'React Development',
          proficiencyLevel: 'expert'
        }
      ]

      for (const testCase of testCases) {
        mockInsert.mockReturnValue({
          select: mockSelect.mockResolvedValue({
            data: [{
              id: `req-${testCase.credentialType}`,
              credential_type: testCase.credentialType,
              status: 'pending'
            }],
            error: null
          })
        })

        const request = new NextRequest('http://localhost:3000/api/verification/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify(testCase)
        })

        const response = await POST(request)
        expect(response.status).toBe(201)
      }
    })
  })

  describe('GET /api/verification/request', () => {
    it('should retrieve user verification requests', async () => {
      const mockRequests = [
        {
          id: 'req-1',
          credential_type: 'education',
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z',
          institution_name: 'University of Zimbabwe'
        },
        {
          id: 'req-2',
          credential_type: 'employment',
          status: 'approved',
          created_at: '2024-01-02T00:00:00Z',
          company_name: 'Tech Company'
        }
      ]

      mockSelect.mockResolvedValue({
        data: mockRequests,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request?status=all', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.requests).toHaveLength(2)
      expect(data.requests[0]).toEqual(mockRequests[0])
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123')
    })

    it('should filter requests by status', async () => {
      const mockPendingRequests = [
        {
          id: 'req-1',
          credential_type: 'education',
          status: 'pending'
        }
      ]

      mockSelect.mockResolvedValue({
        data: mockPendingRequests,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request?status=pending', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.requests).toHaveLength(1)
      expect(data.requests[0].status).toBe('pending')
    })

    it('should filter requests by credential type', async () => {
      const mockEducationRequests = [
        {
          id: 'req-1',
          credential_type: 'education',
          status: 'pending'
        }
      ]

      mockSelect.mockResolvedValue({
        data: mockEducationRequests,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request?credentialType=education', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.requests).toHaveLength(1)
      expect(data.requests[0].credential_type).toBe('education')
    })

    it('should handle pagination', async () => {
      const mockRequests = Array.from({ length: 5 }, (_, i) => ({
        id: `req-${i + 1}`,
        credential_type: 'education',
        status: 'pending'
      }))

      mockLimit.mockResolvedValue({
        data: mockRequests.slice(0, 3),
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request?limit=3&offset=0', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.requests).toHaveLength(3)
      expect(mockLimit).toHaveBeenCalledWith(3)
    })

    it('should require authentication', async () => {
      mockRequireAuth.mockResolvedValue({
        success: false,
        error: 'Authentication required'
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Authentication required')
    })

    it('should handle database errors', async () => {
      mockSelect.mockResolvedValue({
        data: null,
        error: { message: 'Database query failed' }
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })

    it('should return empty array when no requests found', async () => {
      mockSelect.mockResolvedValue({
        data: [],
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.requests).toEqual([])
    })

    it('should include related documents and badges', async () => {
      const mockRequestsWithRelations = [
        {
          id: 'req-1',
          credential_type: 'education',
          status: 'approved',
          documents: [
            { id: 'doc-1', type: 'diploma', url: 'https://example.com/diploma.pdf' }
          ],
          badges: [
            { id: 'badge-1', verification_level: 'verified', score: 85 }
          ]
        }
      ]

      mockSelect.mockResolvedValue({
        data: mockRequestsWithRelations,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request?include=documents,badges', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.requests[0].documents).toBeDefined()
      expect(data.requests[0].badges).toBeDefined()
    })
  })

  describe('Security and Validation', () => {
    it('should sanitize input data', async () => {
      const maliciousInput = {
        credentialType: 'education',
        institutionName: '<script>alert("xss")</script>University',
        degreeTitle: 'Bachelor of <img src=x onerror=alert("xss")>Science'
      }

      const request = new NextRequest('http://localhost:3000/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(maliciousInput)
      })

      await POST(request)

      // Verify that the insert call receives sanitized data
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        institution_name: expect.not.stringContaining('<script>'),
        degree_title: expect.not.stringContaining('<img')
      }))
    })

    it('should validate file uploads in request', async () => {
      const requestWithFiles = {
        credentialType: 'education',
        institutionName: 'University of Zimbabwe',
        degreeTitle: 'Bachelor of Computer Science',
        documents: [
          {
            type: 'diploma',
            filename: 'diploma.pdf',
            size: 1024000 // 1MB
          }
        ]
      }

      const request = new NextRequest('http://localhost:3000/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(requestWithFiles)
      })

      const response = await POST(request)
      expect(response.status).toBeLessThan(500) // Should handle gracefully
    })

    it('should log audit trail for verification requests', async () => {
      const mockSecurityAuditLog = require('@/lib/auth/helpers').securityAuditLog

      mockInsert.mockReturnValue({
        select: mockSelect.mockResolvedValue({
          data: [{ id: 'req-123' }],
          error: null
        })
      })

      const request = new NextRequest('http://localhost:3000/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
          'X-Forwarded-For': '192.168.1.1'
        },
        body: JSON.stringify({
          credentialType: 'education',
          institutionName: 'University of Zimbabwe'
        })
      })

      await POST(request)

      expect(mockSecurityAuditLog).toHaveBeenCalledWith({
        action: 'VERIFICATION_REQUEST_CREATED',
        userId: 'user-123',
        resourceId: 'req-123',
        ipAddress: '192.168.1.1',
        timestamp: expect.any(Date)
      })
    })
  })
}) 