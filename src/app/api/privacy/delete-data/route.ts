import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requestDataDeletion } from '@/lib/privacy/gdpr-compliance'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { deletionType } = body

    if (!['soft', 'hard'].includes(deletionType)) {
      return NextResponse.json(
        { error: 'Invalid deletion type. Must be "soft" or "hard"' },
        { status: 400 }
      )
    }

    const { data: existingRequests } = await supabase
      .from('data_deletion_requests')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing'])

    if (existingRequests && existingRequests.length > 0) {
      return NextResponse.json(
        { error: 'You already have a pending deletion request' },
        { status: 409 }
      )
    }

    if (deletionType === 'hard') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_verified_at')
        .eq('id', user.id)
        .single()

      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const emailVerifiedAt = profile?.email_verified_at ? new Date(profile.email_verified_at) : null

      if (!emailVerifiedAt || emailVerifiedAt < dayAgo) {
        return NextResponse.json(
          { 
            error: 'Hard deletion requires recent email verification. Please verify your email first.',
            requiresEmailVerification: true
          },
          { status: 403 }
        )
      }
    }

    const result = await requestDataDeletion(user.id, deletionType)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    if (deletionType === 'hard') {
      await supabase.auth.signOut()
    }

    return NextResponse.json({
      success: true,
      message: deletionType === 'hard' 
        ? 'Account deletion request submitted. Your account will be permanently deleted within 30 days.'
        : 'Account anonymization request submitted. Your personal data will be removed within 7 days.',
      requestId: result.requestId,
      scheduledDeletionAt: result.scheduledDeletionAt
    })
  } catch (error) {
    console.error('Data deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 