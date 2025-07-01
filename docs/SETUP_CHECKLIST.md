# BuildDiaspora Zimbabwe - Human Setup Checklist

This document outlines all the manual actions you need to take to make the authentication system fully operational. Follow these steps in order after the code implementation is complete.

## 🗂️ Overview of What's Already Created

The system has been built with the following components:

### ✅ **Code Components (Already Created)**
- **Authentication Components**: Login, Register, Forgot/Reset Password forms
- **Profile Management**: Profile creation, editing, and viewing components
- **Database Schema**: SQL migration files for tables, policies, and storage
- **Middleware**: Route protection and security headers
- **Context & Hooks**: React Context for auth state and custom hooks
- **Validation**: Zod schemas for all forms and data validation
- **UI Components**: Buttons, forms, cards, and layout components
- **Pages**: All auth pages, profile pages, and dashboard integration

---

## 🚀 **HUMAN ACTIONS REQUIRED**

### **STEP 1: Supabase Project Setup**

#### 1.1 Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in/create account
3. Click "New Project"
4. Choose organization and set:
   - **Project Name**: `BuildDiaspora Zimbabwe`
   - **Database Password**: (Generate strong password - save it!)
   - **Region**: Choose closest to Zimbabwe (e.g., `ap-southeast-1`)
5. Click "Create new project"
6. Wait for project initialization (2-3 minutes)

#### 1.2 Get Project Credentials
1. In your Supabase dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Project Reference ID** (e.g., `xxxxx`)
   - **anon/public key** (starts with `eyJhbGciOi...`)
   - **service_role key** (starts with `eyJhbGciOi...`) - **Keep this secret!**

### **STEP 2: Database Schema Setup**

#### 2.1 Run Database Migrations
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. **Execute Migration 1** - Copy and paste the entire content of:
   ```
   docs/database/01_initial_schema.sql
   ```
   - Click "Run" button
   - Verify no errors (should see "Success. No rows returned")

4. **Execute Migration 2** - Create new query, copy and paste:
   ```
   docs/database/02_rls_policies.sql
   ```
   - Click "Run" button
   - Verify no errors

5. **Execute Migration 3** - Create new query, copy and paste:
   ```
   docs/database/03_storage_setup.sql
   ```
   - Click "Run" button
   - Verify no errors

#### 2.2 Verify Database Setup
1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `profiles` (with columns: id, email, full_name, phone, etc.)
   - `verification_requests` (with columns: id, user_id, type, etc.)
3. Go to **Storage** section
4. You should see these buckets:
   - `avatars` (for profile pictures)
   - `verification-documents` (for ID verification)

### **STEP 3: Authentication Configuration**

