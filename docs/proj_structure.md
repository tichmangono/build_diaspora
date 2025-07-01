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