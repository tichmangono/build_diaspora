import { emailService } from '@/lib/email/service'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface NotificationContext {
  user: {
    id: string
    email: string
    name?: string
  }
  event: string
  metadata?: {
    ipAddress?: string
    userAgent?: string
    location?: string
    timestamp?: string
  }
  data?: any
}

export class NotificationHooks {
  private static instance: NotificationHooks
  private supabase = createClientComponentClient()

  static getInstance(): NotificationHooks {
    if (!NotificationHooks.instance) {
      NotificationHooks.instance = new NotificationHooks()
    }
    return NotificationHooks.instance
  }

  // Authentication event handlers
  async onUserSignUp(user: { id: string; email: string; name?: string }): Promise<void> {
    try {
      console.log('🔔 User signup notification triggered:', user.email)
      
      await emailService.sendWelcomeEmail({
        name: user.name || user.email.split('@')[0],
        email: user.email
      })

      console.log('✅ Welcome email sent successfully')
    } catch (error) {
      console.error('Failed to send signup notification:', error)
    }
  }

  async onEmailVerificationRequested(user: { id: string; email: string; name?: string }, verificationLink: string): Promise<void> {
    try {
      console.log('🔔 Email verification notification triggered:', user.email)
      
      await emailService.sendEmailVerification(
        {
          name: user.name || user.email.split('@')[0],
          email: user.email
        },
        verificationLink,
        '24 hours'
      )

      console.log('✅ Verification email sent successfully')
    } catch (error) {
      console.error('Failed to send email verification notification:', error)
    }
  }

  async onPasswordResetRequested(user: { id: string; email: string; name?: string }, resetLink: string): Promise<void> {
    try {
      console.log('🔔 Password reset notification triggered:', user.email)
      
      await emailService.sendPasswordReset(
        {
          name: user.name || user.email.split('@')[0],
          email: user.email
        },
        resetLink,
        { expirationTime: '1 hour' }
      )

      console.log('✅ Password reset email sent successfully')
    } catch (error) {
      console.error('Failed to send password reset notification:', error)
    }
  }

  async onPasswordChanged(context: NotificationContext): Promise<void> {
    try {
      console.log('🔔 Password changed notification triggered:', context.user.email)
      
      await emailService.sendPasswordChanged(
        {
          name: context.user.name || context.user.email.split('@')[0],
          email: context.user.email
        },
        {
          ipAddress: context.metadata?.ipAddress,
          location: context.metadata?.location
        }
      )

      await this.logNotificationEvent(context.user.id, 'password_changed_email_sent', {
        email: context.user.email,
        ipAddress: context.metadata?.ipAddress
      })

    } catch (error) {
      console.error('Failed to send password changed notification:', error)
    }
  }

  async onSuspiciousLogin(context: NotificationContext): Promise<void> {
    try {
      console.log('🔔 Suspicious login notification triggered:', context.user.email)
      
      await emailService.sendLoginAlert(
        {
          name: context.user.name || context.user.email.split('@')[0],
          email: context.user.email
        },
        {
          ipAddress: context.metadata?.ipAddress,
          location: context.metadata?.location,
          userAgent: context.metadata?.userAgent
        }
      )

      await this.logNotificationEvent(context.user.id, 'login_alert_email_sent', {
        email: context.user.email,
        ipAddress: context.metadata?.ipAddress,
        userAgent: context.metadata?.userAgent
      })

    } catch (error) {
      console.error('Failed to send suspicious login notification:', error)
    }
  }

  // Verification event handlers
  async onVerificationSubmitted(context: NotificationContext & { verificationDetails: any }): Promise<void> {
    try {
      console.log('🔔 Verification submitted notification triggered:', context.user.email)
      
      await emailService.sendVerificationSubmitted(
        {
          name: context.user.name || context.user.email.split('@')[0],
          email: context.user.email
        },
        {
          credentialType: context.verificationDetails.credentialType,
          institutionName: context.verificationDetails.institutionName
        }
      )

      await this.logNotificationEvent(context.user.id, 'verification_submitted_email_sent', {
        email: context.user.email,
        credentialType: context.verificationDetails.credentialType
      })

    } catch (error) {
      console.error('Failed to send verification submitted notification:', error)
    }
  }

  async onVerificationApproved(user: { id: string; email: string; name?: string }, verificationDetails: { credentialType: string; institutionName?: string }): Promise<void> {
    try {
      console.log('🔔 Verification approved notification triggered:', user.email)
      
      await emailService.sendVerificationApproved(
        {
          name: user.name || user.email.split('@')[0],
          email: user.email
        },
        verificationDetails
      )

      console.log('✅ Verification approved email sent successfully')
    } catch (error) {
      console.error('Failed to send verification approved notification:', error)
    }
  }

