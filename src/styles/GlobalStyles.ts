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
    background-color: ${({ theme }) => theme.colors.background.app};
    color-scheme: ${({ theme }) => theme.mode};
    min-height: 100dvh;
    transition: background-color ${({ theme }) => theme.transitions.normal},
      color ${({ theme }) => theme.transitions.normal};
  }

  #root {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    text-wrap: balance;
  }

  a {
    color: ${({ theme }) => theme.colors.brand.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  button {
    font: inherit;
    cursor: pointer;
    border: none;
    background: none;
  }

  input, select, textarea {
    font: inherit;
    color: inherit;
  }

  /* Monetary values line up in tables/lists */
  [data-money] {
    font-variant-numeric: tabular-nums;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
