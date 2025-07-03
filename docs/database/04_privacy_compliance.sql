-- Privacy Compliance Tables for GDPR/CCPA Compliance
-- Run this after the initial schema setup

-- Consent Records Table
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('essential', 'analytics', 'marketing', 'profiling')),
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Privacy Settings Table
CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  data_processing_consent BOOLEAN NOT NULL DEFAULT true,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  analytics_consent BOOLEAN NOT NULL DEFAULT false,
  profiling_consent BOOLEAN NOT NULL DEFAULT false,
  data_retention_period INTEGER NOT NULL DEFAULT 365, -- days
  anonymize_after_deletion BOOLEAN NOT NULL DEFAULT true,
  allow_data_export BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Export Requests Table
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  data_types TEXT[] NOT NULL DEFAULT '{}',
  file_size_bytes BIGINT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Deletion Requests Table
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deletion_type TEXT NOT NULL DEFAULT 'soft' CHECK (deletion_type IN ('soft', 'hard')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  retention_period INTEGER, -- days before hard deletion
  scheduled_deletion_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs Table (for audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_type_granted ON consent_records(consent_type, granted);
CREATE INDEX IF NOT EXISTS idx_consent_records_granted_at ON consent_records(granted_at DESC);

CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON privacy_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_status ON data_export_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_requested_at ON data_export_requests(requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_user_id ON data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_status ON data_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_scheduled ON data_deletion_requests(scheduled_deletion_at);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- Add columns to existing profiles table for privacy compliance
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scheduled_hard_deletion_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_consent_records_updated_at ON consent_records;
CREATE TRIGGER update_consent_records_updated_at 
    BEFORE UPDATE ON consent_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_privacy_settings_updated_at ON privacy_settings;
CREATE TRIGGER update_privacy_settings_updated_at 
    BEFORE UPDATE ON privacy_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_data_export_requests_updated_at ON data_export_requests;
CREATE TRIGGER update_data_export_requests_updated_at 
    BEFORE UPDATE ON data_export_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_data_deletion_requests_updated_at ON data_deletion_requests;
CREATE TRIGGER update_data_deletion_requests_updated_at 
    BEFORE UPDATE ON data_deletion_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for Privacy Tables

-- Consent Records Policies
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consent records" ON consent_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent records" ON consent_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Privacy Settings Policies
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own privacy settings" ON privacy_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings" ON privacy_settings
    FOR ALL USING (auth.uid() = user_id);

-- Data Export Requests Policies
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own export requests" ON data_export_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export requests" ON data_export_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Data Deletion Requests Policies
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deletion requests" ON data_deletion_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deletion requests" ON data_deletion_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activity Logs Policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO activity_logs (
        user_id, action, resource_type, resource_id, 
        details, ip_address, user_agent
    ) VALUES (
        p_user_id, p_action, p_resource_type, p_resource_id,
        p_details, p_ip_address, p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired export requests
CREATE OR REPLACE FUNCTION cleanup_expired_exports() RETURNS void AS $$
BEGIN
    -- Delete expired export requests and their files
    DELETE FROM data_export_requests 
    WHERE expires_at < NOW() AND status = 'completed';
    
    -- Log cleanup activity
    INSERT INTO activity_logs (action, details) 
    VALUES ('system_cleanup', '{"type": "expired_exports", "timestamp": "' || NOW() || '"}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process scheduled deletions
CREATE OR REPLACE FUNCTION process_scheduled_deletions() RETURNS void AS $$
DECLARE
    deletion_record RECORD;
BEGIN
    -- Process hard deletions that are due
    FOR deletion_record IN 
        SELECT dr.*, p.id as profile_id
        FROM data_deletion_requests dr
        JOIN profiles p ON dr.user_id = p.id
        WHERE dr.deletion_type = 'hard' 
        AND dr.status = 'pending'
        AND dr.scheduled_deletion_at <= NOW()
    LOOP
        -- Delete user data
        DELETE FROM profiles WHERE id = deletion_record.profile_id;
        
        -- Update deletion request status
        UPDATE data_deletion_requests 
        SET status = 'completed', completed_at = NOW()
        WHERE id = deletion_record.id;
        
        -- Log the deletion
        INSERT INTO activity_logs (action, details)
        VALUES ('hard_deletion_completed', 
                jsonb_build_object('user_id', deletion_record.user_id, 
                                 'request_id', deletion_record.id,
                                 'timestamp', NOW()));
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE consent_records IS 'Stores user consent records for GDPR/CCPA compliance';
COMMENT ON TABLE privacy_settings IS 'User privacy preferences and settings';
COMMENT ON TABLE data_export_requests IS 'Tracks data export requests (Right to Data Portability)';
COMMENT ON TABLE data_deletion_requests IS 'Tracks data deletion requests (Right to Erasure)';
COMMENT ON TABLE activity_logs IS 'Audit trail for user and system activities';

COMMENT ON FUNCTION log_user_activity IS 'Logs user activity for audit and compliance purposes';
COMMENT ON FUNCTION cleanup_expired_exports IS 'Cleans up expired data export files and requests';
COMMENT ON FUNCTION process_scheduled_deletions IS 'Processes scheduled hard deletions'; 