# Environment Configuration & Secrets Management

## Overview

This document provides comprehensive guidance for configuring environment variables, managing secrets, and setting up different deployment environments for the BuildDiaspora Zimbabwe platform.

## Environment Variables Structure

### Core Configuration Categories

1. **Database & Authentication** - Supabase configuration
2. **Email Services** - Multi-provider email setup
3. **Security** - Encryption keys and security settings
4. **Application** - General app configuration
5. **Monitoring** - Logging and analytics
6. **Storage** - File upload and storage settings

## Production Environment Template

### `.env.production`

```bash
# =============================================================================
# BUILDDIASPORA ZIMBABWE - PRODUCTION ENVIRONMENT CONFIGURATION
# =============================================================================
# 
# SECURITY NOTICE:
# - Never commit this file to version control
# - Use secure secret management systems in production
# - Rotate secrets regularly
# - Use strong, unique passwords and keys
#
# =============================================================================

# -----------------------------------------------------------------------------
# APPLICATION CONFIGURATION
# -----------------------------------------------------------------------------
NODE_ENV=production
NEXT_PUBLIC_APP_NAME="BuildDiaspora Zimbabwe"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_SITE_URL=https://builddiaspora.zw
NEXT_PUBLIC_API_URL=https://builddiaspora.zw/api

# -----------------------------------------------------------------------------
# SUPABASE CONFIGURATION
# -----------------------------------------------------------------------------
# Get these from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-here

# Database connection (if using direct PostgreSQL access)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# -----------------------------------------------------------------------------
# EMAIL SERVICE CONFIGURATION
# -----------------------------------------------------------------------------

# Primary Email Provider (SMTP)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=noreply@builddiaspora.zw
SMTP_PASSWORD=your-smtp-password

# Fallback Email Providers
# Resend (Fallback 1)
RESEND_API_KEY=re_your_resend_api_key

# SendGrid (Fallback 2)
SENDGRID_API_KEY=SG.your_sendgrid_api_key

# AWS SES (Fallback 3)
AWS_SES_ACCESS_KEY_ID=AKIA...
AWS_SES_SECRET_ACCESS_KEY=your-aws-secret
AWS_SES_REGION=us-east-1

# Email Configuration
EMAIL_FROM_NAME="BuildDiaspora Zimbabwe"
EMAIL_FROM_ADDRESS=noreply@builddiaspora.zw
EMAIL_REPLY_TO=support@builddiaspora.zw

# -----------------------------------------------------------------------------
# SECURITY CONFIGURATION
# -----------------------------------------------------------------------------

# Encryption Keys (Generate with: openssl rand -base64 32)
ENCRYPTION_KEY=your-32-character-encryption-key-here
SESSION_SECRET=your-session-secret-key-here
JWT_SECRET=your-jwt-secret-key-here

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REDIS_URL=redis://localhost:6379

# Security Headers
SECURITY_HEADERS_ENABLED=true
CORS_ORIGIN=https://builddiaspora.zw

# -----------------------------------------------------------------------------
# FILE STORAGE CONFIGURATION
# -----------------------------------------------------------------------------

# Supabase Storage
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage/v1
STORAGE_BUCKET_NAME=verification-documents
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,webp,doc,docx

# File Security
ENABLE_VIRUS_SCANNING=true
VIRUS_SCANNING_API_KEY=your-virus-scanning-api-key

# -----------------------------------------------------------------------------
# MONITORING & ANALYTICS
# -----------------------------------------------------------------------------

# Application Monitoring
MONITORING_ENABLED=true
LOG_LEVEL=error
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Analytics
ANALYTICS_ENABLED=true
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VERCEL_ANALYTICS_ID=your-vercel-analytics-id

# Performance Monitoring
PERFORMANCE_MONITORING=true
LIGHTHOUSE_CI_TOKEN=your-lighthouse-token

# -----------------------------------------------------------------------------
# THIRD-PARTY INTEGRATIONS
# -----------------------------------------------------------------------------

# Social Login (Future)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Payment Processing (Future)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# -----------------------------------------------------------------------------
# COMPLIANCE & PRIVACY
# -----------------------------------------------------------------------------

# GDPR Configuration
GDPR_ENABLED=true
DATA_RETENTION_DAYS=2555  # 7 years
COOKIE_CONSENT_REQUIRED=true

# Privacy Settings
PRIVACY_POLICY_URL=https://builddiaspora.zw/privacy
TERMS_OF_SERVICE_URL=https://builddiaspora.zw/terms
COOKIE_POLICY_URL=https://builddiaspora.zw/cookies

# -----------------------------------------------------------------------------
# FEATURE FLAGS
# -----------------------------------------------------------------------------

# Core Features
FEATURE_EMAIL_VERIFICATION=true
FEATURE_PROFESSIONAL_VERIFICATION=true
FEATURE_ADMIN_PANEL=true
FEATURE_FILE_UPLOAD=true

# Beta Features
FEATURE_SOCIAL_LOGIN=false
FEATURE_MOBILE_APP=false
FEATURE_API_ACCESS=false
FEATURE_PREMIUM_FEATURES=false

# -----------------------------------------------------------------------------
# BACKUP & DISASTER RECOVERY
# -----------------------------------------------------------------------------

# Database Backups
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=builddiaspora-backups
BACKUP_S3_REGION=us-east-1

# -----------------------------------------------------------------------------
# DEVELOPMENT TOOLS (Production: Disabled)
# -----------------------------------------------------------------------------

# Debug Settings
DEBUG_MODE=false
VERBOSE_LOGGING=false
ENABLE_DEV_TOOLS=false

# Testing
ENABLE_TEST_ENDPOINTS=false
MOCK_EMAIL_SERVICE=false
```

