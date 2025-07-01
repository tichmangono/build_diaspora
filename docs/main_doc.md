BuildDiaspora Zimbabwe - Technical Feature Specification
File System
Frontend Repository Structure
/builddiaspora-frontend
├── /src
│   ├── /app                          # Next.js 14 App Router
│   │   ├── /dashboard
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── /journey
│   │   │   ├── /[stageId]
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── /compliance
│   │   │   ├── /[city]
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── /directory
│   │   │   ├── /[professionalId]
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── /calculator
│   │   │   └── page.tsx
│   │   ├── /community
│   │   │   ├── /forum
│   │   │   │   ├── /[threadId]
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── /case-studies
│   │   │   │   └── page.tsx
│   │   │   └── /build-journals
│   │   │       ├── /[journalId]
│   │   │       │   └── page.tsx
│   │   │       └── page.tsx
│   │   ├── /auth
│   │   │   ├── /login
│   │   │   │   └── page.tsx
│   │   │   ├── /signup
│   │   │   │   └── page.tsx
│   │   │   └── /verify
│   │   │       └── page.tsx
│   │   ├── /subscription
│   │   │   ├── /upgrade
│   │   │   │   └── page.tsx
│   │   │   └── /success
│   │   │       └── page.tsx
│   │   ├── /api
│   │   │   ├── /auth
│   │   │   │   └── /callback
│   │   │   │       └── route.ts
│   │   │   ├── /stripe
│   │   │   │   ├── /checkout
│   │   │   │   │   └── route.ts
│   │   │   │   └── /webhook
│   │   │   │       └── route.ts
│   │   │   ├── /cost-estimate
│   │   │   │   └── route.ts
│   │   │   ├── /professionals
│   │   │   │   ├── /search
│   │   │   │   │   └── route.ts
│   │   │   │   └── /[id]
│   │   │   │       └── route.ts
│   │   │   ├── /forum
│   │   │   │   ├── /threads
│   │   │   │   │   └── route.ts
│   │   │   │   └── /posts
│   │   │   │       └── route.ts
│   │   │   ├── /case-studies
│   │   │   │   └── route.ts
│   │   │   └── /analytics
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   ├── /components
│   │   ├── /ui                       # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Accordion.tsx
│   │   │   ├── FilterSidebar.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── PaywallGate.tsx
│   │   ├── /journey
│   │   │   ├── JourneyTimeline.tsx
│   │   │   ├── StageCard.tsx
│   │   │   ├── StageDetails.tsx
│   │   │   ├── CostRangeDisplay.tsx
│   │   │   └── Timeline3D.tsx
│   │   ├── /compliance
│   │   │   ├── ComplianceChecklist.tsx
│   │   │   ├── ChecklistItem.tsx
│   │   │   ├── CitySelector.tsx
│   │   │   └── PermitDetails.tsx
│   │   ├── /directory
│   │   │   ├── ProfessionalGrid.tsx
│   │   │   ├── ProfessionalCard.tsx
│   │   │   ├── ProfessionalModal.tsx
│   │   │   ├── ContactReveal.tsx
│   │   │   └── RatingDisplay.tsx
│   │   ├── /calculator
│   │   │   ├── CostCalculator.tsx
│   │   │   ├── PlotSizeInput.tsx
│   │   │   ├── CitySelector.tsx
│   │   │   └── EstimateResults.tsx
│   │   ├── /community
│   │   │   ├── ForumList.tsx
│   │   │   ├── ThreadCard.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── CaseStudyCard.tsx
│   │   │   ├── BuildJournalCard.tsx
│   │   │   └── CommunityFilters.tsx
│   │   ├── /auth
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── AuthProvider.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── /subscription
│   │       ├── PricingTiers.tsx
│   │       ├── UpgradeModal.tsx
│   │       └── SubscriptionStatus.tsx
│   ├── /lib
│   │   ├── /supabase
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── database.types.ts
│   │   ├── /stripe
│   │   │   └── config.ts
│   │   ├── /utils
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── analytics.ts
│   │   └── /hooks
│   │       ├── useAuth.ts
│   │       ├── useSubscription.ts
│   │       ├── useAnalytics.ts
│   │       └── useDebounce.ts
│   ├── /types
│   │   ├── auth.ts
│   │   ├── subscription.ts
│   │   ├── journey.ts
│   │   ├── compliance.ts
│   │   ├── directory.ts
│   │   ├── calculator.ts
│   │   └── community.ts
│   └── /styles
│       ├── globals.css
│       └── components.css
├── /public
│   ├── /images
│   ├── /icons
│   └── /documents
├── package.json
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
└── .env.local
Backend Repository Structure (Data Layer)
/builddiaspora-backend
├── /supabase
│   ├── /migrations
│   │   ├── 20250701000001_initial_schema.sql
│   │   ├── 20250701000002_journey_stages.sql
│   │   ├── 20250701000003_compliance_items.sql
│   │   ├── 20250701000004_professionals.sql
│   │   ├── 20250701000005_cost_calculators.sql
│   │   ├── 20250701000006_community_forums.sql
│   │   ├── 20250701000007_case_studies.sql
│   │   ├── 20250701000008_build_journals.sql
│   │   ├── 20250701000009_subscriptions.sql
│   │   └── 20250701000010_analytics.sql
│   ├── /functions
│   │   ├── /stripe-webhook
│   │   │   └── index.ts
│   │   ├── /analytics-processor
│   │   │   └── index.ts
│   │   ├── /content-moderation
│   │   │   └── index.ts
│   │   └── /email-notifications
│   │       └── index.ts
│   ├── /seed
│   │   ├── journey_stages.sql
│   │   ├── compliance_items.sql
│   │   ├── professionals.sql
│   │   ├── city_cost_rates.sql
│   │   └── case_studies.sql
│   └── config.toml
├── /scripts
│   ├── setup-database.sh
│   ├── seed-data.sh
│   └── migrate.sh
└── README.md
Feature Specifications
Feature 1: Authentication & User Management
Feature Goal: Provide secure, frictionless user registration and authentication with role-based access control for free and premium tiers.
API Relationships:

