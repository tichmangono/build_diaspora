import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const credentialType = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Mock user verification history for development
    const mockHistory = [
      {
        id: '1',
        title: 'BSc Computer Science - University of Zimbabwe',
        description: 'Bachelor of Science degree in Computer Science',
        status: 'approved',
        credential_type: {
          id: '1',
          name: 'Education Verification',
          type: 'education'
        },
        submitted_at: '2024-01-10T14:30:00Z',
        reviewed_at: '2024-01-15T10:00:00Z',
        verification_score: 98,
        verification_level: 'expert',
        documents: [
          {
            id: 'doc-1',
            document_type: 'diploma',
            file_name: 'BSc_Diploma.pdf',
            file_size: 2048000,
            uploaded_at: '2024-01-10T14:30:00Z'
          },
          {
            id: 'doc-2',
            document_type: 'transcript',
            file_name: 'Academic_Transcript.pdf',
            file_size: 1536000,
            uploaded_at: '2024-01-10T14:32:00Z'
          }
        ],
        badge: {
          id: 'badge-1',
          title: 'Computer Science Degree',
          issued_at: '2024-01-15T10:00:00Z',
          is_public: true
        },
        review_notes: 'Excellent documentation provided. All credentials verified successfully.',
        estimated_completion: '2024-01-20T10:00:00Z'
      },
      {
        id: '2',
        title: 'Senior Software Engineer - TechCorp',
        description: 'Employment verification for senior software engineer position',
        status: 'under_review',
        credential_type: {
          id: '2',
          name: 'Employment Verification',
          type: 'employment'
        },
        submitted_at: '2024-01-18T09:15:00Z',
        reviewed_at: null,
        verification_score: null,
        verification_level: null,
        documents: [
          {
            id: 'doc-3',
            document_type: 'employment_letter',
            file_name: 'Employment_Letter.pdf',
            file_size: 1024000,
            uploaded_at: '2024-01-18T09:15:00Z'
          },
          {
            id: 'doc-4',
            document_type: 'pay_stub',
            file_name: 'Pay_Stub_Dec2023.pdf',
            file_size: 512000,
            uploaded_at: '2024-01-18T09:17:00Z'
          }
        ],
        badge: null,
        review_notes: null,
        estimated_completion: '2024-01-25T09:15:00Z'
      },
      {
        id: '3',
        title: 'AWS Solutions Architect Certification',
        description: 'Professional certification verification',
        status: 'approved',
        credential_type: {
          id: '3',
          name: 'Professional Certification',
          type: 'certification'
        },
        submitted_at: '2024-01-05T12:00:00Z',
        reviewed_at: '2024-01-08T16:30:00Z',
        verification_score: 95,
        verification_level: 'expert',
        documents: [
          {
            id: 'doc-5',
            document_type: 'certificate',
            file_name: 'AWS_Certificate.pdf',
            file_size: 768000,
            uploaded_at: '2024-01-05T12:00:00Z'
          }
        ],
        badge: {
          id: 'badge-2',
          title: 'AWS Solutions Architect',
          issued_at: '2024-01-08T16:30:00Z',
          is_public: true
        },
        review_notes: 'Valid AWS certification confirmed. High-quality documentation.',
        estimated_completion: '2024-01-12T12:00:00Z'
      },
      {
        id: '4',
        title: 'React Development Skills',
        description: 'Skills assessment for React development',
        status: 'rejected',
        credential_type: {
          id: '4',
          name: 'Skills Assessment',
          type: 'skills'
        },
        submitted_at: '2023-12-20T10:30:00Z',
        reviewed_at: '2023-12-22T14:45:00Z',
        verification_score: null,
        verification_level: null,
        documents: [
          {
            id: 'doc-6',
            document_type: 'portfolio',
            file_name: 'React_Portfolio.pdf',
            file_size: 2048000,
            uploaded_at: '2023-12-20T10:30:00Z'
          }
        ],
        badge: null,
        review_notes: 'Portfolio does not demonstrate sufficient React expertise. Please resubmit with more comprehensive examples.',
        rejection_reason: 'Insufficient evidence of advanced React skills',
        estimated_completion: null
      },
      {
        id: '5',
        title: 'Project Management Certification',
        description: 'PMP certification verification',
        status: 'requires_more_info',
        credential_type: {
          id: '3',
          name: 'Professional Certification',
          type: 'certification'
        },
        submitted_at: '2024-01-20T15:00:00Z',
        reviewed_at: '2024-01-22T11:30:00Z',
        verification_score: null,
        verification_level: null,
        documents: [
          {
            id: 'doc-7',
            document_type: 'certificate',
            file_name: 'PMP_Certificate.jpg',
            file_size: 1024000,
            uploaded_at: '2024-01-20T15:00:00Z'
          }
        ],
        badge: null,
        review_notes: 'Please provide a higher quality scan of the certificate. Current image is too blurry to verify details.',
        estimated_completion: '2024-01-27T15:00:00Z'
      }
    ]

    // Filter history based on query parameters
    let filteredHistory = mockHistory

    if (status) {
      filteredHistory = filteredHistory.filter(item => item.status === status)
    }

    if (credentialType) {
      filteredHistory = filteredHistory.filter(item => item.credential_type.type === credentialType)
    }

    // Apply pagination
    const paginatedHistory = filteredHistory.slice(offset, offset + limit)

    // Calculate summary statistics
    const stats = {
      total: mockHistory.length,
      approved: mockHistory.filter(item => item.status === 'approved').length,
      pending: mockHistory.filter(item => item.status === 'pending').length,
      under_review: mockHistory.filter(item => item.status === 'under_review').length,
      rejected: mockHistory.filter(item => item.status === 'rejected').length,
      requires_more_info: mockHistory.filter(item => item.status === 'requires_more_info').length,
      badges_earned: mockHistory.filter(item => item.badge).length,
      average_score: Math.round(
        mockHistory
          .filter(item => item.verification_score)
          .reduce((sum, item) => sum + (item.verification_score || 0), 0) /
        mockHistory.filter(item => item.verification_score).length
      ) || 0
    }

    return NextResponse.json({
      success: true,
      data: paginatedHistory,
      stats,
      pagination: {
        total: filteredHistory.length,
        limit,
        offset,
        hasMore: offset + limit < filteredHistory.length
      }
    })

  } catch (error) {
    console.error('Verification history API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 