import { Outlet, useLocation, Link } from 'react-router-dom';
import { BookOpenIcon, MessageSquareIcon, UserIcon, SparklesIcon, ScanLineIcon } from 'lucide-react';
export function Layout() {
  const location = useLocation();
  return <div className="flex flex-col h-screen bg-[#121212] text-white">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 w-full bg-[#222222] border-t border-[#333333]">
        <div className="flex justify-around items-center h-16">
          <Link to="/" className={`flex flex-col items-center ${location.pathname === '/' ? 'text-[#8C52FF]' : 'text-gray-400'}`}>
            <BookOpenIcon size={24} />
            <span className="text-xs mt-1">Subjects</span>
          </Link>
          <Link to="/chat" className={`flex flex-col items-center ${location.pathname === '/chat' ? 'text-[#8C52FF]' : 'text-gray-400'}`}>
            <MessageSquareIcon size={24} />
            <span className="text-xs mt-1">Chat</span>
          </Link>
          <Link to="/scan" className={`flex flex-col items-center ${location.pathname === '/scan' ? 'text-[#8C52FF]' : 'text-gray-400'}`}>
            <ScanLineIcon size={24} />
            <span className="text-xs mt-1">Scan</span>
          </Link>
          <Link to="/profile" className={`flex flex-col items-center ${location.pathname === '/profile' ? 'text-[#8C52FF]' : 'text-gray-400'}`}>
            <UserIcon size={24} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
          <Link to="/premium" className={`flex flex-col items-center ${location.pathname === '/premium' ? 'text-[#8C52FF]' : 'text-gray-400'}`}>
            <SparklesIcon size={24} />
            <span className="text-xs mt-1">Premium</span>
          </Link>
        </div>
      </nav>
    </div>;
}