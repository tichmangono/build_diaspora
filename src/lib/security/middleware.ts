import { NextRequest } from 'next/server';
import { securityMonitor, SecurityEventType, SecuritySeverity } from './monitoring';
import { createClient } from '@/lib/supabase/server';

export interface AuthEventContext {
  email?: string;
  userId?: string;
  success: boolean;
  reason?: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Log authentication events for security monitoring
 */
export async function logAuthEvent(
  eventType: SecurityEventType,
  context: AuthEventContext,
  request?: NextRequest
): Promise<void> {
  try {
    const severity = context.success ? SecuritySeverity.LOW : SecuritySeverity.MEDIUM;
    
    const details = {
      email: context.email,
      success: context.success,
      reason: context.reason,
      timestamp: new Date().toISOString(),
      user_agent: context.userAgent || request?.headers.get('user-agent'),
      ip_address: context.ipAddress || getClientIP(request)
    };

    await securityMonitor.logEvent(
      eventType,
      severity,
      details,
      request,
      context.userId
    );

    // Additional monitoring for failed logins
    if (!context.success && eventType === SecurityEventType.LOGIN_FAILURE) {
      const ip = context.ipAddress || getClientIP(request);
      if (context.email && ip) {
        await securityMonitor.monitorFailedLogins(context.email, ip);
      }
    }

    // Monitor unusual activity for successful logins
    if (context.success && context.userId && eventType === SecurityEventType.LOGIN_SUCCESS) {
      const ip = context.ipAddress || getClientIP(request);
      const userAgent = context.userAgent || request?.headers.get('user-agent') || '';
      if (ip) {
        await securityMonitor.detectUnusualActivity(context.userId, ip, userAgent);
      }
    }
  } catch (error) {
    console.error('Failed to log authentication event:', error);
    // Don't throw - security logging should not break the main flow
  }
}

/**
 * Log data access events
 */
export async function logDataAccessEvent(
  userId: string,
  dataType: string,
  action: 'read' | 'write' | 'delete' | 'export',
  request?: NextRequest
): Promise<void> {
  try {
    let eventType: SecurityEventType;
    let severity: SecuritySeverity;

    switch (action) {
      case 'export':
        eventType = SecurityEventType.BULK_DATA_EXPORT;
        severity = SecuritySeverity.MEDIUM;
        break;
      case 'delete':
        eventType = SecurityEventType.SENSITIVE_DATA_ACCESS;
        severity = SecuritySeverity.HIGH;
        break;
      default:
        eventType = SecurityEventType.SENSITIVE_DATA_ACCESS;
        severity = SecuritySeverity.LOW;
    }

    const details = {
      data_type: dataType,
      action,
      timestamp: new Date().toISOString(),
      user_agent: request?.headers.get('user-agent'),
      ip_address: getClientIP(request)
    };

    await securityMonitor.logEvent(
      eventType,
      severity,
      details,
      request,
      userId
    );
  } catch (error) {
    console.error('Failed to log data access event:', error);
  }
}

/**
 * Log admin actions
 */
export async function logAdminAction(
  userId: string,
  action: string,
  targetUserId?: string,
  request?: NextRequest
): Promise<void> {
  try {
    const details = {
      action,
      target_user_id: targetUserId,
      timestamp: new Date().toISOString(),
      user_agent: request?.headers.get('user-agent'),
      ip_address: getClientIP(request)
    };

    await securityMonitor.logEvent(
      SecurityEventType.ADMIN_ACTION,
      SecuritySeverity.MEDIUM,
      details,
      request,
      userId
    );
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

/**
 * Log security violations
 */
export async function logSecurityViolation(
  eventType: SecurityEventType,
  details: Record<string, any>,
  request?: NextRequest,
  userId?: string
): Promise<void> {
  try {
    let severity: SecuritySeverity;

    switch (eventType) {
      case SecurityEventType.SQL_INJECTION_ATTEMPT:
      case SecurityEventType.XSS_ATTEMPT:
        severity = SecuritySeverity.CRITICAL;
        break;
      case SecurityEventType.CSP_VIOLATION:
      case SecurityEventType.INVALID_TOKEN:
        severity = SecuritySeverity.HIGH;
        break;
      case SecurityEventType.PERMISSION_DENIED:
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        severity = SecuritySeverity.MEDIUM;
        break;
      default:
        severity = SecuritySeverity.LOW;
    }

    const enhancedDetails = {
      ...details,
      timestamp: new Date().toISOString(),
      user_agent: request?.headers.get('user-agent'),
      ip_address: getClientIP(request),
      referer: request?.headers.get('referer')
    };

    await securityMonitor.logEvent(
      eventType,
      severity,
      enhancedDetails,
      request,
      userId
    );
  } catch (error) {
    console.error('Failed to log security violation:', error);
  }
}

/**
 * Rate limiting middleware
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  limit: number = 60,
  windowSeconds: number = 60,
  request?: NextRequest
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const ip = getClientIP(request);
    const rateLimitExceeded = await securityMonitor.monitorRateLimit(
      ip,
      endpoint,
      limit,
      windowSeconds
    );

    if (rateLimitExceeded) {
      await logSecurityViolation(
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        {
          endpoint,
          identifier,
          limit,
          window_seconds: windowSeconds
        },
        request
      );

      return { allowed: false, remaining: 0 };
    }

    // Calculate remaining requests (simplified)
    const remaining = Math.max(0, limit - 1);
    return { allowed: true, remaining };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Allow request if rate limiting fails
    return { allowed: true, remaining: limit };
  }
}

/**
 * Session tracking for concurrent session detection
 */
export async function trackSession(
  userId: string,
  sessionToken: string,
  request?: NextRequest
): Promise<void> {
  try {
    const supabase = await createClient();
    const ip = getClientIP(request);
    const userAgent = request?.headers.get('user-agent') || '';

    // Store active session
    await supabase.from('active_sessions').insert({
      user_id: userId,
      session_token: sessionToken,
      ip_address: ip,
      user_agent: userAgent,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });

    // Check for concurrent sessions
    await securityMonitor.detectUnusualActivity(userId, ip, userAgent);
  } catch (error) {
    console.error('Failed to track session:', error);
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Deactivate expired sessions
    await supabase
      .from('active_sessions')
      .update({ is_active: false })
      .lt('expires_at', new Date().toISOString())
      .eq('is_active', true);
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
  }
}

/**
 * Extract client IP from request
 */
function getClientIP(request?: NextRequest): string {
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

/**
 * Validate request for potential security threats
 */
export async function validateRequest(request: NextRequest): Promise<{
  isValid: boolean;
  threats: string[];
}> {
  const threats: string[] = [];
  
  try {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
      /(UNION\s+SELECT)/i,
      /(\b(OR|AND)\s+1\s*=\s*1)/i,
      /(--|\#|\/\*)/
    ];
    
    const searchParams = url.searchParams.toString();
    for (const pattern of sqlPatterns) {
      if (pattern.test(searchParams)) {
        threats.push('sql_injection');
        await logSecurityViolation(
          SecurityEventType.SQL_INJECTION_ATTEMPT,
          {
            url: url.toString(),
            query_params: searchParams,
            pattern: pattern.toString()
          },
          request
        );
        break;
      }
    }
    
    // Check for XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>.*?<\/iframe>/gi
    ];
    
    for (const pattern of xssPatterns) {
      if (pattern.test(searchParams)) {
        threats.push('xss_attempt');
        await logSecurityViolation(
          SecurityEventType.XSS_ATTEMPT,
          {
            url: url.toString(),
            query_params: searchParams,
            pattern: pattern.toString()
          },
          request
        );
        break;
      }
    }
    
    // Check for suspicious user agents
    const suspiciousAgents = [
      /bot/i,
      /crawler/i,
      /scanner/i,
      /sqlmap/i,
      /nikto/i
    ];
    
    for (const pattern of suspiciousAgents) {
      if (pattern.test(userAgent)) {
        threats.push('suspicious_user_agent');
        await logSecurityViolation(
          SecurityEventType.SYSTEM_ERROR,
          {
            user_agent: userAgent,
            reason: 'suspicious_user_agent'
          },
          request
        );
        break;
      }
    }
    
    return {
      isValid: threats.length === 0,
      threats
    };
  } catch (error) {
    console.error('Request validation failed:', error);
    return { isValid: true, threats: [] };
  }
} 