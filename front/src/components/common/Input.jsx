import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

// ShadcnUI-inspired Input styles
export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1;

  ${({ $required }) => $required && css`
    &::after {
      content: ' *';
      color: ${({ theme }) => theme.colors.error};
    }
  `}
`;

export const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const StyledInput = styled.input`
  width: 100%;
  height: 2.5rem;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  ${({ $hasIcon }) => $hasIcon && css`
    padding-left: 2.5rem;
  `}

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

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &[type="file"] {
    padding: 0.375rem 0.75rem;
    height: auto;
    cursor: pointer;
  }
`;

export const IconWrapper = styled.span`
  position: absolute;
  left: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  pointer-events: none;

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

export const ErrorMessage = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.error};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const HelperText = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Input = forwardRef(({ 
  label, 
  error, 
  helperText, 
  icon: Icon, 
  required,
  id,
  ...props 
}, ref) => {
  const inputId = id || props.name;

  // Render icon - handle both component references and JSX elements
  const renderIcon = () => {
    if (!Icon) return null;
    // Check if it's a valid React element (already rendered JSX)
    if (React.isValidElement(Icon)) return Icon;
    // Otherwise treat it as a component to render
    return <Icon size={16} />;
  };

  return (
    <InputWrapper>
      {label && (
        <Label htmlFor={inputId} $required={required}>
          {label}
        </Label>
      )}
      <InputContainer>
        {Icon && (
          <IconWrapper>
            {renderIcon()}
          </IconWrapper>
        )}
        <StyledInput 
          ref={ref}
          id={inputId}
          $hasIcon={!!Icon}
          $hasError={!!error}
          {...props}
        />
      </InputContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </InputWrapper>
  );
});

Input.displayName = 'Input';

export default Input;
