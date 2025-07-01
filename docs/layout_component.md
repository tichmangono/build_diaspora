# BuildDiaspora Zimbabwe - Layout & Component Guidelines

## Layout Architecture

### 1. Container System
```html
<!-- Main page container with responsive max-widths -->
<div class="container mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Content goes here -->
</div>

<!-- Full-width sections with contained content -->
<section class="w-full bg-neutral-50">
  <div class="container mx-auto px-4 py-16">
    <!-- Section content -->
  </div>
</section>
```

### 2. Dashboard Layout Structure
```html
<!-- Main dashboard layout -->
<div class="min-h-screen bg-neutral-50">
  <!-- Header -->
  <header class="bg-white border-b border-neutral-100 sticky top-0 z-sticky">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo, navigation, user menu -->
      </div>
    </div>
  </header>

  <!-- Main content area -->
  <div class="flex">
    <!-- Sidebar (desktop) -->
    <aside class="hidden lg:block w-64 bg-white border-r border-neutral-100 min-h-screen">
      <!-- Navigation items -->
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-6">
      <!-- Page content -->
    </main>
  </div>
</div>
```

### 3. Grid Systems for Content

#### Professional Directory Grid
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <!-- Professional cards -->
</div>
```

#### Journey Timeline Layout
```html
<div class="grid lg:grid-cols-dashboard gap-8">
  <!-- Left: Stage navigation -->
  <div class="lg:sticky lg:top-24 lg:self-start">
    <!-- Stage list -->
  </div>
  
  <!-- Right: Stage details -->
  <div class="space-y-8">
    <!-- Stage content -->
  </div>
</div>
```

#### Cost Calculator Layout
```html
<div class="grid lg:grid-cols-calculator gap-8">
  <!-- Left: Input form -->
  <div class="space-y-6">
    <!-- Calculator inputs -->
  </div>
  
  <!-- Right: Results display -->
  <div class="lg:sticky lg:top-24">
    <!-- Cost breakdown -->
  </div>
</div>
```

## Component Design Patterns

### 1. Card Components

#### Basic Card
```html
<div class="card">
  <div class="p-6">
    <h3 class="text-heading-3 mb-2">Card Title</h3>
    <p class="text-neutral-600">Card description text.</p>
  </div>
</div>
```

#### Professional Profile Card
```html
<div class="card hover:shadow-card-hover transition-all duration-300">
  <div class="p-6">
    <!-- Header with avatar and basic info -->
    <div class="flex items-start gap-4 mb-4">
      <img class="w-12 h-12 rounded-full" src="avatar.jpg" alt="Professional">
      <div class="flex-1 min-w-0">
        <h3 class="text-heading-3 truncate">Professional Name</h3>
        <p class="text-body-small text-neutral-600">Architect • Harare</p>
      </div>
      <div class="flex items-center gap-1">
        <span class="badge badge-verified">Verified</span>
      </div>
    </div>

    <!-- Specializations -->
    <div class="flex flex-wrap gap-2 mb-4">
      <span class="badge bg-primary-50 text-primary-700">Residential</span>
      <span class="badge bg-primary-50 text-primary-700">Commercial</span>
    </div>

    <!-- Rating and experience -->
    <div class="flex items-center justify-between text-body-small text-neutral-600 mb-4">
      <div class="flex items-center gap-1">
        <span class="text-accent-400">★★★★★</span>
        <span>4.8 (24 reviews)</span>
      </div>
      <span>8 years experience</span>
    </div>

    <!-- Action buttons -->
    <div class="flex gap-2">
      <button class="btn btn-primary flex-1">View Profile</button>
      <button class="btn btn-ghost">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <!-- Heart icon -->
        </svg>
      </button>
    </div>
  </div>
</div>
```

#### Premium Content Card
```html
<div class="card card-premium">
  <div class="p-6">
    <div class="flex items-center gap-2 mb-4">
      <h3 class="text-heading-3">Premium Feature</h3>
      <span class="badge badge-premium">Premium</span>
    </div>
    
    <!-- Paywall for free users -->
    <div class="text-center py-8 border-2 border-dashed border-accent-200 rounded-lg bg-accent-50">
      <div class="max-w-sm mx-auto">
        <h4 class="text-lg font-semibold mb-2">Unlock Detailed Insights</h4>
        <p class="text-neutral-600 mb-4">Get stage-by-stage cost breakdowns, risk assessments, and expert tips.</p>
        <button class="btn btn-accent">Upgrade to Premium</button>
      </div>
    </div>
  </div>
</div>
```

### 2. Form Components

#### Input Group
```html
<div class="form-group">
  <label class="form-label" for="plot-size">Plot Size (m²)</label>
  <input 
    type="number" 
    id="plot-size" 
    class="form-input focus-ring" 
    placeholder="Enter plot size"
    min="50" 
    max="10000"
  >
  <p class="text-caption text-neutral-600">Typical residential plots range from 300-2000 m²</p>
