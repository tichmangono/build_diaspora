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