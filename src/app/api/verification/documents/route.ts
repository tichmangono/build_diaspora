import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Allowed file types and sizes
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES_PER_REQUEST = 5

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const verificationRequestId = formData.get('verificationRequestId') as string
    const documentType = formData.get('documentType') as string
    
    if (!verificationRequestId || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields: verificationRequestId and documentType' },
        { status: 400 }
      )
    }

    // Get uploaded files
    const files = formData.getAll('files') as File[]
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES_PER_REQUEST} files allowed per request` },
        { status: 400 }
      )
    }

    // Validate files
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} not allowed. Allowed types: PDF, JPEG, PNG, WebP, DOC, DOCX` },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds maximum size of 10MB` },
          { status: 400 }
        )
      }
    }

    // Mock upload for development mode
    const uploadedDocuments = files.map((file, index) => ({
      id: `mock-doc-${Date.now()}-${index}`,
      document_type: documentType,
      file_name: file.name,
      file_size: file.size,
      uploaded_at: new Date().toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: {
        uploadedDocuments,
        totalUploaded: uploadedDocuments.length,
        failed: 0
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Document upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const verificationRequestId = searchParams.get('verificationRequestId')
    
    if (!verificationRequestId) {
      return NextResponse.json(
        { error: 'Missing verificationRequestId parameter' },
        { status: 400 }
      )
    }

    // Mock documents for development
    const documents = [
      {
        id: 'mock-doc-1',
        document_type: 'diploma',
        file_name: 'BSc_Computer_Science.pdf',
        file_size: 2048000,
        uploaded_at: '2024-01-15T10:05:00Z'
      },
      {
        id: 'mock-doc-2',
        document_type: 'transcript',
        file_name: 'Official_Transcript.pdf',
        file_size: 1536000,
        uploaded_at: '2024-01-15T10:10:00Z'
      }
    ]

    return NextResponse.json({
      success: true,
      data: documents
    })

  } catch (error) {
    console.error('Documents fetch API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
