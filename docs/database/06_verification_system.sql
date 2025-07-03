-- =====================================================
-- Professional Verification System Database Schema
-- =====================================================
-- This file contains the complete database schema for the professional
-- verification system including credential types, verification requests,
-- badges, documents, and audit trails.

-- Create verification-specific enums
CREATE TYPE verification_status AS ENUM (
    'pending',
    'under_review',
    'approved',
    'rejected',
    'expired',
    'revoked'
);

CREATE TYPE credential_type AS ENUM (
    'education',
    'certification',
    'employment',
    'skills',
    'identity',
    'business_registration',
    'professional_license',
    'awards_recognition'
);

CREATE TYPE verification_level AS ENUM (
    'basic',
    'verified',
    'premium',
    'expert',
    'authority'
);

CREATE TYPE document_type AS ENUM (
    'diploma',
    'certificate',
    'transcript',
    'employment_letter',
    'id_document',
    'business_license',
    'portfolio',
    'reference_letter',
    'other'
);

-- =====================================================
-- Core Verification Tables
-- =====================================================

-- Credential types configuration
CREATE TABLE credential_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type credential_type NOT NULL,
    description TEXT,
    required_documents document_type[] DEFAULT '{}',
    verification_criteria JSONB DEFAULT '{}',
    processing_time_days INTEGER DEFAULT 7,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification requests
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credential_type_id UUID NOT NULL REFERENCES credential_types(id),
    status verification_status DEFAULT 'pending',
    
    -- Request details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    institution_name VARCHAR(200),
    institution_country VARCHAR(100),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    
    -- Verification data
    verification_data JSONB DEFAULT '{}',
    supporting_info TEXT,
    
    -- Admin fields
    assigned_to UUID REFERENCES auth.users(id),
    reviewed_by UUID REFERENCES auth.users(id),
    review_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (start_date <= end_date OR end_date IS NULL),
    CONSTRAINT valid_review_data CHECK (
        (status IN ('approved', 'rejected') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL) OR
        (status NOT IN ('approved', 'rejected'))
    )
);

-- Verification documents
CREATE TABLE verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_request_id UUID NOT NULL REFERENCES verification_requests(id) ON DELETE CASCADE,
    
    -- File details
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    document_type document_type NOT NULL,
    
    -- Storage details
    storage_path VARCHAR(500) NOT NULL,
    encrypted_key VARCHAR(500),
    
    -- Verification status
    is_verified BOOLEAN DEFAULT false,
    verification_notes TEXT,
    
    -- Metadata
    upload_ip INET,
    upload_user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 52428800), -- 50MB max
    CONSTRAINT valid_file_type CHECK (
        file_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    )
);

-- Verification badges (approved verifications)
CREATE TABLE verification_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verification_request_id UUID NOT NULL REFERENCES verification_requests(id),
    credential_type_id UUID NOT NULL REFERENCES credential_types(id),
    
    -- Badge details
    badge_title VARCHAR(200) NOT NULL,
    badge_description TEXT,
    verification_level verification_level DEFAULT 'verified',
    
    -- Badge data
    badge_data JSONB DEFAULT '{}',
    institution_name VARCHAR(200),
    credential_identifier VARCHAR(100),
    
    -- Validity
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    
    -- Verification details
    verified_by UUID NOT NULL REFERENCES auth.users(id),
    verification_score INTEGER DEFAULT 100 CHECK (verification_score >= 0 AND verification_score <= 100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one active badge per user per credential type
    UNIQUE(user_id, credential_type_id, is_active) WHERE is_active = true
);

-- Verification audit log
CREATE TABLE verification_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_request_id UUID REFERENCES verification_requests(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Action details
    action VARCHAR(100) NOT NULL,
    old_status verification_status,
    new_status verification_status,
    
    -- Change details
    changes JSONB DEFAULT '{}',
    notes TEXT,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification settings
CREATE TABLE verification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Verification requests indexes
CREATE INDEX idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_verification_requests_assigned_to ON verification_requests(assigned_to);
CREATE INDEX idx_verification_requests_credential_type ON verification_requests(credential_type_id);
CREATE INDEX idx_verification_requests_submitted_at ON verification_requests(submitted_at DESC);

-- Verification documents indexes
CREATE INDEX idx_verification_documents_request_id ON verification_documents(verification_request_id);
CREATE INDEX idx_verification_documents_type ON verification_documents(document_type);

-- Verification badges indexes
CREATE INDEX idx_verification_badges_user_id ON verification_badges(user_id);
CREATE INDEX idx_verification_badges_credential_type ON verification_badges(credential_type_id);
CREATE INDEX idx_verification_badges_active ON verification_badges(is_active) WHERE is_active = true;
CREATE INDEX idx_verification_badges_public ON verification_badges(is_public, user_id) WHERE is_public = true;

-- Audit log indexes
CREATE INDEX idx_verification_audit_log_request_id ON verification_audit_log(verification_request_id);
CREATE INDEX idx_verification_audit_log_user_id ON verification_audit_log(user_id);
CREATE INDEX idx_verification_audit_log_created_at ON verification_audit_log(created_at DESC);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE credential_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_settings ENABLE ROW LEVEL SECURITY;

-- Credential types policies (public read, admin write)
CREATE POLICY "credential_types_public_read" ON credential_types
    FOR SELECT USING (is_active = true);

CREATE POLICY "credential_types_admin_all" ON credential_types
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Verification requests policies
CREATE POLICY "verification_requests_user_own" ON verification_requests
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "verification_requests_admin_all" ON verification_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "verification_requests_assigned_read" ON verification_requests
    FOR SELECT USING (assigned_to = auth.uid());

-- Verification documents policies
CREATE POLICY "verification_documents_user_own" ON verification_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM verification_requests vr
            WHERE vr.id = verification_documents.verification_request_id
            AND vr.user_id = auth.uid()
        )
    );