</div>
```

#### Select with Search
```html
<div class="form-group">
  <label class="form-label" for="city">City/Location</label>
  <div class="relative">
    <select class="form-input focus-ring pr-10" id="city">
      <option value="">Select your city...</option>
      <option value="harare">Harare</option>
      <option value="bulawayo">Bulawayo</option>
      <option value="rural">Rural Areas</option>
    </select>
    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg class="w-4 h-4 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
        <!-- Chevron down icon -->
      </svg>
    </div>
  </div>
</div>
```

### 3. Navigation Components

#### Breadcrumb Navigation
```html
<nav class="flex items-center gap-2 text-body-small text-neutral-600 mb-6">
  <a href="/dashboard" class="hover:text-primary-500 transition-colors">Dashboard</a>
  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><!-- chevron --></svg>
  <a href="/journey" class="hover:text-primary-500 transition-colors">Build Journey</a>
  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><!-- chevron --></svg>
  <span class="text-neutral-900">Foundation Stage</span>
</nav>
```

#### Tab Navigation
```html
<div class="border-b border-neutral-200 mb-6">
  <nav class="flex gap-8">
    <button class="py-2 border-b-2 border-primary-500 text-primary-500 font-medium">
      Overview
    </button>
    <button class="py-2 border-b-2 border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 transition-all">
      Requirements
    </button>
    <button class="py-2 border-b-2 border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 transition-all">
      Costs
    </button>
  </nav>
</div>
```

### 4. Data Display Components

#### Progress Indicator
```html
<div class="space-y-2">
  <div class="flex justify-between text-body-small">
    <span class="text-neutral-600">Project Progress</span>
    <span class="font-medium">6 of 12 stages complete</span>
  </div>
  <div class="progress">
    <div class="progress-bar" style="width: 50%"></div>
  </div>
</div>
```

#### Cost Breakdown Table
```html
<div class="overflow-x-auto">
  <table class="w-full">
    <thead class="bg-neutral-50 border-b border-neutral-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Category
        </th>
        <th class="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Estimated Cost (USD)
        </th>
        <th class="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
          % of Total
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-neutral-200">
      <tr class="hover:bg-neutral-50">
        <td class="px-4 py-3 font-medium text-neutral-900">Foundation</td>
        <td class="px-4 py-3 text-right text-neutral-600">$8,500 - $12,000</td>
        <td class="px-4 py-3 text-right text-neutral-600">25%</td>
      </tr>
      <!-- More rows -->
    </tbody>
  </table>
</div>
```

#### Stats Grid
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  <div class="card">
    <div class="p-6 text-center">
      <div class="text-3xl font-bold text-primary-500 mb-2">$45K</div>
      <div class="text-body-small text-neutral-600">Average Build Cost</div>
    </div>
  </div>
  
  <div class="card">
    <div class="p-6 text-center">
      <div class="text-3xl font-bold text-accent-400 mb-2">18</div>
      <div class="text-body-small text-neutral-600">Months Duration</div>
    </div>
  </div>
  
  <!-- More stat cards -->
</div>
```

## Responsive Design Patterns

### 1. Mobile-First Approach
```html
<!-- Stack on mobile, side-by-side on larger screens -->
<div class="flex flex-col lg:flex-row gap-6">
  <div class="lg:w-1/3"><!-- Sidebar content --></div>
  <div class="lg:w-2/3"><!-- Main content --></div>
</div>

<!-- Hide on mobile, show on desktop -->
<div class="hidden lg:block">Desktop-only content</div>

<!-- Show on mobile, hide on desktop -->
<div class="lg:hidden">Mobile-only content</div>
```

### 2. Touch-Friendly Interactions
```html
<!-- Minimum 44px touch targets -->
<button class="btn min-h-11 px-6">Touch-friendly Button</button>

<!-- Swipeable card carousel on mobile -->
<div class="flex lg:grid lg:grid-cols-3 gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
  <div class="flex-none w-80 lg:w-auto"><!-- Card --></div>
  <div class="flex-none w-80 lg:w-auto"><!-- Card --></div>
  <!-- More cards -->
</div>
```

## Loading & Empty States

### 1. Skeleton Loading
```html
<div class="space-y-4">
  <div class="skeleton h-6 w-3/4"></div>
  <div class="skeleton h-4 w-full"></div>
  <div class="skeleton h-4 w-2/3"></div>
  <div class="skeleton h-32 w-full"></div>
</div>
```

