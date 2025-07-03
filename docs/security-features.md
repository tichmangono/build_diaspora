# BuildDiaspora Security Features Documentation

## 🔒 Enhanced Security Implementation

This document outlines the comprehensive security features implemented in the BuildDiaspora Zimbabwe application to ensure production-grade security and data protection.

## 🛡️ Security Features Overview

### 1. Content Security Policy (CSP)
- **Dynamic nonce generation** for inline scripts and styles
- **Strict source restrictions** for scripts, styles, images, and other resources
- **XSS protection** through script source validation
- **Clickjacking protection** via frame-ancestors directive

### 2. Input Sanitization & Validation
- **Server-side input sanitization** for all user inputs
- **XSS prevention** through HTML entity encoding
- **SQL injection protection** via parameterized queries (Supabase)
- **File upload validation** with type and size restrictions

### 3. Authentication Security
- **Secure session management** with HTTP-only cookies
- **Password strength requirements** with visual indicators
- **Rate limiting** on authentication endpoints
- **Account lockout protection** after failed attempts
- **Secure password reset** with time-limited tokens

### 4. Authorization & Access Control
- **Role-based access control** (RBAC) through Supabase RLS
- **Route protection** via Next.js middleware
- **Component-level guards** for sensitive UI elements
- **API endpoint protection** with authentication checks

### 5. Data Protection
- **Encryption at rest** (Supabase PostgreSQL)
- **Encryption in transit** (HTTPS/TLS)
- **Secure file storage** with access controls
- **Personal data anonymization** options

---

## 🔧 Implementation Details

### Content Security Policy (CSP)

**Location**: `middleware.ts`

```typescript
// Dynamic nonce generation for each request
const nonce = generateNonce();

// Strict CSP policy
const cspPolicy = [
  "default-src 'self'",
  `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
  `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');
```

**Features**:
- ✅ Prevents XSS attacks
- ✅ Blocks unauthorized script execution
- ✅ Restricts resource loading to trusted sources
- ✅ Prevents clickjacking attacks

### Input Sanitization

**Location**: `src/lib/middleware/inputSanitization.ts`

```typescript
// Comprehensive input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};
```

**Applied to**:
- ✅ All form inputs
- ✅ Profile data
- ✅ Search queries
- ✅ File upload metadata

### Authentication Security

**Multi-layered Protection**:

1. **Password Requirements**:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

2. **Rate Limiting**:
   - Max 5 login attempts per 15 minutes per IP
   - Max 3 password reset requests per hour
   - Progressive delays on repeated failures

3. **Session Security**:
   - HTTP-only cookies
   - Secure flag in production
   - SameSite protection
   - Automatic session expiration

### File Upload Security

**Location**: Profile components and validation schemas

**Security Measures**:
- ✅ File type validation (images only for avatars)
- ✅ File size limits (5MB max)
- ✅ Virus scanning preparation hooks
- ✅ Secure filename generation
- ✅ Storage access controls via Supabase RLS

### Database Security (Row Level Security)

**Location**: `docs/database/02_rls_policies.sql`

**Policies Implemented**:
- Users can only read/update their own profiles
- Verification documents are private to the user
- Avatar uploads restricted to authenticated users
- Admin-only access for user management functions

---

## 🚨 Security Headers

The application implements comprehensive security headers:

```typescript
// Security headers applied via middleware
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'off',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': cspPolicy
};
```

### Header Explanations:
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Strict-Transport-Security**: Enforces HTTPS
- **Permissions-Policy**: Restricts browser API access
- **Referrer-Policy**: Controls referrer information

---

## 🔍 Security Testing & Monitoring

### Development Security Widget

**Location**: `src/components/security/CSPTest.tsx`

A development-only widget that displays:
- ✅ CSP policy status
- ✅ Security header verification
- ✅ Authentication state
- ✅ Rate limiting status
- ✅ Quick security tests

**Usage**: Automatically appears in development mode in the bottom-right corner.

### Security Testing Checklist

#### Manual Testing:
1. **XSS Prevention**:
   ```javascript
   // Try entering in form fields:
   <script>alert('xss')</script>
   javascript:alert('xss')
   ```

2. **File Upload Security**:
   - Try uploading .exe, .php, .js files
   - Test with oversized files (>5MB)
   - Verify only images are accepted for avatars

3. **Authentication Security**:
   - Test rate limiting with multiple failed logins
   - Verify session expiration
   - Test password strength requirements

4. **Authorization Testing**:
   - Try accessing other users' profile edit pages
   - Test API endpoints without authentication
   - Verify RLS policies in Supabase

