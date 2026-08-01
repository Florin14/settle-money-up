import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import styled from 'styled-components';

const Field = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const FloatLabel = styled.label`
  position: absolute;
  left: ${({ theme }) => theme.spacing.sm};
  top: 0.4rem;
  font-size: 0.68rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.colors.brand.primaryHover};
  pointer-events: none;
`;

const StyledSelect = styled.select`
  appearance: none;
  padding: 1.55rem 2.2rem 0.5rem ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.colors.background.sunken};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition:
    border-color ${({ theme }) => theme.transitions.fast},
    box-shadow ${({ theme }) => theme.transitions.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.strong};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.border.focus};
    box-shadow: ${({ theme }) => theme.shadows.focusRing};
  }

  option {
    background: ${({ theme }) => theme.colors.background.surface};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Chevron = styled.span`
  position: absolute;
  right: ${({ theme }) => theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, id, children, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <Field>
      <StyledSelect ref={ref} id={selectId} {...rest}>
        {children}
      </StyledSelect>
      {label && <FloatLabel htmlFor={selectId}>{label}</FloatLabel>}
      <Chevron aria-hidden>▼</Chevron>
    </Field>
  );
});
