import styled, { css } from 'styled-components';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

// ShadcnUI-inspired Alert styles
const variants = {
  default: css`
    background: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  `,
  success: css`
    background: ${({ theme }) => theme.colors.successLight};
    border-color: ${({ theme }) => theme.colors.success};
    color: ${({ theme }) => theme.colors.successDark};
  `,
  error: css`
    background: ${({ theme }) => theme.colors.errorLight};
    border-color: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.errorDark};
  `,
  destructive: css`
    background: ${({ theme }) => theme.colors.errorLight};
    border-color: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.errorDark};
  `,
  warning: css`
    background: ${({ theme }) => theme.colors.warningLight};
    border-color: ${({ theme }) => theme.colors.warning};
    color: ${({ theme }) => theme.colors.warningDark};
  `,
  info: css`
    background: ${({ theme }) => theme.colors.infoLight};
    border-color: ${({ theme }) => theme.colors.info};
    color: ${({ theme }) => theme.colors.infoDark};
  `
};

const AlertWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid;
  width: 100%;

  ${({ $variant = 'default' }) => variants[$variant]}

  [role="alert"] > svg {
    color: currentColor;
  }
`;

const IconWrapper = styled.span`
  flex-shrink: 0;
  display: flex;
  margin-top: 0.125rem;
  
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h5`
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.025em;
  margin: 0 0 0.25rem;
  color: inherit;
`;

const Message = styled.p`
  font-size: 0.875rem;
  margin: 0;
  color: inherit;
  opacity: 0.9;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  padding: 0.25rem;
  color: inherit;
  opacity: 0.7;
  transition: opacity 150ms;
  border-radius: ${({ theme }) => theme.radii.sm};

  &:hover {
    opacity: 1;
  }

  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const Alert = ({ variant = 'info', title, children, onClose, className }) => {
  const Icon = iconMap[variant];

  return (
    <AlertWrapper $variant={variant} className={className}>
      <IconWrapper>
        <Icon />
      </IconWrapper>
      <Content>
        {title && <Title>{title}</Title>}
        <Message>{children}</Message>
      </Content>
      {onClose && (
        <CloseButton onClick={onClose} type="button">
          <X />
        </CloseButton>
      )}
    </AlertWrapper>
  );
};

export default Alert;
