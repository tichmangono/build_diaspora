import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST, PUT } from '@/app/api/verification/admin/status/route'

// Mock Supabase
const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()
const mockCreateClient = jest.fn(() => ({
  auth: {
    getUser: jest.fn()
  },
  from: mockFrom
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient
}))

describe('/api/verification/admin/status', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    mockFrom.mockReturnValue({
      select: mockSelect
    })
    
    mockSelect.mockReturnValue({
      eq: mockEq
    })
    
    mockEq.mockReturnValue({
      single: mockSingle
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST /api/verification/admin/status (Single Update)', () => {
    it('should update verification request status for admin users', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com'
          }
        },
        error: null
      })

      process.env.NODE_ENV = 'development'

      const requestBody = {
        requestId: 'req-123',
        status: 'approved',
        reviewNotes: 'All documents verified successfully',
        verificationScore: 95,
        assignedTo: 'admin-123'
      }

      const request = new NextRequest('http://localhost:3000/api/verification/admin/status', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.requestId).toBe('req-123')
      expect(data.data.status).toBe('approved')
      expect(data.data.reviewedBy).toBe('admin-123')
      expect(data.data.reviewedAt).toBeDefined()
      expect(data.data.badge).toBeDefined() // Badge created for approved status
    })

    it('should create expert level badge for high verification scores', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com'
          }
        },
        error: null
      })

      process.env.NODE_ENV = 'development'

      const requestBody = {
        requestId: 'req-123',
        status: 'approved',
        verificationScore: 95
      }

      const request = new NextRequest('http://localhost:3000/api/verification/admin/status', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.badge.verification_level).toBe('expert')
      expect(data.data.badge.verification_score).toBe(95)
    })

    it('should create verified level badge for lower verification scores', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com'
          }
        },
        error: null
      })

      process.env.NODE_ENV = 'development'

      const requestBody = {
        requestId: 'req-123',
        status: 'approved',
        verificationScore: 75
      }

      const request = new NextRequest('http://localhost:3000/api/verification/admin/status', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.badge.verification_level).toBe('verified')
      expect(data.data.badge.verification_score).toBe(75)
    })

    it('should not create badge for rejected status', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com'
          }
        },
        error: null
      })

      process.env.NODE_ENV = 'development'

      const requestBody = {
        requestId: 'req-123',
        status: 'rejected',
        reviewNotes: 'Documents are not valid',
        rejectionReason: 'Invalid documents'
      }

      const request = new NextRequest('http://localhost:3000/api/verification/admin/status', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.badge).toBeNull()
    })

    it('should reject unauthenticated requests', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user found' }
      })

      const requestBody = {
        requestId: 'req-123',
        status: 'approved'
      }

      const request = new NextRequest('http://localhost:3000/api/verification/admin/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject non-admin users in production', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com'
          }
        },
        error: null
      })

      process.env.NODE_ENV = 'production'
      mockSingle.mockResolvedValue({
        data: { role: 'user' },
        error: null
      })

      const requestBody = {
        requestId: 'req-123',
        status: 'approved'
      }

      const request = new NextRequest('http://localhost:3000/api/verification/admin/status', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer user-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Insufficient permissions')
    })

    it('should validate request data', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com'
          }
        },
        error: null
      })

      process.env.NODE_ENV = 'development'

      const requestBody = {
        // Missing requestId
        status: 'invalid-status', // Invalid status
        verificationScore: 150 // Invalid score (over 100)
      }

      const request = new NextRequest('http://localhost:3000/api/verification/admin/status', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
      expect(data.details).toBeDefined()
    })

    it('should handle all valid status values', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com'
          }
        },
        error: null
      })

      process.env.NODE_ENV = 'development'

      const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'requires_more_info']

      for (const status of validStatuses) {
        const requestBody = {
          requestId: `req-${status}`,
          status
        }

        const request = new NextRequest('http://localhost:3000/api/verification/admin/status', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer admin-token',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.status).toBe(status)
      }
    })
  })

  describe('PUT /api/verification/admin/status (Bulk Update)', () => {
    it('should update multiple verification requests', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com'
          }
        },
        error: null
      })

      process.env.NODE_ENV = 'development'

      const requestBody = {
        requestIds: ['req-1', 'req-2', 'req-3'],
        status: 'under_review',
        reviewNotes: 'Bulk update for review',
        assignedTo: 'admin-123'
      }

      const request = new NextRequest('http://localhost:3000/api/verification/admin/status', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.totalUpdated).toBe(3)
      expect(data.data.updatedRequests).toHaveLength(3)
      
      data.data.updatedRequests.forEach((update: any, index: number) => {
        expect(update.requestId).toBe(`req-${index + 1}`)
        expect(update.status).toBe('under_review')
        expect(update.reviewedBy).toBe('admin-123')
        expect(update.reviewedAt).toBeDefined()
      })
    })

    it('should require at least one request ID', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com'
          }
        },
        error: null
      })

      process.env.NODE_ENV = 'development'

      const requestBody = {
        requestIds: [], // Empty array
        status: 'under_review'
      }

      const request = new NextRequest('http://localhost:3000/api/verification/admin/status', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
    })

    it('should reject unauthenticated bulk requests', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user found' }
      })

      const requestBody = {
        requestIds: ['req-1', 'req-2'],
        status: 'approved'
      }

      const request = new NextRequest('http://localhost:3000/api/verification/admin/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should handle server errors gracefully', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockRejectedValue(new Error('Database connection failed'))

      const requestBody = {
        requestIds: ['req-1'],
        status: 'approved'
      }

      const request = new NextRequest('http://localhost:3000/api/verification/admin/status', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should validate bulk request data structure', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com'
          }
        },
        error: null
      })

      process.env.NODE_ENV = 'development'

      const requestBody = {
        requestIds: 'not-an-array', // Should be array
        status: 'invalid-status' // Invalid status
      }

      const request = new NextRequest('http://localhost:3000/api/verification/admin/status', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
      expect(data.details).toBeDefined()
    })
  })
}) 