// src/pages/SignUp.tsx
import { useNavigate } from 'react-router-dom';
import { XIcon, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function SignUp() {
  const navigate                        = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  /* ───────────────────────── render ─────────────────────────── */
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col overflow-hidden">
      {/* ── header (same structure / colours) ─────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#333] relative">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-full">
          <XIcon size={24} />
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">
          SIGN&nbsp;UP
        </span>

        {/* right-side spacer so title stays centred */}
        <div className="w-8 h-8" />
      </div>

      {/* ── body ──────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center px-6 py-4 overflow-y-auto">
        {/* language selector placeholder (top centre) */}
        <button className="text-xs text-gray-400 mb-6 hover:text-white">
          English&nbsp;(US)<span className="align-text-top ml-0.5">▾</span>
        </button>

        {/* form */}
        <form className="w-full max-w-xs space-y-4">
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

          {/* faux-reCAPTCHA */}
          <label className="flex items-center gap-2 text-sm pt-1 select-none">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#2da8ff] rounded-sm border-[#555] bg-transparent"
            />
            I’m not a robot
          </label>

          {/* submit button */}
          <button
            type="submit"
            className="w-full mt-4 rounded-full bg-white text-[#121212] font-semibold py-2 hover:bg-gray-200 transition"
          >
            Sign up
          </button>
        </form>

        {/* footer link */}
        <p className="text-sm mt-8">
          Already have an account?&nbsp;
          <button
            onClick={() => navigate('/login')}
            className="text-[#2da8ff] hover:underline"
          >
            Log in
          </button>
        </p>
      </main>
    </div>
  );
}
