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