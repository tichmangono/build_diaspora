-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE verification_type AS ENUM ('professional', 'identity', 'business');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    profession TEXT,
    company TEXT,
    bio TEXT,
    website TEXT,
    linkedin_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_type verification_type,
    verification_documents TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification_requests table
CREATE TABLE public.verification_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    verification_type verification_type NOT NULL,
    documents TEXT[] NOT NULL,
    status verification_status DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_is_verified ON public.profiles(is_verified);
CREATE INDEX idx_profiles_profession ON public.profiles(profession);
CREATE INDEX idx_profiles_location ON public.profiles(location);
CREATE INDEX idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX idx_verification_requests_type ON public.verification_requests(verification_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at BEFORE UPDATE ON public.verification_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, profession, location)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'profession', ''),
        COALESCE(NEW.raw_user_meta_data->>'location', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add constraints
ALTER TABLE public.profiles ADD CONSTRAINT check_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.profiles ADD CONSTRAINT check_phone_format 
    CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$');

ALTER TABLE public.profiles ADD CONSTRAINT check_website_format 
    CHECK (website IS NULL OR website ~* '^https?://.*');

ALTER TABLE public.profiles ADD CONSTRAINT check_linkedin_format 
    CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://(www\.)?linkedin\.com/.*');

ALTER TABLE public.profiles ADD CONSTRAINT check_bio_length 
    CHECK (bio IS NULL OR LENGTH(bio) <= 500);

ALTER TABLE public.profiles ADD CONSTRAINT check_full_name_length 
    CHECK (full_name IS NULL OR LENGTH(full_name) <= 100);

ALTER TABLE public.verification_requests ADD CONSTRAINT check_documents_not_empty 
    CHECK (array_length(documents, 1) > 0);

-- Add comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with professional information and verification status';
COMMENT ON TABLE public.verification_requests IS 'Professional verification requests with document uploads';

COMMENT ON COLUMN public.profiles.id IS 'References auth.users.id';
COMMENT ON COLUMN public.profiles.email IS 'User email address (must be unique)';
COMMENT ON COLUMN public.profiles.full_name IS 'User full name';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN public.profiles.phone IS 'User phone number in international format';
COMMENT ON COLUMN public.profiles.location IS 'User location (city, country)';
COMMENT ON COLUMN public.profiles.profession IS 'User profession or job title';
COMMENT ON COLUMN public.profiles.company IS 'User company or organization';
COMMENT ON COLUMN public.profiles.bio IS 'User biography or description (max 500 chars)';
COMMENT ON COLUMN public.profiles.website IS 'User personal or professional website';
COMMENT ON COLUMN public.profiles.linkedin_url IS 'User LinkedIn profile URL';
COMMENT ON COLUMN public.profiles.is_verified IS 'Whether user is professionally verified';
COMMENT ON COLUMN public.profiles.verification_type IS 'Type of verification (professional, identity, business)';
COMMENT ON COLUMN public.profiles.verification_documents IS 'Array of document URLs for verification';

COMMENT ON COLUMN public.verification_requests.user_id IS 'References profiles.id';
COMMENT ON COLUMN public.verification_requests.verification_type IS 'Type of verification being requested';
COMMENT ON COLUMN public.verification_requests.documents IS 'Array of uploaded document URLs';
COMMENT ON COLUMN public.verification_requests.status IS 'Request status (pending, approved, rejected)';
COMMENT ON COLUMN public.verification_requests.admin_notes IS 'Admin notes or feedback on the request'; 