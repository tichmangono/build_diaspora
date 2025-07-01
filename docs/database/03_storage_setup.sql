-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('verification-documents', 'verification-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

-- Storage policies for avatars bucket
-- Anyone can view public avatars
CREATE POLICY "Public avatars are viewable by everyone" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for verification-documents bucket
-- Users can view their own verification documents
CREATE POLICY "Users can view own verification documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'verification-documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can upload their own verification documents
CREATE POLICY "Users can upload own verification documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'verification-documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can update their own verification documents
CREATE POLICY "Users can update own verification documents" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'verification-documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can delete their own verification documents
CREATE POLICY "Users can delete own verification documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'verification-documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Admin users can view all verification documents
CREATE POLICY "Admin users can view all verification documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'verification-documents' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (
                email LIKE '%@builddiaspora.zw' OR 
                email IN ('admin@builddiaspora.com', 'support@builddiaspora.com')
            )
        )
    );

-- Service role can manage all storage objects
CREATE POLICY "Service role can manage all storage objects" ON storage.objects
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Helper function to generate avatar upload URL
CREATE OR REPLACE FUNCTION generate_avatar_upload_url(file_extension TEXT)
RETURNS TEXT AS $$
DECLARE
    user_uuid UUID := auth.uid();
    file_name TEXT;
BEGIN
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    file_name := user_uuid::text || '/avatar.' || file_extension;
    
    RETURN file_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to generate verification document upload URL
CREATE OR REPLACE FUNCTION generate_verification_upload_url(
    document_type TEXT,
    file_extension TEXT
)
RETURNS TEXT AS $$
DECLARE
    user_uuid UUID := auth.uid();
    file_name TEXT;
    timestamp_str TEXT;
BEGIN
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    timestamp_str := EXTRACT(EPOCH FROM NOW())::text;
    file_name := user_uuid::text || '/' || document_type || '_' || timestamp_str || '.' || file_extension;
    
    RETURN file_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old avatar files when uploading new one
CREATE OR REPLACE FUNCTION cleanup_old_avatar()
RETURNS TRIGGER AS $$
DECLARE
    old_avatar_path TEXT;
    user_uuid UUID;
BEGIN
    -- Extract user UUID from the new avatar URL
    user_uuid := (regexp_matches(NEW.avatar_url, '/([a-f0-9-]{36})/'))[1]::UUID;
    
    -- Get old avatar path if it exists
    IF OLD.avatar_url IS NOT NULL AND OLD.avatar_url != NEW.avatar_url THEN
        old_avatar_path := regexp_replace(OLD.avatar_url, '.*/storage/v1/object/public/avatars/', '');
        
        -- Delete old avatar file (this would need to be implemented in your application)
        -- For now, we'll just log it
        RAISE NOTICE 'Old avatar file to be deleted: %', old_avatar_path;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to cleanup old avatars
CREATE TRIGGER cleanup_old_avatar_trigger
    AFTER UPDATE OF avatar_url ON public.profiles
    FOR EACH ROW
    WHEN (OLD.avatar_url IS DISTINCT FROM NEW.avatar_url)
    EXECUTE FUNCTION cleanup_old_avatar();

-- Grant permissions on helper functions
GRANT EXECUTE ON FUNCTION generate_avatar_upload_url(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_verification_upload_url(TEXT, TEXT) TO authenticated; 