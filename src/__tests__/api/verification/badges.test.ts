import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/verification/badges/route'

// Mock Supabase
const mockCreateClient = jest.fn(() => ({
  auth: {
    getUser: jest.fn()
  }
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient
}))

describe('/api/verification/badges', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/verification/badges', () => {
    it('should return user badges for authenticated user', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/badges', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeInstanceOf(Array)
      expect(data.stats).toBeDefined()
      expect(data.stats.total).toBeGreaterThanOrEqual(0)
      expect(data.stats.by_level).toBeDefined()
      expect(data.stats.by_type).toBeDefined()
      expect(data.meta).toBeDefined()
    })

    it('should return public badges for specific user', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/badges?userId=user-456&public=true', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeInstanceOf(Array)
      expect(data.meta.isPublicView).toBe(true)
      
      // All returned badges should be public
      data.data.forEach((badge: any) => {
        expect(badge.is_public).toBe(true)
      })
    })

    it('should filter badges by credential type', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/badges?type=education', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // All returned badges should be education type
      data.data.forEach((badge: any) => {
        expect(badge.credential_type).toBe('education')
      })
    })

    it('should respect limit parameter', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/badges?limit=2', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.length).toBeLessThanOrEqual(2)
      expect(data.meta.limit).toBe(2)
    })

    it('should require authentication for private badge access', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user found' }
      })

      const request = new NextRequest('http://localhost:3000/api/verification/badges', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should require userId for public badge requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/verification/badges?public=true', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User ID is required')
    })

    it('should return badge statistics with correct structure', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/badges', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.stats).toEqual({
        total: expect.any(Number),
        public: expect.any(Number),
        by_level: {
          basic: expect.any(Number),
          verified: expect.any(Number),
          premium: expect.any(Number),
          expert: expect.any(Number)
        },
        by_type: {
          education: expect.any(Number),
          employment: expect.any(Number),
          certification: expect.any(Number),
          skills: expect.any(Number)
        },
        expired: expect.any(Number)
      })
    })

    it('should handle server errors gracefully', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/verification/badges', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should return badges with correct structure', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/badges', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      if (data.data.length > 0) {
        const badge = data.data[0]
        expect(badge).toEqual({
          id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          credential_type: expect.any(String),
          verification_level: expect.any(String),
          verification_score: expect.any(Number),
          issued_at: expect.any(String),
          expires_at: expect.anything(), // Can be null
          is_public: expect.any(Boolean),
          issuer: {
            name: expect.any(String),
            type: expect.any(String)
          },
          metadata: expect.any(Object),
          documents_count: expect.any(Number)
        })
      }
    })

    it('should filter out private badges for other users', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/badges?userId=user-456', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Should only return public badges when viewing another user's profile
      data.data.forEach((badge: any) => {
        expect(badge.is_public).toBe(true)
      })
    })
  })
}) 