Supabase Auth API for authentication flows
Stripe Customer API for subscription management
Internal profile management endpoints

Detailed Feature Requirements:

User Registration Flow

Email/password registration with email verification
OAuth integration (Google, Facebook)
Phone number verification for premium features
Profile completion wizard (name, location, build intent)
GDPR-compliant consent collection


Authentication States

Unauthenticated (limited access)
Free authenticated user
Premium authenticated user
Professional authenticated user (future)
Admin authenticated user


User Profile Management

Profile picture upload and management
Contact information management
Build project associations
Subscription status display
Account deletion with data export



Detailed Implementation Guide:

Database Schema Design
sql-- Users table (Supabase Auth managed)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Extended profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(20),
  country VARCHAR(100),
  city VARCHAR(100),
  build_intent TEXT CHECK (build_intent IN ('residential', 'commercial', 'mixed')),
  role VARCHAR(20) DEFAULT 'free' CHECK (role IN ('free', 'premium', 'professional', 'admin')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

Authentication Components

AuthProvider: Context provider managing auth state
LoginForm: Email/password and OAuth login
SignupForm: Registration with validation
ProtectedRoute: Route wrapper checking auth status
ProfileSetup: Onboarding wizard component


API Endpoints

POST /api/auth/signup: Handle registration
POST /api/auth/login: Handle login (delegated to Supabase)
GET /api/auth/profile: Fetch user profile
PUT /api/auth/profile: Update user profile
DELETE /api/auth/account: Account deletion


State Management

Global auth context with user, loading, and error states
Persistent session management
Role-based feature flagging
Automatic token refresh handling


Security Implementation

JWT token validation on protected routes
Rate limiting on auth endpoints (5 attempts per minute)
CSRF protection on state-changing operations
Secure session storage with httpOnly cookies
Password strength requirements (8+ chars, mixed case, numbers)


Error Handling

Network failure retry logic
Graceful degradation for auth failures
User-friendly error messages
Audit logging for security events



Feature 2: Interactive Build Journey Timeline
Feature Goal: Provide users with a comprehensive, visual representation of the 45-stage building process in Zimbabwe, with interactive 3D timeline, cost ranges, and stage-specific details.
API Relationships:

Journey stages API for stage data
Cost calculator API for price estimates
Compliance API for permit requirements
Analytics API for tracking user engagement

Detailed Feature Requirements:

3D Timeline Visualization

Interactive 3D timeline with zoom capabilities
Visual progress indicators for each stage
Clickable stages revealing detailed information
Mobile-responsive 2D fallback
Stage dependencies and critical path highlighting


Stage Information Display

Cost range estimates (min/avg/max in USD)
Duration estimates with seasonal variations
Required permits and inspections
Common pitfalls and risk mitigation
City-specific variations (Harare, Bulawayo, rural)


Progressive Disclosure

Free users: Overview of all 12 major stages
Premium users: Detailed 45 sub-stages breakdown
Interactive cost calculators per stage
Weather and seasonal optimization tips



Detailed Implementation Guide:

Database Schema Design
sqlCREATE TABLE journey_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_stage_id UUID REFERENCES journey_stages(id),
  stage_number INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  detailed_description TEXT, -- Premium content
  min_cost_usd DECIMAL(10,2),
  avg_cost_usd DECIMAL(10,2),
  max_cost_usd DECIMAL(10,2),
  duration_weeks_min INTEGER,
  duration_weeks_max INTEGER,
  seasonal_notes TEXT, -- Premium content
  risk_factors TEXT[], -- Premium content
  required_permits TEXT[],
  city_variations JSONB, -- City-specific data
  is_premium_content BOOLEAN DEFAULT FALSE,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stage_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prerequisite_stage_id UUID REFERENCES journey_stages(id),
  dependent_stage_id UUID REFERENCES journey_stages(id),
  dependency_type VARCHAR(50) CHECK (dependency_type IN ('blocking', 'parallel', 'optional'))
);

-- Indexes
CREATE INDEX idx_journey_stages_parent ON journey_stages(parent_stage_id);
CREATE INDEX idx_journey_stages_display_order ON journey_stages(display_order);
CREATE INDEX idx_stage_dependencies_prerequisite ON stage_dependencies(prerequisite_stage_id);

Frontend Components Architecture

JourneyTimeline: Main container with 3D/2D toggle
Timeline3D: Three.js-based 3D visualization
StageCard: Individual stage representation
StageDetails: Detailed modal/sidebar view
CostRangeDisplay: Visual cost range indicators
ProgressTracker: User's journey progress


3D Timeline Implementation

Three.js scene with camera controls
Stage nodes positioned along timeline curve
Interactive hover and click states
Smooth camera animations between stages
Responsive canvas sizing
WebGL fallback detection


API Endpoints

GET /api/journey/stages: Fetch all stages with role filtering
GET /api/journey/stages/[id]: Detailed stage information
POST /api/journey/progress: Track user progress
GET /api/journey/dependencies: Stage dependency graph


State Management

Journey data cached in React Query
Selected stage state management
User progress persistence
3D scene state management
Filter and view preferences


Performance Optimization

Lazy loading of detailed stage content
Image optimization for stage visuals
Three.js asset loading with progress indicators
Virtualization for mobile stage lists
CDN caching for static stage data


Analytics Integration
typescript// Track stage engagement
trackEvent('stage_view', {
  stage_id: string,
  stage_name: string,
  view_duration: number,
  user_tier: 'free' | 'premium'
});

