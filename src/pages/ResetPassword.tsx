import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import logoImage from '/13331037.png';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

// To use this page for /reset-password, add to your router:
// <Route path="/reset-password" element={<ResetPassword />} />
export const ResetPassword = () => {
  // Debug: Log current location and hash to help diagnose 404 issues
  useEffect(() => {
    console.log('[ResetPassword] Page loaded. Location:', window.location.href);
    console.log('[ResetPassword] Hash:', window.location.hash);
  }, []);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  
  const theme = getThemeClasses(isDarkMode);

  // Check for valid reset session when component mounts
  useEffect(() => {
    // Helper to test URL parsing (for debugging)
    const testUrlParsing = () => {
      console.log('=== URL Parsing Test ===');
      console.log('Full URL:', window.location.href);
      console.log('Hash:', window.location.hash);
      console.log('Search:', window.location.search);
      
      // Test different URL formats that Supabase might send
      const testUrls = [
        'http://localhost:5174/StudyPal-AI/#/reset-password?access_token=test&type=recovery',
        'http://localhost:5174/StudyPal-AI/#access_token=test&type=recovery&route=/reset-password',
        'http://localhost:5174/StudyPal-AI/#/reset-password#access_token=test&type=recovery'
      ];
      
      testUrls.forEach((url, index) => {
        console.log(`\nTest URL ${index + 1}:`, url);
        try {
          const tempUrl = new URL(url);
          console.log('- Hash:', tempUrl.hash);
          console.log('- Search:', tempUrl.search);
          
          // Try parsing as query params
          if (tempUrl.search) {
            const searchParams = new URLSearchParams(tempUrl.search);
            console.log('- Access token from search:', searchParams.get('access_token'));
            console.log('- Type from search:', searchParams.get('type'));
          }
          
          // Try parsing hash
          if (tempUrl.hash) {
            const hashContent = tempUrl.hash.substring(1);
            console.log('- Hash content:', hashContent);
            
            if (hashContent.includes('?')) {
              const [route, params] = hashContent.split('?');
              console.log('- Route:', route);
              console.log('- Params:', params);
              const hashParams = new URLSearchParams(params);
              console.log('- Access token from hash params:', hashParams.get('access_token'));
              console.log('- Type from hash params:', hashParams.get('type'));
            }
          }
        } catch (e) {
          console.log('- Error parsing URL:', e);
        }
      });
    };

    if (!supabase) {
      setError('Authentication service is not available.');
      setIsSessionLoading(false);
      return;
    }

    // Run URL parsing test for debugging
    testUrlParsing();

    // Set up auth state listener to detect session changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        console.log('Password recovery session detected');
        setIsValidSession(true);
        setIsSessionLoading(false);
      } else if (event === 'SIGNED_OUT' || !session) {
        setIsValidSession(false);
        if (!isSessionLoading) {
          setError('Session expired. Please request a new password reset.');
        }
      }
    });

    // Also check current session immediately
    const checkCurrentSession = async () => {
      try {
        console.log('Reset Password - Full URL:', window.location.href);
        console.log('Reset Password - Hash:', window.location.hash);
        console.log('Reset Password - Search:', window.location.search);

        // Check current session first
        const { data: { session }, error } = await supabase!.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
        }

        if (session && session.user) {
          console.log('Valid reset session found for user:', session.user.email);
          setIsValidSession(true);
          setIsSessionLoading(false);
          return;
        }

        // Try to get session from URL hash fragments (common with email links)
        // With HashRouter, tokens might be in different parts of the URL
        const fullHash = window.location.hash;
        let hashParams = new URLSearchParams();
        
        // Check if there are parameters after the route
        if (fullHash.includes('?')) {
          const paramsString = fullHash.split('?')[1];
          hashParams = new URLSearchParams(paramsString);
        } else if (fullHash.includes('&')) {
          // Sometimes tokens come directly after the hash
          const paramsString = fullHash.substring(1).includes('/reset-password')
            ? fullHash.substring(fullHash.indexOf('/reset-password') + '/reset-password'.length).replace(/^[&#]/, '')
            : fullHash.substring(1);
          hashParams = new URLSearchParams(paramsString);
        }
        
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Checking URL for tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

        if (accessToken && type === 'recovery') {
          // Set the session from the URL parameters
          const { data, error: setSessionError } = await supabase!.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (setSessionError) {
            console.error('Set session error:', setSessionError);
            setError('Invalid or expired reset link. Please request a new password reset.');
            setIsSessionLoading(false);
          } else if (data.session && data.user) {
            console.log('Session restored from URL for user:', data.user.email);
            setIsValidSession(true);
            setIsSessionLoading(false);
            // Clean up the URL
            window.history.replaceState({}, document.title, '#/reset-password');
          } else {
            setError('Unable to restore session from reset link.');
            setIsSessionLoading(false);
          }
        } else {
          setError('No valid reset session found. Please request a new password reset.');
          setIsSessionLoading(false);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setError('An error occurred while verifying your reset session.');
        setIsSessionLoading(false);
      }
    };

    checkCurrentSession();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* ── close avatar menu when you tap outside ───────────────────── */
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

  /* ── helpers ──────────────────────────────────────────────────── */
  const goto = (path: string) => { setMenuOpen(false); navigate(path); };

  // Update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      if (!supabase) {
        setError('Authentication service is not available. Please try again later.');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (isSessionLoading) {
    return (
      <div className={`h-screen ${theme.bgPrimary} ${theme.textPrimary} flex flex-col`}>
        {/* ── header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#333] relative z-50">
          <button onClick={() => navigate('/login')} className="p-2 hover:bg-gray-800 rounded-full cursor-pointer">
            <ArrowLeft size={24} />
          </button>

          {/* centered title */}
          <span className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">
            PASSWORD RESET
          </span>

          {/* avatar + menu */}
          <div ref={menuRef} className="relative">
            <div className="h-8 w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition bg-[#333] flex items-center justify-center"
                 onClick={() => setMenuOpen(v => !v)}>
              <User size={16} className="text-gray-300" />
            </div>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[#222] border border-[#333] rounded-lg shadow-lg">
                <button onClick={() => goto('/login')}        className="block w-full px-4 py-2 text-left hover:bg-[#444]">Login</button>
                <button onClick={() => goto('/signup')}       className="block w-full px-4 py-2 text-left hover:bg-[#444]">Sign Up</button>
                <button onClick={() => goto('/premium')}      className="block w-full px-4 py-2 text-left hover:bg-[#444]">Plans</button>
                <button onClick={() => goto('/')}             className="block w-full px-4 py-2 text-left hover:bg-[#444] rounded-b-lg">Chat</button>
              </div>
            )}
          </div>
        </div>          {/* ── loading body ─────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 min-h-0">
          <div className="w-8 h-8 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 text-sm">Verifying reset session...</p>
        </main>
      </div>
    );
  }

  // Show error state if session is invalid
  if (!isValidSession) {
    return (
      <div className={`h-screen ${theme.bgPrimary} ${theme.textPrimary} flex flex-col`}>
        {/* ── header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#333] relative z-50">
          <button onClick={() => navigate('/login')} className="p-2 hover:bg-gray-800 rounded-full cursor-pointer">
            <ArrowLeft size={24} />
          </button>

          {/* centered title */}
          <span className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">
            PASSWORD RESET
          </span>

          {/* avatar + menu */}
          <div ref={menuRef} className="relative">
            <div className="h-8 w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition bg-[#333] flex items-center justify-center"
                 onClick={() => setMenuOpen(v => !v)}>
              <User size={16} className="text-gray-300" />
            </div>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[#222] border border-[#333] rounded-lg shadow-lg">
                <button onClick={() => goto('/login')}        className="block w-full px-4 py-2 text-left hover:bg-[#444]">Login</button>
                <button onClick={() => goto('/signup')}       className="block w-full px-4 py-2 text-left hover:bg-[#444]">Sign Up</button>
                <button onClick={() => goto('/profile')}      className="block w-full px-4 py-2 text-left hover:bg-[#444]">Profile</button>
                <button onClick={() => goto('/premium')}      className="block w-full px-4 py-2 text-left hover:bg-[#444]">Plans</button>
                <button onClick={() => goto('/')}             className="block w-full px-4 py-2 text-left hover:bg-[#444] rounded-b-lg">Chat</button>
              </div>
            )}
          </div>
        </div>

        {/* ── error body ─────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 min-h-0">
          <img
            src={logoImage}
            alt="StudyPal Logo"
            className="w-24 h-24 mb-6 object-contain"
          />

          <div className="w-full max-w-xs text-center space-y-4">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✗</span>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Reset Link Invalid</h2>
              <p className="text-gray-400 text-sm mb-4">
                {error || 'This password reset link is invalid or has expired. Please request a new one.'}
              </p>
            </div>

            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full bg-[#4285F4] text-white py-2.5 rounded-lg font-medium hover:bg-[#3367d6] transition-colors cursor-pointer"
            >
              Request New Reset Link
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-transparent text-gray-400 py-2.5 rounded-lg font-medium hover:text-white transition-colors cursor-pointer border border-[#333] hover:border-gray-600"
            >
              Back to Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`h-screen ${theme.bgPrimary} ${theme.textPrimary} flex flex-col`}>
        {/* ── header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#333] relative z-50">
          <button onClick={() => navigate('/login')} className="p-2 hover:bg-gray-800 rounded-full cursor-pointer">
            <ArrowLeft size={24} />
          </button>

          {/* centered title */}
          <span className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">
            PASSWORD RESET
          </span>

          {/* avatar + menu */}
          <div ref={menuRef} className="relative">
            <div className="h-8 w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition bg-[#333] flex items-center justify-center"
                 onClick={() => setMenuOpen(v => !v)}>
              <User size={16} className="text-gray-300" />
            </div>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[#222] border border-[#333] rounded-lg shadow-lg">
                <button onClick={() => goto('/login')}        className="block w-full px-4 py-2 text-left hover:bg-[#444]">Login</button>
                <button onClick={() => goto('/signup')}       className="block w-full px-4 py-2 text-left hover:bg-[#444]">Sign Up</button>
                <button onClick={() => goto('/profile')}      className="block w-full px-4 py-2 text-left hover:bg-[#444]">Profile</button>
                <button onClick={() => goto('/premium')}      className="block w-full px-4 py-2 text-left hover:bg-[#444]">Plans</button>
                <button onClick={() => goto('/')}             className="block w-full px-4 py-2 text-left hover:bg-[#444] rounded-b-lg">Chat</button>
              </div>
            )}
          </div>
        </div>

        {/* ── success body ─────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 min-h-0">
          <img
            src={logoImage}
            alt="StudyPal Logo"
            className="w-24 h-24 mb-6 object-contain"
          />

          <div className="w-full max-w-xs text-center space-y-4">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✓</span>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Password Updated!</h2>
              <p className="text-gray-400 text-sm">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#4285F4] text-white py-2.5 rounded-lg font-medium hover:bg-[#3367d6] transition-colors cursor-pointer"
            >
              Continue to Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`h-screen ${theme.bgPrimary} ${theme.textPrimary} flex flex-col`}>
      {/* ── header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#333] relative z-50">
        <button onClick={() => navigate('/forgot-password')} className="p-2 hover:bg-gray-800 rounded-full cursor-pointer">
          <ArrowLeft size={24} />
        </button>

        {/* centered title */}
        <span className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">
          RESET PASSWORD
        </span>

        {/* avatar + menu */}
        <div ref={menuRef} className="relative">
          <div className="h-8 w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition bg-[#333] flex items-center justify-center"
               onClick={() => setMenuOpen(v => !v)}>
            <User size={16} className="text-gray-300" />
          </div>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#222] border border-[#333] rounded-lg shadow-lg">
              <button onClick={() => goto('/login')}        className="block w-full px-4 py-2 text-left hover:bg-[#444]">Login</button>
              <button onClick={() => goto('/signup')}       className="block w-full px-4 py-2 text-left hover:bg-[#444]">Sign Up</button>
              <button onClick={() => goto('/profile')}      className="block w-full px-4 py-2 text-left hover:bg-[#444]">Profile</button>
              <button onClick={() => goto('/premium')}      className="block w-full px-4 py-2 text-left hover:bg-[#444]">Plans</button>
              <button onClick={() => goto('/')}             className="block w-full px-4 py-2 text-left hover:bg-[#444] rounded-b-lg">Chat</button>
            </div>
          )}
        </div>
      </div>

      {/* ── body ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 min-h-0">
        {/* hero icon */}
        <img
          src={logoImage}
          alt="StudyPal Logo"
          className="w-24 h-24 mb-6 object-contain"
        />

        {/* Error message */}
        {error && (
          <div className="w-full max-w-xs mb-4">
            <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="w-full max-w-xs space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Set New Password</h2>
            <p className="text-gray-400 text-sm">
              Choose a strong password for your account.
            </p>
          </div>

          <div className="relative">
            <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-lg bg-transparent border border-[#444] pl-12 pr-12 py-2.5 placeholder-gray-400 focus:outline-none focus:border-[#4285F4] transition disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-lg bg-transparent border border-[#444] pl-12 pr-12 py-2.5 placeholder-gray-400 focus:outline-none focus:border-[#4285F4] transition disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword}
            className="w-full bg-[#4285F4] text-white py-2.5 rounded-lg font-medium hover:bg-[#3367d6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default ResetPassword;
