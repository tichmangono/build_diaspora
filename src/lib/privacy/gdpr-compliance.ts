import { createClient } from '@/lib/supabase/server'
import { encryptPII, decryptPII } from '@/lib/utils/encryption'

// Privacy compliance types
export interface DataExportRequest {
  userId: string
  requestedAt: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  expiresAt?: string
}

export interface DataDeletionRequest {
  userId: string
  requestedAt: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  deletionType: 'soft' | 'hard'
  retentionPeriod?: number // days
  scheduledDeletionAt?: string
}

export interface ConsentRecord {
  userId: string
  consentType: 'essential' | 'analytics' | 'marketing' | 'profiling'
  granted: boolean
  grantedAt: string
  revokedAt?: string
  ipAddress?: string
  userAgent?: string
  version: string // consent version for tracking changes
}

export interface PrivacySettings {
  userId: string
  dataProcessingConsent: boolean
  marketingConsent: boolean
  analyticsConsent: boolean
  profilingConsent: boolean
  dataRetentionPeriod: number // days
  anonymizeAfterDeletion: boolean
  allowDataExport: boolean
  updatedAt: string
}

/**
 * GDPR Article 20 - Right to Data Portability
 * Export all user data in a structured, machine-readable format
 */
export async function exportUserData(userId: string): Promise<{
  success: boolean
  data?: unknown
  downloadUrl?: string
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      return { success: false, error: 'Failed to fetch user profile' }
    }

    // Get user activity logs
    const { data: activityLogs } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Get verification requests
    const { data: verificationRequests } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('user_id', userId)

    // Get consent records
    const { data: consentRecords } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', userId)
      .order('granted_at', { ascending: false })

    // Get privacy settings
    const { data: privacySettings } = await supabase
      .from('privacy_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Compile all user data
    const userData = {
      exportMetadata: {
        userId,
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0',
        dataTypes: ['profile', 'activity', 'verification', 'consent', 'privacy'],
        format: 'JSON',
        compliance: ['GDPR Article 20', 'CCPA Section 1798.110']
      },
      personalData: {
        profile: profile ? {
          ...profile,
          // Decrypt any encrypted fields if needed
          phone: profile.phone ? decryptPII(profile.phone) : null,
        } : null,
        activityLogs: activityLogs || [],
        verificationRequests: verificationRequests || [],
        consentRecords: consentRecords || [],
        privacySettings: privacySettings || null
      },
      metadata: {
        totalRecords: {
          profile: profile ? 1 : 0,
          activityLogs: activityLogs?.length || 0,
          verificationRequests: verificationRequests?.length || 0,
          consentRecords: consentRecords?.length || 0,
          privacySettings: privacySettings ? 1 : 0
        },
        dataCategories: [
          'Identity Data',
          'Contact Data', 
          'Profile Data',
          'Usage Data',
          'Technical Data',
          'Consent Data'
        ]
      }
    }

    // Create encrypted export file
    const exportData = JSON.stringify(userData, null, 2)
    const encryptedExport = encryptPII(exportData)

    // Store export in secure storage
    const exportPath = `exports/${userId}/${Date.now()}_data_export.encrypted`
    const { error: uploadError } = await supabase.storage
      .from('user-files')
      .upload(exportPath, new Blob([encryptedExport]), {
        metadata: {
          userId,
          type: 'data_export',
          encrypted: true,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        }
      })

    if (uploadError) {
      return { success: false, error: 'Failed to store export file' }
    }

    // Generate signed URL for download
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('user-files')
      .createSignedUrl(exportPath, 604800) // 7 days

    if (urlError) {
      return { success: false, error: 'Failed to generate download URL' }
    }

    // Log the export request
    await supabase.from('data_export_requests').insert({
      user_id: userId,
      status: 'completed',
      download_url: signedUrl.signedUrl,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      data_types: ['profile', 'activity', 'verification', 'consent', 'privacy']
    })

    return {
      success: true,
      data: userData,
      downloadUrl: signedUrl.signedUrl
    }
  } catch (error) {
    console.error('Data export error:', error)
    return { success: false, error: 'Internal error during data export' }
  }
}

/**
 * GDPR Article 17 - Right to Erasure (Right to be Forgotten)
 * Delete user data with proper retention policies
 */
