// src/pages/SignUp.tsx
import { useNavigate } from 'react-router-dom';
import { XIcon, Eye, EyeOff, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import logoImage from '/13331037.png';

export function SignUp() {
  const navigate                        = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const menuRef                         = useRef<HTMLDivElement | null>(null);

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

  /* ───────────────────────── render ──────────────────────── */
  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">

      {/* ── header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#333] relative z-50">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-full">
          <XIcon size={24} />
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">
          SIGN&nbsp;UP
        </span>

        <div ref={menuRef} className="relative">
          <div
            className="h-8 w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition bg-[#333] flex items-center justify-center"
            onClick={() => setMenuOpen(v => !v)}
          >
            <User size={16} className="text-gray-300" />
          </div>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#222] border border-[#333] rounded-lg shadow-lg">
              <button onClick={() => goto('/login')}    className="block w-full px-4 py-2 text-left hover:bg-[#444]">Login</button>
              <button onClick={() => setMenuOpen(false)} className="block w-full px-4 py-2 text-left hover:bg-[#444]">Sign&nbsp;Up</button>
              <button onClick={() => goto('/premium')}  className="block w-full px-4 py-2 text-left hover:bg-[#444]">Get&nbsp;Premium</button>
              <button onClick={() => goto('/')}         className="block w-full px-4 py-2 text-left hover:bg-[#444] rounded-b-lg">Chat</button>
            </div>
          )}
        </div>
      </div>

      {/* ── body ────────────────────────────────────────────── */}
      <div className="flex-grow flex items-center justify-center -mt-8 sm:-mt-4">
        <main className="grid place-items-center px-4 sm:px-6">
          {/* wrap everything so grid treats it as one unit */}
          <section className="flex flex-col items-center w-full max-w-xs">

            <img
              src={logoImage}
              alt="StudyPal Logo"
              className="w-24 h-24 mb-6 object-contain"
            />

          <button className="text-xs text-gray-400 mb-6 hover:text-white">
            English&nbsp;(US)<span className="align-text-top ml-0.5">▾</span>
          </button>

          <form className="w-full space-y-4">
            <input
              type="text"
              placeholder="First Name"
              className="w-full rounded-lg bg-transparent border border-[#444] px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:border-[#4285F4] transition"
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-full rounded-lg bg-transparent border border-[#444] px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:border-[#4285F4] transition"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg bg-transparent border border-[#444] px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:border-[#4285F4] transition"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full rounded-lg bg-transparent border border-[#444] px-4 py-2.5 pr-12 placeholder-gray-400 focus:outline-none focus:border-[#4285F4] transition"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm pt-1 select-none">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#2da8ff] rounded-sm border-[#555] bg-transparent"
              />
              I’m not a robot
            </label>

            <button
              type="submit"
              className="w-full mt-4 rounded-full bg-white text-[#121212] font-semibold py-2 hover:bg-gray-200 transition"
            >
              Sign up
            </button>
          </form>

          <p className="text-sm mt-8">
            Already have an account?&nbsp;
            <button onClick={() => navigate('/login')} className="text-[#2da8ff] hover:underline">
              Log in
            </button>
          </p>
        </section>
      </main>
    </div>
  </div>
  );
}
