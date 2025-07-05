import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exportUserData } from '@/lib/privacy/gdpr-compliance'

interface UserSettings {
  allow_data_export: boolean
  // Add other settings fields as needed
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('allow_data_export')
      .eq('user_id', user.id)
      .single() as { data: UserSettings | null }

    if (settings && !settings.allow_data_export) {
      return NextResponse.json(
        { error: 'Data export is not allowed for this account' },
        { status: 403 }
      )
    }

    // TODO: Fix Supabase query types and re-enable rate limiting check
    // Check for existing recent export requests would go here

    // Create export request
    const result = await exportUserData(user.id)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Data export initiated successfully',
      downloadUrl: result.downloadUrl
    })
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('allow_data_export')
      .eq('user_id', user.id)
      .single() as { data: UserSettings | null }

    if (settings && !settings.allow_data_export) {
      return NextResponse.json(
        { error: 'Data export is not allowed for this account' },
        { status: 403 }
      )
    }

    // Get user data
    const { data: userData, error: dataError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (dataError) {
      console.error('Export data error:', dataError)
      return NextResponse.json({ error: 'Failed to export user data' }, { status: 500 })
    }

    return NextResponse.json({ userData })
  } catch (error) {
    console.error('Export data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 