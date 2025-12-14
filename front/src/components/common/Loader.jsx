import styled, { keyframes } from 'styled-components';

// ShadcnUI-inspired Loader/Spinner styles
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const LoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 0.75rem;

  ${({ $fullScreen }) => $fullScreen && `
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(4px);
    z-index: 9999;
  `}
`;

const Spinner = styled.div`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border: 2px solid ${({ theme }) => theme.colors.muted};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

const LoaderText = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const Loader = ({ size = 24, text, fullScreen }) => (
  <LoaderWrapper $fullScreen={fullScreen}>
    <Spinner size={size} />
    {text && <LoaderText>{text}</LoaderText>}
  </LoaderWrapper>
);

export default Loader;
