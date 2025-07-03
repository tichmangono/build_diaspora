-- Security Monitoring & Logging Schema
-- This file contains the database schema for comprehensive security monitoring

-- Security Events Table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    details JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security Alerts Table
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES security_events(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Failed Login Attempts Tracking (separate table for performance)
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255),
    ip_address INET NOT NULL,
    user_agent TEXT,
    attempt_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason VARCHAR(100) -- 'invalid_password', 'user_not_found', 'account_locked', etc.
);

-- Session Tracking for Concurrent Session Detection
CREATE TABLE IF NOT EXISTS active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Security Configuration Table
CREATE TABLE IF NOT EXISTS security_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);

CREATE INDEX IF NOT EXISTS idx_security_alerts_event_id ON security_alerts(event_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_acknowledged ON security_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_security_alerts_triggered_at ON security_alerts(triggered_at);

CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_time ON failed_login_attempts(attempt_time);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_token ON active_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_active_sessions_ip ON active_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_active_sessions_active ON active_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires ON active_sessions(expires_at);

-- Functions for Automated Cleanup
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void AS $$
BEGIN
    -- Delete security events older than 1 year (except critical ones)
    DELETE FROM security_events 
    WHERE created_at < NOW() - INTERVAL '1 year' 
    AND severity != 'critical';
    
    -- Delete failed login attempts older than 30 days
    DELETE FROM failed_login_attempts 
    WHERE attempt_time < NOW() - INTERVAL '30 days';
    
    -- Deactivate expired sessions
    UPDATE active_sessions 
    SET is_active = FALSE 
    WHERE expires_at < NOW() AND is_active = TRUE;
    
    -- Delete inactive sessions older than 7 days
    DELETE FROM active_sessions 
    WHERE is_active = FALSE 
    AND last_activity < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Function to Get Security Statistics
CREATE OR REPLACE FUNCTION get_security_stats(timeframe_hours INTEGER DEFAULT 24)
RETURNS JSON AS $$
DECLARE
    start_time TIMESTAMPTZ;
    result JSON;
BEGIN
    start_time := NOW() - (timeframe_hours || ' hours')::INTERVAL;
    
    SELECT json_build_object(
        'total_events', (
            SELECT COUNT(*) FROM security_events 
            WHERE timestamp >= start_time
        ),
        'events_by_severity', (
            SELECT json_object_agg(severity, count)
            FROM (
                SELECT severity, COUNT(*) as count
                FROM security_events 
                WHERE timestamp >= start_time
                GROUP BY severity
            ) t
        ),
        'events_by_type', (
            SELECT json_object_agg(type, count)
            FROM (
                SELECT type, COUNT(*) as count
                FROM security_events 
                WHERE timestamp >= start_time
                GROUP BY type
                ORDER BY count DESC
                LIMIT 10
            ) t
        ),
        'top_ips', (
            SELECT json_agg(json_build_object('ip', ip_address, 'count', count))
            FROM (
                SELECT ip_address, COUNT(*) as count
                FROM security_events 
                WHERE timestamp >= start_time
                GROUP BY ip_address
                ORDER BY count DESC
                LIMIT 10
            ) t
        ),
        'unacknowledged_alerts', (
            SELECT COUNT(*) FROM security_alerts 
            WHERE acknowledged = FALSE 
            AND triggered_at >= start_time
        ),
        'failed_logins', (
            SELECT COUNT(*) FROM failed_login_attempts 
            WHERE attempt_time >= start_time
        ),
        'active_sessions', (
            SELECT COUNT(*) FROM active_sessions 
            WHERE is_active = TRUE
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to Detect Suspicious Activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
    p_user_id UUID,
    p_ip_address INET,
    p_threshold INTEGER DEFAULT 5
)
RETURNS JSON AS $$
DECLARE
    failed_attempts INTEGER;
    unusual_location BOOLEAN := FALSE;
    concurrent_sessions INTEGER;
    result JSON;
BEGIN
    -- Check failed login attempts in last hour
    SELECT COUNT(*) INTO failed_attempts
    FROM failed_login_attempts
    WHERE ip_address = p_ip_address
    AND attempt_time >= NOW() - INTERVAL '1 hour';
    
    -- Check for unusual login location (if user_id provided)
    IF p_user_id IS NOT NULL THEN
        SELECT NOT EXISTS(
            SELECT 1 FROM security_events
            WHERE user_id = p_user_id
            AND type = 'login_success'
            AND ip_address = p_ip_address
            AND timestamp >= NOW() - INTERVAL '30 days'
        ) INTO unusual_location;
        
        -- Check concurrent sessions
        SELECT COUNT(DISTINCT ip_address) INTO concurrent_sessions
        FROM active_sessions
        WHERE user_id = p_user_id
        AND is_active = TRUE
        AND last_activity >= NOW() - INTERVAL '5 minutes';
    END IF;
    
    SELECT json_build_object(
        'suspicious', (
            failed_attempts >= p_threshold OR 
            unusual_location OR 
            concurrent_sessions > 2
        ),
        'reasons', json_build_array(
            CASE WHEN failed_attempts >= p_threshold 
                THEN 'multiple_failed_logins' 
                ELSE NULL END,
            CASE WHEN unusual_location 
                THEN 'unusual_location' 
                ELSE NULL END,
            CASE WHEN concurrent_sessions > 2 
                THEN 'concurrent_sessions' 
                ELSE NULL END
        ) - NULL, -- Remove null values
        'details', json_build_object(
            'failed_attempts', failed_attempts,
            'unusual_location', unusual_location,
            'concurrent_sessions', concurrent_sessions
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to Update Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_events_updated_at
    BEFORE UPDATE ON security_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_config_updated_at
    BEFORE UPDATE ON security_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_config ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read their own security events
CREATE POLICY "Users can view their own security events" ON security_events
    FOR SELECT USING (auth.uid() = user_id);

-- Only admins can view all security events
CREATE POLICY "Admins can view all security events" ON security_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Only admins can manage security alerts
CREATE POLICY "Admins can manage security alerts" ON security_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Only admins can view failed login attempts
CREATE POLICY "Admins can view failed login attempts" ON failed_login_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Users can view their own active sessions
CREATE POLICY "Users can view their own sessions" ON active_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Only admins can view all active sessions
CREATE POLICY "Admins can view all sessions" ON active_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Only admins can manage security config
CREATE POLICY "Admins can manage security config" ON security_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Insert Default Security Configuration
INSERT INTO security_config (key, value, description) VALUES
('failed_login_threshold', '5', 'Number of failed login attempts before triggering alert'),
('session_timeout_hours', '24', 'Session timeout in hours'),
('max_concurrent_sessions', '3', 'Maximum concurrent sessions per user'),
('alert_email_enabled', 'true', 'Enable email alerts for security events'),
('rate_limit_requests_per_minute', '60', 'Rate limit for API requests per minute'),
('password_reset_token_expiry_hours', '1', 'Password reset token expiry in hours'),
('account_lockout_duration_minutes', '30', 'Account lockout duration in minutes'),
('suspicious_activity_threshold', '3', 'Threshold for suspicious activity detection')
ON CONFLICT (key) DO NOTHING;

-- Create a scheduled job to cleanup old data (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-security-data', '0 2 * * *', 'SELECT cleanup_old_security_events();');

COMMENT ON TABLE security_events IS 'Comprehensive security event logging';
COMMENT ON TABLE security_alerts IS 'Security alerts triggered by events';
COMMENT ON TABLE failed_login_attempts IS 'Failed login attempt tracking';
COMMENT ON TABLE active_sessions IS 'Active user session tracking';
COMMENT ON TABLE security_config IS 'Security configuration parameters'; 