## Development Environment Template

### `.env.local`

```bash
# =============================================================================
# BUILDDIASPORA ZIMBABWE - DEVELOPMENT ENVIRONMENT CONFIGURATION
# =============================================================================

# -----------------------------------------------------------------------------
# APPLICATION CONFIGURATION
# -----------------------------------------------------------------------------
NODE_ENV=development
NEXT_PUBLIC_APP_NAME="BuildDiaspora Zimbabwe (Dev)"
NEXT_PUBLIC_APP_VERSION="1.0.0-dev"
NEXT_PUBLIC_SITE_URL=http://localhost:3003
NEXT_PUBLIC_API_URL=http://localhost:3003/api

# -----------------------------------------------------------------------------
# SUPABASE CONFIGURATION (Development Project)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_JWT_SECRET=your-dev-jwt-secret

# -----------------------------------------------------------------------------
# EMAIL SERVICE CONFIGURATION (Development)
# -----------------------------------------------------------------------------

# Mock Email Service (Development)
EMAIL_PROVIDER=mock
EMAIL_FROM_NAME="BuildDiaspora Zimbabwe (Dev)"
EMAIL_FROM_ADDRESS=dev@builddiaspora.zw

# Real Email Testing (Optional)
# EMAIL_PROVIDER=smtp
# SMTP_HOST=smtp.mailtrap.io
# SMTP_PORT=2525
# SMTP_USER=your-mailtrap-user
# SMTP_PASSWORD=your-mailtrap-password

# -----------------------------------------------------------------------------
# SECURITY CONFIGURATION (Development)
# -----------------------------------------------------------------------------

# Development Keys (Not for production!)
ENCRYPTION_KEY=dev-encryption-key-32-characters
SESSION_SECRET=dev-session-secret-key
JWT_SECRET=dev-jwt-secret-key

# Rate Limiting (Relaxed for development)
RATE_LIMIT_ENABLED=false

# Security Headers (Relaxed for development)
SECURITY_HEADERS_ENABLED=false
CORS_ORIGIN=http://localhost:3003

# -----------------------------------------------------------------------------
# FILE STORAGE CONFIGURATION (Development)
# -----------------------------------------------------------------------------

# Local Development Storage
STORAGE_BUCKET_NAME=dev-verification-documents
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,webp,doc,docx

# File Security (Disabled for development)
ENABLE_VIRUS_SCANNING=false

# -----------------------------------------------------------------------------
# MONITORING & ANALYTICS (Development)
# -----------------------------------------------------------------------------

# Development Monitoring
MONITORING_ENABLED=false
LOG_LEVEL=debug
SENTRY_DSN=  # Empty for development

# Analytics (Disabled for development)
ANALYTICS_ENABLED=false

# -----------------------------------------------------------------------------
# FEATURE FLAGS (Development)
# -----------------------------------------------------------------------------

# All Features Enabled for Testing
FEATURE_EMAIL_VERIFICATION=true
FEATURE_PROFESSIONAL_VERIFICATION=true
FEATURE_ADMIN_PANEL=true
FEATURE_FILE_UPLOAD=true

# Beta Features (Enabled for testing)
FEATURE_SOCIAL_LOGIN=true
FEATURE_MOBILE_APP=true
FEATURE_API_ACCESS=true
FEATURE_PREMIUM_FEATURES=true

# -----------------------------------------------------------------------------
# DEVELOPMENT TOOLS
# -----------------------------------------------------------------------------

# Debug Settings
DEBUG_MODE=true
VERBOSE_LOGGING=true
ENABLE_DEV_TOOLS=true

# Testing
ENABLE_TEST_ENDPOINTS=true
MOCK_EMAIL_SERVICE=true
```

