-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Profiles table policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but for completeness)
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Public profiles can be viewed by authenticated users (for networking features)
CREATE POLICY "Authenticated users can view public profiles" ON public.profiles
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        (is_verified = true OR auth.uid() = id)
    );

-- Service role can manage all profiles (for admin functions)
CREATE POLICY "Service role can manage profiles" ON public.profiles
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Verification requests policies
-- Users can view their own verification requests
CREATE POLICY "Users can view own verification requests" ON public.verification_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = verification_requests.user_id 
            AND profiles.id = auth.uid()
        )
    );

-- Users can create their own verification requests
CREATE POLICY "Users can create own verification requests" ON public.verification_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = verification_requests.user_id 
            AND profiles.id = auth.uid()
        )
    );

-- Users can update their own pending verification requests
CREATE POLICY "Users can update own pending verification requests" ON public.verification_requests
    FOR UPDATE USING (
        status = 'pending' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = verification_requests.user_id 
            AND profiles.id = auth.uid()
        )
    );

-- Service role can manage all verification requests (for admin functions)
CREATE POLICY "Service role can manage verification requests" ON public.verification_requests
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create admin role policies (for future admin panel)
-- Admin users can view all profiles
CREATE POLICY "Admin users can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (
                email LIKE '%@builddiaspora.zw' OR 
                email IN ('admin@builddiaspora.com', 'support@builddiaspora.com')
            )
        )
    );

-- Admin users can manage all verification requests
CREATE POLICY "Admin users can manage verification requests" ON public.verification_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (
                email LIKE '%@builddiaspora.zw' OR 
                email IN ('admin@builddiaspora.com', 'support@builddiaspora.com')
            )
        )
    );

-- Create functions for common queries
-- Function to get user profile with verification status
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID DEFAULT auth.uid())
RETURNS SETOF public.profiles AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.profiles
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user verification requests
CREATE OR REPLACE FUNCTION get_user_verification_requests(user_uuid UUID DEFAULT auth.uid())
RETURNS SETOF public.verification_requests AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.verification_requests
    WHERE user_id = user_uuid
    ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit verification request
CREATE OR REPLACE FUNCTION submit_verification_request(
    verification_type_param verification_type,
    documents_param TEXT[]
)
RETURNS UUID AS $$
DECLARE
    request_id UUID;
    user_uuid UUID := auth.uid();
BEGIN
    -- Check if user has a pending request of the same type
    IF EXISTS (
        SELECT 1 FROM public.verification_requests 
        WHERE user_id = user_uuid 
        AND verification_type = verification_type_param 
        AND status = 'pending'
    ) THEN
        RAISE EXCEPTION 'You already have a pending verification request of this type';
    END IF;

    -- Insert new verification request
    INSERT INTO public.verification_requests (user_id, verification_type, documents)
    VALUES (user_uuid, verification_type_param, documents_param)
    RETURNING id INTO request_id;

    RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve verification request (admin only)
CREATE OR REPLACE FUNCTION approve_verification_request(
    request_id UUID,
    admin_notes_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    user_uuid UUID;
    verification_type_param verification_type;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (
            email LIKE '%@builddiaspora.zw' OR 
            email IN ('admin@builddiaspora.com', 'support@builddiaspora.com')
        )
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Get request details
    SELECT user_id, verification_type INTO user_uuid, verification_type_param
    FROM public.verification_requests
    WHERE id = request_id AND status = 'pending';

    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'Verification request not found or already processed';
    END IF;

    -- Update verification request status
    UPDATE public.verification_requests
    SET status = 'approved',
        admin_notes = admin_notes_param,
        updated_at = NOW()
    WHERE id = request_id;

    -- Update user profile verification status
    UPDATE public.profiles
    SET is_verified = true,
        verification_type = verification_type_param,
        updated_at = NOW()
    WHERE id = user_uuid;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject verification request (admin only)
CREATE OR REPLACE FUNCTION reject_verification_request(
    request_id UUID,
    admin_notes_param TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (
            email LIKE '%@builddiaspora.zw' OR 
            email IN ('admin@builddiaspora.com', 'support@builddiaspora.com')
        )
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Update verification request status
    UPDATE public.verification_requests
    SET status = 'rejected',
        admin_notes = admin_notes_param,
        updated_at = NOW()
    WHERE id = request_id AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Verification request not found or already processed';
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.verification_requests TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_verification_requests(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_verification_request(verification_type, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_verification_request(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_verification_request(UUID, TEXT) TO authenticated; 