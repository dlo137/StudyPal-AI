import { useState, useRef, useEffect } from 'react';
import { SendIcon } from 'lucide-react';
import studyPalIcon from '../assets/studypal-icon.png';

export function ChatInterface() {
  /* ── state ──────────────────────────────────────────────────────── */
  const [input, setInput]   = useState('');
  const [messages, setMsgs] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  /* ── refs ───────────────────────────────────────────────────────── */
  const bottomRef  = useRef<HTMLDivElement | null>(null);

  /* ── helpers ────────────────────────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;

    setMsgs(m => [...m, { role: 'user', content: text }]);
    setInput('');
    setIsLoading(true);

    // Record start time for minimum delay
    const startTime = Date.now();

    // ――― replace with YOUR backend ―――
    try {
      // Use Vercel backend URL - replace with your actual Vercel URL
      const apiUrl = 'https://study-pal-ai-dangelos-projects-9e03238c.vercel.app/api/chat';
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: text }] })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const { reply } = await res.json();
      
      // Calculate elapsed time and wait if necessary to ensure minimum 2 seconds
      const elapsedTime = Date.now() - startTime;
      const minDelay = 2000; // 2 seconds
      
      if (elapsedTime < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime));
      }
      
      setMsgs(m => [...m, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('API Error:', error);
      
      // Calculate elapsed time and wait if necessary to ensure minimum 2 seconds
      const elapsedTime = Date.now() - startTime;
      const minDelay = 2000; // 2 seconds
      
      if (elapsedTime < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime));
      }
      
      setMsgs(m => [...m, { role: 'assistant', content: '⚠️ Unable to connect to AI service. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full w-full bg-[#121212] text-white">
      {/* HEADER SECTION */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3 border-b border-[#333333] bg-[#121212] z-10">
        {/* Left side - Logo, Title, New Chat Button */}
        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-semibold">StudyPal</h1>
          <img 
            src={studyPalIcon} 
            alt="StudyPal Icon" 
            className="h-6 w-6 sm:h-7 sm:w-7 object-contain" 
          />
          <button
            onClick={() => setMsgs([])}
            className="ml-2 sm:ml-2 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#222] hover:bg-[#333] transition cursor-pointer disabled:cursor-not-allowed"
            title="New Chat"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-4 sm:h-4">
              <path d="M8 3.333v9.334M3.333 8h9.334" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {/* Right side - Upgrade Button, Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3 relative">
          <button className="border border-[#4285F4] text-[#4285F4] px-3 sm:px-3 py-1 sm:py-1 rounded-full text-sm sm:text-sm hover:bg-[#4285F4]/10 transition cursor-pointer disabled:cursor-not-allowed">
            Upgrade
          </button>
          <div className="relative" ref={menuRef}>
            <img
              src="https://placehold.co/32x32/png"
              alt="Profile"
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition"
              onClick={() => setMenuOpen(v => !v)}
            />
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-[#222] border border-[#333] rounded-lg shadow-lg z-50 animate-fade-in">
                <button className="block w-full text-left px-4 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-sm hover:bg-[#333]" onClick={() => setMenuOpen(false)}>Login</button>
                <button className="block w-full text-left px-4 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-sm hover:bg-[#333]" onClick={() => setMenuOpen(false)}>Get premium</button>
                <button className="block w-full text-left px-4 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-sm hover:bg-[#333] text-red-400" onClick={() => setMenuOpen(false)}>Log out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Content Area - Welcome Screen or Chat Messages */}
        <div className="flex-1 min-h-0">
          {messages.length === 0 ? (
            /* WELCOME SCREEN WITH CENTERED INPUT */
            <div className="h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 py-4">
              <h2 className="text-xl sm:text-3xl font-medium px-2 max-w-md mb-6 sm:mb-8">How can I help you?</h2>
              <div className="w-full max-w-2xl px-2">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="w-full"
                >
                  <div className="flex items-center bg-[#222222] rounded-full px-4 py-2.5 sm:px-5 sm:py-2.5 shadow-lg">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      type="text"
                      placeholder="Type a question"
                      className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder:text-gray-400 text-base sm:text-base min-w-0"
                    />
                    <button
                      type="submit"
                      className="bg-[#4285F4] p-2 sm:p-2 rounded-full disabled:opacity-40 ml-2 sm:ml-3 flex-shrink-0 hover:bg-[#3367d6] transition-colors cursor-pointer disabled:cursor-not-allowed" 
                      disabled={!input.trim() || isLoading}
                    >
                      <SendIcon size={18} className="text-white sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* CHAT MESSAGES */
            <main className="h-full overflow-y-auto px-4 sm:px-6 py-3 sm:py-3 space-y-3 sm:space-y-4 pb-20">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] sm:max-w-lg whitespace-pre-wrap leading-relaxed text-base sm:text-base ${
                    m.role === 'user'
                      ? 'ml-auto bg-[#1e1e1e] rounded-2xl px-4 sm:px-4 py-2.5 sm:py-2'
                      : 'mr-auto bg-[#3b87f6] rounded-2xl px-4 sm:px-4 py-2.5 sm:py-2'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {/* Show "Thinking..." when loading */}
              {isLoading && (
                <div className="mr-auto max-w-[85%] sm:max-w-lg px-4 sm:px-4 py-2.5 sm:py-2">
                  <div className="flex items-center gap-2 text-gray-400 italic text-sm">
                    <span>Thinking</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </main>
          )}
        </div>

        {/* 
          INPUT BAR POSITIONING LOGIC:
          - When messages.length === 0: Input bar is centered under welcome message (above)
          - When messages.length > 0: Input bar moves to fixed position at bottom of screen (below)
        */}
        {messages.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-[#333333] px-4 sm:px-6 py-3 sm:py-4 z-20">
            <form
              onSubmit={e => {
                e.preventDefault();
                sendMessage();
              }}
              className="w-full max-w-4xl mx-auto"
            >
              <div className="flex items-center bg-[#222222] rounded-full px-4 py-2.5 sm:px-5 sm:py-2.5 shadow-lg">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  type="text"
                  placeholder="Type a question"
                  className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder:text-gray-400 text-base sm:text-base min-w-0"
                />
                <button
                  type="submit"
                  className="bg-[#4285F4] p-2 sm:p-2 rounded-full disabled:opacity-40 ml-2 sm:ml-3 flex-shrink-0 hover:bg-[#3367d6] transition-colors cursor-pointer disabled:cursor-not-allowed"
                  disabled={!input.trim() || isLoading}
                >
                  <SendIcon size={18} className="text-white sm:w-5 sm:h-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}