trackEvent('journey_progress', {
  stages_completed: number,
  completion_percentage: number,
  time_spent: number
});


Feature 3: Compliance Tracker & Permit Management
Feature Goal: Provide comprehensive permit and compliance tracking for building projects across different Zimbabwean cities and councils, with document management and deadline tracking.
API Relationships:

Journey stages API for stage-specific permits
User profile API for location-based filtering
Document storage API for permit uploads
Notification API for deadline alerts

Detailed Feature Requirements:

Permit Database

Comprehensive permit catalog for major cities
Fee structures with official source links
Responsible department contact information
Processing time estimates
Required documentation checklists


Compliance Tracking

Personal permit checklist generation
Document upload and management
Deadline tracking and notifications
Status updates (not started, in progress, completed)
Integration with journey timeline


City-Specific Variations

Harare city council requirements
Bulawayo city council requirements
Rural district council variations
Municipal by-law differences
Special economic zone regulations



Detailed Implementation Guide:

Database Schema Design
sqlCREATE TABLE compliance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER
);

CREATE TABLE compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES compliance_categories(id),
  stage_id UUID REFERENCES journey_stages(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  city VARCHAR(100) NOT NULL, -- 'harare', 'bulawayo', 'rural', 'all'
  council_type VARCHAR(50), -- 'city', 'municipal', 'rural_district'
  fee_min_usd DECIMAL(10,2),
  fee_max_usd DECIMAL(10,2),
  processing_days_min INTEGER,
  processing_days_max INTEGER,
  responsible_department VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  office_address TEXT,
  required_documents TEXT[],
  source_url TEXT,
  is_premium_content BOOLEAN DEFAULT FALSE,
  is_mandatory BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_compliance_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  compliance_item_id UUID REFERENCES compliance_items(id),
  status VARCHAR(50) DEFAULT 'not_started' 
    CHECK (status IN ('not_started', 'in_progress', 'submitted', 'approved', 'rejected')),
  submission_date DATE,
  approval_date DATE,
  rejection_reason TEXT,
  estimated_completion_date DATE,
  actual_completion_date DATE,
  fees_paid_usd DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, compliance_item_id)
);

CREATE TABLE compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_compliance_id UUID REFERENCES user_compliance_tracking(id),
  document_name VARCHAR(255),
  document_type VARCHAR(100),
  file_path TEXT,
  file_size_bytes BIGINT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_compliance_items_city ON compliance_items(city);
CREATE INDEX idx_compliance_items_stage ON compliance_items(stage_id);
CREATE INDEX idx_user_compliance_user ON user_compliance_tracking(user_id);
CREATE INDEX idx_user_compliance_status ON user_compliance_tracking(status);

Frontend Components Architecture

ComplianceChecklist: Main checklist interface
CitySelector: Location-based filtering
ChecklistItem: Individual permit/requirement card
PermitDetails: Detailed modal with forms
DocumentUpload: File upload component
ComplianceProgress: Visual progress tracking
DeadlineAlerts: Notification component


CRUD Operations
Create Operations:

Initialize user compliance tracking for new projects
Upload compliance documents
Create custom compliance reminders
Generate compliance reports

Read Operations:

Fetch city-specific compliance requirements
Retrieve user's compliance progress
Display compliance item details
Generate compliance status reports

Update Operations:

Mark compliance items as completed
Update document submission status
Modify estimated completion dates
Update contact information

Delete Operations:

Remove uploaded documents (soft delete)
Clear completed compliance history
Remove custom reminders


API Endpoints
typescript// GET /api/compliance/items?city=harare&stage=foundation
interface ComplianceItemsResponse {
  items: ComplianceItem[];
  total: number;
  categories: ComplianceCategory[];
}

// POST /api/compliance/tracking
interface CreateTrackingRequest {
  compliance_item_id: string;
  estimated_completion_date?: string;
  notes?: string;
}

// PUT /api/compliance/tracking/[id]
interface UpdateTrackingRequest {
  status: ComplianceStatus;
  submission_date?: string;
  fees_paid_usd?: number;
  notes?: string;
}

// POST /api/compliance/documents
interface UploadDocumentRequest {
  user_compliance_id: string;
  document_name: string;
  document_type: string;
  file: File;
}

Document Management

Supabase Storage integration for file uploads
File type validation (PDF, images, documents)
File size limits (10MB per document)
Virus scanning for uploaded files
Automatic file compression and optimization
Secure file access with signed URLs


Notification System

Email reminders for approaching deadlines
In-app notifications for status changes
SMS notifications for critical deadlines (premium)
Calendar integration for deadline tracking
Customizable notification preferences



Feature 4: Professional Directory & Verification System
Feature Goal: Provide a comprehensive, searchable directory of verified building professionals with ratings, contact information, and diaspora-friendly indicators.
API Relationships:

User authentication API for contact reveals
Rating and review system API
Geographic filtering API
Subscription API for premium features

Detailed Feature Requirements:

Professional Profiles

Complete professional information (name, company, specializations)
License verification and status
Portfolio and project galleries
Contact information (gated by subscription tier)
Diaspora-friendly indicators and communication preferences
Pricing ranges and service areas


Search and Filtering

Advanced search by profession, location, specialization
Rating and review filtering
Availability and response time filtering
Portfolio and project type filtering
Price range filtering (premium feature)


Verification System

Professional license verification
Community-based rating system
Project completion verification
Background check integration (premium)
Dispute resolution process



Detailed Implementation Guide:

Database Schema Design
sqlCREATE TABLE professional_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER
);

CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id), -- If they have an account
  category_id UUID REFERENCES professional_categories(id),
  business_name VARCHAR(255),
  contact_person VARCHAR(255) NOT NULL,
  license_number VARCHAR(100),
  license_issuing_body VARCHAR(255),
  license_expiry_date DATE,
  license_verified BOOLEAN DEFAULT FALSE,
  license_verification_date TIMESTAMP,
  
  -- Contact Information
  email VARCHAR(255),
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  website_url TEXT,
  
  -- Location and Service Areas
  primary_city VARCHAR(100),
  service_areas TEXT[], -- Array of cities/regions
  
  -- Business Details
  years_experience INTEGER,
  team_size_min INTEGER,
  team_size_max INTEGER,
  project_capacity INTEGER, -- Max concurrent projects
  
  -- Diaspora-specific
  diaspora_friendly BOOLEAN DEFAULT FALSE,
  languages_spoken TEXT[],
  international_payment_accepted BOOLEAN DEFAULT FALSE,
  remote_consultation_available BOOLEAN DEFAULT FALSE,
  
  -- Pricing (optional ranges)
  hourly_rate_min_usd DECIMAL(10,2),
  hourly_rate_max_usd DECIMAL(10,2),
  project_rate_min_usd DECIMAL(10,2),
  project_rate_max_usd DECIMAL(10,2),
  
  -- Status and Verification
  verification_status VARCHAR(50) DEFAULT 'pending' 
    CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  is_active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  
  -- Ratings and Reviews
  rating_average DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE professional_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  specialization VARCHAR(255) NOT NULL,
  experience_years INTEGER,
  certification VARCHAR(255)
);

CREATE TABLE professional_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  project_name VARCHAR(255),
  project_description TEXT,
  project_type VARCHAR(100),
  completion_date DATE,
  project_value_usd DECIMAL(12,2),
  client_testimonial TEXT,
  image_urls TEXT[],
  is_featured BOOLEAN DEFAULT FALSE
);

CREATE TABLE professional_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id),
  reviewer_user_id UUID REFERENCES profiles(id),
  project_type VARCHAR(100),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(255),
  review_text TEXT,
  pros TEXT[],
  cons TEXT[],
  would_recommend BOOLEAN,
  project_completion_date DATE,
  verified_client BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(professional_id, reviewer_user_id) -- One review per user per professional
);

CREATE TABLE professional_contact_reveals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id),
  user_id UUID REFERENCES profiles(id),
  contact_type VARCHAR(50), -- 'email', 'phone', 'whatsapp', 'full'
  revealed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(professional_id, user_id, contact_type)
);

-- Full-text search indexes
CREATE INDEX idx_professionals_search ON professionals 
  USING GIN (to_tsvector('english', business_name || ' ' || contact_person));
CREATE INDEX idx_professionals_location ON professionals(primary_city);
CREATE INDEX idx_professionals_category ON professionals(category_id);
CREATE INDEX idx_professionals_rating ON professionals(rating_average DESC);
CREATE INDEX idx_professionals_verified ON professionals(license_verified, verification_status);

Frontend Components Architecture

ProfessionalGrid: Main directory listing with pagination
ProfessionalCard: Individual professional preview card
ProfessionalModal: Detailed professional profile modal
SearchFilters: Advanced search and filtering interface
ContactReveal: Premium feature for contact information
RatingDisplay: Star rating and review summary
PortfolioGallery: Project showcase component
ReviewsList: Reviews and ratings display


CRUD Operations
Create Operations:

Professional profile registration
Portfolio project addition
Review and rating submission
Contact reveal tracking
Professional verification requests

Read Operations:

Search professionals with filters
Fetch professional details
Retrieve reviews and ratings
Get portfolio projects
View contact reveal history

Update Operations:

Professional profile updates
Portfolio project modifications
Review editing (within time limit)
Verification status updates
Rating recalculation

Delete Operations:

Professional profile deactivation (soft delete)
Portfolio project removal
Review removal (with approval)
Contact reveal data cleanup


API Endpoints
typescript// GET /api/professionals/search
interface ProfessionalSearchParams {
  q?: string; // Search query
  category?: string;
  city?: string;
  service_areas?: string[];
  min_rating?: number;
  diaspora_friendly?: boolean;
  verified_only?: boolean;
  min_experience?: number;
  specializations?: string[];
  sort_by?: 'rating' | 'experience' | 'reviews' | 'featured';
  page?: number;
  limit?: number;
}

interface ProfessionalSearchResponse {
  professionals: Professional[];
  total: number;
  filters: {
    categories: Category[];
    cities: string[];
    specializations: string[];
  };
  pagination: {
    page: number;
    limit: number;
    total_pages: number;
  };
}

// POST /api/professionals/contact-reveal
interface ContactRevealRequest {
  professional_id: string;
  contact_type: 'email' | 'phone' | 'whatsapp' | 'full';
}

// POST /api/professionals/reviews
interface CreateReviewRequest {
  professional_id: string;
  rating: number;
  review_title: string;
  review_text: string;
  pros: string[];
  cons: string[];
  would_recommend: boolean;
  project_type: string;
  project_completion_date: string;
}

// PUT /api/professionals/[id]
interface UpdateProfessionalRequest {
  business_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  service_areas?: string[];
  specializations?: string[];
  diaspora_friendly?: boolean;
  hourly_rate_min_usd?: number;
  hourly_rate_max_usd?: number;
}

Verification System Implementation

License number validation against official registers
Automated license expiry tracking
Community reporting system for fraudulent profiles


RetryTMContinueEditContinued from Feature 4: Professional Directory & Verification System

Verification System Implementation (continued)

Periodic license status checks with government APIs
Photo ID verification for professional profiles
Business registration document verification
Third-party background check integration (premium)
Verification badge system with trust levels
Appeal process for rejected verifications


Contact Reveal System

Tiered contact information access based on subscription
Usage tracking and limits for free users
Premium unlimited contact reveals
Contact attempt tracking and success rates
Professional response time analytics
Lead quality scoring for professionals


Rating and Review System

