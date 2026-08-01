import styled, { css } from 'styled-components';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

/** Transient props ($-prefixed) are consumed by styled-components and not forwarded to the DOM. */
interface ButtonProps {
  $variant?: Variant;
  $size?: Size;
  $fullWidth?: boolean;
}

const sizeStyles = {
  sm: css`
    padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.sm}`};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  `,
  md: css`
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
  `,
  lg: css`
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  `,
} as const;

const variantStyles = {
  primary: css`
    background: ${({ theme }) => theme.colors.brand.primary};
    color: ${({ theme }) => theme.colors.text.onBrand};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.brand.primaryHover};
    }
    &:active:not(:disabled) {
      background: ${({ theme }) => theme.colors.brand.primaryActive};
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.background.surface};
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.border.default};

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.border.strong};
      background: ${({ theme }) => theme.colors.background.sunken};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text.secondary};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.background.sunken};
      color: ${({ theme }) => theme.colors.text.primary};
    }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.negative.solid};
    color: ${({ theme }) => theme.colors.text.onBrand};

    &:hover:not(:disabled) {
      filter: brightness(0.92);
    }
  `,
} as const;

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  white-space: nowrap;
  transition:
    background ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast},
    filter ${({ theme }) => theme.transitions.fast};

  ${({ $size = 'md' }) => sizeStyles[$size]}
  ${({ $variant = 'primary' }) => variantStyles[$variant]}
  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;
