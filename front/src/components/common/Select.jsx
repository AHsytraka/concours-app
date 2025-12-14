import styled, { css } from 'styled-components';
import { forwardRef } from 'react';
import { InputWrapper, Label, ErrorMessage, HelperText } from './Input';

// ShadcnUI-inspired Select styles
const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledSelect = styled.select`
  width: 100%;
  height: 2.5rem;
  padding: 0 2rem 0 0.75rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  appearance: none;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  ${({ $hasError, theme }) => $hasError && css`
    border-color: ${theme.colors.error};
  `}

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.ring};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.background}, 0 0 0 4px ${({ theme }) => theme.colors.ring};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.muted};
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const ChevronIcon = styled.span`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${({ theme }) => theme.colors.textMuted};

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const Select = forwardRef(({
  label,
  error,
  helperText,
  required,
  options = [],
  placeholder,
  id,
  ...props
}, ref) => {
  const selectId = id || props.name;

  return (
    <InputWrapper>
      {label && (
        <Label htmlFor={selectId} required={required}>
          {label}
        </Label>
      )}
      <SelectContainer>
        <StyledSelect id={selectId} $hasError={!!error} ref={ref} {...props}>
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </StyledSelect>
        <ChevronIcon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </ChevronIcon>
      </SelectContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </InputWrapper>
  );
});

Select.displayName = 'Select';

export default Select;