Weighted rating calculation (recent reviews weighted higher)
Review authenticity verification
Photo and project evidence uploads
Professional response to reviews
Review moderation and dispute resolution
Aggregate rating display with breakdown


Search Algorithm Implementation
typescript// Search ranking algorithm
interface SearchRankingFactors {
  text_relevance: number;      // 0.3 weight
  rating_score: number;        // 0.25 weight
  verification_status: number; // 0.2 weight
  review_count: number;        // 0.1 weight
  response_rate: number;       // 0.1 weight
  featured_boost: number;      // 0.05 weight
}

function calculateSearchRank(professional: Professional, query: string): number {
  const factors = {
    text_relevance: calculateTextRelevance(professional, query),
    rating_score: professional.rating_average / 5,
    verification_status: professional.license_verified ? 1 : 0.5,
    review_count: Math.min(professional.review_count / 50, 1),
    response_rate: professional.response_rate || 0,
    featured_boost: professional.featured ? 1 : 0
  };

  return (
    factors.text_relevance * 0.3 +
    factors.rating_score * 0.25 +
    factors.verification_status * 0.2 +
    factors.review_count * 0.1 +
    factors.response_rate * 0.1 +
    factors.featured_boost * 0.05
  );
}


Feature 5: Cost Range Calculator & Financial Planning
Feature Goal: Provide accurate, city-specific cost estimates for building projects with detailed breakdowns, scenario planning, and budget tracking capabilities.
API Relationships:

Journey stages API for stage-specific costs
Compliance API for permit fees
Professional directory API for labor costs
Currency exchange API for real-time USD/ZWL rates

Detailed Feature Requirements:

Multi-Variable Cost Estimation

Plot size and location-based calculations
Building type and quality level selection
Material cost variations and availability
Labor cost differences by region
Seasonal price adjustments
Currency fluctuation impact analysis


Detailed Cost Breakdowns

Stage-by-stage cost allocation
Material vs. labor cost separation
Fixed vs. variable cost identification
Permit and compliance cost integration
Contingency and buffer recommendations
Historical cost trend analysis


Financial Planning Tools

Payment schedule optimization
Cash flow projection
Budget tracking and variance analysis
Financing option comparisons
ROI calculations for investment properties
Currency hedge recommendations



Detailed Implementation Guide:

Database Schema Design
sqlCREATE TABLE cost_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER,
  icon VARCHAR(100)
);

CREATE TABLE cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES cost_categories(id),
  stage_id UUID REFERENCES journey_stages(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_type VARCHAR(50), -- 'per_sqm', 'per_unit', 'fixed', 'percentage'
  base_cost_usd DECIMAL(10,2),
  cost_variance_percent DECIMAL(5,2) DEFAULT 20, -- For min/max calculation
  
  -- Regional variations
  harare_multiplier DECIMAL(4,2) DEFAULT 1.0,
  bulawayo_multiplier DECIMAL(4,2) DEFAULT 0.9,
  rural_multiplier DECIMAL(4,2) DEFAULT 0.7,
  
  -- Quality level multipliers
  basic_quality_multiplier DECIMAL(4,2) DEFAULT 0.8,
  standard_quality_multiplier DECIMAL(4,2) DEFAULT 1.0,
  premium_quality_multiplier DECIMAL(4,2) DEFAULT 1.5,
  luxury_quality_multiplier DECIMAL(4,2) DEFAULT 2.5,
  
  -- Seasonal factors
  dry_season_multiplier DECIMAL(4,2) DEFAULT 1.0,
  wet_season_multiplier DECIMAL(4,2) DEFAULT 1.1,
  
  is_optional BOOLEAN DEFAULT FALSE,
  is_premium_content BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(15,6) NOT NULL,
  rate_date DATE NOT NULL,
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(from_currency, to_currency, rate_date)
);

CREATE TABLE cost_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  project_name VARCHAR(255),
  
  -- Input parameters
  plot_size_sqm DECIMAL(10,2),
  building_size_sqm DECIMAL(10,2),
  city VARCHAR(100),
  quality_level VARCHAR(50) CHECK (quality_level IN ('basic', 'standard', 'premium', 'luxury')),
  building_type VARCHAR(100),
  construction_season VARCHAR(50),
  
  -- Calculated results
  total_cost_min_usd DECIMAL(12,2),
  total_cost_avg_usd DECIMAL(12,2),
  total_cost_max_usd DECIMAL(12,2),
  
  -- Exchange rate at calculation
  usd_zwl_rate DECIMAL(15,6),
  total_cost_zwl DECIMAL(15,2),
  
  -- Breakdown
  material_cost_usd DECIMAL(12,2),
  labor_cost_usd DECIMAL(12,2),
  permit_cost_usd DECIMAL(12,2),
  contingency_percent DECIMAL(5,2) DEFAULT 15,
  
  calculation_date TIMESTAMP DEFAULT NOW(),
  is_saved BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cost_estimate_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID REFERENCES cost_estimates(id) ON DELETE CASCADE,
  cost_item_id UUID REFERENCES cost_items(id),
  quantity DECIMAL(10,2),
  unit_cost_usd DECIMAL(10,2),
  total_cost_usd DECIMAL(12,2),
  notes TEXT
);

CREATE TABLE budget_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID REFERENCES cost_estimates(id),
  user_id UUID REFERENCES profiles(id),
  actual_spent_usd DECIMAL(12,2) DEFAULT 0,
  budget_remaining_usd DECIMAL(12,2),
  variance_percent DECIMAL(5,2),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cost_items_stage ON cost_items(stage_id);
CREATE INDEX idx_cost_estimates_user ON cost_estimates(user_id);
CREATE INDEX idx_currency_rates_date ON currency_rates(rate_date DESC);

Frontend Components Architecture

