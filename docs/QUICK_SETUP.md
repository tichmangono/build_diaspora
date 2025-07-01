# 🚀 Quick Setup Reference Card

## Critical Actions (Must Do First)

### 1. Supabase Project
- Create project at [supabase.com](https://supabase.com)
- Copy: URL + anon key + service role key

### 2. Run SQL Migrations
In Supabase SQL Editor, run these files in order:
1. `docs/database/01_initial_schema.sql`
2. `docs/database/02_rls_policies.sql` 
3. `docs/database/03_storage_setup.sql`

### 3. Environment Variables
```bash
cp env.example .env.local
```
Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

### 4. Supabase Auth Settings
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

### 5. Test
```bash
npm install
npm run dev
```
Visit: `http://localhost:3000/auth/register`

---

## 🔗 Files Created That Connect To Your Setup

| Your Action | Connects To These Files |
|-------------|------------------------|
| **Supabase URL/Keys** | `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts` |
| **SQL Migration 1** | `src/lib/validations/auth.ts` (profile schema) |
| **SQL Migration 2** | `src/components/auth/*` (RLS protection) |
| **SQL Migration 3** | `src/components/profile/ProfileForm.tsx` (avatar upload) |
| **Auth Settings** | `middleware.ts`, `src/lib/auth/client.ts` |
| **Environment File** | All components that use Supabase |

## ⚡ Quick Test Commands

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Install and run
npm install && npm run dev

# Build test
npm run build
```

## 🎯 Success Indicators

✅ No build errors  
✅ Can register new user  
✅ User appears in Supabase dashboard  
✅ Profile created in database  
✅ Dashboard shows user info  
✅ Logout redirects to login  

**Full details**: See `docs/SETUP_CHECKLIST.md` 