### 2. Empty State
```html
<div class="text-center py-12">
  <div class="w-16 h-16 mx-auto mb-4 text-neutral-400">
    <!-- Empty state icon -->
    <svg fill="currentColor" viewBox="0 0 64 64">
      <!-- Icon SVG -->
    </svg>
  </div>
  <h3 class="text-heading-3 text-neutral-900 mb-2">No professionals found</h3>
  <p class="text-body text-neutral-600 mb-6 max-w-sm mx-auto">
    Try adjusting your filters or search terms to find more professionals.
  </p>
  <button class="btn btn-primary">Clear Filters</button>
</div>
```

## Accessibility Guidelines

### 1. Focus Management
```html
<!-- Visible focus rings for keyboard navigation -->
<button class="btn btn-primary focus-ring">Accessible Button</button>

<!-- Skip navigation for screen readers -->
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 btn btn-primary">
  Skip to main content
</a>
```

### 2. ARIA Labels and Roles
```html
<!-- Progress indicators -->
<div role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100" aria-label="Project completion">
  <div class="progress">
    <div class="progress-bar" style="width: 50%"></div>
  </div>
</div>

<!-- Form validation -->
<div class="form-group">
  <label for="email" class="form-label">Email Address</label>
  <input 
    type="email" 
    id="email" 
    class="form-input focus-ring" 
    aria-describedby="email-error"
    aria-invalid="false"
    required
  >
  <div id="email-error" class="form-error hidden" role="alert">
    Please enter a valid email address
  </div>
</div>

<!-- Expandable content -->
<button 
  class="btn btn-ghost" 
  aria-expanded="false" 
  aria-controls="stage-details"
  data-toggle="collapse"
>
  <span>View Stage Details</span>
  <svg class="w-4 h-4 transition-transform" fill="currentColor" viewBox="0 0 20 20">
    <!-- Chevron icon -->
  </svg>
</button>
<div id="stage-details" class="hidden" aria-labelledby="stage-button">
  <!-- Expandable content -->
</div>
```

### 3. Screen Reader Support
```html
<!-- Descriptive button text -->
<button class="btn btn-primary" aria-label="View professional profile for John Smith">
  View Profile
</button>

<!-- Status announcements -->
<div aria-live="polite" aria-atomic="true" class="sr-only" id="status-announcements">
  <!-- Dynamic status updates -->
</div>

<!-- Data table headers -->
<table class="w-full" role="table" aria-label="Cost breakdown by construction stage">
  <thead>
    <tr>
      <th scope="col" class="px-4 py-3 text-left">Stage</th>
      <th scope="col" class="px-4 py-3 text-right">Cost Range (USD)</th>
      <th scope="col" class="px-4 py-3 text-right">Duration</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row" class="px-4 py-3 font-medium">Foundation</th>
      <td class="px-4 py-3 text-right">$8,500 - $12,000</td>
      <td class="px-4 py-3 text-right">3-4 weeks</td>
    </tr>
  </tbody>
</table>
```

## Animation Guidelines

### 1. Micro-interactions
```html
<!-- Hover effects -->
<div class="card transition-all duration-300 hover:shadow-md hover:-translate-y-1">
  <!-- Card content -->
</div>

<!-- Button press feedback -->
<button class="btn btn-primary transition-all duration-150 active:scale-95">
  Click me
</button>

<!-- Loading states -->
<button class="btn btn-primary" disabled>
  <svg class="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
  Loading...
</button>
```

### 2. Page Transitions
```html
<!-- Stagger children animations -->
<div class="space-y-4">
  <div class="animate-fade-in" style="animation-delay: 0ms;">First item</div>
  <div class="animate-fade-in" style="animation-delay: 100ms;">Second item</div>
  <div class="animate-fade-in" style="animation-delay: 200ms;">Third item</div>
</div>

<!-- Modal entrance -->
<div class="fixed inset-0 z-modal flex items-center justify-center p-4">
  <div class="fixed inset-0 bg-black bg-opacity-50 animate-fade-in"></div>
  <div class="bg-white rounded-lg shadow-xl animate-scale-in max-w-md w-full">
    <!-- Modal content -->
  </div>
</div>
```

## Performance Optimization

### 1. Image Optimization
```html
<!-- Responsive images with lazy loading -->
<img 
  src="professional-thumb.jpg" 
  srcset="professional-thumb@2x.jpg 2x" 
  alt="Professional headshot"
  class="w-12 h-12 rounded-full object-cover"
  loading="lazy"
  decoding="async"
>

<!-- Hero image with placeholder -->
<div class="relative bg-neutral-100 aspect-hero">
  <img 
    src="hero-image.jpg" 
    alt="Construction site overview"
    class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
    onload="this.style.opacity=1" 
    style="opacity:0"
  >
</div>
```

### 2. Code Splitting & Lazy Loading
```html
<!-- Intersection Observer for lazy components -->
<div class="min-h-96" data-lazy-component="CostCalculator">
  <div class="skeleton h-96"></div>
</div>

<!-- Progressive enhancement -->
<noscript>
  <div class="card bg-warning-50 border-warning-200">
    <div class="p-4">
      <p class="text-warning-800">
        JavaScript is required for the interactive features. Please enable JavaScript for the best experience.
      </p>
    </div>
  </div>
</noscript>
```

