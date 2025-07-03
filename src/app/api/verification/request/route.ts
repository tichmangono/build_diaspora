import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verificationRequestSchema } from '@/lib/validations/verification'
import { z } from 'zod'

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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = verificationRequestSchema.parse(body)

    // Check if user has reached verification request limit
    const { data: existingRequests, error: countError } = await supabase
      .from('verification_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')

    if (countError) {
      console.error('Error checking existing requests:', countError)
      return NextResponse.json(
        { error: 'Failed to validate request limits' },
        { status: 500 }
      )
    }

    // Limit pending requests per user (e.g., max 5 pending)
    if (existingRequests && existingRequests.length >= 5) {
      return NextResponse.json(
        { error: 'Maximum pending verification requests reached. Please wait for existing requests to be processed.' },
        { status: 429 }
      )
    }

    // Create verification request
    const { data: verificationRequest, error: insertError } = await supabase
      .from('verification_requests')
      .insert({
        user_id: user.id,
        credential_type_id: validatedData.credentialTypeId,
        title: validatedData.title,
        description: validatedData.description,
        institution_name: validatedData.institutionName,
        institution_country: validatedData.institutionCountry,
        start_date: validatedData.startDate,
        end_date: validatedData.endDate,
        is_current: validatedData.isCurrent,
        supporting_info: validatedData.supportingInfo,
        verification_data: validatedData.verificationData,
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .select(`
        id,
        title,
        description,
        status,
        submitted_at,
        credential_type:credential_types(id, name, type, description)
      `)
      .single()

    if (insertError) {
      console.error('Error creating verification request:', insertError)
      return NextResponse.json(
        { error: 'Failed to create verification request' },
        { status: 500 }
      )
    }

    // Create audit log entry
    await supabase
      .from('verification_audit_log')
      .insert({
        request_id: verificationRequest.id,
        action: 'created',
        notes: 'Verification request submitted by user',
        performed_by: user.id,
        performed_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      data: verificationRequest
    }, { status: 201 })

  } catch (error) {
    console.error('Verification request API error:', error)
    
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
    const credentialType = searchParams.get('credentialType')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('verification_requests')
      .select(`
        id,
        title,
        description,
        status,
        submitted_at,
        reviewed_at,
        review_notes,
        verification_score,
        credential_type:credential_types(id, name, type, description),
        documents:verification_documents(id, document_type, file_name, file_size, uploaded_at),
        badge:verification_badges(id, title, verification_level, issued_at, is_public)
      `)
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (credentialType) {
      query = query.eq('credential_type.type', credentialType)
    }

    const { data: requests, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching verification requests:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch verification requests' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: requests || []
    })

  } catch (error) {
    console.error('Verification requests fetch API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 