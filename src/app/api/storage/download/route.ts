import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { downloadSecureFile, getFileMetadata } from '@/lib/storage/secure-storage';
import { sanitizeInput } from '@/lib/utils/security';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get file path from query parameters
    const { searchParams } = new URL(request.url);
    const filePath = sanitizeInput(searchParams.get('path'));

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'File path required' },
        { status: 400 }
      );
    }

    // Get file metadata to check ownership and encryption status
    const metadataResult = await getFileMetadata(filePath);
    if (!metadataResult.success) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    const metadata = metadataResult.metadata;

    // Check if user owns the file or has permission
    if (metadata.metadata?.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Download file
    const downloadResult = await downloadSecureFile(
      filePath,
      metadata.metadata?.encrypted || false
    );

    if (!downloadResult.success || !downloadResult.data) {
      return NextResponse.json(
        { success: false, error: downloadResult.error },
        { status: 500 }
      );
    }

    // Log download activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'file_download',
      details: {
        filePath,
        fileName: metadata.metadata?.originalName,
        encrypted: metadata.metadata?.encrypted,
      },
    });

    // Convert blob to buffer for response
    const buffer = await downloadResult.data.arrayBuffer();

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', metadata.metadata?.originalType || 'application/octet-stream');
    headers.set('Content-Length', buffer.byteLength.toString());
    headers.set('Content-Disposition', `attachment; filename="${metadata.metadata?.originalName || 'download'}"`);

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 