## Staging Environment Template

### `.env.staging`

```bash
# =============================================================================
# BUILDDIASPORA ZIMBABWE - STAGING ENVIRONMENT CONFIGURATION
# =============================================================================

# -----------------------------------------------------------------------------
# APPLICATION CONFIGURATION
# -----------------------------------------------------------------------------
NODE_ENV=staging
NEXT_PUBLIC_APP_NAME="BuildDiaspora Zimbabwe (Staging)"
NEXT_PUBLIC_APP_VERSION="1.0.0-staging"
NEXT_PUBLIC_SITE_URL=https://staging.builddiaspora.zw
NEXT_PUBLIC_API_URL=https://staging.builddiaspora.zw/api

# -----------------------------------------------------------------------------
# SUPABASE CONFIGURATION (Staging Project)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_JWT_SECRET=your-staging-jwt-secret

# -----------------------------------------------------------------------------
# EMAIL SERVICE CONFIGURATION (Staging)
# -----------------------------------------------------------------------------

# Test Email Provider
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.mailtrap.io  # Or staging email service
SMTP_PORT=2525
SMTP_USER=your-staging-smtp-user
SMTP_PASSWORD=your-staging-smtp-password

EMAIL_FROM_NAME="BuildDiaspora Zimbabwe (Staging)"
EMAIL_FROM_ADDRESS=staging@builddiaspora.zw

# -----------------------------------------------------------------------------
# SECURITY CONFIGURATION (Staging)
# -----------------------------------------------------------------------------

# Staging Keys (Similar to production security)
ENCRYPTION_KEY=staging-encryption-key-32-chars
SESSION_SECRET=staging-session-secret-key
JWT_SECRET=staging-jwt-secret-key

# Rate Limiting (Production-like)
RATE_LIMIT_ENABLED=true

# Security Headers (Production-like)
SECURITY_HEADERS_ENABLED=true
CORS_ORIGIN=https://staging.builddiaspora.zw

# -----------------------------------------------------------------------------
# MONITORING & ANALYTICS (Staging)
# -----------------------------------------------------------------------------

# Staging Monitoring
MONITORING_ENABLED=true
LOG_LEVEL=info
SENTRY_DSN=https://your-staging-sentry-dsn@sentry.io/project-id

# Analytics (Staging environment)
ANALYTICS_ENABLED=true
GOOGLE_ANALYTICS_ID=G-STAGING-ID

# -----------------------------------------------------------------------------
# FEATURE FLAGS (Staging)
# -----------------------------------------------------------------------------

# Production Features
FEATURE_EMAIL_VERIFICATION=true
FEATURE_PROFESSIONAL_VERIFICATION=true
FEATURE_ADMIN_PANEL=true
FEATURE_FILE_UPLOAD=true

# Beta Features (Testing)
FEATURE_SOCIAL_LOGIN=true
FEATURE_MOBILE_APP=false
FEATURE_API_ACCESS=true
FEATURE_PREMIUM_FEATURES=false
```

