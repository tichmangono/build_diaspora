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



BuildDiaspora Zimbabwe - Feature Summary for context on all features. 
Feature 1: Authentication & User Management
This feature provides secure user registration and authentication with email/OAuth login, role-based access control distinguishing between free, premium, and professional users, and comprehensive profile management including build project associations and subscription status tracking. The system implements GDPR-compliant data handling with secure session management, JWT token validation, and rate limiting to protect against unauthorized access. Users can seamlessly upgrade between tiers, manage their personal information, and maintain persistent sessions across devices while enjoying frictionless onboarding through a guided profile completion wizard.
Feature 2: Interactive Build Journey Timeline
The core feature presents Zimbabwe's complex 45-stage building process as an interactive 3D timeline that users can navigate to understand the complete construction journey from land preparation to occupancy certificate. Free users access 12 major stages with basic cost ranges and timelines, while premium subscribers unlock detailed sub-stages, city-specific variations, seasonal optimization tips, and risk mitigation strategies. The timeline integrates with other platform features to show stage-specific permit requirements, professional recommendations, and cost calculations, creating a comprehensive visual roadmap for diaspora builders.
Feature 3: Compliance Tracker & Permit Management
This feature provides a comprehensive database of building permits, inspections, and compliance requirements across Harare, Bulawayo, and rural councils, with detailed fee structures, processing times, and responsible department contact information. Users can generate personalized compliance checklists based on their project location and type, track permit application progress, upload required documents, and receive deadline reminders to avoid costly delays. The system integrates with the journey timeline to show compliance requirements at each stage and provides document management capabilities with secure file storage and easy sharing with professionals.
Feature 4: Professional Directory & Verification System
The directory features over 500 verified building professionals including architects, contractors, and engineers, with comprehensive profiles showing licenses, specializations, portfolios, and diaspora-friendly indicators for remote communication and international payments. Advanced search and filtering capabilities allow users to find professionals by location, specialty, rating, and availability, with premium users gaining access to full contact information and direct messaging capabilities. The verification system validates professional licenses against official registers, implements community-based ratings and reviews, and provides dispute resolution processes to ensure directory quality and user trust.
Feature 5: Cost Range Calculator & Financial Planning
This sophisticated calculator provides accurate, location-specific cost estimates by analyzing plot size, building specifications, quality levels, and seasonal factors to generate detailed budget ranges with material, labor, and permit cost breakdowns. The system offers comprehensive financial planning tools including payment schedule optimization, cash flow projections, budget variance tracking, and real-time currency conversion between USD and ZWL with historical trend analysis. Premium users access advanced features like ROI calculations for investment properties, financing option comparisons, scenario planning for different quality levels, and integration with actual spending tracking throughout their build journey.
Feature 6: Community Q&A and Knowledge Sharing
The community platform combines structured forums organized by building topics with AI-curated case studies from YouTube content and user-submitted build journals to create a comprehensive knowledge base of real construction experiences. Users can participate in category-based discussions, vote on helpful content, follow specific threads or journals, and contribute their own project documentation with progress photos, cost breakdowns, and lessons learned. The system implements content moderation, expert contributor highlighting, and real-time notifications to maintain quality discussions while fostering peer-to-peer support and professional networking within the diaspora building community.