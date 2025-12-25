import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Always use dark theme
  const theme = 'dark';

  useEffect(() => {
    // Apply dark theme to document
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.className = 'dark';
    
    // Save to localStorage
    localStorage.setItem('actor-club-theme', 'dark');
  }, []);

  const value = {
    theme,
    toggleTheme: () => {}, // No-op since we only use dark mode
    isLight: false,
    isDark: true
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;