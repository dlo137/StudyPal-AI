import { CrownIcon, BookmarkIcon, ClockIcon, MessageSquareIcon, XIcon, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

export function UserProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  return <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      {/* ── header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#333] relative z-50">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-full">
          <XIcon size={24} />
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">
          PROFILE
        </span>

        <div ref={menuRef} className="relative">
          <div
            className="h-8 w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition bg-[#333] flex items-center justify-center"
            onClick={() => setMenuOpen(v => !v)}
          >
            {user ? (
              <span className="text-white text-xs font-medium">
                {getUserInitials()}
              </span>
            ) : (
              <User size={16} className="text-gray-300" />
            )}
          </div>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#222] border border-[#333] rounded-lg shadow-lg">
              {!user && (
                <>
                  <button onClick={() => { setMenuOpen(false); navigate('/login'); }} className="block w-full px-4 py-2 text-left hover:bg-[#444] rounded-t-lg">Login</button>
                  <button onClick={() => { setMenuOpen(false); navigate('/signup'); }} className="block w-full px-4 py-2 text-left hover:bg-[#444]">Sign&nbsp;Up</button>
                </>
              )}
              <button onClick={() => { setMenuOpen(false); navigate('/premium'); }} className={`block w-full px-4 py-2 text-left hover:bg-[#444] ${!user ? '' : 'rounded-t-lg'}`}>Get&nbsp;Premium</button>
              <button onClick={() => { setMenuOpen(false); navigate('/'); }} className={`block w-full px-4 py-2 text-left hover:bg-[#444] ${!user ? 'rounded-b-lg' : ''}`}>Chat</button>
              {user && (
                <button onClick={handleLogout} className="block w-full px-4 py-2 text-left text-red-400 hover:bg-[#444] hover:text-red-300 rounded-b-lg">Logout</button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center p-6 border-b border-[#333333]">
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
        <p className="text-gray-400">{user?.email || 'No email available'}</p>
        <div className="mt-4 flex items-center bg-[#222222] px-4 py-2 rounded-full">
          <CrownIcon size={16} className="text-yellow-500 mr-2" />
          <span className="text-sm font-medium">Free Member</span>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-2">Activity</h3>
        <div className="bg-[#222222] p-4 rounded-lg flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center mr-4">
            <BookmarkIcon size={20} className="text-[#8C52FF]" />
          </div>
          <div>
            <h4 className="font-medium">Saved Responses</h4>
            <p className="text-sm text-gray-400">
              Access your bookmarked answers
            </p>
          </div>
        </div>
        <div className="bg-[#222222] p-4 rounded-lg flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center mr-4">
            <ClockIcon size={20} className="text-[#8C52FF]" />
          </div>
          <div>
            <h4 className="font-medium">History</h4>
            <p className="text-sm text-gray-400">
              View your past conversations
            </p>
          </div>
        </div>
        <div className="bg-[#222222] p-4 rounded-lg flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center mr-4">
            <MessageSquareIcon size={20} className="text-[#8C52FF]" />
          </div>
          <div>
            <h4 className="font-medium">Study Sessions</h4>
            <p className="text-sm text-gray-400">
              Track your learning progress
            </p>
          </div>
        </div>
      </div>
      <div className="mt-auto p-4">
        <button 
          onClick={handleLogout}
          className="w-full p-3 rounded-lg border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>;
}