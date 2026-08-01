/**
 * Design tokens for the SettleUp design system.
 * Two concrete themes (light/dark) share one shape, so styled-components
 * consumers are theme-agnostic: `${({ theme }) => theme.colors.text.primary}`.
 */

const palette = {
  brand: {
    50: '#eef4ff',
    100: '#dce7fd',
    300: '#93b4f8',
    500: '#4f7df3',
    600: '#3b63d8',
    700: '#2f4eb0',
  },
  green: { 100: '#d7f5e3', 500: '#1fa860', 600: '#178a4e', 300: '#5fd695' },
  red: { 100: '#fde3e3', 500: '#e0483e', 600: '#c03832', 300: '#f2938d' },
  amber: { 100: '#fdf0d5', 500: '#e09c1f', 300: '#f0c76e' },
  gray: {
    0: '#ffffff',
    50: '#f7f8fa',
    100: '#eef0f4',
    200: '#e1e4ea',
    300: '#c8cdd8',
    400: '#9aa1b1',
    500: '#6d7489',
    600: '#4c5265',
    700: '#343a4c',
    800: '#232838',
    900: '#171b28',
    950: '#0f1220',
  },
};

const base = {
  typography: {
    fontFamily:
      "'Inter', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
    fontSize: {
      xs: '0.75rem', //  12px — captions, badges
      sm: '0.875rem', // 14px — secondary text, labels
      md: '1rem', //     16px — body
      lg: '1.125rem', // 18px — emphasized body
      xl: '1.375rem', // 22px — section titles
      xxl: '1.75rem', // 28px — page titles
      display: '2.25rem', // 36px — hero numbers (balances)
    },
    fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.7 },
  },
  spacing: {
    xxs: '0.25rem', //  4px
    xs: '0.5rem', //    8px
    sm: '0.75rem', //  12px
    md: '1rem', //     16px
    lg: '1.5rem', //   24px
    xl: '2rem', //     32px
    xxl: '3rem', //    48px
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '16px',
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
    fast: '120ms ease',
    normal: '200ms ease',
  },
} as const;

export type ThemeMode = 'light' | 'dark';

export const lightTheme = {
  ...base,
  mode: 'light' as ThemeMode,
  colors: {
    brand: {
      primary: palette.brand[500],
      primaryHover: palette.brand[600],
      primaryActive: palette.brand[700],
      subtle: palette.brand[50],
      subtleBorder: palette.brand[100],
    },
    background: {
      app: palette.gray[50],
      surface: palette.gray[0],
      surfaceRaised: palette.gray[0],
      sunken: palette.gray[100],
      inverse: palette.gray[900],
    },
    text: {
      primary: palette.gray[900],
      secondary: palette.gray[600],
      muted: palette.gray[400],
      onBrand: palette.gray[0],
      inverse: palette.gray[50],
    },
    border: {
      default: palette.gray[200],
      strong: palette.gray[300],
      focus: palette.brand[500],
    },
    // Semantic money colors: positive = you are owed, negative = you owe.
    positive: { text: palette.green[600], bg: palette.green[100], solid: palette.green[500] },
    negative: { text: palette.red[600], bg: palette.red[100], solid: palette.red[500] },
    warning: { text: palette.amber[500], bg: palette.amber[100] },
  },
  shadows: {
    sm: '0 1px 2px rgba(23, 27, 40, 0.06)',
    md: '0 4px 12px rgba(23, 27, 40, 0.08)',
    lg: '0 12px 32px rgba(23, 27, 40, 0.12)',
  },
};

export const darkTheme: AppTheme = {
  ...base,
  mode: 'dark',
  colors: {
    brand: {
      primary: palette.brand[500],
      primaryHover: palette.brand[300],
      primaryActive: palette.brand[600],
      subtle: 'rgba(79, 125, 243, 0.12)',
      subtleBorder: 'rgba(79, 125, 243, 0.28)',
    },
    background: {
      app: palette.gray[950],
      surface: palette.gray[900],
      surfaceRaised: palette.gray[800],
      sunken: palette.gray[950],
      inverse: palette.gray[50],
    },
    text: {
      primary: palette.gray[50],
      secondary: palette.gray[300],
      muted: palette.gray[400],
      onBrand: palette.gray[0],
      inverse: palette.gray[900],
    },
    border: {
      default: palette.gray[700],
      strong: palette.gray[600],
      focus: palette.brand[300],
    },
    positive: { text: palette.green[300], bg: 'rgba(31, 168, 96, 0.16)', solid: palette.green[500] },
    negative: { text: palette.red[300], bg: 'rgba(224, 72, 62, 0.16)', solid: palette.red[500] },
    warning: { text: palette.amber[300], bg: 'rgba(224, 156, 31, 0.16)' },
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 4px 12px rgba(0, 0, 0, 0.45)',
    lg: '0 12px 32px rgba(0, 0, 0, 0.55)',
  },
};

export type AppTheme = typeof lightTheme;
