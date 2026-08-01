import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-size-adjust: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.gradients.appGlow}, ${({ theme }) =>
      theme.colors.background.app};
    background-attachment: fixed;
    color-scheme: ${({ theme }) => theme.mode};
    min-height: 100dvh;
    transition: color ${({ theme }) => theme.transitions.normal};
  }

  #root {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.typography.fontFamilyDisplay};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
    color: ${({ theme }) => theme.colors.text.heading};
    text-wrap: balance;
  }

  a {
    color: ${({ theme }) => theme.colors.brand.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.brand.primaryHover};
    }
  }

  button {
    font: inherit;
    cursor: pointer;
    border: none;
    background: none;
    color: inherit;
  }

  input, select, textarea {
    font: inherit;
    color: inherit;
  }

  /* Monetary values line up in tables/lists */
  [data-money] {
    font-variant-numeric: tabular-nums;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.brand.subtleBorder};
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.strong};
    border-radius: 999px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  :focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focusRing};
    border-radius: ${({ theme }) => theme.radii.sm};
  }

  @keyframes equi-fade-up {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes equi-grow-bar {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
