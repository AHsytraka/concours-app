// ShadcnUI-inspired Design System - Clean, Minimal, Black & White
const theme = {
  colors: {
    // Primary - Pure black/dark
    primary: '#18181b',
    primaryLight: '#27272a',
    primaryDark: '#09090b',
    primaryHover: '#3f3f46',
    
    // Secondary - Neutral gray
    secondary: '#71717a',
    secondaryLight: '#a1a1aa',
    secondaryDark: '#52525b',
    
    // Backgrounds - Clean whites and very light grays
    background: '#ffffff',
    backgroundAlt: '#fafafa',
    backgroundDark: '#f4f4f5',
    surface: '#ffffff',
    
    // Text colors - High contrast
    text: '#09090b',
    textSecondary: '#71717a',
    textLight: '#a1a1aa',
    textInverse: '#fafafa',
    textMuted: '#71717a',
    
    // Borders - Subtle
    border: '#e4e4e7',
    borderLight: '#f4f4f5',
    borderDark: '#d4d4d8',
    borderHover: '#a1a1aa',
    
    // Status colors - Muted, professional
    success: '#16a34a',
    successLight: '#f0fdf4',
    successDark: '#15803d',
    
    error: '#dc2626',
    errorLight: '#fef2f2',
    errorDark: '#b91c1c',
    
    warning: '#ca8a04',
    warningLight: '#fefce8',
    warningDark: '#a16207',
    
    info: '#2563eb',
    infoLight: '#eff6ff',
    infoDark: '#1d4ed8',
    
    // Special
    overlay: 'rgba(0, 0, 0, 0.8)',
    shadow: 'rgba(0, 0, 0, 0.05)',
    
    // Accent (for subtle highlights)
    accent: '#f4f4f5',
    accentForeground: '#18181b',
    
    // Muted backgrounds
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    
    // Card
    card: '#ffffff',
    cardForeground: '#09090b',
    
    // Input
    input: '#e4e4e7',
    ring: '#18181b',
  },
  
  fonts: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  },
  
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '0.875rem',
    lg: '1rem',
    xl: '1.125rem',
    '2xl': '1.25rem',
    '3xl': '1.5rem',
    '4xl': '2rem',
    '5xl': '2.5rem',
  },
  
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  
  radii: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
  
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    default: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  zIndex: {
    dropdown: 50,
    sticky: 100,
    modal: 150,
    tooltip: 200,
    toast: 250,
  },
};

export default theme;
