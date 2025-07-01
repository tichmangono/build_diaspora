/* ===============================================
   BuildDiaspora Zimbabwe - Modern Design System
   =============================================== */

/* CSS Custom Properties (Design Tokens) */
:root {
  /* Colors - Zimbabwean-inspired palette */
  --color-primary-50: #f0fdf4;
  --color-primary-100: #dcfce7;
  --color-primary-200: #bbf7d0;
  --color-primary-300: #86efac;
  --color-primary-400: #4ade80;
  --color-primary-500: #1B4B3A; /* Deep emerald green */
  --color-primary-600: #16a34a;
  --color-primary-700: #15803d;
  --color-primary-800: #166534;
  --color-primary-900: #14532d;

  /* Gold accents */
  --color-accent-50: #fffbeb;
  --color-accent-100: #fef3c7;
  --color-accent-200: #fde68a;
  --color-accent-300: #fcd34d;
  --color-accent-400: #D4AF37; /* Warm gold */
  --color-accent-500: #f59e0b;
  --color-accent-600: #d97706;
  --color-accent-700: #b45309;
  --color-accent-800: #92400e;
  --color-accent-900: #78350f;

  /* Neutrals - Modern grays */
  --color-neutral-0: #ffffff;
  --color-neutral-50: #F5F7FA;
  --color-neutral-100: #E4E7EB;
  --color-neutral-200: #C1C7CD;
  --color-neutral-300: #9DA4AE;
  --color-neutral-400: #8B9196;
  --color-neutral-500: #6B7280;
  --color-neutral-600: #4B5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1F2937;
  --color-neutral-900: #111827;

  /* Semantic colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Typography Scale */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-secondary: 'Merriweather', Georgia, serif;
  
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */

  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Spacing Scale (8px grid) */
  --spacing-0: 0;
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-5: 1.25rem;  /* 20px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  --spacing-10: 2.5rem;  /* 40px */
  --spacing-12: 3rem;    /* 48px */
  --spacing-16: 4rem;    /* 64px */
  --spacing-20: 5rem;    /* 80px */
  --spacing-24: 6rem;    /* 96px */

  /* Border radius */
  --radius-none: 0;
  --radius-sm: 0.25rem;   /* 4px */
  --radius-base: 0.5rem;  /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Z-index scale */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-toast: 1080;

  /* Animation timing */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}

/* ===============================================
   Base Styles & Reset
   =============================================== */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-neutral-800);
  background-color: var(--color-neutral-0);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ===============================================
   Typography System
   =============================================== */

.text-display-1 {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.025em;
}

.text-display-2 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.025em;
}

.text-heading-1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.text-heading-2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.text-heading-3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
}

.text-body-large {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
}

.text-body {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

.text-body-small {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

.text-caption {
  font-size: var(--font-size-xs);
  line-height: var(--line-height-normal);
  color: var(--color-neutral-600);
}

/* Long-form content styling */
.text-longform {
  font-family: var(--font-family-secondary);
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
}

/* ===============================================
   Layout System
   =============================================== */

/* Container system */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

.container-sm {
  max-width: 640px;
}

.container-md {
  max-width: 768px;
}

.container-lg {
  max-width: 1024px;
}

.container-xl {
  max-width: 1280px;
}

.container-2xl {
  max-width: 1536px;
}

/* Grid system */
.grid {
  display: grid;
  gap: var(--spacing-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }

/* Flexbox utilities */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.items-start {
  align-items: flex-start;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-1 { gap: var(--spacing-1); }
.gap-2 { gap: var(--spacing-2); }
.gap-3 { gap: var(--spacing-3); }
.gap-4 { gap: var(--spacing-4); }
.gap-6 { gap: var(--spacing-6); }
.gap-8 { gap: var(--spacing-8); }

/* ===============================================
   Component Styles
   =============================================== */

/* Card Component */
.card {
  background: var(--color-neutral-0);
  border: 1px solid var(--color-neutral-100);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-normal) var(--ease-out);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.card-header {
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-neutral-100);
}

.card-content {
  padding: var(--spacing-6);
}

.card-footer {
  padding: var(--spacing-6);
  border-top: 1px solid var(--color-neutral-100);
  background: var(--color-neutral-50);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

/* Premium card variant */
.card-premium {
  border: 2px solid var(--color-accent-400);
  position: relative;
  overflow: hidden;
}

.card-premium::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-accent-400), var(--color-primary-500));
}

/* Button System */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border: 1px solid transparent;
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  text-decoration: none;
  min-height: 44px; /* Touch-friendly */
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Button variants */
.btn-primary {
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
  border-color: var(--color-primary-500);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

.btn-secondary {
  background: var(--color-neutral-0);
  color: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-primary-50);
}

.btn-accent {
  background: var(--color-accent-400);
  color: var(--color-neutral-900);
  border-color: var(--color-accent-400);
}

.btn-accent:hover:not(:disabled) {
  background: var(--color-accent-500);
  border-color: var(--color-accent-500);
}

.btn-ghost {
  background: transparent;
  color: var(--color-neutral-600);
  border-color: transparent;
}

.btn-ghost:hover:not(:disabled) {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
}

/* Button sizes */
.btn-sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-xs);
  min-height: 36px;
}