## Secret Management Best Practices

### 1. Secret Generation

#### Strong Password Generation
```bash
# Generate secure passwords
openssl rand -base64 32

# Generate encryption keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Environment-Specific Secrets
```bash
# Production secrets (maximum security)
ENCRYPTION_KEY=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 64)
JWT_SECRET=$(openssl rand -base64 64)

# Development secrets (consistent across team)
ENCRYPTION_KEY="dev-encryption-key-32-characters"
SESSION_SECRET="dev-session-secret-key"
JWT_SECRET="dev-jwt-secret-key"
```

### 2. Secret Storage Solutions

#### Vercel (Recommended for Production)
```bash
# Install Vercel CLI
npm i -g vercel

# Set production secrets
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ENCRYPTION_KEY production
vercel env add SMTP_PASSWORD production

# Set staging secrets
vercel env add SUPABASE_SERVICE_ROLE_KEY staging
vercel env add ENCRYPTION_KEY staging

# Pull environment variables
vercel env pull .env.local
```

#### Docker Secrets (For Container Deployment)
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    image: builddiaspora:latest
    secrets:
      - supabase_service_key
      - encryption_key
      - smtp_password
    environment:
      - SUPABASE_SERVICE_ROLE_KEY_FILE=/run/secrets/supabase_service_key
      - ENCRYPTION_KEY_FILE=/run/secrets/encryption_key
      - SMTP_PASSWORD_FILE=/run/secrets/smtp_password

secrets:
  supabase_service_key:
    external: true
  encryption_key:
    external: true
  smtp_password:
    external: true
```

#### AWS Systems Manager (For AWS Deployment)
```bash
# Store secrets in AWS Parameter Store
aws ssm put-parameter \
  --name "/builddiaspora/prod/supabase-service-key" \
  --value "your-secret-value" \
  --type "SecureString"

# Retrieve secrets in application
aws ssm get-parameter \
  --name "/builddiaspora/prod/supabase-service-key" \
  --with-decryption
```

### 3. Environment Variable Validation

#### Validation Schema
```typescript
// src/lib/env/validation.ts
import { z } from 'zod'

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // Email
  EMAIL_PROVIDER: z.enum(['smtp', 'resend', 'sendgrid', 'ses', 'mock']),
  EMAIL_FROM_ADDRESS: z.string().email(),
  
  // Security
  ENCRYPTION_KEY: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  JWT_SECRET: z.string().min(32),
  
  // Optional fields
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  RESEND_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional()
})

export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('Environment validation failed:', error.errors)
    process.exit(1)
  }
}
```

#### Runtime Validation
```typescript
// src/lib/env/index.ts
import { validateEnv } from './validation'

// Validate environment on startup
export const env = validateEnv()

// Type-safe environment access
export function getEnvVar(key: keyof typeof env): string {
  const value = env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value
}
```

## Deployment Platform Configuration

### Vercel Deployment

#### Project Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1", "lhr1"],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_SITE_URL": "@site-url",
      "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  redis_data:
```

## Security Considerations

### 1. Secret Rotation Schedule

#### Recommended Rotation Frequency
- **Encryption Keys**: Every 90 days
- **Database Passwords**: Every 60 days
- **API Keys**: Every 30 days
- **JWT Secrets**: Every 30 days
- **SMTP Passwords**: Every 90 days

#### Rotation Process
```bash
#!/bin/bash
# rotate-secrets.sh