  async onVerificationRejected(context: NotificationContext & { verificationDetails: any }): Promise<void> {
    try {
      console.log('🔔 Verification rejected notification triggered:', context.user.email)
      
      await emailService.sendVerificationRejected(
        {
          name: context.user.name || context.user.email.split('@')[0],
          email: context.user.email
        },
        {
          credentialType: context.verificationDetails.credentialType,
          institutionName: context.verificationDetails.institutionName,
          reviewerNotes: context.verificationDetails.reviewerNotes
        }
      )

      await this.logNotificationEvent(context.user.id, 'verification_rejected_email_sent', {
        email: context.user.email,
        credentialType: context.verificationDetails.credentialType
      })

    } catch (error) {
      console.error('Failed to send verification rejected notification:', error)
    }
  }

  // Utility methods
  private async logNotificationEvent(userId: string, eventType: string, data: any): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('📝 [DEV] Notification event logged:', { userId, eventType, data })
        return
      }

      // In production, log to database
      const { error } = await this.supabase
        .from('notification_logs')
        .insert({
          user_id: userId,
          event_type: eventType,
          data,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Failed to log notification event:', error)
      }
    } catch (error) {
      console.error('Error logging notification event:', error)
    }
  }

  // Get user notification preferences
  async getUserNotificationPreferences(userId: string): Promise<{
    emailNotifications: boolean
    securityAlerts: boolean
    verificationUpdates: boolean
    marketingEmails: boolean
  }> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return {
          emailNotifications: true,
          securityAlerts: true,
          verificationUpdates: true,
          marketingEmails: false
        }
      }

      const { data, error } = await this.supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        // Return default preferences
        return {
          emailNotifications: true,
          securityAlerts: true,
          verificationUpdates: true,
          marketingEmails: false
        }
      }

      return {
        emailNotifications: data.email_notifications ?? true,
        securityAlerts: data.security_alerts ?? true,
        verificationUpdates: data.verification_updates ?? true,
        marketingEmails: data.marketing_emails ?? false
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
      return {
        emailNotifications: true,
        securityAlerts: true,
        verificationUpdates: true,
        marketingEmails: false
      }
    }
  }

  // Update user notification preferences
  async updateUserNotificationPreferences(userId: string, preferences: {
    emailNotifications?: boolean
    securityAlerts?: boolean
    verificationUpdates?: boolean
    marketingEmails?: boolean
  }): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('📝 [DEV] Notification preferences updated:', { userId, preferences })
        return true
      }

      const { error } = await this.supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          email_notifications: preferences.emailNotifications,
          security_alerts: preferences.securityAlerts,
          verification_updates: preferences.verificationUpdates,
          marketing_emails: preferences.marketingEmails,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Failed to update notification preferences:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      return false
    }
  }

  // Batch notification sending
  async sendBatchNotifications(notifications: Array<{
    type: string
    context: NotificationContext & any
  }>): Promise<void> {
    const batchSize = 5
    
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize)
      
      const promises = batch.map(async ({ type, context }) => {
        try {
          switch (type) {
            case 'signup':
              await this.onUserSignUp(context.user)
              break
            case 'email_verification':
              await this.onEmailVerificationRequested(context.user, context.data?.verificationLink)
              break
            case 'password_reset':
              await this.onPasswordResetRequested(context.user, context.data?.resetLink)
              break
            case 'password_changed':
              await this.onPasswordChanged(context)
              break
            case 'suspicious_login':
              await this.onSuspiciousLogin(context)
              break
            case 'verification_submitted':
              await this.onVerificationSubmitted(context)
              break
            case 'verification_approved':
              await this.onVerificationApproved(context.user, context.data?.verificationDetails)
              break
            case 'verification_rejected':
              await this.onVerificationRejected(context)
              break
            default:
              console.warn('Unknown notification type:', type)
          }
        } catch (error) {
          console.error(`Failed to send ${type} notification:`, error)
        }
      })

      await Promise.allSettled(promises)
      
      // Add delay between batches
      if (i + batchSize < notifications.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }
}

// Export singleton instance
export const notificationHooks = NotificationHooks.getInstance()

// Convenience functions for common use cases
export const sendWelcomeNotification = (user: { id: string; email: string; name?: string }) =>
  notificationHooks.onUserSignUp(user)

export const sendEmailVerificationNotification = (user: { id: string; email: string; name?: string }, verificationLink: string) =>
  notificationHooks.onEmailVerificationRequested(user, verificationLink)

export const sendPasswordResetNotification = (user: { id: string; email: string; name?: string }, resetLink: string, metadata?: any) =>
  notificationHooks.onPasswordResetRequested(user, resetLink)

export const sendVerificationStatusNotification = (user: { id: string; email: string; name?: string }, status: 'submitted' | 'approved' | 'rejected', verificationDetails: any) => {
  const context = { user, event: `verification_${status}`, verificationDetails }
  
  switch (status) {
    case 'submitted':
      return notificationHooks.onVerificationSubmitted(context)
    case 'approved':
      return notificationHooks.onVerificationApproved(user, verificationDetails)
    case 'rejected':
      return notificationHooks.onVerificationRejected(context)
  }
} 