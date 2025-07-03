import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get consent history from database
    const { data: consentHistory, error: consentError } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', user.id)
      .range(0, 49)

    if (consentError) {
      console.error('Consent history fetch error:', consentError)
      return NextResponse.json({ error: 'Failed to fetch consent history' }, { status: 500 })
    }

    // Transform data to match frontend interface
    const transformedHistory = consentHistory?.map(record => ({
      consentType: record.consent_type,
      granted: record.granted,
      grantedAt: record.granted_at,
      revokedAt: record.revoked_at,
      version: record.version || '1.0'
    })) || []

    return NextResponse.json({
      success: true,
      history: transformedHistory
    })
  } catch (error) {
    console.error('Consent history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 