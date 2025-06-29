import { useNavigate } from 'react-router-dom';
import { XIcon, Facebook, Linkedin, Instagram, Twitter, Eye, EyeOff, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import logoImage from '/13331037.png';

export function Login() {
  const navigate                    = useNavigate();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const menuRef                     = useRef<HTMLDivElement | null>(null);

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
  const goto          = (path: string) => { setMenuOpen(false); navigate(path); };

  /* ── render ───────────────────────────────────────────────────── */
  return (
    
    //Main Container
    <div className="h-screen bg-[#121212] text-white flex flex-col">
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
              <button onClick={() => goto('/premium')}       className="block w-full px-4 py-2 text-left hover:bg-[#444]">Get&nbsp;Premium</button>
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
        <form className="w-full max-w-xs mb-6 space-y-4">
          <input
            type="text"
            placeholder="Email address or phone number"
            className="w-full rounded-lg bg-transparent border border-[#444] px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:border-[#4285F4] transition"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full rounded-lg bg-transparent border border-[#444] px-4 py-2.5 pr-12 placeholder-gray-400 focus:outline-none focus:border-[#4285F4] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
          <button aria-label="Facebook"  className="hover:text-[#2da8ff]"><Facebook  size={24}/></button>
          <button aria-label="LinkedIn"   className="hover:text-[#2da8ff]"><Linkedin  size={24}/></button>
          <button aria-label="Instagram"  className="hover:text-[#2da8ff]"><Instagram size={24}/></button>
          <button aria-label="Twitter"    className="hover:text-[#2da8ff]"><Twitter   size={24}/></button>
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
