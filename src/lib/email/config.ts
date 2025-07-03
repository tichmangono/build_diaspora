import nodemailer from 'nodemailer'
import { Resend } from 'resend'

export interface EmailConfig {
  provider: 'smtp' | 'resend' | 'sendgrid' | 'ses'
  smtp?: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
  resend?: {
    apiKey: string
  }
  sendgrid?: {
    apiKey: string
  }
  ses?: {
    region: string
    accessKeyId: string
    secretAccessKey: string
  }
  from: {
    name: string
    email: string
  }
  replyTo?: string
  baseUrl: string
}

export const emailConfig: EmailConfig = {
  provider: (process.env.EMAIL_PROVIDER as any) || 'smtp',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || ''
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || ''
  },
  ses: {
    region: process.env.AWS_SES_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'BuildDiaspora Zimbabwe',
    email: process.env.EMAIL_FROM_ADDRESS || 'noreply@builddiaspora.com'
  },
  replyTo: process.env.EMAIL_REPLY_TO || 'support@builddiaspora.com',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private resend: Resend | null = null

  constructor() {
    this.initializeProvider()
  }

  private async initializeProvider() {
    try {
      switch (emailConfig.provider) {
        case 'smtp':
          this.transporter = nodemailer.createTransporter({
            host: emailConfig.smtp!.host,
            port: emailConfig.smtp!.port,
            secure: emailConfig.smtp!.secure,
            auth: emailConfig.smtp!.auth,
            tls: {
              rejectUnauthorized: false
            }
          })
          break

        case 'resend':
          if (emailConfig.resend!.apiKey) {
            this.resend = new Resend(emailConfig.resend!.apiKey)
          }
          break

        case 'sendgrid':
          // SendGrid implementation would go here
          break

        case 'ses':
          // AWS SES implementation would go here
          break

        default:
          console.warn('No valid email provider configured, falling back to console logging')
      }
    } catch (error) {
      console.error('Failed to initialize email provider:', error)
    }
  }

  async sendEmail(options: {
    to: string | string[]
    subject: string
    html: string
    text?: string
    attachments?: Array<{
      filename: string
      content: Buffer | string
      contentType?: string
    }>
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Development mode - log to console
      if (process.env.NODE_ENV === 'development' || !this.isConfigured()) {
        console.log('\n📧 EMAIL SENT (Development Mode)')
        console.log('To:', options.to)
        console.log('Subject:', options.subject)
        console.log('HTML:', options.html.substring(0, 200) + '...')
        return { success: true, messageId: 'dev-' + Date.now() }
      }

      switch (emailConfig.provider) {
        case 'smtp':
          if (this.transporter) {
            const result = await this.transporter.sendMail({
              from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
              to: options.to,
              subject: options.subject,
              html: options.html,
              text: options.text,
              replyTo: emailConfig.replyTo,
              attachments: options.attachments
            })
            return { success: true, messageId: result.messageId }
          }
          break

        case 'resend':
          if (this.resend) {
            const result = await this.resend.emails.send({
              from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
              to: Array.isArray(options.to) ? options.to : [options.to],
              subject: options.subject,
              html: options.html,
              text: options.text,
              reply_to: emailConfig.replyTo,
              attachments: options.attachments
            })
            return { success: true, messageId: result.data?.id }
          }
          break

        default:
          throw new Error(`Email provider ${emailConfig.provider} not implemented`)
      }

      throw new Error('No email provider available')
    } catch (error) {
      console.error('Failed to send email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  private isConfigured(): boolean {
    switch (emailConfig.provider) {
      case 'smtp':
        return !!(emailConfig.smtp?.auth.user && emailConfig.smtp?.auth.pass)
      case 'resend':
        return !!emailConfig.resend?.apiKey
      case 'sendgrid':
        return !!emailConfig.sendgrid?.apiKey
      case 'ses':
        return !!(emailConfig.ses?.accessKeyId && emailConfig.ses?.secretAccessKey)
      default:
        return false
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (emailConfig.provider === 'smtp' && this.transporter) {
        await this.transporter.verify()
        return true
      }
      // Add verification for other providers as needed
      return true
    } catch (error) {
      console.error('Email connection verification failed:', error)
      return false
    }
  }
}

export const emailService = new EmailService() 