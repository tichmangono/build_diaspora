import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPrivacySettings, updatePrivacySettings } from '@/lib/privacy/gdpr-compliance'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getPrivacySettings(user.id)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Set default settings if none exist
    const defaultSettings = {
      userId: user.id,
      dataProcessingConsent: true,
      marketingConsent: false,
      analyticsConsent: false,
      profilingConsent: false,
      dataRetentionPeriod: 365,
      anonymizeAfterDeletion: true,
      allowDataExport: true,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      settings: result.settings || defaultSettings
    })
  } catch (error) {
    console.error('Privacy settings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'dataProcessingConsent',
      'marketingConsent', 
      'analyticsConsent',
      'profilingConsent',
      'dataRetentionPeriod',
      'anonymizeAfterDeletion',
      'allowDataExport'
    ]

    for (const field of requiredFields) {
      if (settings[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate data retention period
    if (settings.dataRetentionPeriod < 30 || settings.dataRetentionPeriod > 2555) { // 7 years max
      return NextResponse.json(
        { error: 'Data retention period must be between 30 and 2555 days' },
        { status: 400 }
      )
    }

    const result = await updatePrivacySettings(user.id, settings)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Privacy settings updated successfully'
    })
  } catch (error) {
    console.error('Privacy settings update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 