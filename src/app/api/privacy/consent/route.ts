import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recordConsent } from '@/lib/privacy/gdpr-compliance'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { consentType, granted, ipAddress, userAgent } = body

    // Validate consent type
    const validConsentTypes = ['essential', 'analytics', 'marketing', 'profiling']
    if (!validConsentTypes.includes(consentType)) {
      return NextResponse.json(
        { error: 'Invalid consent type' },
        { status: 400 }
      )
    }

    if (typeof granted !== 'boolean') {
      return NextResponse.json(
        { error: 'Granted must be a boolean' },
        { status: 400 }
      )
    }

    const consentData = {
      consentType,
      granted,
      grantedAt: new Date().toISOString(),
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      version: '1.0'
    }

    if (!granted) {
      // If revoking consent, also set revokedAt
      consentData.revokedAt = new Date().toISOString()
    }

    const result = await recordConsent(user.id, consentData)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Update privacy settings to reflect consent changes
    const settingsUpdate = {
      [`${consentType}Consent`]: granted,
      updatedAt: new Date().toISOString()
    }

    // Only update analytics, marketing, and profiling consents in settings
    if (['analytics', 'marketing', 'profiling'].includes(consentType)) {
      await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user.id,
          ...settingsUpdate
        })
    }

    return NextResponse.json({
      success: true,
      message: `Consent ${granted ? 'granted' : 'revoked'} successfully`
    })
  } catch (error) {
    console.error('Consent management error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 