import { useState, useRef, useEffect } from 'react';
import { SendIcon } from 'lucide-react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import './chat-transition.css';
import studyPalIcon from '../assets/studypal-icon.png';

export function ChatInterface() {
  /* ── state ──────────────────────────────────────────────────────── */
  const [input, setInput]   = useState('');
  const [messages, setMsgs] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
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
  const emptyRef   = useRef<HTMLDivElement | null>(null);
  const chatRef    = useRef<HTMLDivElement | null>(null);

  /* ── helpers ────────────────────────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;

    setMsgs(m => [...m, { role: 'user', content: text }]);
    setInput('');

    // ――― replace with YOUR backend ―――
    try {
      const res   = await fetch('/api/chat', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ messages: [...messages, { role: 'user', content: text }] })
      });
      const { reply } = await res.json();
      setMsgs(m => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMsgs(m => [...m, { role: 'assistant', content: '⚠️  Something went wrong.' }]);
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
    <div 
      className="flex flex-col h-full bg-[#121212] text-white overflow-hidden relative" 
      style={{ 
        height: '100vh',
        maxHeight: '100vh'
      }}
    >
      {/* header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-2 sm:py-3 border-b border-[#333333] bg-[#121212] bg-opacity-95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-semibold">StudyPal</h1>
          <img 
            src={studyPalIcon} 
            alt="StudyPal Icon" 
            className="h-6 w-6 sm:h-7 sm:w-7 object-contain" 
          />
          <button
            onClick={() => setMsgs([])}
            className="ml-1 sm:ml-2 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#222] hover:bg-[#333] transition"
            title="New Chat"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-4 sm:h-4">
              <path d="M8 3.333v9.334M3.333 8h9.334" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 relative">
          <button className="border border-[#4285F4] text-[#4285F4] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm hover:bg-[#4285F4]/10 transition">
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
                <button className="block w-full text-left px-3 sm:px-4 py-2 text-sm hover:bg-[#333]" onClick={() => setMenuOpen(false)}>Login</button>
                <button className="block w-full text-left px-3 sm:px-4 py-2 text-sm hover:bg-[#333]" onClick={() => setMenuOpen(false)}>Get premium</button>
                <button className="block w-full text-left px-3 sm:px-4 py-2 text-sm hover:bg-[#333] text-red-400" onClick={() => setMenuOpen(false)}>Log out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* animated area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SwitchTransition mode="out-in">
          {messages.length === 0 ? (
            <CSSTransition
              key="prompt"
              nodeRef={emptyRef}
              timeout={400}
              classNames="chat-fade"
              unmountOnExit
            >
              <div ref={emptyRef} className="h-full flex flex-col px-4 sm:px-6">
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <h2 className="text-xl sm:text-3xl font-medium px-2 mb-6 sm:mb-8">How can I help you?</h2>
                </div>
                <div className="pb-2 sm:pb-4">
                  <InputBar
                    input={input}
                    setInput={setInput}
                    handleKeyDown={handleKeyDown}
                    sendMessage={sendMessage}
                  />
                </div>
              </div>
            </CSSTransition>
          ) : (
            <CSSTransition
              key="chat"
              nodeRef={chatRef}
              timeout={400}
              classNames="chat-fade"
              unmountOnExit
            >
              <div ref={chatRef} className="h-full flex flex-col">
                <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 sm:py-3 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent min-h-0 pb-2">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`max-w-xs sm:max-w-lg whitespace-pre-wrap leading-relaxed text-sm sm:text-base ${
                        m.role === 'user'
                          ? 'ml-auto bg-[#1e1e1e] rounded-2xl px-3 sm:px-4 py-2'
                          : 'mr-auto bg-[#222222] rounded-2xl px-3 sm:px-4 py-2'
                      }`}
                    >
                      {m.content}
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </main>
                <div className="flex-shrink-0 bg-[#121212] pb-2 sm:pb-4">
                  <InputBar
                    input={input}
                    setInput={setInput}
                    handleKeyDown={handleKeyDown}
                    sendMessage={sendMessage}
                    wide
                  />
                </div>
              </div>
            </CSSTransition>
          )}
        </SwitchTransition>
      </div>
    </div>
  );
}

/* ── tiny sub-component for the input bar so we don’t duplicate markup ── */
function InputBar({
  input,
  setInput,
  handleKeyDown,
  sendMessage,
  wide = false
}: {
  input: string;
  setInput: (s: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  sendMessage: () => void;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'w-full max-w-3xl mx-auto px-4 sm:px-6' : 'w-full max-w-xl px-0 sm:px-6'}>
      <form
        onSubmit={e => {
          e.preventDefault();
          sendMessage();
        }}
        className="w-full"
      >
        <div className="flex items-center bg-[#222222] rounded-full p-1.5 sm:p-2 pl-3 sm:pl-4 mx-4 sm:mx-0">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Type a question"
            className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder:text-gray-400 text-sm sm:text-base min-w-0 py-1"
          />
          <button
            type="submit"
            className="bg-[#4285F4] p-1.5 sm:p-2 rounded-full disabled:opacity-40 ml-2 flex-shrink-0"
            disabled={!input.trim()}
          >
            <SendIcon size={16} className="text-white sm:w-5 sm:h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
