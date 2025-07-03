import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import { emailConfig, EmailConfig } from './config'
import { EmailTemplates, EmailTemplateData } from './templates'

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  provider?: string
  retryCount?: number
}

export class EmailService {
  private static instance: EmailService
  private config: EmailConfig
  private smtpTransporter?: nodemailer.Transporter
  private resendClient?: Resend
  private isDevelopment: boolean

  constructor(config: EmailConfig = emailConfig) {
    this.config = config
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.initializeProviders()
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  private initializeProviders(): void {
    try {
      // Initialize SMTP transporter
      if (this.config.provider === 'smtp' && this.config.smtp) {
        this.smtpTransporter = nodemailer.createTransporter({
          host: this.config.smtp.host,
          port: this.config.smtp.port,
          secure: this.config.smtp.secure,
          auth: this.config.smtp.auth,
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateLimit: 14, // 14 emails per second max
        })
      }

      // Initialize Resend client
      if (this.config.provider === 'resend' && this.config.resend?.apiKey) {
        this.resendClient = new Resend(this.config.resend.apiKey)
      }

      console.log(`Email service initialized with provider: ${this.config.provider}`)
    } catch (error) {
      console.error('Failed to initialize email providers:', error)
    }
  }

  async sendEmail(options: EmailOptions, retryCount = 0): Promise<EmailResult> {
    if (this.isDevelopment) {
      return this.mockEmailSend(options)
    }

    const maxRetries = 3
    const { to, subject, html, text, replyTo, attachments } = options

    try {
      let result: EmailResult

      switch (this.config.provider) {
        case 'smtp':
          result = await this.sendViaSMTP(options)
          break
        case 'resend':
          result = await this.sendViaResend(options)
          break
        default:
          throw new Error(`Unsupported email provider: ${this.config.provider}`)
      }

      if (result.success) {
        console.log(`Email sent successfully via ${result.provider}:`, {
          to: Array.isArray(to) ? to.join(', ') : to,
          subject,
          messageId: result.messageId
        })
        return result
      }

      throw new Error(result.error || 'Unknown email sending error')
    } catch (error) {
      console.error(`Email sending failed (attempt ${retryCount + 1}):`, error)

      // Retry logic
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
        console.log(`Retrying email send in ${delay}ms...`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.sendEmail(options, retryCount + 1)
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.config.provider,
        retryCount
      }
    }
  }

  private async sendViaSMTP(options: EmailOptions): Promise<EmailResult> {
    if (!this.smtpTransporter) {
      throw new Error('SMTP transporter not initialized')
    }

    const mailOptions = {
      from: `${this.config.from.name} <${this.config.from.email}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || this.config.replyTo,
      attachments: options.attachments
    }

    const info = await this.smtpTransporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: info.messageId,
      provider: 'smtp'
    }
  }

  private async sendViaResend(options: EmailOptions): Promise<EmailResult> {
    if (!this.resendClient) {
      throw new Error('Resend client not initialized')
    }

    const { data, error } = await this.resendClient.emails.send({
      from: `${this.config.from.name} <${this.config.from.email}>`,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo || this.config.replyTo,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        content_type: att.contentType
      }))
    })

    if (error) {
      throw new Error(`Resend error: ${error.message}`)
    }

    return {
      success: true,
      messageId: data?.id,
      provider: 'resend'
    }
  }

  private mockEmailSend(options: EmailOptions): EmailResult {
    console.log('📧 [MOCK EMAIL SEND]')
    console.log('To:', options.to)
    console.log('Subject:', options.subject)
    console.log('HTML Preview:', options.html.substring(0, 200) + '...')
    console.log('Text Preview:', options.text.substring(0, 200) + '...')
    
    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      provider: 'mock'
    }
  }

  // Template-based email sending methods
  async sendWelcomeEmail(userData: { name: string; email: string }): Promise<EmailResult> {
    const template = EmailTemplates.welcomeEmail({ user: userData })
    return this.sendEmail({
      to: userData.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendEmailVerification(userData: { name: string; email: string }, verificationLink: string, expirationTime?: string): Promise<EmailResult> {
    const template = EmailTemplates.emailVerification({
      user: userData,
      verificationLink,
      expirationTime
    })
    return this.sendEmail({
      to: userData.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendPasswordReset(userData: { name: string; email: string }, resetLink: string, metadata?: { ipAddress?: string; location?: string; expirationTime?: string }): Promise<EmailResult> {
    const template = EmailTemplates.passwordReset({
      user: userData,
      resetLink,
      ...metadata
    })
    return this.sendEmail({
      to: userData.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendPasswordChanged(userData: { name: string; email: string }, metadata?: { ipAddress?: string; location?: string }): Promise<EmailResult> {
    const template = EmailTemplates.passwordChanged({
      user: userData,
      ...metadata
    })
    return this.sendEmail({
      to: userData.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendLoginAlert(userData: { name: string; email: string }, metadata?: { ipAddress?: string; location?: string; userAgent?: string }): Promise<EmailResult> {
    const template = EmailTemplates.loginAlert({
      user: userData,
      ...metadata
    })
    return this.sendEmail({
      to: userData.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendVerificationSubmitted(userData: { name: string; email: string }, verificationDetails: { credentialType: string; institutionName?: string }): Promise<EmailResult> {
    const template = EmailTemplates.verificationSubmitted({
      user: userData,
      verificationDetails: {
        ...verificationDetails,
        status: 'submitted'
      }
    })
    return this.sendEmail({
      to: userData.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendVerificationApproved(userData: { name: string; email: string }, verificationDetails: { credentialType: string; institutionName?: string }): Promise<EmailResult> {
    const template = EmailTemplates.verificationApproved({
      user: userData,
      verificationDetails: {
        ...verificationDetails,
        status: 'approved'
      }
    })
    return this.sendEmail({
      to: userData.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendVerificationRejected(userData: { name: string; email: string }, verificationDetails: { credentialType: string; institutionName?: string; reviewerNotes?: string }): Promise<EmailResult> {
    const template = EmailTemplates.verificationRejected({
      user: userData,
      verificationDetails: {
        ...verificationDetails,
        status: 'rejected'
      }
    })
    return this.sendEmail({
      to: userData.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  // Bulk email sending
  async sendBulkEmails(emails: EmailOptions[]): Promise<EmailResult[]> {
    const results: EmailResult[] = []
    const batchSize = 10 // Process in batches to avoid overwhelming the provider
    
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
      const batchPromises = batch.map(email => this.sendEmail(email))
      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({
            success: false,
            error: result.reason?.message || 'Unknown error',
            provider: this.config.provider
          })
        }
      })

      // Add delay between batches to respect rate limits
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return results
  }

  // Health check
  async testConnection(): Promise<{ success: boolean; provider: string; error?: string }> {
    if (this.isDevelopment) {
      return { success: true, provider: 'mock' }
    }

    try {
      switch (this.config.provider) {
        case 'smtp':
          if (!this.smtpTransporter) {
            throw new Error('SMTP transporter not initialized')
          }
          await this.smtpTransporter.verify()
          return { success: true, provider: 'smtp' }

        case 'resend':
          if (!this.resendClient) {
            throw new Error('Resend client not initialized')
          }
          // Resend doesn't have a direct verify method, so we'll just check if client exists
          return { success: true, provider: 'resend' }

        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`)
      }
    } catch (error) {
      return {
        success: false,
        provider: this.config.provider,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get email statistics (for monitoring)
  getStats(): { provider: string; isDevelopment: boolean } {
    return {
      provider: this.config.provider,
      isDevelopment: this.isDevelopment
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance() 