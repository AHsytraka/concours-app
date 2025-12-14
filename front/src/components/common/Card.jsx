import styled, { css } from 'styled-components';

// ShadcnUI-inspired Card styles
const CardWrapper = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: ${({ $overflow }) => $overflow || 'hidden'};
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  ${({ hoverable }) => hoverable && css`
    cursor: pointer;
    &:hover {
      border-color: ${({ theme }) => theme.colors.borderDark};
      box-shadow: ${({ theme }) => theme.shadows.sm};
    }
  `}
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.025em;
  color: ${({ theme }) => theme.colors.cardForeground};
  margin: 0;
`;

const CardSubtitle = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  line-height: 1.5;
`;

const CardBody = styled.div`
  padding: ${({ noPadding }) => noPadding ? '0' : '0 1.5rem 1.5rem 1.5rem'};
`;

const CardFooter = styled.div`
  padding: 1.5rem;
  padding-top: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Card = ({ children, hoverable, onClick, className, overflow }) => (
  <CardWrapper hoverable={hoverable} onClick={onClick} className={className} $overflow={overflow}>
    {children}
  </CardWrapper>
);

Card.Header = ({ children, title, subtitle, action }) => (
  <CardHeader>
    <div>
      {title && <CardTitle>{title}</CardTitle>}
      {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
      {children}
    </div>
    {action}
  </CardHeader>
);

Card.Body = ({ children, noPadding }) => (
  <CardBody noPadding={noPadding}>{children}</CardBody>
);

Card.Footer = ({ children }) => (
  <CardFooter>{children}</CardFooter>
);

export default Card;