CREATE POLICY "verification_documents_admin_all" ON verification_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Verification badges policies
CREATE POLICY "verification_badges_public_read" ON verification_badges
    FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "verification_badges_user_own" ON verification_badges
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "verification_badges_admin_all" ON verification_badges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Audit log policies (admin only)
CREATE POLICY "verification_audit_log_admin_read" ON verification_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Settings policies (admin only)
CREATE POLICY "verification_settings_admin_all" ON verification_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- Database Functions
-- =====================================================

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_credential_types_updated_at
    BEFORE UPDATE ON credential_types
    FOR EACH ROW EXECUTE FUNCTION update_verification_updated_at();

CREATE TRIGGER update_verification_requests_updated_at
    BEFORE UPDATE ON verification_requests
    FOR EACH ROW EXECUTE FUNCTION update_verification_updated_at();

CREATE TRIGGER update_verification_documents_updated_at
    BEFORE UPDATE ON verification_documents
    FOR EACH ROW EXECUTE FUNCTION update_verification_updated_at();

CREATE TRIGGER update_verification_badges_updated_at
    BEFORE UPDATE ON verification_badges
    FOR EACH ROW EXECUTE FUNCTION update_verification_updated_at();

CREATE TRIGGER update_verification_settings_updated_at
    BEFORE UPDATE ON verification_settings
    FOR EACH ROW EXECUTE FUNCTION update_verification_updated_at();

-- Function to log verification changes
CREATE OR REPLACE FUNCTION log_verification_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO verification_audit_log (
            verification_request_id,
            user_id,
            admin_id,
            action,
            old_status,
            new_status,
            changes,
            ip_address
        ) VALUES (
            NEW.id,
            NEW.user_id,
            NEW.reviewed_by,
            'status_change',
            OLD.status,
            NEW.status,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'review_notes', NEW.review_notes
            ),
            inet_client_addr()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger
CREATE TRIGGER log_verification_request_changes
    AFTER UPDATE ON verification_requests
    FOR EACH ROW EXECUTE FUNCTION log_verification_change();

-- Function to create verification badge after approval
CREATE OR REPLACE FUNCTION create_verification_badge()
RETURNS TRIGGER AS $$
BEGIN
    -- Create badge when verification is approved
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        INSERT INTO verification_badges (
            user_id,
            verification_request_id,
            credential_type_id,
            badge_title,
            badge_description,
            verification_level,
            badge_data,
            institution_name,
            verified_by,
            expires_at
        )
        SELECT 
            NEW.user_id,
            NEW.id,
            NEW.credential_type_id,
            COALESCE(NEW.title, ct.name),
            NEW.description,
            CASE 
                WHEN ct.type = 'identity' THEN 'verified'::verification_level
                WHEN ct.type = 'education' THEN 'verified'::verification_level
                WHEN ct.type = 'certification' THEN 'premium'::verification_level
                WHEN ct.type = 'professional_license' THEN 'expert'::verification_level
                ELSE 'basic'::verification_level
            END,
            NEW.verification_data,
            NEW.institution_name,
            NEW.reviewed_by,
            CASE 
                WHEN NEW.end_date IS NOT NULL THEN NEW.end_date + INTERVAL '1 year'
                ELSE NULL
            END
        FROM credential_types ct
        WHERE ct.id = NEW.credential_type_id;
    END IF;
    
    -- Deactivate badge when verification is rejected or revoked
    IF NEW.status IN ('rejected', 'revoked') THEN
        UPDATE verification_badges 
        SET is_active = false, updated_at = NOW()
        WHERE verification_request_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply badge creation trigger
CREATE TRIGGER create_verification_badge_trigger
    AFTER UPDATE ON verification_requests
    FOR EACH ROW EXECUTE FUNCTION create_verification_badge();