## Dark Mode Preparation

### 1. Color Token Usage
```html
<!-- Use semantic color classes that will adapt to dark mode -->
<div class="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
  <h2 class="text-neutral-900 dark:text-white">Heading</h2>
  <p class="text-neutral-600 dark:text-neutral-400">Description text</p>
</div>

<!-- Card with dark mode support -->
<div class="card bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700">
  <!-- Card content -->
</div>
```

### 2. Dark Mode Toggle Component
```html
<button 
  class="btn btn-ghost p-2" 
  aria-label="Toggle dark mode"
  data-theme-toggle
>
  <!-- Sun icon for light mode -->
  <svg class="w-5 h-5 dark:hidden" fill="currentColor" viewBox="0 0 20 20">
    <!-- Sun SVG -->
  </svg>
  
  <!-- Moon icon for dark mode -->
  <svg class="w-5 h-5 hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
    <!-- Moon SVG -->
  </svg>
</button>
```

## Typography Implementation

### 1. Heading Hierarchy
```html
<!-- Page title -->
<h1 class="text-display-1 font-bold text-neutral-900 mb-2">
  Build Your Dream Home
</h1>
<p class="text-body-large text-neutral-600 mb-8">
  Navigate Zimbabwe's building process with confidence
</p>

<!-- Section headings -->
<h2 class="text-heading-1 font-semibold text-neutral-900 mb-6">
  Professional Directory
</h2>

<!-- Card titles -->
<h3 class="text-heading-3 font-semibold text-neutral-900 mb-2">
  Foundation Stage
</h3>

<!-- List items -->
<h4 class="text-body font-medium text-neutral-900">
  Item Title
</h4>
```

### 2. Long-form Content
```html
<article class="prose max-w-prose mx-auto">
  <h1>Building in Zimbabwe: A Complete Guide</h1>
  
  <p class="text-body-large text-neutral-700 font-medium">
    This comprehensive guide covers everything you need to know about building in Zimbabwe, from initial planning to final occupancy.
  </p>
  
  <h2>Getting Started</h2>
  <p>Your building journey begins with proper planning and understanding of local regulations...</p>
  
  <blockquote class="border-l-4 border-primary-500 pl-6 italic text-neutral-700">
    "The key to successful building in Zimbabwe is understanding the local context and building strong relationships with verified professionals."
  </blockquote>
</article>
```

## Error Handling & Validation

### 1. Form Validation States
```html
<!-- Success state -->
<div class="form-group">
  <label class="form-label text-success">Email Address ✓</label>
  <input class="form-input border-success focus:border-success" value="user@example.com">
  <p class="text-success text-caption">Email verified successfully</p>
</div>

<!-- Error state -->
<div class="form-group">
  <label class="form-label text-error">Password</label>
  <input class="form-input border-error focus:border-error" type="password">
  <p class="text-error text-caption">Password must be at least 8 characters</p>
</div>

<!-- Warning state -->
<div class="form-group">
  <label class="form-label text-warning">Phone Number</label>
  <input class="form-input border-warning focus:border-warning" value="+263">
  <p class="text-warning text-caption">Please include country code</p>
</div>
```

### 2. Error Messages
```html
<!-- Inline error -->
<div class="bg-error-50 border border-error-200 rounded-lg p-4 mb-4">
  <div class="flex items-start gap-3">
    <svg class="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <!-- Error icon -->
    </svg>
    <div>
      <h4 class="font-medium text-error-900">Calculation Error</h4>
      <p class="text-error-700 text-body-small">Please check your input values and try again.</p>
    </div>
  </div>
</div>

<!-- Success message -->
<div class="bg-success-50 border border-success-200 rounded-lg p-4 mb-4">
  <div class="flex items-start gap-3">
    <svg class="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <!-- Success icon -->
    </svg>
    <div>
      <h4 class="font-medium text-success-900">Estimate Saved</h4>
      <p class="text-success-700 text-body-small">Your cost estimate has been saved to your dashboard.</p>
    </div>
  </div>
</div>
```

This comprehensive design system provides:

1. **Consistent visual language** using Zimbabwean-inspired colors and modern typography
2. **Mobile-first responsive design** with touch-friendly interactions
3. **Accessible components** with proper ARIA labels and focus management
4. **Performance-optimized patterns** with lazy loading and efficient layouts
5. **Scalable component architecture** that supports the freemium business model
6. **Future-ready dark mode support** with semantic color tokens

The design emphasizes trust through transparency, professional credibility, and cultural sensitivity while maintaining a modern, sleek appearance that appeals to diaspora users making significant financial decisions about their homeland investments.