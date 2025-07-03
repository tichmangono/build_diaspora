import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email/service'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const sendEmailSchema = z.object({
  type: z.enum(['welcome', 'verification', 'password_reset', 'password_changed', 'login_alert', 'verification_submitted', 'verification_approved', 'verification_rejected']),
  data: z.object({
    user: z.object({
      name: z.string(),
      email: z.string().email()
    }),
    verificationLink: z.string().url().optional(),
    resetLink: z.string().url().optional(),
    expirationTime: z.string().optional(),
    ipAddress: z.string().optional(),
    location: z.string().optional(),
    userAgent: z.string().optional(),
    verificationDetails: z.object({
      credentialType: z.string(),
      institutionName: z.string().optional(),
      reviewerNotes: z.string().optional()
    }).optional()
  })
})

function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const userLimit = rateLimitStore.get(identifier)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (userLimit.count >= limit) {
    return false
  }

  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Development mode - skip auth for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email API called in development mode')
    } else {
      // Authentication check for production
      const supabase = createRouteHandlerClient({ cookies })
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Rate limiting
      const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      if (!checkRateLimit(`email:${user.id}:${clientIP}`, 5, 60000)) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Too many email requests.' },
          { status: 429 }
        )
      }
    }

    const body = await request.json()
    const validatedData = sendEmailSchema.parse(body)

    const { type, data } = validatedData

    let result
    switch (type) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail(data.user)
        break

      case 'verification':
        if (!data.verificationLink) {
          return NextResponse.json(
            { error: 'Verification link is required' },
            { status: 400 }
          )
        }
        result = await emailService.sendEmailVerification(
          data.user,
          data.verificationLink,
          data.expirationTime
        )
        break

      case 'password_reset':
        if (!data.resetLink) {
          return NextResponse.json(
            { error: 'Reset link is required' },
            { status: 400 }
          )
        }
        result = await emailService.sendPasswordReset(
          data.user,
          data.resetLink,
          {
            ipAddress: data.ipAddress,
            location: data.location,
            expirationTime: data.expirationTime
          }
        )
        break

      case 'password_changed':
        result = await emailService.sendPasswordChanged(
          data.user,
          {
            ipAddress: data.ipAddress,
            location: data.location
          }
        )
        break

      case 'login_alert':
        result = await emailService.sendLoginAlert(
          data.user,
          {
            ipAddress: data.ipAddress,
            location: data.location,
            userAgent: data.userAgent
          }
        )
        break

      case 'verification_submitted':
        if (!data.verificationDetails) {
          return NextResponse.json(
            { error: 'Verification details are required' },
            { status: 400 }
          )
        }
        result = await emailService.sendVerificationSubmitted(
          data.user,
          data.verificationDetails
        )
        break

      case 'verification_approved':
        if (!data.verificationDetails) {
          return NextResponse.json(
            { error: 'Verification details are required' },
            { status: 400 }
          )
        }
        result = await emailService.sendVerificationApproved(
          data.user,
          data.verificationDetails
        )
        break

      case 'verification_rejected':
        if (!data.verificationDetails) {
          return NextResponse.json(
            { error: 'Verification details are required' },
            { status: 400 }
          )
        }
        result = await emailService.sendVerificationRejected(
          data.user,
          data.verificationDetails
        )
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      provider: result.provider,
      error: result.error
    })

  } catch (error) {
    console.error('Email API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const stats = emailService.getStats()
    const connectionTest = await emailService.testConnection()

    return NextResponse.json({
      stats,
      connection: connectionTest,
      supportedTypes: [
        'welcome',
        'verification',
        'password_reset',
        'password_changed',
        'login_alert',
        'verification_submitted',
        'verification_approved',
        'verification_rejected'
      ]
    })

  } catch (error) {
    console.error('Email stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 