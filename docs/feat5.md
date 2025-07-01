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