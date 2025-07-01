import { NextRequest, NextResponse } from 'next/server'
import { withInputSanitization } from '@/lib/middleware/inputSanitization'
import { registerSchema } from '@/lib/validations/auth'
import { z } from 'zod'

/**
 * Example API route demonstrating secure input handling
 * This shows how to use input sanitization middleware with Zod validation
 */

// Example handler function
async function handleSecureRegistration(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the sanitized request body
    const body = await request.json()
    
    // Validate with Zod schema (which includes security checks)
    const validationResult = registerSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }
    
    const sanitizedData = validationResult.data
    
    // At this point, the data is:
    // 1. Sanitized by the middleware (HTML stripped, control chars removed)
    // 2. Validated by Zod schemas (type-safe, format-checked)
    // 3. Security-checked (injection patterns detected)
    
    // Example: Log sanitized data (don't log passwords in production!)
    console.log('Sanitized registration data:', {
      ...sanitizedData,
      password: '[REDACTED]',
      confirmPassword: '[REDACTED]'
    })
    
    // Here you would typically:
    // 1. Check if user already exists
    // 2. Hash the password
    // 3. Save to database
    // 4. Send verification email
    
    // For this example, just return success
    return NextResponse.json(
      { 
        message: 'Registration data processed successfully',
        user: {
          email: sanitizedData.email,
          fullName: sanitizedData.fullName,
          profession: sanitizedData.profession,
          location: sanitizedData.location
        }
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Registration error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// Apply input sanitization middleware to the handler
export const POST = withInputSanitization(handleSecureRegistration, {
  maxBodySize: 2 * 1024 * 1024, // 2MB for this endpoint
  allowedMethods: ['POST'],
  skipSanitization: ['password', 'confirmPassword'], // Don't sanitize passwords
  strictMode: true
})

// Example of a GET endpoint with query parameter sanitization
async function handleSecureSearch(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    
    // Validate search parameters
    const searchValidation = z.object({
      query: z.string().max(100).optional(),
      page: z.number().min(1).max(1000),
      limit: z.number().min(1).max(100)
    }).safeParse({ query, page, limit })
    
    if (!searchValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid search parameters',
          details: searchValidation.error.errors,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }
    
    const { query: sanitizedQuery, page: validPage, limit: validLimit } = searchValidation.data
    
    // Example search logic (sanitized query is safe to use)
    const results = {
      query: sanitizedQuery,
      page: validPage,
      limit: validLimit,
      results: [
        // Mock results
        { id: 1, title: 'Example Result 1' },
        { id: 2, title: 'Example Result 2' }
      ],
      total: 2
    }
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('Search error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// Apply input sanitization to GET endpoint
export const GET = withInputSanitization(handleSecureSearch, {
  allowedMethods: ['GET'],
  strictMode: true
})

// Example of handling file uploads securely
async function handleSecureFileUpload(request: NextRequest): Promise<NextResponse> {
  try {
    // For file uploads, you would typically use FormData
    // This is a simplified example
    
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content type must be multipart/form-data' },
        { status: 400 }
      )
    }
    
    // In a real implementation, you would:
    // 1. Parse the multipart form data
    // 2. Validate file type and size
    // 3. Scan for malware
    // 4. Store securely (e.g., Supabase Storage)
    // 5. Return file URL
    
    return NextResponse.json(
      { 
        message: 'File upload endpoint ready',
        supportedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        maxSize: '10MB'
      }
    )
    
  } catch (error) {
    console.error('File upload error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// Apply input sanitization to file upload endpoint
export const PUT = withInputSanitization(handleSecureFileUpload, {
  maxBodySize: 10 * 1024 * 1024, // 10MB for file uploads
  allowedMethods: ['PUT'],
  strictMode: true
}) 