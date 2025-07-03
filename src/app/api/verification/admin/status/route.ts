import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

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

const statusUpdateSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  status: z.enum(['pending', 'under_review', 'approved', 'rejected', 'requires_more_info']),
  reviewNotes: z.string().optional(),
  verificationScore: z.number().min(0).max(100).optional(),
  assignedTo: z.string().optional(),
  rejectionReason: z.string().optional()
})

const bulkStatusUpdateSchema = z.object({
  requestIds: z.array(z.string()).min(1, 'At least one request ID is required'),
  status: z.enum(['pending', 'under_review', 'approved', 'rejected', 'requires_more_info']),
  reviewNotes: z.string().optional(),
  assignedTo: z.string().optional()
})

export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = statusUpdateSchema.parse(body)

    // Mock update for development mode
    console.log('Admin updating verification request:', {
      requestId: validatedData.requestId,
      status: validatedData.status,
      reviewNotes: validatedData.reviewNotes,
      verificationScore: validatedData.verificationScore,
      assignedTo: validatedData.assignedTo,
      reviewedBy: user.id,
      reviewedAt: new Date().toISOString()
    })

    // Create mock badge if approved
    let badge = null
    if (validatedData.status === 'approved') {
      badge = {
        id: `badge-${validatedData.requestId}`,
        title: 'Professional Verification',
        verification_level: validatedData.verificationScore && validatedData.verificationScore >= 90 ? 'expert' : 'verified',
        issued_at: new Date().toISOString(),
        is_public: true,
        verification_score: validatedData.verificationScore || 85
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        requestId: validatedData.requestId,
        status: validatedData.status,
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
        badge
      }
    })

  } catch (error) {
    console.error('Status update API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    // Parse and validate request body for bulk update
    const body = await request.json()
    const validatedData = bulkStatusUpdateSchema.parse(body)

    // Mock bulk update for development mode
    console.log('Admin bulk updating verification requests:', {
      requestIds: validatedData.requestIds,
      status: validatedData.status,
      reviewNotes: validatedData.reviewNotes,
      assignedTo: validatedData.assignedTo,
      reviewedBy: user.id,
      reviewedAt: new Date().toISOString()
    })

    const updatedRequests = validatedData.requestIds.map(requestId => ({
      requestId,
      status: validatedData.status,
      reviewedBy: user.id,
      reviewedAt: new Date().toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: {
        updatedRequests,
        totalUpdated: validatedData.requestIds.length
      }
    })

  } catch (error) {
    console.error('Bulk status update API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
