// Theme utility functions
export const getThemeClasses = (isDarkMode: boolean) => ({
  // Background colors
  bgPrimary: isDarkMode ? 'bg-[#121212]' : 'bg-white',
  bgSecondary: isDarkMode ? 'bg-[#222]' : 'bg-gray-100',
  bgTertiary: isDarkMode ? 'bg-[#333]' : 'bg-gray-200',
  bgHover: isDarkMode ? 'hover:bg-[#333]' : 'hover:bg-gray-200',
  bgHoverSecondary: isDarkMode ? 'hover:bg-[#444]' : 'hover:bg-gray-300',
  
  // Text colors
  textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
  textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-600',
  textMuted: isDarkMode ? 'text-gray-500' : 'text-gray-500',
  
  // Border colors
  borderPrimary: isDarkMode ? 'border-[#333]' : 'border-gray-300',
  borderSecondary: isDarkMode ? 'border-[#444]' : 'border-gray-400',
  
  // Input styles
  inputBg: isDarkMode ? 'bg-transparent' : 'bg-white',
  inputBorder: isDarkMode ? 'border-[#444]' : 'border-gray-300',
  inputFocus: isDarkMode ? 'focus:border-[#4285F4]' : 'focus:border-blue-500',
  inputPlaceholder: isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500',
  
  // Button styles
  buttonPrimary: isDarkMode ? 'bg-white text-[#121212]' : 'bg-[#121212] text-white',
  buttonSecondary: isDarkMode ? 'border-[#444]' : 'border-gray-300',
});

export const getGradientClasses = () => ({
  gradient: 'bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6]',
  gradientText: 'bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] bg-clip-text text-transparent',
});
