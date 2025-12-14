import styled, { css } from 'styled-components';

// ShadcnUI-inspired Badge styles
const variants = {
  default: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.textInverse};
    border-color: transparent;
  `,
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.textInverse};
    border-color: transparent;
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.textInverse};
    border-color: transparent;
  `,
  success: css`
    background: ${({ theme }) => theme.colors.success};
    color: ${({ theme }) => theme.colors.textInverse};
    border-color: transparent;
  `,
  warning: css`
    background: ${({ theme }) => theme.colors.warning};
    color: ${({ theme }) => theme.colors.textInverse};
    border-color: transparent;
  `,
  error: css`
    background: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.textInverse};
    border-color: transparent;
  `,
  destructive: css`
    background: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.textInverse};
    border-color: transparent;
  `,
  info: css`
    background: ${({ theme }) => theme.colors.info};
    color: ${({ theme }) => theme.colors.textInverse};
    border-color: transparent;
  `,
  outline: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.border};
  `,
  neutral: css`
    background: ${({ theme }) => theme.colors.muted};
    color: ${({ theme }) => theme.colors.mutedForeground};
    border-color: transparent;
  `
};

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  border: 1px solid;
  white-space: nowrap;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  ${({ variant = 'default' }) => variants[variant]}

  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

const Badge = ({ variant, icon, children, ...props }) => (
  <StyledBadge variant={variant} {...props}>
    {icon}
    {children}
  </StyledBadge>
);

export default Badge;