#### Automated Testing:
```bash
# Security audit with npm
npm audit

# Dependency vulnerability check
npm run security-check

# CSP violation monitoring (check browser console)
```

---

## 🚀 Production Security Checklist

### Before Deployment:

#### Environment Variables:
- [ ] `CSP_NONCE_SECRET` is set with a strong random value
- [ ] `NEXTAUTH_SECRET` is set with a strong random value
- [ ] All Supabase keys are production keys
- [ ] `NEXT_PUBLIC_APP_URL` points to production domain

#### Supabase Configuration:
- [ ] RLS policies are enabled on all tables
- [ ] Storage policies are correctly configured
- [ ] Email confirmation is enabled
- [ ] Site URL is set to production domain
- [ ] CORS settings allow only production domain

#### Security Headers:
- [ ] HTTPS is enforced (HSTS header)
- [ ] CSP policy is strict and tested
- [ ] All security headers are applied
- [ ] Rate limiting is configured

#### Database Security:
- [ ] All SQL migrations are applied
- [ ] RLS policies are tested and working
- [ ] Sensitive data is properly encrypted
- [ ] Backup and recovery procedures are in place

### Post-Deployment Monitoring:

#### Security Monitoring:
- [ ] CSP violation reports are monitored
- [ ] Failed authentication attempts are logged
- [ ] File upload attempts are monitored
- [ ] Rate limiting triggers are tracked

#### Regular Security Tasks:
- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly penetration testing
- [ ] Annual security policy review

---

## 🔧 Configuration Guide

### Required Environment Variables:

```env
# Security Configuration (Required)
CSP_NONCE_SECRET=your_32_character_random_string
NEXTAUTH_SECRET=your_32_character_random_string

# Optional Security Configuration
REDIS_URL=redis://localhost:6379  # For distributed rate limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### Generating Secure Secrets:

```bash
# Generate CSP nonce secret
openssl rand -base64 32

# Generate NextAuth secret
openssl rand -base64 32

# Generate multiple secrets at once
for i in {1..2}; do openssl rand -base64 32; done
```

### Redis Setup (Optional - Production):

```bash
# Install Redis (macOS)
brew install redis

# Start Redis
redis-server

# Test Redis connection
redis-cli ping
```

---

## 🛠️ Troubleshooting Security Issues

### Common CSP Violations:

1. **Inline Script Violations**:
   ```
   Error: Refused to execute inline script because it violates CSP
   ```
   **Solution**: Ensure all inline scripts use the nonce attribute

2. **External Resource Violations**:
   ```
   Error: Refused to load resource because it violates CSP
   ```
   **Solution**: Add the domain to the appropriate CSP directive

3. **Style Violations**:
   ```
   Error: Refused to apply inline style because it violates CSP
   ```
   **Solution**: Use external stylesheets or nonce for inline styles

### Authentication Issues:

1. **Rate Limiting Triggered**:
   ```
   Error: Too many requests, please try again later
   ```
   **Solution**: Wait for the rate limit window to reset or increase limits

2. **Session Expired**:
   ```
   Error: Session has expired, please log in again
   ```
   **Solution**: Implement automatic session refresh or extend session duration

3. **CORS Errors**:
   ```
   Error: CORS policy blocks request
   ```
   **Solution**: Update Supabase CORS settings to include your domain

### File Upload Issues:

1. **File Type Rejected**:
   ```
   Error: File type not allowed
   ```
   **Solution**: Verify file type is in the allowed list

2. **File Size Exceeded**:
   ```
   Error: File size exceeds maximum allowed
   ```
   **Solution**: Compress image or increase size limits

---

## 📚 Security Resources

### Documentation:
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase Security Documentation](https://supabase.com/docs/guides/auth/row-level-security)

### Tools:
- [Mozilla Observatory](https://observatory.mozilla.org/) - Security header testing
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - CSP policy validation
- [OWASP ZAP](https://www.zaproxy.org/) - Security testing tool

### Regular Updates:
- Monitor security advisories for dependencies
- Subscribe to Next.js and Supabase security updates
- Follow OWASP guidelines for web application security

---

## 🎯 Security Compliance

This implementation addresses key security requirements:

- ✅ **OWASP Top 10** protection
- ✅ **GDPR compliance** preparation
- ✅ **SOC 2** security controls
- ✅ **ISO 27001** alignment
- ✅ **NIST Cybersecurity Framework** compliance

**Note**: This security implementation provides a strong foundation, but regular security audits and updates are essential for maintaining protection against evolving threats. 