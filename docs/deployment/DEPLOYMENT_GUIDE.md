# BuildDiaspora Zimbabwe - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the BuildDiaspora Zimbabwe platform across different environments and platforms.

## Pre-Deployment Checklist

### ✅ Prerequisites
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Git repository access
- [ ] Supabase project configured
- [ ] Email service provider configured
- [ ] Domain name and SSL certificates (production)
- [ ] Environment variables prepared

### ✅ Code Preparation
- [ ] All tests passing (`npm run test`)
- [ ] Build successful (`npm run build`)
- [ ] Environment variables validated
- [ ] Database migrations applied
- [ ] Email templates tested
- [ ] Security configurations verified

## Deployment Options

### 1. Vercel Deployment (Recommended)

#### Quick Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

#### Project Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1", "lhr1", "syd1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
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
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

---

This deployment guide ensures secure and scalable deployment of BuildDiaspora Zimbabwe.
