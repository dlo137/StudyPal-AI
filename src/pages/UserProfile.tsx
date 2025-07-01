import { CrownIcon, BookmarkIcon, MessageSquareIcon, XIcon, User, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

export function UserProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const { isDarkMode, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  
  const theme = getThemeClasses(isDarkMode);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    
    // Try to get user metadata first (from sign up)
    const metadata = user.user_metadata;
    if (metadata?.firstName && metadata?.lastName) {
      return `${metadata.firstName.charAt(0)}${metadata.lastName.charAt(0)}`.toUpperCase();
    }
    
    // Fallback to email first letter
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    signOut();
  };

  const handleToggleDarkMode = () => {
    toggleTheme();
  };

  return <div className={`flex flex-col min-h-screen ${theme.bgPrimary} ${theme.textPrimary}`}>
      {/* ── header ──────────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b ${theme.borderPrimary} relative z-50`}>
        <button onClick={() => navigate(-1)} className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full`}>
          <XIcon size={24} />
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">
          PROFILE
        </span>

        <div ref={menuRef} className="relative">
          <div
            className={`h-8 w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition ${theme.bgTertiary} flex items-center justify-center`}
            onClick={() => setMenuOpen(v => !v)}
          >
            {user ? (
              <span className={`${theme.textPrimary} text-xs font-medium`}>
                {getUserInitials()}
              </span>
            ) : (
              <User size={16} className={theme.textSecondary} />
            )}
          </div>

          {menuOpen && (
            <div className={`absolute right-0 mt-2 w-40 ${theme.bgSecondary} border ${theme.borderPrimary} rounded-lg shadow-lg`}>
              {user && (
                <button onClick={() => setMenuOpen(false)} className={`block w-full px-4 py-2 text-left ${theme.bgHoverSecondary} rounded-t-lg ${theme.bgTertiary}`}>Profile</button>
              )}
              {!user && (
                <>
                  <button onClick={() => { setMenuOpen(false); navigate('/login'); }} className={`block w-full px-4 py-2 text-left ${theme.bgHoverSecondary} rounded-t-lg`}>Login</button>
                  <button onClick={() => { setMenuOpen(false); navigate('/signup'); }} className={`block w-full px-4 py-2 text-left ${theme.bgHoverSecondary}`}>Sign&nbsp;Up</button>
                </>
              )}
              <button onClick={() => { setMenuOpen(false); navigate('/premium'); }} className={`block w-full px-4 py-2 text-left ${theme.bgHoverSecondary} ${!user ? '' : ''}`}>Get&nbsp;Premium</button>
              <button onClick={() => { setMenuOpen(false); navigate('/'); }} className={`block w-full px-4 py-2 text-left ${theme.bgHoverSecondary} ${!user ? 'rounded-b-lg' : ''}`}>Chat</button>
              {user && (
                <button onClick={handleLogout} className={`block w-full px-4 py-2 text-left text-red-400 ${theme.bgHoverSecondary} hover:text-red-300 rounded-b-lg`}>Logout</button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={`flex flex-col items-center p-6 border-b ${theme.borderPrimary}`}>
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] flex items-center justify-center mb-4">
          <span className="text-4xl font-bold text-white">
            {getUserInitials()}
          </span>
        </div>
        <h2 className="text-xl font-bold">
          {user?.user_metadata?.firstName && user?.user_metadata?.lastName 
            ? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
            : user?.email?.split('@')[0] || 'User'
          }
        </h2>
        <p className={theme.textSecondary}>{user?.email || 'No email available'}</p>
        <div className={`mt-4 flex items-center ${theme.bgSecondary} px-4 py-2 rounded-full`}>
          <CrownIcon size={16} className="text-yellow-500 mr-2" />
          <span className="text-sm font-medium">Free Member</span>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-2">Activity</h3>
        <button 
          onClick={() => navigate('/mission')}
          className={`w-full ${theme.bgSecondary} p-4 rounded-lg flex items-center ${theme.bgHover} transition cursor-pointer`}
        >
          <div className={`w-10 h-10 rounded-full ${theme.bgTertiary} flex items-center justify-center mr-4`}>
            <BookmarkIcon size={20} className="text-[#8C52FF]" />
          </div>
          <div className="text-left">
            <h4 className="font-medium">Mission Statement</h4>
            <p className={`text-sm ${theme.textSecondary}`}>
              Learn about our purpose and goals
            </p>
          </div>
        </button>
        <button 
          onClick={() => navigate('/contact')}
          className={`w-full ${theme.bgSecondary} p-4 rounded-lg flex items-center ${theme.bgHover} transition cursor-pointer`}
        >
          <div className={`w-10 h-10 rounded-full ${theme.bgTertiary} flex items-center justify-center mr-4`}>
            <MessageSquareIcon size={20} className="text-[#8C52FF]" />
          </div>
          <div className="text-left">
            <h4 className="font-medium">Contact Us</h4>
            <p className={`text-sm ${theme.textSecondary}`}>
              Get in touch with our support team
            </p>
          </div>
        </button>
        <button 
          onClick={handleToggleDarkMode}
          className={`w-full ${theme.bgSecondary} p-4 rounded-lg flex items-center ${theme.bgHover} transition cursor-pointer`}
        >
          <div className="mr-4 ml-1">
            {/* Toggle Switch replacing the clock icon */}
            <div className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-[#8C52FF]' : 'bg-gray-400'}`}>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`}>
                {isDarkMode ? (
                  <Moon size={8} className="text-[#8C52FF]" />
                ) : (
                  <Sun size={8} className="text-yellow-500" />
                )}
              </div>
            </div>
          </div>
          <div className="text-left">
            <h4 className="font-medium">Dark & Light Mode</h4>
            <p className={`text-sm ${theme.textSecondary}`}>
              Toggle between light and dark themes
            </p>
          </div>
        </button>
      </div>
    </div>;
}