CostCalculator: Main calculator interface with inputs
PlotSizeInput: Interactive plot size selector with validation
QualityLevelSelector: Building quality level chooser
CostBreakdown: Detailed cost breakdown visualization
EstimateResults: Results display with sharing options
BudgetTracker: Budget vs. actual spending tracker
PaymentSchedule: Recommended payment timeline
CurrencyConverter: Real-time currency conversion


CRUD Operations
Create Operations:

Generate new cost estimates
Save estimate configurations
Create budget tracking records
Export estimate reports
Generate payment schedules

Read Operations:

Fetch saved estimates
Retrieve cost item databases
Get currency exchange rates
Calculate real-time estimates
Generate comparative reports

Update Operations:

Modify estimate parameters
Update actual spending amounts
Recalculate with new rates
Adjust contingency percentages
Update material preferences

Delete Operations:

Remove saved estimates
Clear budget tracking history
Archive old calculations
Clean up temporary estimates


API Endpoints
typescript// POST /api/calculator/estimate
interface CostEstimateRequest {
  plot_size_sqm: number;
  building_size_sqm: number;
  city: string;
  quality_level: 'basic' | 'standard' | 'premium' | 'luxury';
  building_type: string;
  construction_season?: 'dry' | 'wet';
  include_optionals: boolean;
  contingency_percent?: number;
  save_estimate?: boolean;
  project_name?: string;
}

interface CostEstimateResponse {
  estimate_id: string;
  total_costs: {
    min_usd: number;
    avg_usd: number;
    max_usd: number;
    zwl_equivalent: number;
    currency_rate: number;
  };
  breakdown: {
    category: string;
    items: CostLineItem[];
    subtotal_usd: number;
    percentage_of_total: number;
  }[];
  payment_schedule: PaymentMilestone[];
  assumptions: string[];
  last_updated: string;
}

// GET /api/calculator/estimates?user_id={id}
interface SavedEstimatesResponse {
  estimates: SavedEstimate[];
  total: number;
}

// PUT /api/calculator/estimates/[id]/budget
interface BudgetUpdateRequest {
  actual_spent_usd: number;
  category_breakdown: {
    category_id: string;
    spent_amount: number;
  }[];
  notes?: string;
}

// GET /api/calculator/currency-rates
interface CurrencyRatesResponse {
  usd_zwl: {
    rate: number;
    last_updated: string;
    trend: 'up' | 'down' | 'stable';
  };
  historical_rates: {
    date: string;
    rate: number;
  }[];
}

Calculation Engine Implementation
typescriptclass CostCalculationEngine {
  async calculateEstimate(params: CostEstimateRequest): Promise<CostEstimateResponse> {
    // 1. Fetch base cost items for selected stages
    const costItems = await this.getCostItems(params.building_type);
    
    // 2. Apply regional multipliers
    const regionalItems = this.applyRegionalMultipliers(costItems, params.city);
    
    // 3. Apply quality level adjustments
    const qualityAdjustedItems = this.applyQualityMultipliers(regionalItems, params.quality_level);
    
    // 4. Calculate quantities based on building size
    const quantifiedItems = this.calculateQuantities(qualityAdjustedItems, params);
    
    // 5. Apply seasonal adjustments
    const seasonalItems = this.applySeasonalAdjustments(quantifiedItems, params.construction_season);
    
    // 6. Calculate totals with variance ranges
    const totals = this.calculateTotals(seasonalItems);
    
    // 7. Add contingency and buffer
    const finalTotals = this.addContingency(totals, params.contingency_percent || 15);
    
    // 8. Convert to local currency
    const currencyRate = await this.getCurrentExchangeRate('USD', 'ZWL');
    
    return this.formatResponse(finalTotals, currencyRate, quantifiedItems);
  }

  private applyRegionalMultipliers(items: CostItem[], city: string): CostItem[] {
    const multiplierMap = {
      'harare': 'harare_multiplier',
      'bulawayo': 'bulawayo_multiplier',
      'rural': 'rural_multiplier'
    };

    return items.map(item => ({
      ...item,
      base_cost_usd: item.base_cost_usd * item[multiplierMap[city] || 'rural_multiplier']
    }));
  }

  private calculateQuantities(items: CostItem[], params: CostEstimateRequest): CostLineItem[] {
    return items.map(item => {
      let quantity = 1;
      
      switch (item.unit_type) {
        case 'per_sqm':
          quantity = params.building_size_sqm;
          break;
        case 'per_plot':
          quantity = 1;
          break;
        case 'percentage':
          // Calculate as percentage of other costs
          quantity = this.calculatePercentageBase(items, item);
          break;
      }

      const unitCost = item.base_cost_usd;
      const totalCost = quantity * unitCost;
      const variance = totalCost * (item.cost_variance_percent / 100);

      return {
        cost_item_id: item.id,
        name: item.name,
        quantity,
        unit_cost_usd: unitCost,
        total_cost_min: totalCost - variance,
        total_cost_avg: totalCost,
        total_cost_max: totalCost + variance,
        category: item.category_name
      };
    });
  }
}

Payment Schedule Generation
typescriptinterface PaymentMilestone {
  stage_name: string;
  percentage: number;
  amount_usd: number;
  recommended_timing: string;
  description: string;
}

function generatePaymentSchedule(totalCost: number, stages: JourneyStage[]): PaymentMilestone[] {
  const standardSchedule = [
    { stage: 'Foundation', percentage: 30, timing: 'Before foundation work begins' },
    { stage: 'Walls & Roof', percentage: 25, timing: 'At roof level completion' },
    { stage: 'Windows & Doors', percentage: 15, timing: 'At window/door installation' },
    { stage: 'Electrical & Plumbing', percentage: 15, timing: 'At first fix completion' },
    { stage: 'Finishing', percentage: 10, timing: 'At finishing commencement' },
    { stage: 'Final Payment', percentage: 5, timing: 'On satisfactory completion' }
  ];

  return standardSchedule.map(schedule => ({
    stage_name: schedule.stage,
    percentage: schedule.percentage,
    amount_usd: totalCost * (schedule.percentage / 100),
    recommended_timing: schedule.timing,
    description: `${schedule.percentage}% payment due ${schedule.timing.toLowerCase()}`
  }));
}


