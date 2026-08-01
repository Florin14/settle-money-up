import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import styled from 'styled-components';

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StyledInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  height: 2.5rem;
  padding: 0 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.negative.solid : theme.colors.border.default};
  background: ${({ theme }) => theme.colors.background.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  transition:
    border-color ${({ theme }) => theme.transitions.fast},
    box-shadow ${({ theme }) => theme.transitions.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:hover:not(:disabled):not(:focus) {
    border-color: ${({ theme }) => theme.colors.border.strong};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.negative.solid : theme.colors.border.focus};
    box-shadow: ${({ theme }) => theme.shadows.focusRing};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.background.sunken};
  }
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.negative.text};
`;

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <Field>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <StyledInput ref={ref} id={inputId} $hasError={!!error} aria-invalid={!!error} {...rest} />
      {error && <ErrorText role="alert">{error}</ErrorText>}
    </Field>
  );
});
