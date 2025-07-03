import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/verification/admin/queue/route'

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

describe('/api/verification/admin/queue', () => {
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

  describe('GET /api/verification/admin/queue', () => {
    it('should return verification queue for admin users', async () => {
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

      // Mock admin check (development mode allows all users to be admin)
      process.env.NODE_ENV = 'development'

      const request = new NextRequest('http://localhost:3000/api/verification/admin/queue', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeInstanceOf(Array)
      expect(data.pagination).toBeDefined()
      expect(data.pagination.total).toBeGreaterThanOrEqual(0)
      expect(data.pagination.limit).toBe(50) // Default limit
      expect(data.pagination.offset).toBe(0) // Default offset
    })

    it('should reject unauthenticated requests', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user found' }
      })

      const request = new NextRequest('http://localhost:3000/api/verification/admin/queue', {
        method: 'GET'
      })

      const response = await GET(request)
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

      // Mock production environment and non-admin role
      process.env.NODE_ENV = 'production'
      mockSingle.mockResolvedValue({
        data: { role: 'user' },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/verification/admin/queue', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer user-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Insufficient permissions')
    })

    it('should allow admin users in production', async () => {
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

      // Mock production environment and admin role
      process.env.NODE_ENV = 'production'
      mockSingle.mockResolvedValue({
        data: { role: 'admin' },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/verification/admin/queue', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should filter by status parameter', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/admin/queue?status=pending', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // All returned requests should have pending status
      data.data.forEach((request: any) => {
        expect(request.status).toBe('pending')
      })
    })

    it('should filter by credential type', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/admin/queue?credentialType=education', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // All returned requests should be education type
      data.data.forEach((request: any) => {
        expect(request.credential_type.type).toBe('education')
      })
    })

    it('should filter by assigned user', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/admin/queue?assignedTo=admin-123', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // All returned requests should be assigned to admin-123
      data.data.forEach((request: any) => {
        expect(request.assigned_to).toBe('admin-123')
      })
    })

    it('should support search query', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/admin/queue?query=computer', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Results should contain the search term in title, description, or user info
      data.data.forEach((request: any) => {
        const searchTerm = 'computer'
        const matchFound = 
          request.title.toLowerCase().includes(searchTerm) ||
          request.description.toLowerCase().includes(searchTerm) ||
          request.user.full_name.toLowerCase().includes(searchTerm) ||
          request.user.email.toLowerCase().includes(searchTerm)
        expect(matchFound).toBe(true)
      })
    })

    it('should respect pagination parameters', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/admin/queue?limit=2&offset=1', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.length).toBeLessThanOrEqual(2)
      expect(data.pagination.limit).toBe(2)
      expect(data.pagination.offset).toBe(1)
    })

    it('should return verification requests with correct structure', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/admin/queue', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      if (data.data.length > 0) {
        const verificationRequest = data.data[0]
        expect(verificationRequest).toEqual({
          id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          status: expect.any(String),
          priority: expect.any(String),
          submitted_at: expect.any(String),
          user: {
            id: expect.any(String),
            full_name: expect.any(String),
            email: expect.any(String)
          },
          credential_type: {
            id: expect.any(String),
            name: expect.any(String),
            type: expect.any(String)
          },
          documents: expect.any(Array),
          assigned_to: expect.anything(), // Can be null
          verification_score: expect.anything(), // Can be null
          estimated_completion: expect.anything() // Can be null
        })
      }
    })

    it('should handle server errors gracefully', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/verification/admin/queue', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should handle multiple filter parameters', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/admin/queue?status=pending&credentialType=education&priority=high', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Results should match all filters (though may be empty if no matches)
      data.data.forEach((request: any) => {
        expect(request.status).toBe('pending')
        expect(request.credential_type.type).toBe('education')
      })
    })

    it('should return hasMore flag correctly', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/admin/queue?limit=1', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pagination.hasMore).toBeDefined()
      expect(typeof data.pagination.hasMore).toBe('boolean')
    })
  })
}) 