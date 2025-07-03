// Design tokens for BuildDiaspora Zimbabwe
// Following the style guide defined in tailwind.config.ts

export const designTokens = {
  // Color palette
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
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    }
  },

  // Typography scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Merriweather', 'Georgia', 'serif'],
    },
    fontSize: {
      'display-1': { size: '3rem', lineHeight: '1.25', letterSpacing: '-0.025em' },
      'display-2': { size: '2.25rem', lineHeight: '1.25', letterSpacing: '-0.025em' },
      'heading-1': { size: '1.875rem', lineHeight: '1.25' },
      'heading-2': { size: '1.5rem', lineHeight: '1.25' },
      'heading-3': { size: '1.25rem', lineHeight: '1.5' },
      'body-large': { size: '1.125rem', lineHeight: '1.75' },
      'body': { size: '1rem', lineHeight: '1.5' },
      'body-small': { size: '0.875rem', lineHeight: '1.5' },
      'caption': { size: '0.75rem', lineHeight: '1.5' },
    },
    fontWeight: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },

  // Spacing scale
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
    '4xl': '6rem',  // 96px
    '5xl': '8rem',  // 128px
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    'card-hover': '0 10px 25px -5px rgba(27, 75, 58, 0.1), 0 10px 10px -5px rgba(27, 75, 58, 0.04)',
    'premium': '0 0 0 1px rgba(212, 175, 55, 0.2), 0 10px 25px -5px rgba(212, 175, 55, 0.1)',
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },

  // Animation timing
  transitions: {
    fast: '0.15s',
    normal: '0.3s',
    slow: '0.5s',
    slower: '0.75s',
  },

  // Easing functions
  easings: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    custom: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Component sizes
  sizes: {
    button: {
      sm: { padding: '0.5rem 1rem', fontSize: '0.875rem', height: '2rem' },
      md: { padding: '0.75rem 1.5rem', fontSize: '1rem', height: '2.5rem' },
      lg: { padding: '1rem 2rem', fontSize: '1.125rem', height: '3rem' },
    },
    input: {
      sm: { padding: '0.5rem 0.75rem', fontSize: '0.875rem', height: '2rem' },
      md: { padding: '0.75rem 1rem', fontSize: '1rem', height: '2.5rem' },
      lg: { padding: '1rem 1.25rem', fontSize: '1.125rem', height: '3rem' },
    },
    card: {
      sm: { padding: '1rem', borderRadius: '0.5rem' },
      md: { padding: '1.5rem', borderRadius: '0.75rem' },
      lg: { padding: '2rem', borderRadius: '1rem' },
    },
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Component states
  states: {
    hover: {
      opacity: 0.8,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    focus: {
      outline: '2px solid #1B4B3A',
      outlineOffset: '2px',
      boxShadow: '0 0 0 2px rgba(27, 75, 58, 0.1)',
    },
    active: {
      transform: 'translateY(0)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
  },

  // Grid systems
  grid: {
    columns: {
      directory: 'repeat(auto-fill, minmax(280px, 1fr))',
      calculator: '1fr 2fr',
      dashboard: '300px 1fr',
      article: '1fr min(65ch, 100%) 1fr',
    },
    gaps: {
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
    },
  },

  // Aspect ratios
  aspectRatio: {
    square: '1 / 1',
    video: '16 / 9',
    photo: '4 / 3',
    golden: '1.618 / 1',
  },
}

// Helper functions for accessing design tokens
export const getColor = (path: string): string => {
  const keys = path.split('.')
  let value: unknown = designTokens.colors
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key]
    } else {
      return '#000000' // fallback color
    }
  }
  return typeof value === 'string' ? value : '#000000'
}

export const getSpacing = (size: keyof typeof designTokens.spacing) => {
  return designTokens.spacing[size]
}

export const getTypography = (size: keyof typeof designTokens.typography.fontSize) => {
  return designTokens.typography.fontSize[size]
}

export const getShadow = (size: keyof typeof designTokens.shadows) => {
  return designTokens.shadows[size]
}

export default designTokens 