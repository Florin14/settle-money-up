import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import styled from 'styled-components';

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StyledInput = styled.input<{ $hasError?: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.negative.solid : theme.colors.border.default};
  background: ${({ theme }) => theme.colors.background.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.negative.solid : theme.colors.border.focus};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.background.sunken};
    cursor: not-allowed;
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
