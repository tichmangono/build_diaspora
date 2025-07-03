# Security Monitoring & Logging System

## Overview

The BuildDiaspora Zimbabwe security monitoring system provides comprehensive real-time security event logging, threat detection, and alerting capabilities. This system is designed to meet enterprise-grade security requirements and compliance standards.

## Features

### 🔒 Security Event Logging
- **Authentication Events**: Login success/failure, password resets, account lockouts
- **Data Access Events**: Sensitive data access, bulk exports, admin actions
- **Security Violations**: CSP violations, injection attempts, permission denials
- **System Events**: Rate limiting, file upload violations, system errors

### 🚨 Threat Detection
- **Failed Login Monitoring**: Brute force attack detection
- **Unusual Activity Detection**: New location logins, concurrent sessions
- **Rate Limiting**: API endpoint protection with configurable limits
- **Request Validation**: SQL injection and XSS attempt detection

### 📊 Real-time Dashboard
- **Security Statistics**: Event counts by type and severity
- **Alert Management**: Unacknowledged alerts with one-click acknowledgment
- **IP Address Tracking**: Top source IPs with event counts
- **Event Timeline**: Recent security events with filtering

### 🔔 Automated Alerting
- **Severity-based Alerts**: Automatic alerts for high/critical events
- **Threshold Monitoring**: Configurable thresholds for various events
- **Alert Acknowledgment**: Track alert handling by administrators

## Architecture

### Core Components

1. **SecurityMonitor Class** (`src/lib/security/monitoring.ts`)
   - Singleton pattern for centralized security monitoring
   - Event logging with automatic alert generation
   - Statistical analysis and reporting

2. **Security Middleware** (`src/lib/security/middleware.ts`)
   - Authentication event logging
   - Request validation and threat detection
   - Rate limiting and session tracking

3. **Database Schema** (`docs/database/05_security_monitoring.sql`)
   - Security events table with full event details
   - Security alerts table with acknowledgment tracking
   - Failed login attempts for performance optimization
   - Active sessions for concurrent session detection

4. **Dashboard Interface** (`src/components/security/SecurityDashboard.tsx`)
   - Real-time security monitoring interface
   - Admin-only access with role-based permissions
   - Interactive charts and statistics

## Security Event Types

### Authentication Events
- `LOGIN_SUCCESS`: Successful user login
- `LOGIN_FAILURE`: Failed login attempt
- `LOGOUT`: User logout
- `PASSWORD_RESET_REQUEST`: Password reset initiated
- `PASSWORD_RESET_SUCCESS`: Password reset completed
- `ACCOUNT_LOCKED`: Account locked due to security policy

### Suspicious Activity
- `MULTIPLE_FAILED_LOGINS`: Brute force attack detected
- `UNUSUAL_LOGIN_LOCATION`: Login from new IP address
- `CONCURRENT_SESSIONS`: Multiple active sessions detected
- `RAPID_REQUESTS`: Rate limiting threshold exceeded

### Data Access
- `SENSITIVE_DATA_ACCESS`: Access to sensitive user data
- `BULK_DATA_EXPORT`: Large data export operation
- `ADMIN_ACTION`: Administrative action performed

### Security Violations
- `CSP_VIOLATION`: Content Security Policy violation
- `INVALID_TOKEN`: Invalid authentication token used
- `PERMISSION_DENIED`: Unauthorized access attempt
- `SQL_INJECTION_ATTEMPT`: SQL injection attack detected
- `XSS_ATTEMPT`: Cross-site scripting attack detected

### System Events
- `SYSTEM_ERROR`: System-level error occurred
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded
- `FILE_UPLOAD_VIOLATION`: Malicious file upload detected

## Severity Levels

- **CRITICAL**: Immediate attention required (SQL injection, XSS attempts)
- **HIGH**: Urgent security concern (multiple failed logins, CSP violations)
- **MEDIUM**: Moderate security event (unusual activity, permission denials)
- **LOW**: Informational event (successful logins, normal data access)

## Implementation Guide

### 1. Database Setup

Run the security monitoring schema:

```sql
-- Execute the security monitoring schema
\i docs/database/05_security_monitoring.sql
```

### 2. Environment Configuration

Add security configuration to your environment:

