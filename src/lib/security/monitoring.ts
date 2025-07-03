import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  user_id?: string;
  ip_address: string;
  user_agent: string;
  details: Record<string, any>;
  timestamp: string;
  resolved: boolean;
  resolution_notes?: string;
}

export enum SecurityEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  ACCOUNT_LOCKED = 'account_locked',
  
  // Suspicious Activity
  MULTIPLE_FAILED_LOGINS = 'multiple_failed_logins',
  UNUSUAL_LOGIN_LOCATION = 'unusual_login_location',
  CONCURRENT_SESSIONS = 'concurrent_sessions',
  RAPID_REQUESTS = 'rapid_requests',
  
  // Data Access
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  BULK_DATA_EXPORT = 'bulk_data_export',
  ADMIN_ACTION = 'admin_action',
  
  // Security Violations
  CSP_VIOLATION = 'csp_violation',
  INVALID_TOKEN = 'invalid_token',
  PERMISSION_DENIED = 'permission_denied',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  
  // System Events
  SYSTEM_ERROR = 'system_error',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  FILE_UPLOAD_VIOLATION = 'file_upload_violation'
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface SecurityAlert {
  id: string;
  event_id: string;
  alert_type: string;
  message: string;
  severity: SecuritySeverity;
  triggered_at: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
}

