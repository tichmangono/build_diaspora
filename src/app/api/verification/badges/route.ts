import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const isPublic = searchParams.get('public') === 'true'
    const credentialType = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Check authentication for private badge requests
    let currentUser = null
    if (!isPublic || !userId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      currentUser = user
    }

    // Determine target user ID
    const targetUserId = userId || currentUser?.id

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Mock badges data for development
    const mockBadges = [
      {
        id: 'badge-1',
        title: 'Software Engineer',
        description: 'Verified employment at TechCorp as Senior Software Engineer',
        credential_type: 'employment',
        verification_level: 'premium',
        verification_score: 92,
        issued_at: '2024-01-15T10:00:00Z',
        expires_at: null,
        is_public: true,
        issuer: {
          name: 'BuildDiaspora Verification Team',
          type: 'platform'
        },
        metadata: {
          company: 'TechCorp',
          position: 'Senior Software Engineer',
          employment_period: '2022-01 to Present'
        },
        documents_count: 2
      },
      {
        id: 'badge-2',
        title: 'Computer Science Degree',
        description: 'Bachelor of Science in Computer Science from University of Zimbabwe',
        credential_type: 'education',
        verification_level: 'expert',
        verification_score: 98,
        issued_at: '2024-01-10T14:30:00Z',
        expires_at: null,
        is_public: true,
        issuer: {
          name: 'BuildDiaspora Verification Team',
          type: 'platform'
        },
        metadata: {
          institution: 'University of Zimbabwe',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          graduation_year: '2020'
        },
        documents_count: 3
      },
      {
        id: 'badge-3',
        title: 'AWS Solutions Architect',
        description: 'AWS Certified Solutions Architect - Professional',
        credential_type: 'certification',
        verification_level: 'expert',
        verification_score: 95,
        issued_at: '2024-01-05T09:15:00Z',
        expires_at: '2027-01-05T09:15:00Z',
        is_public: true,
        issuer: {
          name: 'Amazon Web Services',
          type: 'certification_body'
        },
        metadata: {
          certification_id: 'AWS-SAP-2024-001',
          issued_by: 'Amazon Web Services',
          certification_level: 'Professional'
        },
        documents_count: 1
      },
      {
        id: 'badge-4',
        title: 'React Development',
        description: 'Verified skills in React development through practical assessment',
        credential_type: 'skills',
        verification_level: 'basic',
        verification_score: 78,
        issued_at: '2024-01-01T12:00:00Z',
        expires_at: '2025-01-01T12:00:00Z',
        is_public: false,
        issuer: {
          name: 'BuildDiaspora Skills Assessment',
          type: 'platform'
        },
        metadata: {
          skill_category: 'Frontend Development',
          assessment_type: 'Practical Project',
          proficiency_level: 'Intermediate'
        },
        documents_count: 1
      }
    ]

    // Filter badges based on query parameters
    let filteredBadges = mockBadges

    // Filter by credential type
    if (credentialType) {
      filteredBadges = filteredBadges.filter(badge => badge.credential_type === credentialType)
    }

    // Filter by public visibility (if requesting another user's badges)
    if (userId && userId !== currentUser?.id) {
      filteredBadges = filteredBadges.filter(badge => badge.is_public)
    }

    // Apply limit
    filteredBadges = filteredBadges.slice(0, limit)

    // Calculate statistics
    const stats = {
      total: mockBadges.length,
      public: mockBadges.filter(b => b.is_public).length,
      by_level: {
        basic: mockBadges.filter(b => b.verification_level === 'basic').length,
        verified: mockBadges.filter(b => b.verification_level === 'verified').length,
        premium: mockBadges.filter(b => b.verification_level === 'premium').length,
        expert: mockBadges.filter(b => b.verification_level === 'expert').length
      },
      by_type: {
        education: mockBadges.filter(b => b.credential_type === 'education').length,
        employment: mockBadges.filter(b => b.credential_type === 'employment').length,
        certification: mockBadges.filter(b => b.credential_type === 'certification').length,
        skills: mockBadges.filter(b => b.credential_type === 'skills').length
      },
      expired: mockBadges.filter(b => b.expires_at && new Date(b.expires_at) < new Date()).length
    }

    return NextResponse.json({
      success: true,
      data: filteredBadges,
      stats,
      meta: {
        total: filteredBadges.length,
        limit,
        isPublicView: isPublic && userId !== currentUser?.id
      }
    })

  } catch (error) {
    console.error('Badges API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 