-- Function to get user verification summary
CREATE OR REPLACE FUNCTION get_user_verification_summary(p_user_id UUID)
RETURNS TABLE (
    total_badges INTEGER,
    verified_count INTEGER,
    premium_count INTEGER,
    expert_count INTEGER,
    pending_requests INTEGER,
    verification_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(badge_counts.total_badges, 0)::INTEGER,
        COALESCE(badge_counts.verified_count, 0)::INTEGER,
        COALESCE(badge_counts.premium_count, 0)::INTEGER,
        COALESCE(badge_counts.expert_count, 0)::INTEGER,
        COALESCE(request_counts.pending_requests, 0)::INTEGER,
        COALESCE(badge_counts.avg_score, 0)::INTEGER
    FROM (
        SELECT 
            COUNT(*)::INTEGER as total_badges,
            COUNT(*) FILTER (WHERE verification_level = 'verified')::INTEGER as verified_count,
            COUNT(*) FILTER (WHERE verification_level = 'premium')::INTEGER as premium_count,
            COUNT(*) FILTER (WHERE verification_level = 'expert')::INTEGER as expert_count,
            AVG(verification_score)::INTEGER as avg_score
        FROM verification_badges 
        WHERE user_id = p_user_id AND is_active = true
    ) badge_counts
    CROSS JOIN (
        SELECT COUNT(*)::INTEGER as pending_requests
        FROM verification_requests 
        WHERE user_id = p_user_id AND status = 'pending'
    ) request_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Initial Data Setup
-- =====================================================

-- Insert default credential types
INSERT INTO credential_types (name, type, description, required_documents, processing_time_days) VALUES
('University Degree', 'education', 'Bachelor, Master, or PhD degree from accredited institution', ARRAY['diploma', 'transcript'], 5),
('Professional Certification', 'certification', 'Industry-recognized professional certifications', ARRAY['certificate'], 3),
('Work Experience', 'employment', 'Professional work experience verification', ARRAY['employment_letter', 'reference_letter'], 7),
('Technical Skills', 'skills', 'Technical skills assessment and verification', ARRAY['certificate', 'portfolio'], 5),
('Identity Verification', 'identity', 'Government-issued identity document verification', ARRAY['id_document'], 2),
('Business Registration', 'business_registration', 'Registered business or company verification', ARRAY['business_license'], 7),
('Professional License', 'professional_license', 'Licensed professional practice verification', ARRAY['business_license', 'certificate'], 10),
('Awards & Recognition', 'awards_recognition', 'Professional awards and recognition', ARRAY['certificate', 'other'], 5);

-- Insert default verification settings
INSERT INTO verification_settings (setting_key, setting_value, description) VALUES
('max_file_size', '52428800', 'Maximum file size for document uploads (50MB)'),
('allowed_file_types', '["application/pdf", "image/jpeg", "image/png", "image/webp"]', 'Allowed file types for document uploads'),
('auto_approval_threshold', '95', 'Verification score threshold for automatic approval'),
('notification_enabled', 'true', 'Enable email notifications for verification updates'),
('badge_expiry_days', '365', 'Default badge expiry period in days'),
('max_pending_requests', '5', 'Maximum pending verification requests per user');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- Views for Common Queries
-- =====================================================

-- View for verification request details with related data
CREATE VIEW verification_request_details AS
SELECT 
    vr.*,
    ct.name as credential_type_name,
    ct.type as credential_category,
    p.full_name as user_name,
    p.email as user_email,
    admin_p.full_name as reviewer_name,
    COALESCE(doc_count.count, 0) as document_count,
    CASE 
        WHEN vr.status = 'pending' THEN 'Awaiting Review'
        WHEN vr.status = 'under_review' THEN 'Under Review'
        WHEN vr.status = 'approved' THEN 'Approved'
        WHEN vr.status = 'rejected' THEN 'Rejected'
        WHEN vr.status = 'expired' THEN 'Expired'
        WHEN vr.status = 'revoked' THEN 'Revoked'
    END as status_display
FROM verification_requests vr
JOIN credential_types ct ON vr.credential_type_id = ct.id
JOIN profiles p ON vr.user_id = p.user_id
LEFT JOIN profiles admin_p ON vr.reviewed_by = admin_p.user_id
LEFT JOIN (
    SELECT verification_request_id, COUNT(*) as count
    FROM verification_documents 
    GROUP BY verification_request_id
) doc_count ON vr.id = doc_count.verification_request_id;

-- View for active verification badges
CREATE VIEW active_verification_badges AS
SELECT 
    vb.*,
    ct.name as credential_type_name,
    ct.type as credential_category,
    p.full_name as user_name,
    p.avatar_url as user_avatar,
    CASE 
        WHEN vb.expires_at IS NULL THEN false
        WHEN vb.expires_at > NOW() THEN false
        ELSE true
    END as is_expired
FROM verification_badges vb
JOIN credential_types ct ON vb.credential_type_id = ct.id
JOIN profiles p ON vb.user_id = p.user_id
WHERE vb.is_active = true;

COMMENT ON TABLE verification_requests IS 'Stores professional verification requests from users';
COMMENT ON TABLE verification_badges IS 'Stores approved verification badges displayed on user profiles';
COMMENT ON TABLE verification_documents IS 'Stores encrypted documents uploaded for verification';
COMMENT ON TABLE verification_audit_log IS 'Audit trail for all verification-related actions'; 