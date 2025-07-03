import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper function to check admin permissions
async function checkAdminPermissions(supabase: any, user: any) {
  // In development mode, allow all authenticated users to be admin
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  // In production, check actual admin role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return false
  }

  return ['admin', 'moderator', 'verifier'].includes(profile.role)
}

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

    // Check admin permissions
    const isAdmin = await checkAdminPermissions(supabase, user)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const credentialType = searchParams.get('credentialType')
    const assignedTo = searchParams.get('assignedTo')
    const priority = searchParams.get('priority')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Mock data for development
    const mockRequests = [
      {
        id: '1',
        title: 'BSc Computer Science - University of Zimbabwe',
        description: 'Bachelor of Science degree in Computer Science',
        status: 'pending',
        priority: 'medium',
        submitted_at: '2024-01-15T10:00:00Z',
        user: {
          id: 'user-1',
          full_name: 'John Doe',
          email: 'john.doe@example.com'
        },
        credential_type: {
          id: '1',
          name: 'Education Verification',
          type: 'education'
        },
        documents: [
          {
            id: 'doc-1',
            document_type: 'diploma',
            file_name: 'BSc_Diploma.pdf',
            file_size: 2048000
          }
        ],
        assigned_to: null,
        verification_score: null,
        estimated_completion: '2024-01-20T10:00:00Z'
      },
      {
        id: '2',
        title: 'Senior Software Engineer - TechCorp',
        description: 'Employment verification for senior software engineer position',
        status: 'under_review',
        priority: 'high',
        submitted_at: '2024-01-10T14:30:00Z',
        user: {
          id: 'user-2',
          full_name: 'Jane Smith',
          email: 'jane.smith@example.com'
        },
        credential_type: {
          id: '2',
          name: 'Employment Verification',
          type: 'employment'
        },
        documents: [
          {
            id: 'doc-2',
            document_type: 'employment_letter',
            file_name: 'Employment_Letter.pdf',
            file_size: 1536000
          }
        ],
        assigned_to: user.id,
        verification_score: null,
        estimated_completion: '2024-01-18T14:30:00Z'
      },
      {
        id: '3',
        title: 'AWS Solutions Architect Certification',
        description: 'Professional certification verification',
        status: 'approved',
        priority: 'medium',
        submitted_at: '2024-01-05T09:15:00Z',
        reviewed_at: '2024-01-12T16:45:00Z',
        user: {
          id: 'user-3',
          full_name: 'Mike Johnson',
          email: 'mike.johnson@example.com'
        },
        credential_type: {
          id: '3',
          name: 'Professional Certification',
          type: 'certification'
        },
        documents: [
          {
            id: 'doc-3',
            document_type: 'certificate',
            file_name: 'AWS_Certificate.pdf',
            file_size: 1024000
          }
        ],
        assigned_to: user.id,
        verification_score: 95,
        estimated_completion: null
      }
    ]

    // Apply filters to mock data
    let filteredRequests = mockRequests

    if (status) {
      filteredRequests = filteredRequests.filter(req => req.status === status)
    }

    if (credentialType) {
      filteredRequests = filteredRequests.filter(req => req.credential_type.type === credentialType)
    }

    if (assignedTo) {
      filteredRequests = filteredRequests.filter(req => req.assigned_to === assignedTo)
    }

    if (query) {
      const searchTerm = query.toLowerCase()
      filteredRequests = filteredRequests.filter(req => 
        req.title.toLowerCase().includes(searchTerm) ||
        req.description.toLowerCase().includes(searchTerm) ||
        req.user.full_name.toLowerCase().includes(searchTerm) ||
        req.user.email.toLowerCase().includes(searchTerm)
      )
    }

    // Apply pagination
    const paginatedRequests = filteredRequests.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedRequests,
      pagination: {
        total: filteredRequests.length,
        limit,
        offset,
        hasMore: offset + limit < filteredRequests.length
      }
    })

  } catch (error) {
    console.error('Admin queue API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 