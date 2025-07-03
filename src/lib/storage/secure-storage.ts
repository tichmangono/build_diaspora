import { createClient } from '@/lib/supabase/client';
import { encryptPII, decryptPII } from '@/lib/utils/encryption';

// File type configurations
const ALLOWED_FILE_TYPES = {
  avatar: ['image/jpeg', 'image/png', 'image/webp'],
  document: ['application/pdf', 'image/jpeg', 'image/png'],
  verification: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

const MAX_FILE_SIZES = {
  avatar: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  verification: 10 * 1024 * 1024, // 10MB
} as const;

type FileCategory = keyof typeof ALLOWED_FILE_TYPES;

interface UploadOptions {
  category: FileCategory;
  userId: string;
  encrypt?: boolean;
  metadata?: Record<string, unknown>;
}

interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Validate file before upload
 */
function validateFile(file: File, category: FileCategory): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ALLOWED_FILE_TYPES[category];
  if (!allowedTypes.includes(file.type as (typeof allowedTypes)[number])) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  const maxSize = MAX_FILE_SIZES[category];
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Generate secure file path
 */
function generateSecureFilePath(userId: string, category: FileCategory, fileName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = fileName.split('.').pop();
  
  return `${category}/${userId}/${timestamp}_${randomString}.${fileExtension}`;
}

/**
 * Upload file to Supabase storage with optional encryption
 */
export async function uploadSecureFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    const supabase = createClient();
    
    // Validate file
    const validation = validateFile(file, options.category);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate secure file path
    const filePath = generateSecureFilePath(options.userId, options.category, file.name);

    let fileToUpload: File | Blob = file;

    // Encrypt file if requested (for sensitive documents)
    if (options.encrypt) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const encryptedData = encryptPII(base64String);
        
        // Create new blob with encrypted data
        fileToUpload = new Blob([encryptedData], { type: 'application/octet-stream' });
      } catch (error) {
        console.error('File encryption error:', error);
        return { success: false, error: 'Failed to encrypt file' };
      }
    }

    // Upload to Supabase
    const { error } = await supabase.storage
      .from('user-files')
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false,
        metadata: {
          userId: options.userId,
          category: options.category,
          encrypted: options.encrypt || false,
          originalName: file.name,
          originalSize: file.size,
          originalType: file.type,
          uploadedAt: new Date().toISOString(),
          ...options.metadata,
        },
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: 'Upload failed' };
    }

    // Get public URL for non-encrypted files
    let publicUrl: string | undefined;
    if (!options.encrypt) {
      const { data: urlData } = supabase.storage
        .from('user-files')
        .getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    }

    return {
      success: true,
      url: publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Upload failed' };
  }
}

/**
 * Download and decrypt file from Supabase storage
 */
export async function downloadSecureFile(
  filePath: string,
  encrypted: boolean = false
): Promise<{ success: boolean; data?: Blob; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.storage
      .from('user-files')
      .download(filePath);

    if (error) {
      console.error('Download error:', error);
      return { success: false, error: 'Download failed' };
    }

    if (!encrypted) {
      return { success: true, data };
    }

    // Decrypt file
    try {
      const encryptedText = await data.text();
      const decryptedBase64 = decryptPII(encryptedText);
      
      // Convert base64 back to binary
      const binaryString = atob(decryptedBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const decryptedBlob = new Blob([bytes]);
      return { success: true, data: decryptedBlob };
    } catch (error) {
      console.error('Decryption error:', error);
      return { success: false, error: 'Failed to decrypt file' };
    }
  } catch (error) {
    console.error('Download error:', error);
    return { success: false, error: 'Download failed' };
  }
}

/**
 * Delete file from Supabase storage
 */
export async function deleteSecureFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase.storage
      .from('user-files')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: 'Delete failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: 'Delete failed' };
  }
}

/**
 * List user files with metadata
 */
export async function listUserFiles(
  userId: string,
  category?: FileCategory
): Promise<{ success: boolean; files?: any[]; error?: string }> {
  try {
    const supabase = createClient();

    const prefix = category ? `${category}/${userId}/` : `${userId}/`;

    const { data, error } = await supabase.storage
      .from('user-files')
      .list(prefix, {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error('List files error:', error);
      return { success: false, error: 'Failed to list files' };
    }

    return { success: true, files: data };
  } catch (error) {
    console.error('List files error:', error);
    return { success: false, error: 'Failed to list files' };
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(filePath: string): Promise<{ success: boolean; metadata?: any; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.storage
      .from('user-files')
      .list('', {
        limit: 1,
        search: filePath,
      });

    if (error) {
      console.error('Get metadata error:', error);
      return { success: false, error: 'Failed to get metadata' };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'File not found' };
    }

    return { success: true, metadata: data[0] };
  } catch (error) {
    console.error('Get metadata error:', error);
    return { success: false, error: 'Failed to get metadata' };
  }
}

/**
 * Create secure backup of user data
 */
export async function createUserDataBackup(userId: string): Promise<{ success: boolean; backupPath?: string; error?: string }> {
  try {
    const supabase = createClient();

    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      return { success: false, error: 'Failed to fetch user data' };
    }

    // Encrypt user data
    const encryptedData = encryptPII(JSON.stringify(userData));
    
    // Create backup file
    const backupPath = `backups/${userId}/${Date.now()}_backup.encrypted`;
    const backupBlob = new Blob([encryptedData], { type: 'application/octet-stream' });

    const { error: uploadError } = await supabase.storage
      .from('user-files')
      .upload(backupPath, backupBlob, {
        metadata: {
          userId,
          type: 'backup',
          encrypted: true,
          createdAt: new Date().toISOString(),
        },
      });

    if (uploadError) {
      return { success: false, error: 'Failed to create backup' };
    }

    return { success: true, backupPath };
  } catch (error) {
    console.error('Backup creation error:', error);
    return { success: false, error: 'Failed to create backup' };
  }
}

/**
 * Restore user data from backup
 */
export async function restoreUserDataBackup(userId: string, backupPath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // Download backup file
    const downloadResult = await downloadSecureFile(backupPath, true);
    if (!downloadResult.success || !downloadResult.data) {
      return { success: false, error: 'Failed to download backup' };
    }

    // Parse restored data
    const backupText = await downloadResult.data.text();
    const userData = JSON.parse(backupText);

    // Restore to database (implement based on your needs)
    // This is a simplified example
    const { error: restoreError } = await supabase
      .from('profiles')
      .upsert(userData);

    if (restoreError) {
      return { success: false, error: 'Failed to restore data' };
    }

    return { success: true };
  } catch (error) {
    console.error('Backup restore error:', error);
    return { success: false, error: 'Failed to restore backup' };
  }
} 