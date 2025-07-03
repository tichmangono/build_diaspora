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

    // Parse query parameters for date range
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y

    // Mock statistics data for development
    const mockStats = {
      overview: {
        total_requests: 156,
        pending_requests: 23,
        under_review: 8,
        approved_requests: 98,
        rejected_requests: 27,
        total_badges_issued: 98,
        active_verifiers: 5,
        average_processing_time_hours: 72
      },
      by_status: {
        pending: 23,
        under_review: 8,
        approved: 98,
        rejected: 27,
        requires_more_info: 0
      },
      by_credential_type: {
        education: 45,
        employment: 62,
        certification: 31,
        skills: 18
      },
      by_verification_level: {
        basic: 18,
        verified: 34,
        premium: 28,
        expert: 18
      },
      processing_times: {
        average_hours: 72,
        median_hours: 48,
        fastest_hours: 12,
        slowest_hours: 168,
        by_type: {
          education: 84,
          employment: 96,
          certification: 48,
          skills: 36
        }
      },
      trends: {
        daily_submissions: [
          { date: '2024-01-15', count: 8 },
          { date: '2024-01-16', count: 12 },
          { date: '2024-01-17', count: 6 },
          { date: '2024-01-18', count: 15 },
          { date: '2024-01-19', count: 9 },
          { date: '2024-01-20', count: 11 },
          { date: '2024-01-21', count: 7 }
        ],
        weekly_approvals: [
          { week: 'Week 1', approved: 18, rejected: 4 },
          { week: 'Week 2', approved: 22, rejected: 6 },
          { week: 'Week 3', approved: 28, rejected: 8 },
          { week: 'Week 4', approved: 30, rejected: 9 }
        ],
        monthly_growth: {
          current_month: 156,
          previous_month: 132,
          growth_rate: 18.2
        }
      },
      verifier_performance: [
        {
          verifier_id: user.id,
          name: 'Current User',
          requests_handled: 45,
          average_processing_time: 48,
          approval_rate: 78.9,
          quality_score: 92
        },
        {
          verifier_id: 'verifier-2',
          name: 'Jane Verifier',
          requests_handled: 38,
          average_processing_time: 72,
          approval_rate: 84.2,
          quality_score: 88
        },
        {
          verifier_id: 'verifier-3',
          name: 'Mike Reviewer',
          requests_handled: 52,
          average_processing_time: 96,
          approval_rate: 73.1,
          quality_score: 85
        }
      ],
      quality_metrics: {
        average_verification_score: 87.3,
        score_distribution: {
          '90-100': 32,
          '80-89': 45,
          '70-79': 18,
          '60-69': 3,
          'below-60': 0
        },
        appeal_rate: 2.8,
        user_satisfaction: 94.2
      },
      document_analysis: {
        total_documents: 312,
        by_type: {
          diploma: 67,
          certificate: 89,
          employment_letter: 78,
          transcript: 45,
          license: 23,
          portfolio: 10
        },
        file_formats: {
          pdf: 245,
          jpg: 34,
          png: 28,
          doc: 5
        },
        average_file_size_mb: 2.4,
        processing_issues: {
          poor_quality: 8,
          invalid_format: 2,
          missing_information: 12,
          suspicious_document: 1
        }
      }
    }

    console.log('Admin statistics requested:', {
      period,
      dateFrom,
      dateTo,
      requestedBy: user.id
    })

    return NextResponse.json({
      success: true,
      data: mockStats,
      meta: {
        period,
        dateFrom,
        dateTo,
        generatedAt: new Date().toISOString(),
        requestedBy: user.id
      }
    })

  } catch (error) {
    console.error('Admin statistics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 