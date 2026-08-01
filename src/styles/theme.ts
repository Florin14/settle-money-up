/**
 * Equi design system — "Quiet Ledger".
 * Calm, editorial, soft: warm paper surfaces, deep viridian green as the only
 * accent, Fraunces serif for display type, hairline borders and feather-soft
 * shadows. No neon, no glass, no gradients shouting for attention.
 * Both modes share one token shape so styled-components consumers are
 * theme-agnostic.
 */

export type ThemeMode = 'light' | 'dark';

const base = {
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyDisplay: "'Fraunces', 'Georgia', serif",
    fontFamilyMono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.375rem',
      xxl: '1.875rem',
      display: '3rem',
    },
    fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 700 },
    lineHeight: { tight: 1.15, normal: 1.55, relaxed: 1.7 },
    letterSpacing: { tight: '-0.01em', wide: '0.06em', wider: '0.12em' },
  },
  spacing: {
    xxs: '0.25rem',
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  breakpoints: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  zIndex: { dropdown: 100, sticky: 200, modal: 500, toast: 900 },
  transitions: {
    fast: '140ms ease-out',
    normal: '220ms ease-out',
    slow: '360ms cubic-bezier(0.22, 1, 0.36, 1)',
    spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
};

export const lightTheme = {
  ...base,
  mode: 'light' as ThemeMode,
  colors: {
    brand: {
      primary: '#166E58',
      primaryHover: '#0F5A47',
      primaryActive: '#0C4A3B',
      subtle: 'rgba(22, 110, 88, 0.07)',
      subtleBorder: 'rgba(22, 110, 88, 0.2)',
    },
    accent: {
      green: '#166E58',
      clay: '#B4574A',
      gold: '#A8762B',
    },
    background: {
      app: '#F6F5F1',
      surface: '#FFFFFF',
      surfaceRaised: '#FFFFFF',
      sunken: '#F0EEE8',
      inverse: '#22242A',
    },
    glass: {
      bg: '#FFFFFF',
      bgStrong: 'rgba(246, 245, 241, 0.92)',
      border: '#E8E5DE',
      borderHover: 'rgba(22, 110, 88, 0.35)',
      highlight: '#FFFFFF',
    },
    text: {
      primary: '#26282C',
      heading: '#1A1C1F',
      secondary: '#6E6B64',
      muted: '#A5A199',
      onBrand: '#FCFBF8',
      inverse: '#F4F3EF',
    },
    border: {
      default: '#E8E5DE',
      strong: '#D8D4CB',
      focus: '#166E58',
    },
    // Money semantics: positive = you are owed, negative = you owe.
    positive: { text: '#166E58', bg: 'rgba(22, 110, 88, 0.08)', solid: '#1B8A6B' },
    negative: { text: '#A64B3F', bg: 'rgba(180, 87, 74, 0.08)', solid: '#B4574A' },
    warning: { text: '#A8762B', bg: 'rgba(168, 118, 43, 0.1)' },
  },
  gradients: {
    brand: 'linear-gradient(160deg, #1B8A6B, #14654F)',
    brandText: 'linear-gradient(160deg, #166E58, #0F5A47)',
    lime: 'linear-gradient(90deg, #1B8A6B, #2A9D7C)',
    rose: 'linear-gradient(90deg, #B4574A, #C36B5E)',
    border: 'linear-gradient(135deg, rgba(22, 110, 88, 0.3), rgba(22, 110, 88, 0.08))',
    appGlow: 'radial-gradient(1200px 700px at 50% -20%, rgba(22, 110, 88, 0.045), transparent 60%)',
  },
  shadows: {
    sm: '0 1px 2px rgba(38, 36, 30, 0.05)',
    md: '0 4px 16px rgba(38, 36, 30, 0.07)',
    lg: '0 16px 40px rgba(38, 36, 30, 0.1)',
    glowViolet: '0 6px 18px rgba(22, 110, 88, 0.16)',
    glowCyan: '0 6px 18px rgba(22, 110, 88, 0.12)',
    focusRing: '0 0 0 3px rgba(22, 110, 88, 0.18)',
  },
};

export type AppTheme = typeof lightTheme;

export const darkTheme: AppTheme = {
  ...base,
  mode: 'dark',
  colors: {
    brand: {
      primary: '#4CAB8D',
      primaryHover: '#5FBC9E',
      primaryActive: '#3B9377',
      subtle: 'rgba(76, 171, 141, 0.12)',
      subtleBorder: 'rgba(76, 171, 141, 0.3)',
    },
    accent: {
      green: '#4CAB8D',
      clay: '#D08A7E',
      gold: '#C9A05C',
    },
    background: {
      app: '#17181A',
      surface: '#1E2023',
      surfaceRaised: '#26282C',
      sunken: 'rgba(255, 255, 255, 0.045)',
      inverse: '#F4F3EF',
    },
    glass: {
      bg: '#1E2023',
      bgStrong: 'rgba(23, 24, 26, 0.92)',
      border: 'rgba(255, 255, 255, 0.09)',
      borderHover: 'rgba(76, 171, 141, 0.4)',
      highlight: 'rgba(255, 255, 255, 0.04)',
    },
    text: {
      primary: '#E9E7E2',
      heading: '#F5F4F0',
      secondary: '#A5A29B',
      muted: '#75726B',
      onBrand: '#10231D',
      inverse: '#26282C',
    },
    border: {
      default: 'rgba(255, 255, 255, 0.09)',
      strong: 'rgba(255, 255, 255, 0.18)',
      focus: '#4CAB8D',
    },
    positive: { text: '#7FC9AF', bg: 'rgba(76, 171, 141, 0.13)', solid: '#4CAB8D' },
    negative: { text: '#D99A8F', bg: 'rgba(208, 138, 126, 0.12)', solid: '#C87F72' },
    warning: { text: '#C9A05C', bg: 'rgba(201, 160, 92, 0.12)' },
  },
  gradients: {
    brand: 'linear-gradient(160deg, #4CAB8D, #3B9377)',
    brandText: 'linear-gradient(160deg, #5FBC9E, #4CAB8D)',
    lime: 'linear-gradient(90deg, #4CAB8D, #5FBC9E)',
    rose: 'linear-gradient(90deg, #C87F72, #D99A8F)',
    border: 'linear-gradient(135deg, rgba(76, 171, 141, 0.35), rgba(76, 171, 141, 0.08))',
    appGlow:
      'radial-gradient(1200px 700px at 50% -20%, rgba(76, 171, 141, 0.05), transparent 60%)',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.35)',
    md: '0 4px 16px rgba(0, 0, 0, 0.35)',
    lg: '0 16px 40px rgba(0, 0, 0, 0.45)',
    glowViolet: '0 6px 18px rgba(0, 0, 0, 0.35)',
    glowCyan: '0 6px 18px rgba(0, 0, 0, 0.3)',
    focusRing: '0 0 0 3px rgba(76, 171, 141, 0.25)',
  },
};
