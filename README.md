# BuildDiaspora Zimbabwe

A comprehensive platform connecting Zimbabwean diaspora professionals worldwide, facilitating networking, mentorship, and community building.

## 🚀 Quick Start

**⚠️ IMPORTANT**: This project requires manual setup steps before it will work.

### For Developers - Quick Setup
1. 📖 **Read**: [`docs/QUICK_SETUP.md`](docs/QUICK_SETUP.md) - 5-minute setup guide
2. 📋 **Full Details**: [`docs/SETUP_CHECKLIST.md`](docs/SETUP_CHECKLIST.md) - Complete setup instructions

### For Users - What This Platform Offers
- **Professional Networking**: Connect with Zimbabwean professionals globally
- **Mentorship Programs**: Find mentors or become one
- **Career Development**: Access job opportunities and career resources
- **Community Events**: Join virtual and in-person networking events
- **Cultural Connection**: Stay connected to Zimbabwean culture and community

## 🏗️ System Status

### ✅ **COMPLETED (Ready for Setup)**
- **Authentication System**: Registration, login, password reset, email verification
- **Profile Management**: Complete profile creation, editing, avatar uploads
- **Database Schema**: User profiles, verification system, storage setup
- **Security**: Route protection, middleware, RLS policies
- **UI Components**: Professional forms, cards, layouts, responsive design
- **Integration**: React Context, custom hooks, TypeScript validation

### 🔧 **REQUIRES HUMAN SETUP**
- Supabase project creation and configuration
- Database migrations (3 SQL files to run)
- Environment variables configuration
- Authentication settings in Supabase dashboard

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Styling**: Tailwind CSS, Lucide Icons
- **Forms**: React Hook Form, Zod validation
- **Security**: Row Level Security (RLS), Middleware protection
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard
│   ├── profile/           # Profile management
│   └── journey/           # User journey pages
├── components/
│   ├── auth/              # Authentication components
│   ├── profile/           # Profile components
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── lib/
│   ├── supabase/          # Supabase client configuration
│   ├── auth/              # Authentication utilities
│   ├── validations/       # Zod validation schemas
│   ├── contexts/          # React Context providers
│   └── hooks/             # Custom React hooks
└── types/                 # TypeScript type definitions

docs/
├── database/              # SQL migration files
├── SETUP_CHECKLIST.md    # Complete setup guide
└── QUICK_SETUP.md         # Quick reference
```

## 🔐 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Route Protection**: Middleware-based authentication
- **Form Validation**: Client and server-side validation
- **Rate Limiting**: Protection against abuse
- **Secure Headers**: CSRF, XSS, and other security headers
- **Email Verification**: Required for account activation

## 🧪 Testing

After setup, the system includes:
- **Registration Flow**: Email verification, profile creation
- **Authentication**: Login, logout, password reset
- **Profile Management**: Avatar upload, profile editing
- **Route Protection**: Dashboard and protected pages
- **Security**: RLS policies, middleware protection

## 📱 Features

### Authentication
- Secure registration with email verification
- Professional login system
- Password reset functionality
- Session management

### Profile Management
- Comprehensive professional profiles
- Avatar upload and management
- Verification system for credentials
- Professional networking information

### Dashboard
- Personalized user dashboard
- Professional networking tools
- Activity tracking
- Community features

## 🌍 Deployment

### Development
```bash
# After completing setup checklist
npm install
npm run dev
```

### Production (Vercel)
1. Push to GitHub repository
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Update Supabase settings with production URLs
5. Deploy

## 📚 Documentation

- [`docs/SETUP_CHECKLIST.md`](docs/SETUP_CHECKLIST.md) - Complete setup instructions
- [`docs/QUICK_SETUP.md`](docs/QUICK_SETUP.md) - Quick reference guide
- [`docs/database/README.md`](docs/database/README.md) - Database setup details
- [`docs/environment-setup.md`](docs/environment-setup.md) - Environment variables guide

## 🤝 Contributing

1. Complete the setup checklist
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**🎯 Ready to connect the Zimbabwean diaspora worldwide!**