.btn-lg {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--font-size-base);
  min-height: 52px;
}

/* Form Elements */
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
}

.form-input {
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-base);
  font-size: var(--font-size-base);
  transition: border-color var(--duration-fast) var(--ease-out);
  min-height: 44px;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(27, 75, 58, 0.1);
}

.form-input:invalid {
  border-color: var(--color-error);
}

.form-error {
  font-size: var(--font-size-sm);
  color: var(--color-error);
}

/* Badge Component */
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
}

.badge-success {
  background: var(--color-success);
  color: var(--color-neutral-0);
}

.badge-warning {
  background: var(--color-warning);
  color: var(--color-neutral-0);
}

.badge-premium {
  background: var(--color-accent-400);
  color: var(--color-neutral-900);
}

.badge-verified {
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
}

/* Progress Bar */
.progress {
  width: 100%;
  height: 8px;
  background: var(--color-neutral-100);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-accent-400));
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-out);
}

/* ===============================================
   Layout Components
   =============================================== */

/* Header */
.header {
  background: var(--color-neutral-0);
  border-bottom: 1px solid var(--color-neutral-100);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) 0;
}

/* Sidebar */
.sidebar {
  background: var(--color-neutral-50);
  border-right: 1px solid var(--color-neutral-100);
  min-height: calc(100vh - 80px);
  padding: var(--spacing-6);
}

/* Main content area */
.main-content {
  flex: 1;
  padding: var(--spacing-6);
  max-width: 100%;
  overflow-x: auto;
}

/* ===============================================
   Utility Classes
   =============================================== */

/* Spacing utilities */
.p-0 { padding: var(--spacing-0); }
.p-1 { padding: var(--spacing-1); }
.p-2 { padding: var(--spacing-2); }
.p-3 { padding: var(--spacing-3); }
.p-4 { padding: var(--spacing-4); }
.p-6 { padding: var(--spacing-6); }
.p-8 { padding: var(--spacing-8); }

.m-0 { margin: var(--spacing-0); }
.m-1 { margin: var(--spacing-1); }
.m-2 { margin: var(--spacing-2); }
.m-3 { margin: var(--spacing-3); }
.m-4 { margin: var(--spacing-4); }
.m-6 { margin: var(--spacing-6); }
.m-8 { margin: var(--spacing-8); }

/* Text utilities */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

.text-primary { color: var(--color-primary-500); }
.text-accent { color: var(--color-accent-400); }
.text-success { color: var(--color-success); }
.text-warning { color: var(--color-warning); }
.text-error { color: var(--color-error); }
.text-muted { color: var(--color-neutral-600); }

/* Background utilities */
.bg-primary { background-color: var(--color-primary-500); }
.bg-accent { background-color: var(--color-accent-400); }
.bg-neutral-50 { background-color: var(--color-neutral-50); }
.bg-white { background-color: var(--color-neutral-0); }

/* Border utilities */
.border { border: 1px solid var(--color-neutral-200); }
.border-primary { border-color: var(--color-primary-500); }
.border-accent { border-color: var(--color-accent-400); }

.rounded { border-radius: var(--radius-base); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-full { border-radius: var(--radius-full); }

/* Shadow utilities */
.shadow-sm { box-shadow: var(--shadow-sm); }
.shadow { box-shadow: var(--shadow-base); }
.shadow-md { box-shadow: var(--shadow-md); }
.shadow-lg { box-shadow: var(--shadow-lg); }

/* Display utilities */
.hidden { display: none; }
.block { display: block; }
.inline-block { display: inline-block; }
.flex { display: flex; }
.grid { display: grid; }

/* Position utilities */
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.sticky { position: sticky; }

/* ===============================================
   Responsive Design
   =============================================== */

/* Mobile-first breakpoints */
@media (min-width: 480px) {
  .sm\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sm\:flex-row { flex-direction: row; }
  .sm\:text-left { text-align: left; }
}

@media (min-width: 768px) {
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .md\:text-lg { font-size: var(--font-size-lg); }
  .md\:p-8 { padding: var(--spacing-8); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .lg\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .lg\:flex-row { flex-direction: row; }
  .lg\:text-xl { font-size: var(--font-size-xl); }
}

@media (min-width: 1280px) {
  .xl\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}

/* ===============================================
   Animation & Transitions
   =============================================== */

.transition {
  transition: all var(--duration-normal) var(--ease-out);
}

.transition-fast {
  transition: all var(--duration-fast) var(--ease-out);
}

.transition-slow {
  transition: all var(--duration-slow) var(--ease-out);
}

/* Hover animations */
.hover-lift {
  transition: transform var(--duration-normal) var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-2px);
}

/* Loading animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Skeleton loading */
.skeleton {
  background: linear-gradient(90deg, var(--color-neutral-100) 25%, var(--color-neutral-50) 50%, var(--color-neutral-100) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===============================================
   Accessibility & Focus States
   =============================================== */

/* Focus ring for keyboard navigation */
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(27, 75, 58, 0.2);
  border-color: var(--color-primary-500);
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .card {
    border-width: 2px;
  }
  
  .btn {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  .card {
    box-shadow: none;
    border: 1px solid var(--color-neutral-300);
  }
}