```env
# Security monitoring settings
SECURITY_ALERT_EMAIL=security@builddiaspora.zw
SECURITY_WEBHOOK_URL=https://hooks.slack.com/your-webhook
FAILED_LOGIN_THRESHOLD=5
RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

### 3. Integration Examples

#### Authentication Event Logging

```typescript
import { logAuthEvent, SecurityEventType } from '@/lib/security/middleware';

// Log successful login
await logAuthEvent(
  SecurityEventType.LOGIN_SUCCESS,
  {
    email: user.email,
    userId: user.id,
    success: true
  },
  request
);

// Log failed login
await logAuthEvent(
  SecurityEventType.LOGIN_FAILURE,
  {
    email: attemptedEmail,
    success: false,
    reason: 'invalid_password'
  },
  request
);
```

#### Data Access Logging

```typescript
import { logDataAccessEvent } from '@/lib/security/middleware';

// Log data export
await logDataAccessEvent(
  userId,
  'user_profiles',
  'export',
  request
);
```

#### Security Violation Logging

```typescript
import { logSecurityViolation, SecurityEventType } from '@/lib/security/middleware';

// Log CSP violation
await logSecurityViolation(
  SecurityEventType.CSP_VIOLATION,
  {
    violated_directive: 'script-src',
    blocked_uri: 'https://malicious-site.com/script.js',
    document_uri: request.url
  },
  request
);
```

### 4. Rate Limiting

```typescript
import { checkRateLimit } from '@/lib/security/middleware';

// Check rate limit before processing request
const { allowed, remaining } = await checkRateLimit(
  userEmail,
  '/api/auth/login',
  5, // 5 requests
  300, // per 5 minutes
  request
);

if (!allowed) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  );
}
```

## API Endpoints

### Security Statistics
```
GET /api/security/stats?timeframe=24h
```
Returns security statistics for the specified timeframe.

### Security Events
```
GET /api/security/events?limit=50&timeframe=7d&severity=high
```
Returns filtered security events.

### Security Alerts
```
GET /api/security/alerts?acknowledged=false
```
Returns unacknowledged security alerts.

### Acknowledge Alert
```
POST /api/security/alerts/{id}/acknowledge
```
Acknowledges a security alert.

## Dashboard Access

The security dashboard is available at `/admin/security` and requires admin role access:

- Real-time security statistics
- Unacknowledged alerts management
- Event filtering and search
- IP address analysis
- Event type distribution

## Monitoring Best Practices

### 1. Regular Review
- Review security alerts daily
- Analyze security trends weekly
- Conduct security audits monthly

### 2. Alert Configuration
- Set appropriate thresholds for your environment
- Configure notification channels (email, Slack, PagerDuty)
- Test alert systems regularly

### 3. Incident Response
- Document security incident procedures
- Train staff on alert acknowledgment
- Maintain incident response playbooks

### 4. Data Retention
- Configure appropriate data retention periods
- Archive old security events
- Comply with regulatory requirements

## Security Considerations

### Data Protection
- Security events contain sensitive information
- Implement proper access controls
- Encrypt sensitive event data
- Follow data retention policies

### Performance
- Monitor database performance with high event volumes
- Use database indexes for efficient querying
- Consider event aggregation for long-term storage

### Compliance
- Meets GDPR audit trail requirements
- Supports SOC 2 compliance
- Provides forensic investigation capabilities

## Troubleshooting

### Common Issues

1. **High Event Volume**
   - Check for automated attacks
   - Adjust rate limiting thresholds
   - Optimize database queries

2. **Missing Events**
   - Verify middleware integration
   - Check error logs for logging failures
   - Ensure proper authentication

3. **False Positives**
   - Review detection patterns
   - Adjust sensitivity thresholds
   - Whitelist legitimate traffic

### Performance Monitoring

Monitor these metrics:
- Event ingestion rate
- Database query performance
- Alert response times
- Dashboard load times

## Future Enhancements

### Planned Features
- Machine learning-based anomaly detection
- Integration with external SIEM systems
- Advanced threat intelligence feeds
- Automated incident response workflows

### Scalability Improvements
- Event streaming with Apache Kafka
- Distributed logging with Elasticsearch
- Real-time analytics with Apache Spark
- Microservices architecture

## Support

For security monitoring support:
- Create GitHub issues for bugs
- Submit feature requests via GitHub discussions
- Contact security team for urgent issues
- Review security documentation regularly

---

**Note**: This security monitoring system is designed for production use and should be regularly updated to address new security threats and vulnerabilities. 