import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';
import type { ReactNode } from 'react';

interface ThemeWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ThemeWrapper({ children, className = '' }: ThemeWrapperProps) {
  const { isDarkMode } = useTheme();
  const theme = getThemeClasses(isDarkMode);
  
  const defaultClasses = `${theme.bgPrimary} ${theme.textPrimary}`;
  const combinedClasses = className ? `${defaultClasses} ${className}` : defaultClasses;
  
  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
}
