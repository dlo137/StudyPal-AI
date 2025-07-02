import { useNavigate } from 'react-router-dom';
import { XIcon, Facebook, Linkedin, Instagram, Twitter, Eye, EyeOff, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import logoImage from '/13331037.png';
import { loginUser, loginWithGoogle, loginWithFacebook } from '../lib/auth';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

export function Login() {
  const navigate                    = useNavigate();
  const { isDarkMode } = useTheme();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const menuRef                     = useRef<HTMLDivElement | null>(null);
  
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

  // Handle form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { user, error } = await loginUser({ email, password });
      
      if (error) {
        setError(error.message);
      } else if (user) {
        // Success - redirect to chat
        navigate('/chat');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social logins
  const handleGoogleLogin = async () => {
    const { error } = await loginWithGoogle();
    if (error) {
      setError(error.message);
    }
  };

  const handleFacebookLogin = async () => {
    const { error } = await loginWithFacebook();
    if (error) {
      setError(error.message);
    }
  };

  /* ── render ───────────────────────────────────────────────────── */
  return (
    
    //Main Container
    <div className={`h-screen ${theme.bgPrimary} ${theme.textPrimary} flex flex-col`}>
      {/* ── header (unchanged) ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#333] relative z-50">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-800 rounded-full">
          <XIcon size={24} />
        </button>

        {/* centred title */}
        <span className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">
          LOG&nbsp;IN
        </span>

        {/* avatar + menu */}
        <div ref={menuRef} className="relative">
          <div className="h-8 w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition bg-[#333] flex items-center justify-center"
               onClick={() => setMenuOpen(v => !v)}>
            <User size={16} className="text-gray-300" />
          </div>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#222] border border-[#333] rounded-lg shadow-lg">
              <button onClick={() => setMenuOpen(false)}     className="block w-full px-4 py-2 text-left hover:bg-[#444]">Login</button>
              <button onClick={() => goto('/signup')}        className="block w-full px-4 py-2 text-left hover:bg-[#444]">Sign&nbsp;Up</button>
              <button onClick={() => goto('/premium')}       className="block w-full px-4 py-2 text-left hover:bg-[#444]">Plans</button>
              <button onClick={() => goto('/')}              className="block w-full px-4 py-2 text-left hover:bg-[#444] rounded-b-lg">Chat</button>
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

        {/* input fields */}
        <form onSubmit={handleLogin} className="w-full max-w-xs mb-6 space-y-4">
          {/* Error message */}
          {error && (
            <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full rounded-lg bg-transparent border border-[#444] px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:border-[#4285F4] transition disabled:opacity-50"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-lg bg-transparent border border-[#444] px-4 py-2.5 pr-12 placeholder-gray-400 focus:outline-none focus:border-[#4285F4] transition disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="text-right text-sm pt-1">
            <button
              type="button"
              className="text-[#2da8ff] hover:underline"
              onClick={() => goto('/forgot')}
            >
              Forgot&nbsp;Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-[#4285F4] text-white py-2.5 rounded-lg font-medium hover:bg-[#3367d6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* divider */}
        <div className="flex items-center gap-2 mb-4">
          <span className="h-px flex-1 bg-[#444]"></span>
          <span className="text-sm text-gray-400 uppercase">or</span>
          <span className="h-px flex-1 bg-[#444]"></span>
        </div>

        {/* login with socials */}
        <p className="text-sm mb-3">Login with</p>
        <div className="flex gap-6 mb-4">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            aria-label="Google"  
            className="hover:text-[#2da8ff] transition-colors disabled:opacity-50"
            title="Login with Google"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>
          <button 
            type="button"
            onClick={handleFacebookLogin}
            disabled={isLoading}
            aria-label="Facebook"  
            className="hover:text-[#2da8ff] transition-colors disabled:opacity-50"
          >
            <Facebook size={24}/>
          </button>
          <button 
            type="button"
            aria-label="LinkedIn"   
            className="hover:text-[#2da8ff] transition-colors opacity-50 cursor-not-allowed"
            title="LinkedIn login coming soon"
          >
            <Linkedin size={24}/>
          </button>
          <button 
            type="button"
            aria-label="Instagram"  
            className="hover:text-[#2da8ff] transition-colors opacity-50 cursor-not-allowed"
            title="Instagram login coming soon"
          >
            <Instagram size={24}/>
          </button>
          <button 
            type="button"
            aria-label="Twitter"    
            className="hover:text-[#2da8ff] transition-colors opacity-50 cursor-not-allowed"
            title="Twitter login coming soon"
          >
            <Twitter size={24}/>
          </button>
        </div>

        {/* footer link */}
        <p className="text-sm">
          Don’t have an account?&nbsp;
          <button onClick={() => goto('/signup')} className="text-[#2da8ff] hover:underline">
            Create&nbsp;new&nbsp;Account
          </button>
        </p>
      </main>
    </div>
  );
}
