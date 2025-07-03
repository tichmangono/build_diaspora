import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exportUserData } from '@/lib/privacy/gdpr-compliance'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has data export permission
    const { data: settings } = await supabase
      .from('privacy_settings')
      .select('allow_data_export')
      .eq('user_id', user.id)
      .single()

    if (settings && !settings.allow_data_export) {
      return NextResponse.json(
        { error: 'Data export is not allowed for this account' },
        { status: 403 }
      )
    }

    // Check for existing recent export requests (rate limiting)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentExports } = await supabase
      .from('data_export_requests')
      .select('id')
      .eq('user_id', user.id)
      .gte('requested_at', oneDayAgo)
      .eq('status', 'completed')

    if (recentExports && recentExports.length > 0) {
      return NextResponse.json(
        { error: 'You can only request one data export per day' },
        { status: 429 }
      )
    }

    // Create export request
    const result = await exportUserData(user.id)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Data export initiated successfully',
      downloadUrl: result.downloadUrl,
      expiresAt: result.expiresAt
    })
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 