Feature 6: Community Q&A and Knowledge Sharing
Feature Goal: Create a comprehensive knowledge-sharing platform with forums, case studies, build journals, and peer-to-peer advice exchange.
API Relationships:

User authentication API for posting permissions
Professional directory API for expert contributions
Analytics API for content engagement tracking
Moderation API for content quality control

Detailed Feature Requirements:

Forum System

Category-based discussion threads
Rich text posting with image support
Voting and reputation system
Expert contributor highlighting
Search and filtering capabilities
Mobile-optimized discussion interface


Case Study Database

AI-curated YouTube content analysis
Project cost and timeline breakdowns
Photo galleries and progress documentation
Lessons learned compilation
Searchable by budget, location, and project type
Expert commentary and analysis


Build Journal System

Personal project documentation
Progress photo uploads
Cost tracking integration
Timeline milestone recording
Community feedback and advice
Privacy controls and sharing options



Detailed Implementation Guide:

Database Schema Design
sqlCREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  display_order INTEGER,
  post_count INTEGER DEFAULT 0,
  is_premium_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES forum_categories(id),
  title VARCHAR(500) NOT NULL,
  created_by UUID REFERENCES profiles(id),
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_solved BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 1,
  last_activity_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  parent_post_id UUID REFERENCES forum_posts(id), -- For replies
  created_by UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  content_html TEXT, -- Rendered HTML version
  image_urls TEXT[],
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_solution BOOLEAN DEFAULT FALSE,
  is_expert_answer BOOLEAN DEFAULT FALSE,
  edit_count INTEGER DEFAULT 0,
  last_edited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  project_type VARCHAR(100),
  location VARCHAR(255),
  budget_category VARCHAR(50) CHECK (budget_category IN ('budget', 'mid-range', 'luxury')),
  
  -- Project details
  plot_size_sqm DECIMAL(10,2),
  building_size_sqm DECIMAL(10,2),
  total_cost_usd DECIMAL(12,2),
  duration_months INTEGER,
  completion_date DATE,
  
  -- Content
  content TEXT, -- Main case study content
  lessons_learned TEXT[],
  challenges_faced TEXT[],
  cost_breakdown JSONB,
  timeline_breakdown JSONB,
  image_urls TEXT[],
  video_urls TEXT[],
  
  -- Source information
  source_type VARCHAR(50) CHECK (source_type IN ('youtube', 'user_submitted', 'professional')),
  source_url TEXT,
  source_creator VARCHAR(255),
  ai_curated BOOLEAN DEFAULT FALSE,
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE build_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  
  -- Project details
  project_type VARCHAR(100),
  location VARCHAR(255),
  plot_size_sqm DECIMAL(10,2),
  planned_budget_usd DECIMAL(12,2),
  actual_cost_usd DECIMAL(12,2) DEFAULT 0,
  start_date DATE,
  planned_completion_date DATE,
  actual_completion_date DATE,
  current_stage_id UUID REFERENCES journey_stages(id),
  
  -- Privacy settings
  visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'community', 'public')),
  allow_comments BOOLEAN DEFAULT TRUE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'planning' 
    CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'abandoned')),
  
  -- Engagement
  follower_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID REFERENCES build_journals(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  entry_date DATE DEFAULT CURRENT_DATE,
  stage_id UUID REFERENCES journey_stages(id),
  
  -- Progress tracking
  percentage_complete DECIMAL(5,2),
  cost_to_date_usd DECIMAL(12,2),
  
  -- Media
  image_urls TEXT[],
  video_urls TEXT[],
  document_urls TEXT[],
  
  -- Mood/sentiment
  mood VARCHAR(20) CHECK (mood IN ('excited', 'optimistic', 'neutral', 'concerned', 'frustrated')),
  challenges TEXT[],
  achievements TEXT[],
  lessons_learned TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE community_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id),
  following_type VARCHAR(20) CHECK (following_type IN ('journal', 'thread', 'user')),
  following_id UUID, -- Can reference journals, threads, or users
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_type, following_id)
);

-- Full-text search indexes
CREATE INDEX idx_forum_posts_search ON forum_posts 
  USING GIN (to_tsvector('english', content));
