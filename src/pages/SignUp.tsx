// src/pages/SignUp.tsx
import { useNavigate } from 'react-router-dom';
import { XIcon, Eye, EyeOff, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import logoImage from '/13331037.png';
import { signUpUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

export function SignUp() {
  const navigate                        = useNavigate();
  const { isDarkMode } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [isRobot, setIsRobot]           = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState<string | null>(null);
  const menuRef                         = useRef<HTMLDivElement | null>(null);
  
  const theme = getThemeClasses(isDarkMode);

  /* ── close avatar menu when you tap outside ─────────────── */
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const goto = (path: string) => { setMenuOpen(false); navigate(path); };

  // Handle form submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!isRobot) {
      setError('Please verify that you are not a robot');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const { user, error } = await signUpUser({
        email,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`
      });
      
      if (error) {
        setError(error.message);
      } else if (user) {
        if (user.email_confirmed_at) {
          setSuccess('Account created successfully! You can now log in.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setSuccess("Account created successfully! Please check your email (including spam folder) to verify your account. If you don't receive an email within 5 minutes, try the 'Resend Email' button below.");
        }
        // Clear form
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setIsRobot(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resending confirmation email
  const handleResendEmail = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        setError('Authentication service is not available. Please check your configuration.');
        return;
      }
      
      const { error } = await supabase!.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Confirmation email sent! Please check your inbox and spam folder.');
      }
    } catch {
      setError('Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ───────────────────────── render ──────────────────────── */
  return (
    <div className={`flex flex-col min-h-screen ${theme.bgPrimary} ${theme.textPrimary}`}>

      {/* ── header ──────────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b ${theme.borderPrimary} relative z-50`}>
        <button onClick={() => navigate(-1)} className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'} rounded-full cursor-pointer`}>
          <XIcon size={24} />
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">
          SIGN&nbsp;UP
        </span>

        <div ref={menuRef} className="relative">
          <div
            className={`h-8 w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition ${theme.bgTertiary} flex items-center justify-center`}
            onClick={() => setMenuOpen(v => !v)}
          >
            <User size={16} className={theme.textSecondary} />
          </div>

          {menuOpen && (
            <div className={`absolute right-0 mt-2 w-40 ${theme.bgSecondary} border ${theme.borderPrimary} rounded-lg shadow-lg`}>
              <button onClick={() => goto('/login')}    className={`block w-full px-4 py-2 text-left ${theme.bgHoverSecondary}`}>Login</button>
              <button onClick={() => setMenuOpen(false)} className={`block w-full px-4 py-2 text-left ${theme.bgHoverSecondary}`}>Sign&nbsp;Up</button>
              <button onClick={() => goto('/premium')}  className={`block w-full px-4 py-2 text-left ${theme.bgHoverSecondary}`}>Plans</button>
              <button onClick={() => goto('/')}         className={`block w-full px-4 py-2 text-left ${theme.bgHoverSecondary} rounded-b-lg`}>Chat</button>
            </div>
          )}
        </div>
      </div>

      {/* ── body ────────────────────────────────────────────── */}
      <div className="flex-grow flex items-center justify-center py-8 px-4 sm:px-6">
        <main className="grid place-items-center">
          {/* wrap everything so grid treats it as one unit */}
          <section className="flex flex-col items-center w-full max-w-xs">

            <img
              src={logoImage}
              alt="StudyPal Logo"
              className="w-24 h-24 mb-6 object-contain"
            />

          <button className={`text-xs ${theme.textSecondary} mb-6 ${isDarkMode ? 'hover:text-white' : 'hover:text-black'}`}>
            English&nbsp;(US)<span className="align-text-top ml-0.5">▾</span>
          </button>

          <form onSubmit={handleSignUp} className="w-full space-y-4">
            {/* Error and Success Messages */}
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-800/30">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-400 text-sm text-center bg-green-900/20 p-2 rounded-lg border border-green-800/30">
                {success}
                {success.includes('verify your account') && (
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    className="block mx-auto mt-2 px-4 py-1 bg-green-700 hover:bg-green-600 rounded text-xs transition disabled:opacity-50"
                  >
                    Resend Email
                  </button>
                )}
              </div>
            )}

            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full rounded-lg ${theme.inputBg} border ${theme.inputBorder} px-4 py-2.5 ${theme.inputPlaceholder} focus:outline-none ${theme.inputFocus} transition`}
              disabled={isLoading}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-full rounded-lg ${theme.inputBg} border ${theme.inputBorder} px-4 py-2.5 ${theme.inputPlaceholder} focus:outline-none ${theme.inputFocus} transition`}
              disabled={isLoading}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-lg ${theme.inputBg} border ${theme.inputBorder} px-4 py-2.5 ${theme.inputPlaceholder} focus:outline-none ${theme.inputFocus} transition`}
              disabled={isLoading}
              required
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-lg ${theme.inputBg} border ${theme.inputBorder} px-4 py-2.5 pr-12 ${theme.inputPlaceholder} focus:outline-none ${theme.inputFocus} transition`}
                disabled={isLoading}
                required
                minLength={6}
              />
              <button
                type="button"
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.textSecondary} ${isDarkMode ? 'hover:text-white' : 'hover:text-black'}`}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm pt-1 select-none">
              <input
                type="checkbox"
                checked={isRobot}
                onChange={(e) => setIsRobot(e.target.checked)}
                className={`h-4 w-4 accent-[#2da8ff] rounded-sm ${isDarkMode ? 'border-[#555]' : 'border-gray-400'} bg-transparent`}
                disabled={isLoading}
              />
              I'm not a robot
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-4 rounded-full ${theme.buttonPrimary} font-semibold py-2 ${isDarkMode ? 'hover:bg-gray-200' : 'hover:bg-gray-800'} transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
            >
              {isLoading ? 'Creating Account...' : 'Sign up'}
            </button>
          </form>

          <p className="text-sm mt-8">
            Already have an account?&nbsp;
            <button onClick={() => navigate('/login')} className="text-[#2da8ff] hover:underline cursor-pointer">
              Log in
            </button>
          </p>
        </section>
      </main>
    </div>
    </div>
  );
}
