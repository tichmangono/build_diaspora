# Developer Setup Guide

Welcome to the BuildDiaspora Zimbabwe project! This guide will help you set up your development environment and get started contributing to the authentication system.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **pnpm** (recommended)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### Optional but Recommended

- **Docker** - [Download](https://www.docker.com/) (for containerized development)
- **Supabase CLI** - [Installation Guide](https://supabase.com/docs/guides/cli)

### Verify Installation

```bash
# Check Node.js version
node --version  # Should be v18 or later

# Check npm version
npm --version

# Check Git version
git --version
```

## Project Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-org/build-diaspora-zimbabwe.git
cd build-diaspora-zimbabwe

# Create your feature branch
git checkout -b feature/your-feature-name
```

### 2. Install Dependencies

```bash
# Install project dependencies
npm install

# Or if using pnpm (recommended)
pnpm install
```

### 3. Install VS Code Extensions (Recommended)

Install these extensions for the best development experience:

- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Prettier - Code formatter**
- **ESLint**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**

## Environment Configuration

### 1. Create Environment File

```bash
# Copy the example environment file
cp env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your configuration:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration (Choose one provider)
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Or Resend (recommended)
RESEND_API_KEY=your_resend_api_key

# Security
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# Optional: Analytics & Monitoring
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
SENTRY_DSN=your_sentry_dsn
```

### 3. Get Supabase Credentials

1. Create a new project at [Supabase](https://supabase.com/)
2. Go to **Settings** → **API**
3. Copy the **Project URL** and **anon public** key
4. Copy the **service_role** key (keep this secret!)

### 4. Set Up Email Provider

#### Option A: Gmail SMTP (Development)

1. Enable 2-factor authentication on your Gmail account
2. Generate an app password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use your Gmail address and the app password in the environment variables

#### Option B: Resend (Recommended for Production)

1. Sign up at [Resend](https://resend.com/)
2. Create an API key
3. Add your domain (for production)

## Database Setup

### 1. Set Up Supabase Database

The project includes database migrations and seed data. Follow these steps:

```bash
# Install Supabase CLI (if not already installed)
npm install -g @supabase/cli

# Initialize Supabase (if starting fresh)
supabase init

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Run database migrations
supabase db push

# Or if you prefer, you can run the SQL directly in Supabase dashboard
```

### 2. Database Schema

The project uses the following main tables:

- `profiles` - User profile information
- `verification_requests` - Professional verification requests
- `verification_documents` - Document uploads for verification
- `audit_logs` - Security and activity logging
- `user_preferences` - User notification and privacy settings

### 3. Seed Data (Optional)

For development, you can add test data:

```sql
-- Run this in Supabase SQL editor
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User', now(), now());
```

## Development Workflow

### 1. Start Development Server

```bash
# Start the development server
npm run dev

# Or with pnpm
pnpm dev

# Server will start on http://localhost:3000
```

### 2. Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   └── dashboard/         # Protected dashboard pages
├── components/            # Reusable React components
│   ├── auth/             # Authentication components
│   ├── ui/               # UI components (shadcn/ui)
│   └── forms/            # Form components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client configuration
│   ├── email/            # Email service
│   ├── auth/             # Authentication utilities
│   └── utils/            # General utilities
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── styles/               # Global styles and Tailwind config
```

### 3. Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type checking
npm run type-check

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate test coverage
npm run test:coverage
```

## Testing

### 1. Unit Tests (Jest + React Testing Library)

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 2. Integration Tests

```bash
# Run integration tests
npm run test:integration
```

### 3. End-to-End Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run specific test file
npx playwright test auth.spec.ts
```

### 4. Email Testing

Visit `http://localhost:3000/test-email` to test email functionality in development mode.

## Code Quality

### 1. Linting and Formatting

The project uses ESLint and Prettier for code quality:

```bash
# Check for linting errors
npm run lint

# Fix auto-fixable linting errors
npm run lint:fix

# Format code with Prettier
npm run format
```

### 2. Pre-commit Hooks

The project uses Husky for pre-commit hooks:

- **Lint-staged**: Runs linting and formatting on staged files
- **Type checking**: Ensures TypeScript types are valid
- **Tests**: Runs relevant tests for changed files

### 3. Code Style Guidelines

- Use **TypeScript** for all new code
- Follow **React best practices** and hooks patterns
- Use **Tailwind CSS** for styling
- Write **descriptive component and variable names**
- Add **JSDoc comments** for complex functions
- Keep components **small and focused**
- Use **custom hooks** for reusable logic

### 4. Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add user authentication flow"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### 5. Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new authentication feature
fix: resolve login redirect issue
docs: update API documentation
style: format code with prettier
refactor: improve error handling
test: add unit tests for auth service
chore: update dependencies
```

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading

```bash
# Make sure your .env.local file is in the root directory
ls -la .env.local

# Restart the development server
npm run dev
```

#### 2. Supabase Connection Issues

```bash
# Check your Supabase URL and keys
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection in browser console
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(url, key)
await supabase.from('profiles').select('*').limit(1)
```

#### 3. Email Not Sending

```bash
# Check email configuration
echo $SMTP_HOST
echo $SMTP_USER

# Test email endpoint
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{"type":"welcome","to":"test@example.com","data":{"name":"Test"}}'
```

#### 4. Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

#### 5. Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Getting Help

1. **Check the documentation** in the `docs/` folder
2. **Search existing issues** on GitHub
3. **Ask in team chat** or create a GitHub issue
4. **Review the code** - the codebase is well-documented

### Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

## Next Steps

1. **Explore the codebase** - Start with `src/app/page.tsx`
2. **Run the tests** - Understand how testing works
3. **Make a small change** - Try updating a component
4. **Read the API docs** - Understand the backend endpoints
5. **Join the team** - Participate in code reviews and discussions

Welcome to the team! 🚀 