export async function deleteUserData(
  userId: string, 
  deletionType: 'soft' | 'hard' = 'soft',
  retentionPeriod: number = 30 // days
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    if (deletionType === 'soft') {
      // Soft delete - anonymize data but keep records for legal/business purposes
      const anonymizedData = {
        full_name: 'Deleted User',
        email: `deleted_${Date.now()}@anonymized.local`,
        phone: null,
        bio: null,
        website: null,
        linkedin_url: null,
        avatar_url: null,
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        scheduled_hard_deletion_at: new Date(Date.now() + retentionPeriod * 24 * 60 * 60 * 1000).toISOString()
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(anonymizedData)
        .eq('id', userId)

      if (updateError) {
        return { success: false, error: 'Failed to anonymize user data' }
      }

      // Log deletion request
      await supabase.from('data_deletion_requests').insert({
        user_id: userId,
        deletion_type: 'soft',
        status: 'completed',
        retention_period: retentionPeriod,
        scheduled_deletion_at: anonymizedData.scheduled_hard_deletion_at
      })

    } else {
      // Hard delete - permanently remove all data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        return { success: false, error: 'Failed to delete user profile' }
      }

      // Delete related data
      await Promise.all([
        supabase.from('verification_requests').delete().eq('user_id', userId),
        supabase.from('consent_records').delete().eq('user_id', userId),
        supabase.from('privacy_settings').delete().eq('user_id', userId),
        supabase.from('activity_logs').delete().eq('user_id', userId)
      ])

      // Delete user files
      const { data: userFiles } = await supabase.storage
        .from('user-files')
        .list(`avatar/${userId}`)

      if (userFiles && userFiles.length > 0) {
        const filePaths = userFiles.map(file => `avatar/${userId}/${file.name}`)
        await supabase.storage.from('user-files').remove(filePaths)
      }

      // Log deletion request
      await supabase.from('data_deletion_requests').insert({
        user_id: userId,
        deletion_type: 'hard',
        status: 'completed'
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Data deletion error:', error)
    return { success: false, error: 'Internal error during data deletion' }
  }
}

/**
 * Record user consent for GDPR compliance
 */
export async function recordConsent(
  userId: string,
  consentData: Omit<ConsentRecord, 'userId'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('consent_records').insert({
      user_id: userId,
      ...consentData
    })

    if (error) {
      return { success: false, error: 'Failed to record consent' }
    }

    return { success: true }
  } catch (error) {
    console.error('Consent recording error:', error)
    return { success: false, error: 'Internal error recording consent' }
  }
}

/**
 * Get user's current privacy settings
 */
export async function getPrivacySettings(userId: string): Promise<{
  success: boolean
  settings?: PrivacySettings
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('privacy_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is ok
      return { success: false, error: 'Failed to fetch privacy settings' }
    }

    return { success: true, settings: data }
  } catch (error) {
    console.error('Privacy settings fetch error:', error)
    return { success: false, error: 'Internal error fetching privacy settings' }
  }
}

/**
 * Update user's privacy settings
 */
export async function updatePrivacySettings(
  userId: string,
  settings: Partial<PrivacySettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const updateData = {
      ...settings,
      user_id: userId,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('privacy_settings')
      .upsert(updateData)

    if (error) {
      return { success: false, error: 'Failed to update privacy settings' }
    }

    return { success: true }
  } catch (error) {
    console.error('Privacy settings update error:', error)
    return { success: false, error: 'Internal error updating privacy settings' }
  }
}

/**
 * Check if user has given specific consent
 */
export async function hasConsent(
  userId: string,
  consentType: ConsentRecord['consentType']
): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data } = await supabase
      .from('consent_records')
      .select('granted, revoked_at')
      .eq('user_id', userId)
      .eq('consent_type', consentType)
      .order('granted_at', { ascending: false })
      .limit(1)
      .single()

    return data?.granted && !data?.revoked_at
  } catch {
    return false
  }
}

/**
 * Revoke specific consent
 */
export async function revokeConsent(
  userId: string,
  consentType: ConsentRecord['consentType'],
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Record consent revocation
    const { error } = await supabase.from('consent_records').insert({
      user_id: userId,
      consent_type: consentType,
      granted: false,
      granted_at: new Date().toISOString(),
      revoked_at: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
      version: '1.0'
    })

    if (error) {
      return { success: false, error: 'Failed to revoke consent' }
    }

    return { success: true }
  } catch (error) {
    console.error('Consent revocation error:', error)
    return { success: false, error: 'Internal error revoking consent' }
  }
}

/**
 * Request data deletion (soft or hard)
 * Creates a deletion request that can be processed later
 */
export async function requestDataDeletion(
  userId: string,
  deletionType: 'soft' | 'hard' = 'soft',
  retentionPeriod: number = 30
): Promise<{ 
  success: boolean
  error?: string
  requestId?: string
  scheduledDeletionAt?: string
}> {
  try {
    const supabase = await createClient()

    const scheduledDeletionAt = new Date(Date.now() + retentionPeriod * 24 * 60 * 60 * 1000).toISOString()

    // Create deletion request record
    const { data: deletionRequest, error: requestError } = await supabase
      .from('data_deletion_requests')
      .insert({
        user_id: userId,
        deletion_type: deletionType,
        status: 'pending',
        retention_period: retentionPeriod,
        scheduled_deletion_at: scheduledDeletionAt,
        requested_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (requestError) {
      return { success: false, error: 'Failed to create deletion request' }
    }

    // For immediate soft deletion, process it right away
    if (deletionType === 'soft') {
      const deletionResult = await deleteUserData(userId, 'soft', retentionPeriod)
      if (!deletionResult.success) {
        return { success: false, error: deletionResult.error }
      }

      // Update request status
      await supabase
        .from('data_deletion_requests')
        .update({ status: 'completed' })
        .eq('id', deletionRequest.id)
    }

    return {
      success: true,
      requestId: deletionRequest.id,
      scheduledDeletionAt
    }
  } catch (error) {
    console.error('Data deletion request error:', error)
    return { success: false, error: 'Internal error creating deletion request' }
  }
} 