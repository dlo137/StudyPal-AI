import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SendIcon, User } from 'lucide-react';
import studyPalIcon from '../assets/studypal-icon.png';
import demoLogo from '../assets/13331037.png';
import { SparklesIcon, ZapIcon, CrownIcon } from 'lucide-react';
import { XIcon } from 'lucide-react';
import { sendMessageToOpenAI, validateOpenAIConfig, type ChatMessage } from '../lib/openai';

export function ChatInterface() {
  /* ── state ──────────────────────────────────────────────────────── */
  const [input, setInput]   = useState('');
  const [messages, setMsgs] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openaiError, setOpenaiError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

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

    // Clear any previous errors
    setOpenaiError(null);

    // Check OpenAI configuration
    const configCheck = validateOpenAIConfig();
    if (!configCheck.valid) {
      setOpenaiError(configCheck.error || 'OpenAI configuration error');
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMsgs(m => [...m, userMessage]);
    setInput('');
    setIsLoading(true);

    // Record start time for minimum delay
    const startTime = Date.now();

    try {
      // Send message to OpenAI
      const aiResponse = await sendMessageToOpenAI([...messages, userMessage]);
      
      // Calculate elapsed time and wait if necessary to ensure minimum 2 seconds
      const elapsedTime = Date.now() - startTime;
      const minDelay = 2000; // 2 seconds
      
      if (elapsedTime < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime));
      }
      
      const aiMessage: ChatMessage = { role: 'assistant', content: aiResponse };
      setMsgs(m => [...m, aiMessage]);
    } catch (error) {
      console.error('OpenAI Error:', error);
      
      // Calculate elapsed time and wait if necessary to ensure minimum 2 seconds
      const elapsedTime = Date.now() - startTime;
      const minDelay = 2000; // 2 seconds
      
      if (elapsedTime < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime));
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong with the AI service. Please try again.';
      setOpenaiError(errorMessage);
      
      const errorResponse: ChatMessage = { 
        role: 'assistant', 
        content: `⚠️ ${errorMessage}`
      };
      setMsgs(m => [...m, errorResponse]);
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

  function handleLogin() {
    setMenuOpen(false);
    navigate('/login');
  }

  function handlePremium() {
    setMenuOpen(false);
    navigate('/premium');
  }

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <div className="mobile-full-height w-full bg-[#121212] text-white flex flex-col">
      {/* HEADER SECTION */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#333] bg-[#121212] z-10 relative">

        
        {/* Left side - Logo and New Chat Button */}
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-semibold">StudyPal</span>
          <img 
            src={studyPalIcon} 
            alt="StudyPal Icon" 
            className="h-6 w-6 sm:h-7 sm:w-7 object-contain" 
          />
          <button
            onClick={() => setMsgs([])}
            className="ml-2 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#222] hover:bg-[#333] transition cursor-pointer"
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
          <button 
            className="border border-[#4285F4] text-[#4285F4] bg-transparent px-3 py-1 rounded-full text-sm transition-all duration-200 cursor-pointer hover:bg-[#4285F4] hover:text-white"
            onClick={handlePremium}
          >
            Upgrade
          </button>
          <div className="relative" ref={menuRef}>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition bg-[#333] flex items-center justify-center"
                 onClick={() => setMenuOpen(v => !v)}>
              <User size={16} className="text-gray-300" />
            </div>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-[#222] border border-[#333] rounded-lg shadow-lg z-50">
                <button 
                  className="block w-full text-left px-4 py-2.5 text-sm hover:bg-[#444] hover:text-white transition-all duration-200 cursor-pointer rounded-t-lg" 
                  onClick={handleLogin}
                >
                  Login
                </button>
                <button 
                  className="block w-full text-left px-4 py-2.5 text-sm hover:bg-[#444] hover:text-white transition-all duration-200 cursor-pointer" 
                  onClick={() => { setMenuOpen(false); navigate('/signup'); }}
                >
                  Sign Up
                </button>
                <button 
                  className="block w-full text-left px-4 py-2.5 text-sm hover:bg-[#444] hover:text-white transition-all duration-200 cursor-pointer" 
                  onClick={handlePremium}
                >
                  Get Premium
                </button>
                <button 
                  className="block w-full text-left px-4 py-2.5 text-sm hover:bg-[#444] hover:text-white transition-all duration-200 cursor-pointer rounded-b-lg" 
                  onClick={() => { setMenuOpen(false); navigate('/'); }}
                >
                  Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {messages.length === 0 ? (
          /* WELCOME SCREEN WITH CENTERED INPUT */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 min-h-0">
            
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
                    className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder:text-gray-400 text-base min-w-0"
                  />
                  <button
                    type="submit"
                    className="bg-[#4285F4] p-2 rounded-full disabled:opacity-40 ml-2 sm:ml-3 flex-shrink-0 hover:bg-[#3367d6] transition-colors cursor-pointer disabled:cursor-not-allowed" 
                    disabled={!input.trim() || isLoading}
                  >
                    <SendIcon size={18} className="text-white sm:w-5 sm:h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* CHAT MESSAGES WITH BOTTOM INPUT */
          <>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 space-y-3 sm:space-y-4 min-h-0">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] sm:max-w-lg whitespace-pre-wrap leading-relaxed text-base ${
                    m.role === 'user'
                      ? 'ml-auto bg-[#1e1e1e] rounded-2xl px-4 py-2.5'
                      : 'mr-auto bg-[#3b87f6] rounded-2xl px-4 py-2.5'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {/* Show "Thinking..." when loading */}
              {isLoading && (
                <div className="mr-auto max-w-[85%] sm:max-w-lg px-4 py-2.5">
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
            </div>
            
            {/* BOTTOM INPUT BAR */}
            <div className="flex-shrink-0 bg-[#121212] border-t border-[#333333] px-4 sm:px-6 py-3 sm:py-4">
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
                    className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder:text-gray-400 text-base min-w-0"
                  />
                  <button
                    type="submit"
                    className="bg-[#4285F4] p-2 rounded-full disabled:opacity-40 ml-2 sm:ml-3 flex-shrink-0 hover:bg-[#3367d6] transition-colors cursor-pointer disabled:cursor-not-allowed"
                    disabled={!input.trim() || isLoading}
                  >
                    <SendIcon size={18} className="text-white sm:w-5 sm:h-5" />
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

      {/* PREMIUM FEATURES SECTION - HIDDEN BY DEFAULT */}
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50 hidden" id="premiumFeatures">
        {/* Close button - top right */}
        <div className="flex justify-end p-4">
          <button 
            onClick={() => document.getElementById('premiumFeatures')?.classList.add('hidden')} 
            className="text-white hover:text-gray-300 transition cursor-pointer p-2 hover:bg-gray-800 rounded-full"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Content - Centered container */}
        <div className="flex items-center justify-center h-full">
          <div className="max-w-3xl w-full px-4 sm:px-6 py-8 rounded-lg bg-[#1e1e1e] border border-[#333333]">
            {/* Title and Description */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Upgrade to Premium</h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Unlock the full potential of StudyPal with our premium features.
              </p>
            </div>

            {/* Cards - 3 column layout on large screens, 1 column on small screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Card 1 */}
              <div className="bg-[#2a1052]/80 p-4 rounded-lg sm:rounded-xl md:rounded-2xl border border-purple-500/30 backdrop-blur-sm flex flex-col">
                <div className="flex items-center mb-3">
                  <div className="bg-[#8C52FF] w-10 h-10 flex items-center justify-center rounded-lg md:rounded-xl mr-3">
                    <ZapIcon size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Free Plan</h3>
                </div>
                <ul className="space-y-2 text-gray-300 flex-1">
                  <li className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8C52FF] mr-2"></div>
                    10 Requests/Daily
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8C52FF] mr-2"></div>
                    30 Requests/Monthly
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8C52FF] mr-2"></div>
                    Free Forever
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8C52FF] mr-2"></div>
                    No Credit Card Required
                  </li>
                </ul>
              </div>

              {/* Card 2 - Elevated */}
              <div className="bg-[#2a1052]/80 p-4 rounded-lg sm:rounded-xl md:rounded-2xl border border-purple-500/30 backdrop-blur-sm flex flex-col">
                <div className="flex items-center mb-3">
                  <div className="bg-[#8C52FF] w-10 h-10 flex items-center justify-center rounded-lg md:rounded-xl mr-3">
                    <SparklesIcon size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Gold Plan</h3>
                </div>
                <ul className="space-y-2 text-gray-300 flex-1">
                  <li className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8C52FF] mr-2"></div>
                    50 Requests/Daily
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8C52FF] mr-2"></div>
                    1.5K Requests/Monthly
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8C52FF] mr-2"></div>
                    Email Support
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8C52FF] mr-2"></div>
                    Chat Support
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8C52FF] mr-2"></div>
                    24/7 Available
                  </li>
                </ul>
              </div>

              {/* Card 3 */}
              <div className="bg-[#2a1052]/80 p-4 rounded-lg sm:rounded-xl md:rounded-2xl border border-purple-500/30 backdrop-blur-sm flex flex-col">
                <div className="flex items-center mb-3">
                  <div className="bg-[#8C52FF] w-10 h-10 flex items-center justify-center rounded-lg md:rounded-xl mr-3">
                    <CrownIcon size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Diamond Plan</h3>
                </div>
                <ul className="space-y-2 text-gray-300 flex-1">
                  <li className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8C52FF] mr-2"></div>
                    150 Requests/Daily
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8C52FF] mr-2"></div>
                    4.5K Requests/Monthly
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8C52FF] mr-2"></div>
                    Email Support
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8C52FF] mr-2"></div>
                    Export History
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="max-w-md mx-auto">
              <button className="w-full p-3 sm:p-4 rounded-xl bg-[#8C52FF] text-white font-bold shadow-lg shadow-purple-500/30 hover:bg-[#7a4ae6] transition-colors text-sm sm:text-base cursor-pointer">
                Get Now
              </button>
              <p className="text-center text-xs sm:text-sm text-gray-400 mt-2">
                7-day free trial, then $9.99/month
              </p>
              
              {/* Try Chat Now Button */}
              <button 
                onClick={() => navigate('/chat')}
                className="w-full mt-3 p-3 sm:p-4 rounded-xl bg-transparent border-2 border-[#8C52FF] text-[#8C52FF] font-bold hover:bg-[#8C52FF] hover:text-white transition-colors text-sm sm:text-base cursor-pointer"
              >
                Try Chat Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}