# Generate new secrets
NEW_ENCRYPTION_KEY=$(openssl rand -base64 32)
NEW_SESSION_SECRET=$(openssl rand -base64 64)
NEW_JWT_SECRET=$(openssl rand -base64 64)

# Update in secret management system
vercel env rm ENCRYPTION_KEY production
vercel env add ENCRYPTION_KEY production "$NEW_ENCRYPTION_KEY"

# Deploy with new secrets
vercel --prod

echo "Secrets rotated successfully"
```

### 2. Access Control

#### Environment Access Matrix
```
Environment | Developers | DevOps | Admin | CI/CD
------------|------------|--------|-------|-------
Development|     ✓      |   ✓    |   ✓   |   ✓
Staging     |     ✗      |   ✓    |   ✓   |   ✓
Production  |     ✗      |   ✗    |   ✓   |   ✓
```

### 3. Audit Logging

#### Environment Access Logging
```typescript
// src/lib/audit/env-access.ts
export function logEnvironmentAccess(
  environment: string,
  user: string,
  action: string,
  variable?: string
) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    environment,
    user,
    action,
    variable: variable || 'N/A',
    level: 'AUDIT'
  }))
}

// Usage
logEnvironmentAccess('production', 'admin@builddiaspora.zw', 'SECRET_UPDATED', 'ENCRYPTION_KEY')
```

## Monitoring & Alerting

### Environment Health Checks

#### Configuration Validation Endpoint
```typescript
// src/app/api/health/config/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabaseConnection(),
    email: await checkEmailService(),
    storage: await checkStorageService(),
    secrets: await validateSecrets()
  }
  
  const allHealthy = Object.values(checks).every(check => check.healthy)
  
  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  }, {
    status: allHealthy ? 200 : 503
  })
}
```

### Alert Configuration

#### Critical Environment Alerts
- Missing required environment variables
- Invalid configuration values
- Secret expiration warnings
- Service connection failures
- Unauthorized access attempts

## Required Environment Variables Checklist

### ✅ Essential Variables (Must be set)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `EMAIL_PROVIDER`
- [ ] `EMAIL_FROM_ADDRESS`
- [ ] `ENCRYPTION_KEY`
- [ ] `SESSION_SECRET`
- [ ] `JWT_SECRET`

### 📧 Email Provider Variables (Choose one)

#### SMTP Configuration
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASSWORD`

#### Resend Configuration
- [ ] `RESEND_API_KEY`

#### SendGrid Configuration
- [ ] `SENDGRID_API_KEY`

#### AWS SES Configuration
- [ ] `AWS_SES_ACCESS_KEY_ID`
- [ ] `AWS_SES_SECRET_ACCESS_KEY`
- [ ] `AWS_SES_REGION`

### 🔧 Optional Variables
- [ ] `RATE_LIMIT_ENABLED`
- [ ] `MONITORING_ENABLED`
- [ ] `ANALYTICS_ENABLED`
- [ ] `FEATURE_*` flags

## Troubleshooting

### Common Environment Issues

#### 1. Missing Environment Variables
```bash
# Check for missing variables
npm run build 2>&1 | grep -i "environment"

# Validate environment
npm run validate-env
```

#### 2. Invalid Supabase Configuration
```bash
# Test Supabase connection
curl -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
     -H "apikey: $SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/"
```

#### 3. Email Service Issues
```bash
# Test email configuration
npm run test-email

# Check email provider status
curl -X POST http://localhost:3003/api/email/send \
     -H "Content-Type: application/json" \
     -d '{"type":"welcome","data":{"user":{"name":"Test","email":"test@example.com"}}}'
```

---

This comprehensive environment configuration ensures secure, scalable, and maintainable deployment of the BuildDiaspora Zimbabwe platform across all environments. 