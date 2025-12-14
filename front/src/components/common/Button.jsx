import styled, { css } from 'styled-components';
import React from 'react';

// ShadcnUI-inspired Button variants
const variants = {
  default: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.textInverse};
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primaryLight};
    }
  `,
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.textInverse};
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primaryLight};
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.textInverse};
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.secondaryDark};
    }
  `,
  destructive: css`
    background: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.textInverse};
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.errorDark};
    }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.textInverse};
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.errorDark};
    }
  `,
  success: css`
    background: ${({ theme }) => theme.colors.success};
    color: ${({ theme }) => theme.colors.textInverse};
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.successDark};
    }
  `,
  outline: css`
    background: transparent;
    border: 1px solid ${({ theme }) => theme.colors.input};
    color: ${({ theme }) => theme.colors.text};
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.accent};
      color: ${({ theme }) => theme.colors.accentForeground};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.accent};
      color: ${({ theme }) => theme.colors.accentForeground};
    }
  `,
  link: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.primary};
    text-decoration-color: transparent;
    
    &:hover:not(:disabled) {
      text-decoration: underline;
      text-underline-offset: 4px;
    }
  `
};

const sizes = {
  sm: css`
    height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.75rem;
    border-radius: ${({ theme }) => theme.radii.md};
  `,
  md: css`
    height: 2.5rem;
    padding: 0 1rem;
    font-size: 0.875rem;
    border-radius: ${({ theme }) => theme.radii.md};
  `,
  lg: css`
    height: 2.75rem;
    padding: 0 1.5rem;
    font-size: 0.875rem;
    border-radius: ${({ theme }) => theme.radii.md};
  `,
  xl: css`
    height: 3rem;
    padding: 0 2rem;
    font-size: 1rem;
    border-radius: ${({ theme }) => theme.radii.lg};
  `,
  icon: css`
    height: 2.5rem;
    width: 2.5rem;
    padding: 0;
    border-radius: ${({ theme }) => theme.radii.md};
  `
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  font-family: inherit;
  border: none;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;

  ${({ $variant = 'default' }) => variants[$variant]}
  ${({ $size = 'md' }) => sizes[$size]}

  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}

  ${({ $isLoading }) => $isLoading && css`
    position: relative;
    color: transparent !important;
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      width: 1rem;
      height: 1rem;
      border: 2px solid ${({ theme }) => theme.colors.textInverse};
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `}

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }

  svg {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }
`;

// Wrapper component to map variant/size to $variant/$size
const Button = React.forwardRef(({ variant, size, fullWidth, isLoading, ...props }, ref) => (
  <StyledButton
    ref={ref}
    $variant={variant}
    $size={size}
    $fullWidth={fullWidth}
    $isLoading={isLoading}
    {...props}
  />
));

Button.displayName = 'Button';

export default Button;
