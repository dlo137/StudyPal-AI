import { XIcon, User, Target, Heart, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

export function MissionStatement() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const { isDarkMode } = useTheme();
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

  const goto = (path: string) => { setMenuOpen(false); navigate(path); };

  return (
    <div className={`flex flex-col min-h-screen ${theme.bgPrimary} ${theme.textPrimary}`}>
      {/* ── header ──────────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b ${theme.borderPrimary} relative z-50`}>
        <button onClick={() => navigate(-1)} className={`p-2 ${theme.bgHover} rounded-full`}>
          <XIcon size={24} />
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">
          MISSION STATEMENT
        </span>

        <div ref={menuRef} className="relative">
          <div
            className={`h-8 w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition ${theme.bgSecondary} flex items-center justify-center`}
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
              {!user && (
                <>
                  <button onClick={() => goto('/login')} className={`block w-full px-4 py-2 text-left ${theme.bgHoverSecondary} rounded-t-lg`}>Login</button>
                  <button onClick={() => goto('/signup')} className={`block w-full px-4 py-2 text-left ${theme.bgHoverSecondary}`}>Sign&nbsp;Up</button>
                </>
              )}
              <button onClick={() => goto('/profile')} className={`block w-full px-4 py-2 text-left ${theme.bgHoverSecondary} ${!user ? '' : 'rounded-t-lg'}`}>Profile</button>
              <button onClick={() => goto('/premium')} className={`block w-full px-4 py-2 text-left ${theme.bgHoverSecondary}`}>Plans</button>
              <button onClick={() => goto('/')} className={`block w-full px-4 py-2 text-left ${theme.bgHoverSecondary} ${!user ? 'rounded-b-lg' : ''}`}>Chat</button>
              {user && (
                <button onClick={handleLogout} className={`block w-full px-4 py-2 text-left text-red-400 ${theme.bgHoverSecondary} hover:text-red-300 rounded-b-lg`}>Logout</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── body ────────────────────────────────────────────── */}
      <div className="flex-grow py-8 px-4 sm:px-6">
        <main className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] flex items-center justify-center mx-auto mb-6">
              <Target size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] bg-clip-text text-transparent">
              Our Mission
            </h1>
            <p className={`text-xl ${theme.textSecondary} max-w-2xl mx-auto`}>
              Empowering students worldwide to achieve academic excellence through intelligent, personalized learning assistance.
            </p>
          </div>

          {/* Mission Values */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className={`${theme.bgSecondary} p-6 rounded-lg border ${theme.borderPrimary}`}>
              <div className="w-12 h-12 rounded-full bg-[#8C52FF]/20 flex items-center justify-center mb-4">
                <Lightbulb size={24} className="text-[#8C52FF]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Innovation</h3>
              <p className={theme.textSecondary}>
                Leveraging cutting-edge AI technology to create smarter, more intuitive learning experiences.
              </p>
            </div>

            <div className={`${theme.bgSecondary} p-6 rounded-lg border ${theme.borderPrimary}`}>
              <div className="w-12 h-12 rounded-full bg-[#5CE1E6]/20 flex items-center justify-center mb-4">
                <Heart size={24} className="text-[#5CE1E6]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Accessibility</h3>
              <p className={theme.textSecondary}>
                Making quality education assistance available to students everywhere, regardless of background or resources.
              </p>
            </div>

            <div className={`${theme.bgSecondary} p-6 rounded-lg border ${theme.borderPrimary}`}>
              <div className="w-12 h-12 rounded-full bg-[#8C52FF]/20 flex items-center justify-center mb-4">
                <Target size={24} className="text-[#8C52FF]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Excellence</h3>
              <p className={theme.textSecondary}>
                Committed to delivering the highest quality educational support and continuously improving our platform.
              </p>
            </div>
          </div>

          {/* Detailed Mission */}
          <div className={`${theme.bgSecondary} p-8 rounded-lg border ${theme.borderPrimary} mb-8`}>
            <h2 className="text-2xl font-bold mb-6">What We Stand For</h2>
            <div className={`space-y-4 ${theme.textSecondary}`}>
              <p>
                At StudyPal AI, we believe that every student deserves access to personalized, intelligent tutoring that adapts to their unique learning style and pace. Our mission is to democratize education by providing AI-powered assistance that helps students understand complex concepts, solve challenging problems, and achieve their academic goals.
              </p>
              <p>
                We are committed to creating a learning environment that is inclusive, supportive, and empowering. Our AI tutor is designed not just to provide answers, but to guide students through the learning process, helping them develop critical thinking skills and deep understanding of their subjects.
              </p>
              <p>
                Through continuous innovation and dedication to educational excellence, we strive to bridge the gap between traditional learning methods and the digital future of education, making quality tutoring accessible to students worldwide.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Mission</h2>
            <p className={`${theme.textSecondary} mb-6`}>
              Be part of the educational revolution. Start your learning journey with StudyPal AI today.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Start Learning
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
