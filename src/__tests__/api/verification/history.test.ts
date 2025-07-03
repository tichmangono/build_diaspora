import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/verification/history/route'

// Mock Supabase
const mockCreateClient = jest.fn(() => ({
  auth: {
    getUser: jest.fn()
  }
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient
}))

describe('/api/verification/history', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/verification/history', () => {
    it('should return user verification history for authenticated user', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/history', {
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
      expect(data.pagination).toBeDefined()
      expect(data.stats).toBeDefined()
      expect(data.stats.total).toBeGreaterThanOrEqual(0)
      expect(data.stats.by_status).toBeDefined()
      expect(data.stats.by_type).toBeDefined()
    })

    it('should reject unauthenticated requests', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user found' }
      })

      const request = new NextRequest('http://localhost:3000/api/verification/history', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should filter history by status', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/history?status=approved', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // All returned items should have approved status
      data.data.forEach((item: any) => {
        expect(item.status).toBe('approved')
      })
    })

    it('should filter history by credential type', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/history?type=education', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // All returned items should be education type
      data.data.forEach((item: any) => {
        expect(item.credential_type.type).toBe('education')
      })
    })

    it('should respect pagination parameters', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/history?limit=2&offset=1', {
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
      expect(data.pagination.limit).toBe(2)
      expect(data.pagination.offset).toBe(1)
    })

    it('should return verification history items with correct structure', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/history', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      if (data.data.length > 0) {
        const historyItem = data.data[0]
        expect(historyItem).toEqual({
          id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          status: expect.any(String),
          credential_type: {
            id: expect.any(String),
            name: expect.any(String),
            type: expect.any(String)
          },
          submitted_at: expect.any(String),
          reviewed_at: expect.anything(), // Can be null
          verification_score: expect.anything(), // Can be null
          verification_level: expect.anything(), // Can be null
          documents: expect.any(Array),
          badge: expect.anything(), // Can be null
          review_notes: expect.anything(), // Can be null
          estimated_completion: expect.anything() // Can be null
        })
      }
    })

    it('should return statistics with correct structure', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/history', {
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
        by_status: {
          pending: expect.any(Number),
          under_review: expect.any(Number),
          approved: expect.any(Number),
          rejected: expect.any(Number),
          requires_more_info: expect.any(Number)
        },
        by_type: {
          education: expect.any(Number),
          employment: expect.any(Number),
          certification: expect.any(Number),
          skills: expect.any(Number)
        },
        success_rate: expect.any(Number),
        average_processing_time: expect.any(Number)
      })
    })

    it('should handle multiple filter parameters', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/history?status=approved&type=certification', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Results should match both filters
      data.data.forEach((item: any) => {
        expect(item.status).toBe('approved')
        expect(item.credential_type.type).toBe('certification')
      })
    })

    it('should include documents in history items', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/history', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      if (data.data.length > 0) {
        const historyItem = data.data[0]
        expect(historyItem.documents).toBeInstanceOf(Array)
        
        if (historyItem.documents.length > 0) {
          const document = historyItem.documents[0]
          expect(document).toEqual({
            id: expect.any(String),
            document_type: expect.any(String),
            file_name: expect.any(String),
            file_size: expect.any(Number),
            uploaded_at: expect.any(String)
          })
        }
      }
    })

    it('should include badge information for approved items', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/history?status=approved', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      // Approved items should have badges
      data.data.forEach((item: any) => {
        if (item.status === 'approved' && item.badge) {
          expect(item.badge).toEqual({
            id: expect.any(String),
            title: expect.any(String),
            issued_at: expect.any(String),
            is_public: expect.any(Boolean)
          })
        }
      })
    })

    it('should handle server errors gracefully', async () => {
      const mockAuth = mockCreateClient().auth
      mockAuth.getUser.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/verification/history', {
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

    it('should return hasMore flag correctly', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/history?limit=2', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pagination.hasMore).toBeDefined()
      expect(typeof data.pagination.hasMore).toBe('boolean')
    })

    it('should return empty array when no history matches filters', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/history?status=nonexistent', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
      expect(data.pagination.total).toBe(0)
    })

    it('should include rejection reason for rejected items', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/verification/history?status=rejected', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      // Rejected items should have rejection reason
      data.data.forEach((item: any) => {
        if (item.status === 'rejected') {
          expect(item.rejection_reason).toBeDefined()
        }
      })
    })
  })
}) 