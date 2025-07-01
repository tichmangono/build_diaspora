/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Zimbabwean-inspired color palette
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#1B4B3A', // Deep emerald green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#D4AF37', // Warm gold
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        neutral: {
          0: '#ffffff',
          50: '#F5F7FA',
          100: '#E4E7EB',
          200: '#C1C7CD',
          300: '#9DA4AE',
          400: '#8B9196',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      
      // Typography system
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-1': ['3rem', { lineHeight: '1.25', letterSpacing: '-0.025em' }],
        'display-2': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.025em' }],
        'heading-1': ['1.875rem', { lineHeight: '1.25' }],
        'heading-2': ['1.5rem', { lineHeight: '1.25' }],
        'heading-3': ['1.25rem', { lineHeight: '1.5' }],
        'body-large': ['1.125rem', { lineHeight: '1.75' }],
        'body': ['1rem', { lineHeight: '1.5' }],
        'body-small': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.5' }],
      },
      
      // Spacing scale (8px grid)
      spacing: {
        '0': '0',
        '1': '0.25rem',  // 4px
        '2': '0.5rem',   // 8px
        '3': '0.75rem',  // 12px
        '4': '1rem',     // 16px
        '5': '1.25rem',  // 20px
        '6': '1.5rem',   // 24px
        '8': '2rem',     // 32px
        '10': '2.5rem',  // 40px
        '12': '3rem',    // 48px
        '16': '4rem',    // 64px
        '20': '5rem',    // 80px
        '24': '6rem',    // 96px
        '32': '8rem',    // 128px
        '40': '10rem',   // 160px
        '48': '12rem',   // 192px
        '56': '14rem',   // 224px
        '64': '16rem',   // 256px
      },
      
      // Enhanced border radius
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',    // 4px
        'DEFAULT': '0.5rem', // 8px
        'lg': '0.75rem',    // 12px
        'xl': '1rem',       // 16px
        '2xl': '1.5rem',    // 24px
        '3xl': '2rem',      // 32px
        'full': '9999px',
      },
      
      // Box shadows with consistent elevation
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
        // Custom shadows for specific components
        'card-hover': '0 10px 25px -5px rgba(27, 75, 58, 0.1), 0 10px 10px -5px rgba(27, 75, 58, 0.04)',
        'premium': '0 0 0 1px rgba(212, 175, 55, 0.2), 0 10px 25px -5px rgba(212, 175, 55, 0.1)',
      },
      
      // Animation and transitions
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'loading': 'loading 1.5s infinite',
      },
      
      // Custom keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        loading: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      
      // Transition timing functions
      transitionTimingFunction: {
        'ease-in-out-custom': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out-custom': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-custom': 'cubic-bezier(0.4, 0, 1, 1)',
        'bounce-custom': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      // Z-index scale for consistent layering
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
      
      // Custom grid templates for common layouts
      gridTemplateColumns: {
        // Professional directory layout
        'directory': 'repeat(auto-fill, minmax(280px, 1fr))',
        // Cost calculator layout
        'calculator': '1fr 2fr',
        // Dashboard layout
        'dashboard': '300px 1fr',
        // Article layout
        'article': '1fr min(65ch, 100%) 1fr',
      },
      
      // Container sizes for consistent max-widths
      maxWidth: {
        'prose': '65ch',
        'screen-3xl': '1920px',
      },
      
      // Backdrop blur for modern glass morphism effects
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
      },
      
      // Custom aspect ratios
      aspectRatio: {
        'golden': '1.618',
        'card': '4/3',
        'hero': '16/9',
        'square': '1',
      },
    },
  },
  plugins: [
    // Custom component classes plugin
    function({ addComponents, theme }) {
      addComponents({
        // Button component classes
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme('spacing.2'),
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.medium'),
          lineHeight: '1',
          border: '1px solid transparent',
          borderRadius: theme('borderRadius.DEFAULT'),
          cursor: 'pointer',
          transition: 'all 150ms cubic-bezier(0, 0, 0.2, 1)',
          textDecoration: 'none',
          minHeight: '44px',
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        
        '.btn-primary': {
          backgroundColor: theme('colors.primary.500'),
          color: theme('colors.white'),
          borderColor: theme('colors.primary.500'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.primary.600'),
            borderColor: theme('colors.primary.600'),
            transform: 'translateY(-1px)',
            boxShadow: theme('boxShadow.md'),
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        
        '.btn-secondary': {
          backgroundColor: theme('colors.white'),
          color: theme('colors.primary.500'),
          borderColor: theme('colors.primary.500'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.primary.50'),
            transform: 'translateY(-1px)',
            boxShadow: theme('boxShadow.md'),
          },
        },
        
        '.btn-accent': {
          backgroundColor: theme('colors.accent.400'),
          color: theme('colors.neutral.900'),
          borderColor: theme('colors.accent.400'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.accent.500'),
            borderColor: theme('colors.accent.500'),
            transform: 'translateY(-1px)',
            boxShadow: theme('boxShadow.md'),
          },
        },
        
        '.btn-ghost': {
          backgroundColor: 'transparent',
          color: theme('colors.neutral.600'),
          borderColor: 'transparent',
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.neutral.100'),
            color: theme('colors.neutral.700'),
          },
        },
        
        // Card component classes
        '.card': {
          backgroundColor: theme('colors.white'),
          border: `1px solid ${theme('colors.neutral.100')}`,
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.sm'),
          transition: 'all 250ms cubic-bezier(0, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: theme('boxShadow.md'),
            transform: 'translateY(-1px)',
          },
        },
        
        '.card-premium': {
          border: `2px solid ${theme('colors.accent.400')}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: `linear-gradient(90deg, ${theme('colors.accent.400')}, ${theme('colors.primary.500')})`,
          },
        },
        
        // Form component classes
        '.form-input': {
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          border: `1px solid ${theme('colors.neutral.200')}`,
          borderRadius: theme('borderRadius.DEFAULT'),
          fontSize: theme('fontSize.base'),
          transition: 'border-color 150ms cubic-bezier(0, 0, 0.2, 1)',
          minHeight: '44px',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.primary.500'),
            boxShadow: `0 0 0 3px rgba(27, 75, 58, 0.1)`,
          },
          '&:invalid': {
            borderColor: theme('colors.error'),
          },
        },
        
        // Badge component classes
        '.badge': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: theme('spacing.1'),
          padding: `${theme('spacing.1')} ${theme('spacing.3')}`,
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.full'),
        },
        
        '.badge-success': {
          backgroundColor: theme('colors.success'),
          color: theme('colors.white'),
        },
        
        '.badge-premium': {
          backgroundColor: theme('colors.accent.400'),
          color: theme('colors.neutral.900'),
        },
        
        '.badge-verified': {
          backgroundColor: theme('colors.primary.500'),
          color: theme('colors.white'),
        },
        
        // Skeleton loading component
        '.skeleton': {
          background: `linear-gradient(90deg, ${theme('colors.neutral.100')} 25%, ${theme('colors.neutral.50')} 50%, ${theme('colors.neutral.100')} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'loading 1.5s infinite',
          borderRadius: theme('borderRadius.DEFAULT'),
        },
        
        // Focus ring for accessibility
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 3px rgba(27, 75, 58, 0.2)`,
            borderColor: theme('colors.primary.500'),
          },
        },
      });
    },
    
    // Custom utilities plugin
    function({ addUtilities, theme }) {
      addUtilities({
        // Glass morphism utilities
        '.glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        
        '.glass-dark': {
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: theme('colors.white'),
        },
        
        // Text gradient utilities
        '.text-gradient-primary': {
          background: `linear-gradient(135deg, ${theme('colors.primary.500')}, ${theme('colors.accent.400')})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        
        // Animation utilities
        '.animate-fade-in': {
          animation: 'fadeIn 0.5s ease-in-out',
        },
        
        '.animate-slide-up': {
          animation: 'slideUp 0.3s ease-out',
        },
        
        // Layout utilities
        '.safe-area-inset': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
      });
    },
  ],
  
  // Dark mode configuration (future-ready)
  darkMode: 'class',
  
  // Safelist for dynamic classes
  safelist: [
    // Status badges
    'badge-success',
    'badge-warning',
    'badge-error',
    'badge-premium',
    'badge-verified',
    
    // Grid variations
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-3',
    'grid-cols-4',
    'sm:grid-cols-2',
    'md:grid-cols-3',
    'lg:grid-cols-4',
    
    // Button variants
    'btn-primary',
    'btn-secondary',
    'btn-accent',
    'btn-ghost',
    
    // Text colors for dynamic content
    'text-success',
    'text-warning',
    'text-error',
    'text-primary',
    'text-accent',
  ],
};