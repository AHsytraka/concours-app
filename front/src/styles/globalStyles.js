import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    border-color: ${({ theme }) => theme.colors.border};
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.primary};
    font-size: ${({ theme }) => theme.fontSizes.base};
    font-feature-settings: "rlig" 1, "calt" 1;
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
    line-height: 1.5;
    min-height: 100vh;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  a {
    color: inherit;
    text-decoration: none;
    text-underline-offset: 4px;
    
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    line-height: 1.2;
    letter-spacing: -0.025em;
    color: ${({ theme }) => theme.colors.text};
  }

  h1 { font-size: ${({ theme }) => theme.fontSizes['5xl']}; font-weight: 700; letter-spacing: -0.05em; }
  h2 { font-size: ${({ theme }) => theme.fontSizes['4xl']}; letter-spacing: -0.03em; }
  h3 { font-size: ${({ theme }) => theme.fontSizes['3xl']}; }
  h4 { font-size: ${({ theme }) => theme.fontSizes['2xl']}; }
  h5 { font-size: ${({ theme }) => theme.fontSizes.xl}; }
  h6 { font-size: ${({ theme }) => theme.fontSizes.lg}; }

  p {
    line-height: 1.625;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  small {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
  }

  code {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 0.875em;
    background-color: ${({ theme }) => theme.colors.muted};
    padding: 0.2em 0.4em;
    border-radius: ${({ theme }) => theme.radii.sm};
  }

  ::selection {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.textInverse};
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.borderDark};
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }

  :focus:not(:focus-visible) {
    outline: none;
  }

  /* ShadcnUI-style animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideInFromBottom {
    from { 
      opacity: 0;
      transform: translateY(4px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from { 
      opacity: 0;
      transform: scale(0.95);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export default GlobalStyles;
