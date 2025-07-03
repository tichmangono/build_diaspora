# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the BuildDiaspora Zimbabwe platform.

## Development Issues

### Environment Setup Problems

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Should be v18 or later
# If not, install latest LTS version from nodejs.org
```

#### Dependencies Installation Failures
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

#### Environment Variables Not Loading
```bash
# Check if .env.local exists
ls -la .env.local

# Restart development server
npm run dev
```

## Authentication Problems

### Login Issues

#### "Invalid credentials" Error
1. **Check email format**: Ensure valid email format
2. **Verify password**: Check for typos, caps lock
3. **Account exists**: Confirm account was created
4. **Email verified**: Check if email verification is required

#### Account Locked
1. **Wait period**: Account unlocks after 15 minutes
2. **Check email**: Look for security notification
3. **Contact support**: If problem persists

### Registration Problems

#### Email Verification Not Received
1. **Check spam folder**: Look in junk/spam folders
2. **Whitelist domain**: Add noreply@builddiaspora.com to contacts
3. **Request new email**: Use resend verification option

#### Weak Password Error
```
Password requirements:
- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)
```

## Email Issues

### Email Not Sending

#### SMTP Configuration
```bash
# Check environment variables
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USER
```

#### Resend API Issues
```bash
# Test Resend API key
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json"
```

## Database Connection

### Supabase Connection Issues

#### Invalid API Key
```bash
# Verify API keys in Supabase dashboard
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
curl -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/"
```

## Build and Deployment

### Build Failures

#### TypeScript Errors
```bash
# Run type checking
npm run type-check

# Fix common issues:
# - Missing type definitions
# - Incorrect imports
# - Type mismatches
```

#### Environment Variables in Build
```bash
# Ensure build-time variables are prefixed with NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=your_url

# Check build logs for missing variables
npm run build
```

## Performance Issues

### Slow Page Loads

#### Large Bundle Size
```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer
```

#### Database Query Performance
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_profiles_email ON profiles(email);
```

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Common Issues
- Check browser console for errors
- Ensure JavaScript is enabled
- Clear browser cache and cookies

## Getting Help

### Debug Information to Collect
1. **Environment Details**: Node.js version, browser info
2. **Error Messages**: Full stack trace, console errors
3. **Steps to Reproduce**: Detailed instructions
4. **Configuration**: Environment variables (sanitized)

### Support Channels
1. **Documentation**: Check existing docs first
2. **GitHub Issues**: Search for similar issues
3. **Email Support**: support@builddiaspora.com

---

Remember: Most issues have been encountered before. Search existing documentation first.