export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private supabase: any;
  
  private constructor() {
    this.supabase = createClient();
  }
  
  public static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }
  
  /**
   * Log a security event
   */
  async logEvent(
    type: SecurityEventType,
    severity: SecuritySeverity,
    details: Record<string, any>,
    request?: Request,
    userId?: string
  ): Promise<SecurityEvent> {
    const event: SecurityEvent = {
      id: uuidv4(),
      type,
      severity,
      user_id: userId,
      ip_address: this.getClientIP(request),
      user_agent: request?.headers.get('user-agent') || 'unknown',
      details,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    try {
      // Store in database
      await this.supabase
        .from('security_events')
        .insert(event);
      
      // Check if this event should trigger an alert
      await this.checkForAlerts(event);
      
      return event;
    } catch (error) {
      console.error('Failed to log security event:', error);
      throw error;
    }
  }
  
  /**
   * Monitor failed login attempts
   */
  async monitorFailedLogins(email: string, ip: string): Promise<void> {
    const oneHour = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    try {
      // Count failed attempts in the last hour
      const { data: failedAttempts, error } = await this.supabase
        .from('security_events')
        .select('*')
        .eq('type', SecurityEventType.LOGIN_FAILURE)
        .eq('ip_address', ip)
        .gte('timestamp', oneHour);
      
      if (error) throw error;
      
      const attemptCount = failedAttempts?.length || 0;
      
      // Trigger alert if too many failed attempts
      if (attemptCount >= 5) {
        await this.logEvent(
          SecurityEventType.MULTIPLE_FAILED_LOGINS,
          SecuritySeverity.HIGH,
          {
            email,
            attempt_count: attemptCount,
            time_window: '1 hour'
          }
        );
      }
    } catch (error) {
      console.error('Failed to monitor login attempts:', error);
    }
  }
  
  /**
   * Detect unusual login patterns
   */
  async detectUnusualActivity(userId: string, ip: string, userAgent: string): Promise<void> {
    try {
      // Check for logins from new locations
      const { data: recentLogins } = await this.supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .eq('type', SecurityEventType.LOGIN_SUCCESS)
        .neq('ip_address', ip)
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .limit(10);
      
      // If this is a new IP for this user
      const isNewLocation = !recentLogins?.some(login => 
        login.ip_address === ip
      );
      
      if (isNewLocation && recentLogins && recentLogins.length > 0) {
        await this.logEvent(
          SecurityEventType.UNUSUAL_LOGIN_LOCATION,
          SecuritySeverity.MEDIUM,
          {
            new_ip: ip,
            user_agent: userAgent,
            previous_ips: recentLogins.map(l => l.ip_address)
          },
          undefined,
          userId
        );
      }
      
      // Check for concurrent sessions
      await this.checkConcurrentSessions(userId, ip);
      
    } catch (error) {
      console.error('Failed to detect unusual activity:', error);
    }
  }
  
  /**
   * Check for concurrent sessions
   */
  private async checkConcurrentSessions(userId: string, currentIp: string): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    try {
      const { data: recentSessions } = await this.supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .eq('type', SecurityEventType.LOGIN_SUCCESS)
        .gte('timestamp', fiveMinutesAgo);
      
      const uniqueIPs = new Set(recentSessions?.map(s => s.ip_address) || []);
      
      if (uniqueIPs.size > 2) { // More than 2 different IPs in 5 minutes
        await this.logEvent(
          SecurityEventType.CONCURRENT_SESSIONS,
          SecuritySeverity.MEDIUM,
          {
            concurrent_ips: Array.from(uniqueIPs),
            session_count: uniqueIPs.size
          },
          undefined,
          userId
        );
      }
    } catch (error) {
      console.error('Failed to check concurrent sessions:', error);
    }
  }
  
  /**
   * Monitor rate limiting violations
   */
  async monitorRateLimit(ip: string, endpoint: string, limit: number, window: number): Promise<boolean> {
    const windowStart = new Date(Date.now() - window * 1000).toISOString();
    
    try {
      const { data: requests } = await this.supabase
        .from('security_events')
        .select('*')
        .eq('ip_address', ip)
        .eq('type', SecurityEventType.RAPID_REQUESTS)
        .gte('timestamp', windowStart);
      
      const requestCount = requests?.length || 0;
      
      if (requestCount >= limit) {
        await this.logEvent(
          SecurityEventType.RATE_LIMIT_EXCEEDED,
          SecuritySeverity.MEDIUM,
          {
            endpoint,
            request_count: requestCount,
            limit,
            window_seconds: window
          }
        );
        
        return true; // Rate limit exceeded
      }
      
      // Log this request
      await this.logEvent(
        SecurityEventType.RAPID_REQUESTS,
        SecuritySeverity.LOW,
        { endpoint },
        undefined
      );
      
      return false;
    } catch (error) {
      console.error('Failed to monitor rate limit:', error);
      return false;
    }
  }
  
  /**
   * Check for alerts based on event patterns
   */
  private async checkForAlerts(event: SecurityEvent): Promise<void> {
    const alerts: SecurityAlert[] = [];
    
    // Critical events always trigger alerts
    if (event.severity === SecuritySeverity.CRITICAL) {
      alerts.push({
        id: uuidv4(),
        event_id: event.id,
        alert_type: 'critical_security_event',
        message: `Critical security event: ${event.type}`,
        severity: SecuritySeverity.CRITICAL,
        triggered_at: new Date().toISOString(),
        acknowledged: false
      });
    }
    
    // Multiple failed logins
    if (event.type === SecurityEventType.MULTIPLE_FAILED_LOGINS) {
      alerts.push({
        id: uuidv4(),
        event_id: event.id,
        alert_type: 'brute_force_attack',
        message: `Potential brute force attack detected from IP: ${event.ip_address}`,
        severity: SecuritySeverity.HIGH,
        triggered_at: new Date().toISOString(),
        acknowledged: false
      });
    }
    
    // Store alerts
    if (alerts.length > 0) {
      await this.supabase
        .from('security_alerts')
        .insert(alerts);
      
      // Send notifications for high/critical alerts
      for (const alert of alerts) {
        if (alert.severity === SecuritySeverity.HIGH || alert.severity === SecuritySeverity.CRITICAL) {
          await this.sendSecurityAlert(alert);
        }
      }
    }
  }
  
  /**
   * Send security alert notification
   */
  private async sendSecurityAlert(alert: SecurityAlert): Promise<void> {
    // In production, integrate with email service, Slack, PagerDuty, etc.
    console.warn('SECURITY ALERT:', {
      type: alert.alert_type,
      message: alert.message,
      severity: alert.severity,
      timestamp: alert.triggered_at
    });
    
    // TODO: Implement actual notification system
    // - Email to security team
    // - Slack webhook
    // - PagerDuty integration
    // - SMS for critical alerts
  }
  
  /**
   * Get security events with filtering
   */
  async getEvents(filters: {
    type?: SecurityEventType;
    severity?: SecuritySeverity;
    userId?: string;
    ipAddress?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}): Promise<SecurityEvent[]> {
    try {
      let query = this.supabase
        .from('security_events')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.severity) query = query.eq('severity', filters.severity);
      if (filters.userId) query = query.eq('user_id', filters.userId);
      if (filters.ipAddress) query = query.eq('ip_address', filters.ipAddress);
      if (filters.startDate) query = query.gte('timestamp', filters.startDate);
      if (filters.endDate) query = query.lte('timestamp', filters.endDate);
      if (filters.limit) query = query.limit(filters.limit);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to get security events:', error);
      return [];
    }
  }
  
  /**
   * Get security alerts
   */
  async getAlerts(acknowledged: boolean = false): Promise<SecurityAlert[]> {
    try {
      const { data, error } = await this.supabase
        .from('security_alerts')
        .select('*')
        .eq('acknowledged', acknowledged)
        .order('triggered_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to get security alerts:', error);
      return [];
    }
  }
  
  /**
   * Acknowledge a security alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    try {
      await this.supabase
        .from('security_alerts')
        .update({
          acknowledged: true,
          acknowledged_by: acknowledgedBy,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      throw error;
    }
  }
  
  /**
   * Get security statistics
   */
  async getSecurityStats(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topIPs: Array<{ ip: string; count: number }>;
    alertCount: number;
    unacknowledgedAlerts: number;
  }> {
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }
    
    try {
      // Get events in timeframe
      const { data: events } = await this.supabase
        .from('security_events')
        .select('*')
        .gte('timestamp', startDate.toISOString());
      
      // Get alerts
      const { data: alerts } = await this.supabase
        .from('security_alerts')
        .select('*')
        .gte('triggered_at', startDate.toISOString());
      
      const eventsByType: Record<string, number> = {};
      const eventsBySeverity: Record<string, number> = {};
      const ipCounts: Record<string, number> = {};
      
      (events || []).forEach(event => {
        // Count by type
        eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
        
        // Count by severity
        eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
        
        // Count by IP
        ipCounts[event.ip_address] = (ipCounts[event.ip_address] || 0) + 1;
      });
      
      // Top IPs
      const topIPs = Object.entries(ipCounts)
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      const unacknowledgedAlerts = (alerts || []).filter(a => !a.acknowledged).length;
      
      return {
        totalEvents: events?.length || 0,
        eventsByType,
        eventsBySeverity,
        topIPs,
        alertCount: alerts?.length || 0,
        unacknowledgedAlerts
      };
    } catch (error) {
      console.error('Failed to get security stats:', error);
      return {
        totalEvents: 0,
        eventsByType: {},
        eventsBySeverity: {},
        topIPs: [],
        alertCount: 0,
        unacknowledgedAlerts: 0
      };
    }
  }
  
  /**
   * Extract client IP from request
   */
  private getClientIP(request?: Request): string {
    if (!request) return 'unknown';
    
    // Check various headers for real IP
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const xRealIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    if (cfConnectingIP) return cfConnectingIP;
    if (xRealIP) return xRealIP;
    if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
    
    return 'unknown';
  }
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance(); 