CREATE INDEX idx_case_studies_search ON case_studies 
  USING GIN (to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_build_journals_search ON build_journals 
  USING GIN (to_tsvector('english', title || ' ' || description));

-- Performance indexes
CREATE INDEX idx_forum_threads_activity ON forum_threads(last_activity_at DESC);
CREATE INDEX idx_forum_posts_thread ON forum_posts(thread_id, created_at);
CREATE INDEX idx_case_studies_featured ON case_studies(featured DESC, view_count DESC);
CREATE INDEX idx_journal_entries_journal ON journal_entries(journal_id, entry_date DESC);

Frontend Components Architecture

CommunityDashboard: Main community hub with activity feed
ForumList: Category-based forum listing
ThreadView: Individual thread display with posts
PostEditor: Rich text editor for posts and replies
CaseStudyGrid: Searchable case study library
CaseStudyDetail: Detailed case study view
BuildJournalList: Personal and community journals
JournalEditor: Journal entry creation and editing
CommunitySearch: Global search across all content
ModerationTools: Content moderation interface (admin)


CRUD Operations
Create Operations:

Create forum threads and posts
Submit new case studies
Start build journals
Add journal entries
Upload media content
Create community polls

Read Operations:

Browse forum categories and threads
Search case studies by criteria
View build journal progress
Fetch community activity feeds
Generate trending content lists
Retrieve user contribution history

Update Operations:

Edit posts and journal entries
Update journal progress status
Modify case study information
Change privacy settings
Update user following preferences
Vote on posts and content

Delete Operations:

Remove posts (soft delete with moderation)
Archive completed journals
Hide inappropriate content
Unfollow journals and threads
Clean up spam submissions


API Endpoints
typescript// GET /api/community/forum/categories
interface ForumCategoriesResponse {
  categories: {
    id: string;
    name: string;
    description: string;
    post_count: number;
    latest_activity: {
      thread_title: string;
      last_post_at: string;
      author: string;
    };
  }[];
}

// GET /api/community/forum/threads?category_id={id}&sort={sort}&page={page}
interface ForumThreadsResponse {
  threads: {
    id: string;
    title: string;
    created_by: UserProfile;
    post_count: number;
    view_count: number;
    last_activity_at: string;
    is_pinned: boolean;
    is_solved: boolean;
  }[];
  pagination: PaginationInfo;
}

// POST /api/community/forum/threads
interface CreateThreadRequest {
  category_id: string;
  title: string;
  content: string;
  images?: File[];
}

// GET /api/community/case-studies/search
interface CaseStudySearchParams {
  q?: string;
  project_type?: string;
  budget_category?: 'budget' | 'mid-range' | 'luxury';
  location?: string;
  min_cost?: number;
  max_cost?: number;
  completion_year?: number;
  sort_by?: 'relevance' | 'cost' | 'date' | 'helpful';
}

// POST /api/community/journals
interface CreateJournalRequest {
  title: string;
  description: string;
  project_type: string;
  location: string;
  plot_size_sqm: number;
  planned_budget_usd: number;
  start_date: string;
  planned_completion_date: string;
  visibility: 'private' | 'community' | 'public';
}

// POST /api/community/journals/[id]/entries
interface CreateJournalEntryRequest {
  title: string;
  content: string;
  entry_date: string;
  stage_id?: string;
  percentage_complete: number;
  cost_to_date_usd: number;
  mood: string;
  challenges: string[];
  achievements: string[];
  images?: File[];
}

Content Moderation System
typescriptinterface ModerationRule {
  id: string;
  name: string;
  type: 'keyword' | 'pattern' | 'ai_detection';
  criteria: string;
  action: 'flag' | 'hide' | 'delete' | 'warn';
  severity: 'low' | 'medium' | 'high';
}

class ContentModerationEngine {
  async moderateContent(content: string, contentType: string): Promise<ModerationResult> {
    const results = await Promise.all([
      this.checkProfanity(content),
      this.checkSpam(content),
      this.checkPromotional(content),
      this.checkMisinformation(content)
    ]);

    return this.aggregateResults(results);
  }

  private async checkProfanity(content: string): Promise<ModerationFlag> {
    // Implement profanity detection
  }

  private async checkSpam(content: string): Promise<ModerationFlag> {
    // Implement spam detection using patterns and ML
  }
}

AI Content Curation System
typescriptinterface YouTubeVideoAnalysis {
  video_id: string;
  title: string;
  description: string;
  duration: number;
  view_count: number;
  upload_date: string;
  channel_name: string;
  extracted_data: {
    project_type: string;
    location: string;
    budget_mentioned: boolean;
    cost_breakdown: CostItem[];
    timeline_mentioned: boolean;
    lessons_learned: string[];
    quality_score: number;
  };
}

class AIContentCurator {
  async analyzeYouTubeVideo(videoId: string): Promise<YouTubeVideoAnalysis> {
    // 1. Fetch video metadata and transcript
    const metadata = await this.fetchVideoMetadata(videoId);
    const transcript = await this.extractTranscript(videoId);
    
    // 2. Extract structured data using NLP
    const extractedData = await this.extractProjectData(transcript, metadata);
    
    // 3. Score content quality and relevance
    const qualityScore = this.calculateQualityScore(extractedData);
    
    return {
      video_id: videoId,
      ...metadata,
      extracted_data: {
        ...extractedData,
        quality_score: qualityScore
      }
    };
  }

  private calculateQualityScore(data: any): number {
    let score = 0;
    
    // Content completeness
    if (data.budget_mentioned) score += 25;
    if (data.timeline_mentioned) score += 25;
    if (data.cost_breakdown.length > 0) score += 25;
    if (data.lessons_learned.length > 0) score += 25;
    
    // Adjust for video quality indicators
    score *= this.getVideoQualityMultiplier(data);
    
    return Math.min(score, 100);
  }
}

Real-time Features Implementation
typescript// WebSocket events for real-time community features
interface CommunityWebSocketEvents {
  'new_post': {
    thread_id: string;
    post: ForumPost;
  };
  'journal_update': {
    journal_id: string;
    entry: JournalEntry;
  };
  'user_online': {
    user_id: string;
    status: 'online' | 'offline';
  };
  'thread_activity': {
    thread_id: string;
    activity_type: 'new_post' | 'vote' | 'solution_marked';
    user: UserProfile;
  };
}

// Real-time notification system
class CommunityNotificationService {
  async notifyFollowers(event: CommunityEvent): Promise<void> {
    const followers = await this.getFollowers(event.target_id, event.type);
    
    const notifications = followers.map(follower => ({
      user_id: follower.id,
      type: event.type,
      title: this.generateNotificationTitle(event),
      content: this.generateNotificationContent(event),
      action_url: this.generateActionUrl(event),
      created_at: new Date()
    }));

    await this.sendBatchNotifications(notifications);
  }
}


This comprehensive feature specification provides detailed implementation guidance for building a robust community platform that encourages knowledge sharing, peer support, and professional networking within the BuildDiaspora Zimbabwe ecosystem. The system balances user engagement with content quality through moderation and AI curation, while providing multiple avenues for users to share their building experiences and learn from others.