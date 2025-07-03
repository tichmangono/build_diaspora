import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/verification/documents/route'

// Mock file upload utilities
const mockUploadFile = jest.fn()
jest.mock('@/lib/utils/file-upload', () => ({
  uploadFile: mockUploadFile,
  validateFileType: jest.fn(),
  validateFileSize: jest.fn()
}))

// Mock authentication
const mockRequireAuth = jest.fn()
jest.mock('@/middleware/auth', () => ({
  requireAuth: mockRequireAuth
}))

// Mock Supabase
const mockInsert = jest.fn()
const mockSelect = jest.fn()
const mockCreateServerClient = jest.fn(() => ({
  from: jest.fn(() => ({
    insert: mockInsert,
    select: mockSelect
  }))
}))

jest.mock('@/lib/supabase/server', () => ({
  createServerClient: mockCreateServerClient
}))

describe('/api/verification/documents', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default auth to authenticated user
    mockRequireAuth.mockResolvedValue({
      success: true,
      user: {
        id: 'user-123',
        email: 'user@example.com'
      }
    })
    
    // Default file upload success
    mockUploadFile.mockResolvedValue({
      success: true,
      url: 'https://storage.example.com/documents/diploma.pdf',
      key: 'documents/user-123/diploma.pdf'
    })
    
    // Default database insert success
    mockInsert.mockReturnValue({
      select: mockSelect.mockResolvedValue({
        data: [{
          id: 'doc-123',
          user_id: 'user-123',
          type: 'diploma',
          url: 'https://storage.example.com/documents/diploma.pdf'
        }],
        error: null
      })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST /api/verification/documents', () => {
    it('should successfully upload document', async () => {
      const formData = new FormData()
      const file = new File(['test content'], 'diploma.pdf', { type: 'application/pdf' })
      formData.append('file', file)
      formData.append('type', 'diploma')
      formData.append('verificationRequestId', 'req-123')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.document).toEqual({
        id: 'doc-123',
        user_id: 'user-123',
        type: 'diploma',
        url: 'https://storage.example.com/documents/diploma.pdf'
      })
      expect(mockUploadFile).toHaveBeenCalledWith(file, expect.objectContaining({
        folder: 'verification-documents',
        userId: 'user-123'
      }))
    })

    it('should reject unauthenticated requests', async () => {
      mockRequireAuth.mockResolvedValue({
        success: false,
        error: 'Authentication required'
      })

      const formData = new FormData()
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' })
      formData.append('file', file)

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Authentication required')
    })

    it('should validate file type', async () => {
      const mockValidateFileType = require('@/lib/utils/file-upload').validateFileType
      mockValidateFileType.mockReturnValue({
        isValid: false,
        error: 'Invalid file type. Only PDF, JPG, PNG files are allowed.'
      })

      const formData = new FormData()
      const file = new File(['test'], 'document.txt', { type: 'text/plain' })
      formData.append('file', file)
      formData.append('type', 'diploma')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid file type')
    })

    it('should validate file size', async () => {
      const mockValidateFileSize = require('@/lib/utils/file-upload').validateFileSize
      mockValidateFileSize.mockReturnValue({
        isValid: false,
        error: 'File size exceeds maximum limit of 10MB.'
      })

      const formData = new FormData()
      // Create a large file (mock)
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })
      formData.append('file', largeFile)
      formData.append('type', 'diploma')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('File size exceeds')
    })

    it('should require file in request', async () => {
      const formData = new FormData()
      formData.append('type', 'diploma')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('No file provided')
    })

    it('should require document type', async () => {
      const formData = new FormData()
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' })
      formData.append('file', file)

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Document type is required')
    })

    it('should handle upload failures', async () => {
      mockUploadFile.mockResolvedValue({
        success: false,
        error: 'Storage service unavailable'
      })

      const formData = new FormData()
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' })
      formData.append('file', file)
      formData.append('type', 'diploma')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Storage service unavailable')
    })

    it('should handle database errors', async () => {
      mockInsert.mockReturnValue({
        select: mockSelect.mockResolvedValue({
          data: null,
          error: { message: 'Database insert failed' }
        })
      })

      const formData = new FormData()
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' })
      formData.append('file', file)
      formData.append('type', 'diploma')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })

    it('should validate document types', async () => {
      const validTypes = ['diploma', 'transcript', 'certificate', 'employment_letter', 'contract', 'license']
      
      for (const type of validTypes) {
        const formData = new FormData()
        const file = new File(['test'], `${type}.pdf`, { type: 'application/pdf' })
        formData.append('file', file)
        formData.append('type', type)

        const request = new NextRequest('http://localhost:3000/api/verification/documents', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer valid-token'
          },
          body: formData
        })

        const response = await POST(request)
        expect(response.status).toBe(201)
      }
    })

    it('should reject invalid document types', async () => {
      const formData = new FormData()
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' })
      formData.append('file', file)
      formData.append('type', 'invalid-type')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid document type')
    })

    it('should scan uploaded files for security threats', async () => {
      const mockScanFile = jest.fn().mockResolvedValue({
        isSafe: false,
        threats: ['malware detected']
      })

      jest.doMock('@/lib/utils/security-scanner', () => ({
        scanFile: mockScanFile
      }))

      const formData = new FormData()
      const file = new File(['malicious content'], 'malware.pdf', { type: 'application/pdf' })
      formData.append('file', file)
      formData.append('type', 'diploma')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Security threat detected')
    })

    it('should generate file metadata', async () => {
      const formData = new FormData()
      const file = new File(['test content'], 'diploma.pdf', { type: 'application/pdf' })
      formData.append('file', file)
      formData.append('type', 'diploma')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      await POST(request)

      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 'user-123',
        type: 'diploma',
        filename: 'diploma.pdf',
        file_size: expect.any(Number),
        mime_type: 'application/pdf',
        url: expect.any(String),
        uploaded_at: expect.any(String)
      }))
    })

    it('should associate document with verification request', async () => {
      const formData = new FormData()
      const file = new File(['test'], 'diploma.pdf', { type: 'application/pdf' })
      formData.append('file', file)
      formData.append('type', 'diploma')
      formData.append('verificationRequestId', 'req-123')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      await POST(request)

      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        verification_request_id: 'req-123'
      }))
    })

    it('should handle concurrent uploads', async () => {
      const createRequest = (filename: string) => {
        const formData = new FormData()
        const file = new File(['test'], filename, { type: 'application/pdf' })
        formData.append('file', file)
        formData.append('type', 'diploma')
        
        return new NextRequest('http://localhost:3000/api/verification/documents', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer valid-token'
          },
          body: formData
        })
      }

      const requests = [
        createRequest('diploma1.pdf'),
        createRequest('diploma2.pdf'),
        createRequest('diploma3.pdf')
      ]

      const responses = await Promise.all(requests.map(req => POST(req)))

      responses.forEach(response => {
        expect(response.status).toBe(201)
      })
    })

    it('should enforce upload rate limits', async () => {
      const mockRateLimitCheck = jest.fn().mockResolvedValue({
        allowed: false,
        remaining: 0,
        retryAfter: 60
      })

      jest.doMock('@/lib/auth/helpers', () => ({
        rateLimitCheck: mockRateLimitCheck
      }))

      const formData = new FormData()
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' })
      formData.append('file', file)
      formData.append('type', 'diploma')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Too many upload attempts')
    })
  })

  describe('File Processing', () => {
    it('should extract text from PDF documents', async () => {
      const mockExtractText = jest.fn().mockResolvedValue({
        text: 'University of Zimbabwe Bachelor of Computer Science',
        confidence: 0.95
      })

      jest.doMock('@/lib/utils/document-processor', () => ({
        extractText: mockExtractText
      }))

      const formData = new FormData()
      const file = new File(['pdf content'], 'diploma.pdf', { type: 'application/pdf' })
      formData.append('file', file)
      formData.append('type', 'diploma')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      await POST(request)

      expect(mockExtractText).toHaveBeenCalledWith(file)
    })

    it('should generate document thumbnails', async () => {
      const mockGenerateThumbnail = jest.fn().mockResolvedValue({
        thumbnailUrl: 'https://storage.example.com/thumbnails/diploma-thumb.jpg'
      })

      jest.doMock('@/lib/utils/thumbnail-generator', () => ({
        generateThumbnail: mockGenerateThumbnail
      }))

      const formData = new FormData()
      const file = new File(['image content'], 'diploma.jpg', { type: 'image/jpeg' })
      formData.append('file', file)
      formData.append('type', 'diploma')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      await POST(request)

      expect(mockGenerateThumbnail).toHaveBeenCalledWith(file)
    })
  })

  describe('Security and Compliance', () => {
    it('should encrypt sensitive documents', async () => {
      const mockEncryptFile = jest.fn().mockResolvedValue({
        encryptedUrl: 'https://storage.example.com/encrypted/diploma.pdf.enc',
        encryptionKey: 'encrypted-key-hash'
      })

      jest.doMock('@/lib/utils/encryption', () => ({
        encryptFile: mockEncryptFile
      }))

      const formData = new FormData()
      const file = new File(['sensitive content'], 'diploma.pdf', { type: 'application/pdf' })
      formData.append('file', file)
      formData.append('type', 'diploma')
      formData.append('sensitive', 'true')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      await POST(request)

      expect(mockEncryptFile).toHaveBeenCalledWith(file)
    })

    it('should log document upload events', async () => {
      const mockSecurityAuditLog = jest.fn()

      jest.doMock('@/lib/auth/helpers', () => ({
        securityAuditLog: mockSecurityAuditLog
      }))

      const formData = new FormData()
      const file = new File(['test'], 'diploma.pdf', { type: 'application/pdf' })
      formData.append('file', file)
      formData.append('type', 'diploma')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'X-Forwarded-For': '192.168.1.1'
        },
        body: formData
      })

      await POST(request)

      expect(mockSecurityAuditLog).toHaveBeenCalledWith({
        action: 'DOCUMENT_UPLOADED',
        userId: 'user-123',
        resourceId: 'doc-123',
        ipAddress: '192.168.1.1',
        metadata: {
          documentType: 'diploma',
          filename: 'diploma.pdf',
          fileSize: expect.any(Number)
        }
      })
    })

    it('should comply with data retention policies', async () => {
      const formData = new FormData()
      const file = new File(['test'], 'diploma.pdf', { type: 'application/pdf' })
      formData.append('file', file)
      formData.append('type', 'diploma')

      const request = new NextRequest('http://localhost:3000/api/verification/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        body: formData
      })

      await POST(request)

      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        retention_period: expect.any(String), // Should set appropriate retention period
        expires_at: expect.any(String) // Should set expiration date
      }))
    })
  })
}) 