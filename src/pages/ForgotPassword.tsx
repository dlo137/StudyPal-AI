import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import logoImage from '/13331037.png';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

type ForgotPasswordStep = 'email' | 'emailSent' | 'newPassword' | 'success';

export function ForgotPassword() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  
  const theme = getThemeClasses(isDarkMode);

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

  // Step 1: Send reset email
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!supabase) {
        setError('Authentication service is not available. Please try again later.');
        return;
      }

      const redirectUrl = window.location.hostname === 'localhost' 
        ? `${window.location.origin}${window.location.pathname}#/reset-password`
        : `${window.location.origin}/#/reset-password`;
        
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(`Password reset instructions have been sent to ${email}`);
        setCurrentStep('emailSent');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user came from email link to reset password
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const step = urlParams.get('step');
    if (step === 'reset') {
      setCurrentStep('newPassword');
    }
  }, []);

  // Step 3: Update password
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
        setCurrentStep('success');
        setSuccess('Password updated successfully!');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'email':
        return (
          <form onSubmit={handleSendResetEmail} className="w-full max-w-xs space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
              <p className="text-gray-400 text-sm">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>

            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full rounded-lg bg-transparent border border-[#444] pl-12 pr-4 py-2.5 placeholder-gray-400 focus:outline-none focus:border-[#4285F4] transition disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-[#4285F4] text-white py-2.5 rounded-lg font-medium hover:bg-[#3367d6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Sending...' : 'Continue'}
            </button>
          </form>
        );

      case 'emailSent':
        return (
          <div className="w-full max-w-xs space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Check Your Email</h2>
              <p className="text-gray-400 text-sm">
                We've sent password reset instructions to <span className="text-white">{email}</span>
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Click the link in the email to reset your password. The link will expire in 24 hours.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep('email')}
              className="w-full text-[#2da8ff] hover:underline cursor-pointer"
            >
              Back to email entry
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full bg-[#4285F4] text-white py-2.5 rounded-lg font-medium hover:bg-[#3367d6] transition-colors cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        );

      case 'newPassword':
        return (
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
        );

      case 'success':
        return (
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
              Back to Login
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`h-screen ${theme.bgPrimary} ${theme.textPrimary} flex flex-col`}>
      {/* ── header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#333] relative z-50">
        <button onClick={() => navigate('/login')} className="p-2 hover:bg-gray-800 rounded-full cursor-pointer">
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

        {/* Error/Success messages */}
        {error && (
          <div className="w-full max-w-xs mb-4">
            <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="w-full max-w-xs mb-4">
            <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-3 text-green-300 text-sm">
              {success}
            </div>
          </div>
        )}

        {/* Current step content */}
        {renderStep()}

        {/* Progress indicator */}
        {currentStep !== 'success' && (
          <div className="flex space-x-2 mt-6">
            <div className={`w-2 h-2 rounded-full ${currentStep === 'email' ? 'bg-[#4285F4]' : 'bg-gray-600'}`} />
            <div className={`w-2 h-2 rounded-full ${currentStep === 'emailSent' ? 'bg-[#4285F4]' : 'bg-gray-600'}`} />
          </div>
        )}
      </main>
    </div>
  );
}