#### 3.1 Configure Auth Settings
1. In Supabase dashboard, go to **Authentication > Settings**
2. **Site URL**: Set to your domain:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. **Redirect URLs**: Add these URLs:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```
4. **Email Templates**: Customize if needed (optional)
5. **Enable Email Confirmations**: Keep enabled for security

#### 3.2 Configure Storage Policies
1. Go to **Storage > Policies**
2. Verify these policies exist (created by migration):
   - `avatars`: Users can upload/view their own avatars
   - `verification-documents`: Users can upload their own documents

### **STEP 4: Environment Variables Setup**

#### 4.1 Create Environment File
1. In your project root, copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. **Edit `.env.local`** with your Supabase credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-here
   
   # Email Configuration (Optional - for custom emails)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

#### 4.2 Generate NextAuth Secret
1. Generate a random secret:
   ```bash
   openssl rand -base64 32
   ```
2. Copy the output and use it for `NEXTAUTH_SECRET`

### **STEP 5: Development Environment Setup**

#### 5.1 Install Dependencies
```bash
npm install
```

#### 5.2 Run Development Server
```bash
npm run dev
```

#### 5.3 Verify Setup
1. Open [http://localhost:3000](http://localhost:3000)
2. Navigate to `/auth/register`
3. Try creating a test account
4. Check Supabase dashboard > Authentication > Users to see if user was created
5. Check `profiles` table to see if profile was created

### **STEP 6: Production Deployment Setup**

#### 6.1 Vercel Deployment (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. **Set Environment Variables** in Vercel dashboard:
   - Add all variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your production domain
4. **Update Supabase Settings**:
   - Add production URL to Site URL and Redirect URLs
   - Update CORS settings if needed

#### 6.2 Custom Domain Setup
1. Configure your domain in Vercel
2. Update `NEXT_PUBLIC_APP_URL` environment variable
3. Update Supabase Auth settings with new domain

---

## 🔗 **How Everything Connects**

### **Authentication Flow**
1. **User Registration** (`/auth/register`):
   - Form uses `RegisterForm.tsx` component
   - Validation via `src/lib/validations/auth.ts`
   - Supabase creates user account
   - Database trigger creates profile in `profiles` table
   - Welcome email sent automatically

2. **User Login** (`/auth/login`):
   - Form uses `LoginForm.tsx` component
   - Supabase handles authentication
   - Session stored in cookies via `middleware.ts`
   - User redirected to dashboard

3. **Profile Management**:
   - Profile data stored in `profiles` table
   - Avatar uploads go to `avatars` storage bucket
   - Forms use `ProfileForm.tsx` and validation schemas

4. **Route Protection**:
   - `middleware.ts` protects all `/dashboard/*` routes
   - `AuthContext.tsx` provides auth state to components
   - `AuthGuard.tsx` and `ProtectedRoute.tsx` handle component-level protection

### **File Connections**
- **Environment Variables** → Used by `src/lib/supabase/client.ts` and `server.ts`
- **Database Schema** → Matches TypeScript types in validation files
- **Supabase Client** → Used by all auth components and context
- **Middleware** → Protects routes and manages sessions
- **Auth Context** → Provides auth state to all components
- **Validation Schemas** → Used by all forms for data validation

---

## 🧪 **Testing Checklist**

After setup, test these workflows:

### ✅ **Registration Flow**
1. Go to `/auth/register`
2. Fill out form with valid data
3. Submit form
4. Check email for confirmation
5. Verify user appears in Supabase Auth dashboard
6. Verify profile created in `profiles` table

### ✅ **Login Flow**
1. Go to `/auth/login`
2. Use registered credentials
3. Verify redirect to dashboard
4. Check that user info appears in dashboard header

### ✅ **Profile Management**
1. Go to `/profile/setup` or `/profile/edit`
2. Upload avatar image
3. Fill out profile information
4. Save changes
5. Verify data saved in database
6. Verify avatar uploaded to storage

### ✅ **Password Reset**
1. Go to `/auth/forgot-password`
2. Enter email address
3. Check email for reset link
4. Use reset link to set new password
5. Login with new password

### ✅ **Route Protection**
1. Try accessing `/dashboard` without login (should redirect)
2. Login and access `/dashboard` (should work)
3. Logout and verify redirect to login page

---

## 🆘 **Troubleshooting Common Issues**

### **"Invalid API Key" Error**
- Check that environment variables are correctly set
- Verify Supabase URL and keys are copied correctly
- Restart development server after changing env vars

### **Database Connection Issues**
- Verify all SQL migrations ran successfully
- Check Supabase project is active and not paused
- Verify database password is correct

### **Email Not Sending**
- Check Supabase Auth settings
- Verify email templates are configured
- Check spam folder for confirmation emails

### **Storage Upload Issues**
- Verify storage buckets exist
- Check storage policies are correctly applied
- Verify file size limits (default 50MB)

### **Build Errors**
- Run `npm run build` to check for TypeScript errors
- Verify all environment variables are set
- Check that all imports are correctly typed

---

## 📋 **Final Verification**

Once everything is set up, you should be able to:

1. ✅ Register new users
2. ✅ Login existing users
3. ✅ Reset passwords
4. ✅ Create and edit profiles
5. ✅ Upload avatar images
6. ✅ Access protected dashboard
7. ✅ Logout and redirect properly
8. ✅ See user info in Supabase dashboard

**System Status**: Ready for production use once all human actions are completed! 🚀 