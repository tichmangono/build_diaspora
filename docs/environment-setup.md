# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Application Configuration
APP_URL=http://localhost:3000
APP_NAME="BuildDiaspora Zimbabwe"

# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# Security Configuration
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=7d
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000  # 15 minutes in milliseconds
```

## Setup Instructions

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon key from the Supabase dashboard
3. Generate a secure secret for NEXTAUTH_SECRET using: `openssl rand -base64 32`
4. Configure email settings for your SMTP provider
5. Update the `.env.local` file with your actual values

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique secrets for production
- Rotate keys regularly
- Use environment-specific configurations for different deployment stages 