import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '', showLabel = false, size = 'default' }) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    small: 'h-8 w-8',
    default: 'h-10 w-10',
    large: 'h-12 w-12'
  };

  const iconSizes = {
    small: 'h-4 w-4',
    default: 'h-5 w-5', 
    large: 'h-6 w-6'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          theme-button-secondary
          hover:scale-110
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
          group
        `}
        title={theme === 'light' ? 'Koyu Moda Geç' : 'Açık Moda Geç'}
        aria-label={theme === 'light' ? 'Koyu Moda Geç' : 'Açık Moda Geç'}
      >
        {theme === 'light' ? (
          <Moon 
            className={`${iconSizes[size]} transition-transform duration-300 group-hover:rotate-12`} 
          />
        ) : (
          <Sun 
            className={`${iconSizes[size]} transition-transform duration-300 group-hover:rotate-12 text-yellow-400`} 
          />
        )}
      </button>
      
      {showLabel && (
        <span className="text-sm font-medium theme-text-secondary">
          {theme === 'light' ? 'Açık Mod' : 'Koyu Mod'}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;