# Database Setup Guide

This directory contains the SQL migration files for setting up the BuildDiaspora Zimbabwe authentication and user management system with Supabase.

## Migration Files

Run these SQL files in your Supabase SQL Editor in the following order:

### 1. `01_initial_schema.sql`
- Creates the core database schema
- Sets up `profiles` and `verification_requests` tables
- Creates custom types for verification status and types
- Adds indexes for performance optimization
- Creates triggers for automatic profile creation on user signup
- Adds data validation constraints

### 2. `02_rls_policies.sql`
- Enables Row Level Security (RLS) on all tables
- Creates security policies for data access control
- Sets up admin access policies
- Creates helper functions for common database operations
- Implements verification request workflow functions

### 3. `03_storage_setup.sql`
- Creates storage buckets for avatars and verification documents
- Sets up storage policies for file access control
- Creates helper functions for file upload URL generation
- Implements cleanup triggers for old files

## Database Schema Overview

### Tables

#### `public.profiles`
- **Purpose**: Store user profile information and verification status
- **Key Fields**:
  - `id`: References `auth.users(id)`
  - `email`: User email (unique)
  - `full_name`, `phone`, `location`: Basic profile info
  - `profession`, `company`, `bio`: Professional information
  - `website`, `linkedin_url`: Social links
  - `is_verified`: Verification status
  - `verification_type`: Type of verification completed
  - `verification_documents`: Array of document URLs

#### `public.verification_requests`
- **Purpose**: Track professional verification requests
- **Key Fields**:
  - `id`: Unique request identifier
  - `user_id`: References `profiles(id)`
  - `verification_type`: Type of verification requested
  - `documents`: Array of uploaded document URLs
  - `status`: Request status (pending, approved, rejected)
  - `admin_notes`: Admin feedback on the request

### Custom Types

#### `verification_status`
- `pending`: Request submitted, awaiting review
- `approved`: Request approved by admin
- `rejected`: Request rejected by admin

#### `verification_type`
- `professional`: Professional qualification verification
- `identity`: Identity document verification
- `business`: Business registration verification

### Storage Buckets

#### `avatars`
- **Purpose**: Store user profile pictures
- **Access**: Public (anyone can view)
- **Size Limit**: 5MB
- **Allowed Types**: JPEG, PNG, WebP

#### `verification-documents`
- **Purpose**: Store verification documents
- **Access**: Private (user and admin only)
- **Size Limit**: 10MB
- **Allowed Types**: JPEG, PNG, WebP, PDF

## Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Admins have elevated access to all verification requests
- Public profiles are viewable by authenticated users
- Service role has full access for system operations

### Admin Access
Admin users are identified by email patterns:
- `%@builddiaspora.zw` (organization emails)
- `admin@builddiaspora.com`
- `support@builddiaspora.com`

### Data Validation
- Email format validation
- Phone number format validation (international format)
- URL validation for websites and LinkedIn
- Text length constraints
- Required document arrays for verification requests

## Helper Functions

### User Functions
- `get_user_profile(UUID)`: Get user profile with verification status
- `get_user_verification_requests(UUID)`: Get user's verification requests
- `submit_verification_request(verification_type, TEXT[])`: Submit new verification request

### Admin Functions
- `approve_verification_request(UUID, TEXT)`: Approve verification request
- `reject_verification_request(UUID, TEXT)`: Reject verification request

### Storage Functions
- `generate_avatar_upload_url(TEXT)`: Generate avatar upload path
- `generate_verification_upload_url(TEXT, TEXT)`: Generate document upload path

## Setup Instructions

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Migrations**
   - Open Supabase SQL Editor
   - Run `01_initial_schema.sql`
   - Run `02_rls_policies.sql`
   - Run `03_storage_setup.sql`

3. **Configure Environment Variables**
   - Copy environment variables from `docs/environment-setup.md`
   - Add your Supabase project credentials

4. **Test Setup**
   - Create a test user through your application
   - Verify profile is created automatically
   - Test file upload functionality
   - Submit a test verification request

## Common Operations

### Creating a User Profile
Profiles are created automatically when users sign up through the `handle_new_user()` trigger function.

### Submitting Verification Request
```sql
SELECT submit_verification_request(
    'professional',
    ARRAY['path/to/document1.pdf', 'path/to/document2.jpg']
);
```

### Approving Verification (Admin)
```sql
SELECT approve_verification_request(
    'request-uuid-here',
    'Approved - documents verified successfully'
);
```

### Rejecting Verification (Admin)
```sql
SELECT reject_verification_request(
    'request-uuid-here',
    'Rejected - documents unclear, please resubmit'
);
```

## Performance Considerations

- Indexes are created on frequently queried columns
- RLS policies use efficient joins and exists clauses
- Storage policies prevent unauthorized access
- Triggers automatically maintain data consistency

## Backup and Maintenance

- Supabase provides automatic backups
- Monitor storage usage for file uploads
- Regularly review verification requests
- Clean up old verification documents if needed

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Ensure user is authenticated
   - Check policy conditions match your use case
   - Verify admin email patterns

2. **Storage Upload Errors**
   - Check file size limits
   - Verify file type is allowed
   - Ensure proper folder structure

3. **Function Execution Errors**
   - Verify user permissions
   - Check function parameters
   - Review error logs in Supabase dashboard

### Support

For database-related issues:
1. Check Supabase logs in the dashboard
2. Review RLS policies for access issues
3. Verify environment variables are set correctly
4. Test with service role key for debugging 