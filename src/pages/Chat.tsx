import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SendIcon, User, Camera, Upload, Paperclip } from 'lucide-react';
import studyPalIcon from '../assets/studypal-icon.png';
import { SparklesIcon, ZapIcon, CrownIcon } from 'lucide-react';
import { XIcon } from 'lucide-react';
import { sendMessageToAI, validateOpenAIConfig, type ChatMessage } from '../lib/aiService';
import { useAuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';
import { getUserPlan } from '../lib/userPlanService';
import { checkDailyUsage, recordQuestionAsked, getDailyLimit } from '../lib/usageService';
import { getAnonymousUsage, canAskQuestion, recordAnonymousQuestion } from '../lib/anonymousUsageService';

export function ChatInterface() {
  /* ── state ──────────────────────────────────────────────────────── */
  const [input, setInput]   = useState('');
  const [messages, setMsgs] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'gold' | 'diamond'>('free');
  const [dailyUsage, setDailyUsage] = useState({ questionsAsked: 0, limit: 5, remaining: 5 });
  const [showWelcomeImageOptions, setShowWelcomeImageOptions] = useState(false);
  const [showChatImageOptions, setShowChatImageOptions] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const welcomeImageOptionsRef = useRef<HTMLDivElement | null>(null);
  const chatImageOptionsRef = useRef<HTMLDivElement | null>(null);
  const welcomeFileInputRef = useRef<HTMLInputElement | null>(null);
  const welcomeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const chatFileInputRef = useRef<HTMLInputElement | null>(null);
  const chatCameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const { isDarkMode } = useTheme();
  
  const theme = getThemeClasses(isDarkMode);

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

  // Close image options when clicking outside
  useEffect(() => {
    if (!showWelcomeImageOptions && !showChatImageOptions) return;
    function handleClick(e: MouseEvent) {
      const welcomeElement = welcomeImageOptionsRef.current;
      const chatElement = chatImageOptionsRef.current;
      
      if (showWelcomeImageOptions && welcomeElement && !welcomeElement.contains(e.target as Node)) {
        setShowWelcomeImageOptions(false);
      }
      if (showChatImageOptions && chatElement && !chatElement.contains(e.target as Node)) {
        setShowChatImageOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showWelcomeImageOptions, showChatImageOptions]);

  // Fetch user plan and daily usage
  useEffect(() => {
    if (user?.id) {
      // Get user's current plan
      getUserPlan(user.id, user.email).then(result => {
        if (result.success && result.user) {
          const planType = result.user.plan_type;
          setUserPlan(planType);
          
          // Check daily usage for this plan
          checkDailyUsage(user.id, planType).then(usageResult => {
            console.log('📊 Initial Usage Check:', {
              planType,
              usageResult,
              questionsAsked: usageResult.usage?.questions_asked || 0,
              limit: usageResult.limit || getDailyLimit(planType),
              remaining: usageResult.remaining || getDailyLimit(planType)
            });
            
            if (usageResult.success) {
              setDailyUsage({
                questionsAsked: usageResult.usage?.questions_asked || 0,
                limit: usageResult.limit || getDailyLimit(planType),
                remaining: usageResult.remaining || getDailyLimit(planType)
              });
            }
          });
        }
      });
    } else {
      // For anonymous users, get usage from localStorage
      setUserPlan('free');
      const anonymousUsage = getAnonymousUsage();
      setDailyUsage({
        questionsAsked: anonymousUsage.questionsAsked,
        limit: anonymousUsage.limit,
        remaining: anonymousUsage.remaining
      });
    }
  }, [user?.id, user?.email]);

  /* ── refs ───────────────────────────────────────────────────────── */
  const bottomRef  = useRef<HTMLDivElement | null>(null);

  /* ── helpers ────────────────────────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper function to extract text from message content
  function getMessageText(content: string | Array<{type: 'text' | 'image_url'; text?: string; image_url?: {url: string}}>): string {
    if (typeof content === 'string') {
      return content;
    }
    // For array content, find text parts and join them
    return content
      .filter(part => part.type === 'text' && part.text)
      .map(part => part.text)
      .join(' ');
  }

  // Helper function to get images from message content
  function getMessageImages(content: string | Array<{type: 'text' | 'image_url'; text?: string; image_url?: {url: string}}>): string[] {
    if (typeof content === 'string') {
      return [];
    }
    return content
      .filter(part => part.type === 'image_url' && part.image_url?.url)
      .map(part => part.image_url!.url);
  }

  // Typewriter effect for AI responses
  const typewriterEffect = async (fullText: string) => {
    // Add empty message first
    const emptyMessage: ChatMessage = { role: 'assistant', content: '' };
    setMsgs(prev => [...prev, emptyMessage]);
    
    let currentText = '';
    
    for (let i = 0; i < fullText.length; i++) {
      currentText += fullText[i];
      
      setMsgs(prev => {
        const newMessages = [...prev];
        const lastMessageIndex = newMessages.length - 1;
        if (newMessages[lastMessageIndex] && newMessages[lastMessageIndex].role === 'assistant') {
          newMessages[lastMessageIndex] = { ...newMessages[lastMessageIndex], content: currentText };
        }
        return newMessages;
      });
      
      // Variable delay: faster for spaces, slower for punctuation (very fast)
      const char = fullText[i];
      let delay = 3; // Base delay (very fast)
      
      if (char === ' ') delay = 1; // Very fast for spaces
      else if (['.', '!', '?'].includes(char)) delay = 15; // Pause for sentence endings
      else if ([',', ';', ':'].includes(char)) delay = 8; // Brief pause for punctuation
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };

  async function sendMessage() {
    const text = input.trim();
    if (!text && !uploadedImage) return;

    // Handle usage limits for both authenticated and anonymous users
    if (user?.id) {
      // For authenticated users, check and record usage in database
      const usageCheck = await checkDailyUsage(user.id, userPlan);
      if (!usageCheck.success) {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `⚠️ Unable to check usage limit: ${usageCheck.error}`
        };
        setMsgs(m => [...m, errorMessage]);
        return;
      }

      if (!usageCheck.canAsk) {
        const limitMessage: ChatMessage = { 
          role: 'assistant', 
          content: `⚠️ Daily limit reached! You've used all ${usageCheck.limit} questions for today. ${
            userPlan === 'free' ? 'Upgrade to Gold (50 questions) or Diamond (150 questions) for more daily questions!' : 
            userPlan === 'gold' ? 'Upgrade to Diamond (150 questions) for more daily questions!' :
            'Your limit will reset tomorrow.'
          }`
        };
        setMsgs(m => [...m, limitMessage]);
        return;
      }

      // Record the question IMMEDIATELY after confirming they can ask
      const recordResult = await recordQuestionAsked(user.id, userPlan);
      if (!recordResult.success) {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `⚠️ Unable to record usage: ${recordResult.error}`
        };
        setMsgs(m => [...m, errorMessage]);
        return;
      }

      // Debug the usage update
      console.log('🔢 Usage Update:', {
        before: dailyUsage,
        recordResult: recordResult.usage,
        newQuestionsAsked: recordResult.usage?.questions_asked || 0,
        newRemaining: Math.max(0, getDailyLimit(userPlan) - (recordResult.usage?.questions_asked || 0))
      });

      // Update local usage count immediately with the actual database values
      setDailyUsage({
        questionsAsked: recordResult.usage?.questions_asked || 0,
        limit: getDailyLimit(userPlan),
        remaining: Math.max(0, getDailyLimit(userPlan) - (recordResult.usage?.questions_asked || 0))
      });
    } else {
      // For anonymous users, check and record usage in localStorage
      if (!canAskQuestion()) {
        const limitMessage: ChatMessage = { 
          role: 'assistant', 
          content: `⚠️ Daily limit reached! You've used all 5 questions for today. Sign up for a free account to continue using StudyPal, or upgrade to Gold (50 questions) or Diamond (150 questions) for more daily questions!`
        };
        setMsgs(m => [...m, limitMessage]);
        return;
      }

      // Record the question for anonymous user
      try {
        const newUsage = recordAnonymousQuestion();
        setDailyUsage({
          questionsAsked: newUsage.questionsAsked,
          limit: newUsage.limit,
          remaining: newUsage.remaining
        });
        
        console.log('🔢 Anonymous Usage Update:', {
          before: dailyUsage,
          after: newUsage
        });
      } catch (error) {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `⚠️ ${error instanceof Error ? error.message : 'Unable to record usage'}`
        };
        setMsgs(m => [...m, errorMessage]);
        return;
      }
    }

    console.log('💬 Sending message:', {
      messageText: text,
      hasImage: !!uploadedImage,
      timestamp: new Date().toISOString(),
      userPlan: userPlan,
      currentUsage: dailyUsage,
      userId: user?.id || 'anonymous',
      isAuthenticated: !!user
    });

    // Check OpenAI configuration
    const configCheck = validateOpenAIConfig();
    console.log('⚙️ Config check result:', configCheck);
    
    if (!configCheck.valid) {
      console.warn('⚠️ OpenAI configuration invalid:', configCheck.error);
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: `⚠️ ${configCheck.error || 'OpenAI configuration error'}`
      };
      setMsgs(m => [...m, errorMessage]);
      return;
    }

    // Create user message with image support
    let userMessage: ChatMessage;
    
    if (uploadedImage && text) {
      // Both text and image
      userMessage = {
        role: 'user',
        content: [
          { type: 'text', text: text },
          { type: 'image_url', image_url: { url: uploadedImage } }
        ]
      };
    } else if (uploadedImage) {
      // Only image
      userMessage = {
        role: 'user',
        content: [
          { type: 'text', text: 'Please analyze this homework image and help me solve it.' },
          { type: 'image_url', image_url: { url: uploadedImage } }
        ]
      };
    } else {
      // Only text
      userMessage = {
        role: 'user',
        content: text
      };
    }

    setMsgs(m => [...m, userMessage]);
    setInput('');
    setUploadedImage(null); // Clear the uploaded image after sending
    setIsLoading(true);

    // Record start time for minimum delay
    const startTime = Date.now();

    try {
      console.log('🚀 Calling OpenAI API...');
      
      // Prepare messages for AI - add general system message if no system message exists
      const messagesToSend = [...messages, userMessage];
      const hasSystemMessage = messagesToSend.some(msg => msg.role === 'system');
      
      if (!hasSystemMessage) {
        // Add general system message for structured responses
        const generalSystemMessage: ChatMessage = {
          role: 'system',
          content: `You are StudyPal, a helpful AI tutor. When answering questions or solving problems, structure your responses with clear sections:

**🤔 Understanding the Problem:**
- Identify what the question is asking
- Note any given information or constraints

**📝 Step-by-Step Solution:**
- Break down the solution into numbered steps
- Show all work and calculations
- Explain the reasoning behind each step

**✅ Final Answer:**
- Clearly state the final answer
- Include units if applicable
- Verify the answer makes sense

**💡 Key Concepts:**
- Explain the main concepts used
- Provide tips for similar problems

When analyzing homework images, first describe what you see in the image, then follow the same structured format. Provide clear, educational explanations that help students learn.`
        };
        messagesToSend.unshift(generalSystemMessage);
      }
      
      // Send message to AI
      const aiResponse = await sendMessageToAI(messagesToSend);
      
      console.log('✅ Received OpenAI response:', {
        responseLength: aiResponse?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      // Calculate elapsed time and wait if necessary to ensure minimum 2 seconds
      const elapsedTime = Date.now() - startTime;
      const minDelay = 2000; // 2 seconds
      
      if (elapsedTime < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime));
      }
      
      // Check if response is longer than 50 words to decide on typewriter effect
      const wordCount = aiResponse.trim().split(/\s+/).length;
      
      if (wordCount > 50) {
        // For long responses (>50 words), display instantly without typewriter effect
        const instantMessage: ChatMessage = { role: 'assistant', content: aiResponse };
        setMsgs(m => [...m, instantMessage]);
      } else {
        // For shorter responses (≤50 words), use typewriter effect
        await typewriterEffect(aiResponse);
      }
    } catch (error) {
      console.error('❌ Chat Error:', {
        error,
        timestamp: new Date().toISOString(),
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        location: window.location.href
      });
      
      // Calculate elapsed time and wait if necessary to ensure minimum 2 seconds
      const elapsedTime = Date.now() - startTime;
      const minDelay = 2000; // 2 seconds
      
      if (elapsedTime < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime));
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong with the AI service. Please try again.';
      
      const errorResponse: ChatMessage = { 
        role: 'assistant', 
        content: `⚠️ ${errorMessage}`
      };
      setMsgs(m => [...m, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleLogin() {
    setMenuOpen(false);
    navigate('/login');
  }

  function handleLogout() {
    setMenuOpen(false);
    signOut();
  }

  function handlePremium() {
    setMenuOpen(false);
    navigate('/premium');
  }

  // Handle image upload
  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        // Don't add text to input anymore - the image will be sent directly
      };
      reader.readAsDataURL(file);
    }
    setShowWelcomeImageOptions(false);
    setShowChatImageOptions(false);
  }

  // Handle camera capture for welcome screen
  async function handleWelcomeCameraCapture() {
    setShowWelcomeImageOptions(false);
    setShowCameraModal(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      
      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      setShowCameraModal(false);
      // Fallback to file input
      if (welcomeCameraInputRef.current) {
        welcomeCameraInputRef.current.click();
      }
    }
  }

  // Handle file upload for welcome screen
  function handleWelcomeFileUpload() {
    if (welcomeFileInputRef.current) {
      welcomeFileInputRef.current.click();
    }
  }

  // Handle camera capture for chat screen
  async function handleChatCameraCapture() {
    setShowChatImageOptions(false);
    setShowCameraModal(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      
      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      setShowCameraModal(false);
      // Fallback to file input
      if (chatCameraInputRef.current) {
        chatCameraInputRef.current.click();
      }
    }
  }

  // Handle file upload for chat screen
  function handleChatFileUpload() {
    if (chatFileInputRef.current) {
      chatFileInputRef.current.click();
    }
  }

  // Capture photo from camera
  function capturePhoto() {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setUploadedImage(result);
            closeCameraModal();
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/jpeg', 0.8);
    }
  }

  // Close camera modal
  function closeCameraModal() {
    setShowCameraModal(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }

  // Remove uploaded image
  function removeUploadedImage() {
    setUploadedImage(null);
    // No need to remove text from input anymore
  }

  // Handle subject button clicks
  function handleSubjectClick(subject: string) {
    // Create system message for the AI (won't be shown to user)
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are a helpful and knowledgeable AI tutor specialized in ${subject}. When answering questions or solving problems, structure your responses with clear sections:

**🤔 Understanding the Problem:**
- Identify what the question is asking
- Note any given information or constraints

**📝 Step-by-Step Solution:**
- Break down the solution into numbered steps
- Show all work and calculations
- Explain the reasoning behind each step

**✅ Final Answer:**
- Clearly state the final answer
- Include units if applicable
- Verify the answer makes sense

**💡 Key Concepts:**
- Explain the main concepts used
- Provide tips for similar problems

When analyzing homework images, first describe what you see in the image, then follow the same structured format. Stay on topic within ${subject}, unless the user asks to switch topics.`
    };

    // Create subject-specific welcome messages
    const welcomeMessages: { [key: string]: string } = {
      'Math': "Hello! I'm your Math tutor. Whether you need help with algebra, geometry, calculus, or any other math topic, I'm here to guide you through step-by-step solutions. What math problem can I help you solve today?",
      'Science': "Hi there! I'm your Science tutor. I can help you explore the wonders of biology, chemistry, physics, and more. From basic concepts to complex theories, let's discover science together. What scientific topic interests you?",
      'Literature': "Welcome! I'm your Literature tutor. I love discussing books, poems, writing techniques, and literary analysis. Whether it's Shakespeare, modern novels, or creative writing, I'm here to help. What literary work or concept would you like to explore?",
      'Art': "Hello! I'm your Art tutor. I can help you understand art history, techniques, famous artists, and art movements. From Renaissance masters to modern art, let's explore creativity together. What aspect of art would you like to learn about?",
      'Music': "Hi! I'm your Music tutor. Whether you're interested in music theory, composition, music history, or learning about instruments, I'm here to help. Let's make music education fun and engaging. What musical topic interests you?",
      'History': "Greetings! I'm your History tutor. From ancient civilizations to modern events, I can help you understand historical contexts, analyze sources, and connect past events to today. What historical period or event would you like to explore?",
      'Physics': "Hello! I'm your Physics tutor. I can help you understand everything from basic mechanics to quantum physics. Let's break down complex concepts into simple, understandable parts. What physics topic would you like to tackle?",
      'Chemistry': "Hi there! I'm your Chemistry tutor. Whether it's balancing equations, understanding molecular structures, or exploring chemical reactions, I'm here to make chemistry clear and interesting. What chemistry concept can I help you with?",
      'Biology': "Welcome! I'm your Biology tutor. From cells and genetics to ecosystems and evolution, I can help you understand the fascinating world of life sciences. What biological topic would you like to explore today?",
      'Geography': "Hello! I'm your Geography tutor. I can help you understand physical geography, human geography, maps, climate, and cultures around the world. What geographic topic interests you?",
      'Economics': "Hi! I'm your Economics tutor. Whether it's microeconomics, macroeconomics, market structures, or economic theories, I'm here to help you understand how economies work. What economic concept would you like to explore?"
    };

    // Create initial AI welcome message that will be shown to user
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: welcomeMessages[subject] || `Hello! I'm your ${subject} tutor. I'm here to help you understand concepts, solve problems, and answer any questions you have about ${subject}. What would you like to learn about today?`
    };

    // Add both messages to the conversation
    setMsgs([systemMessage]);
    
    // Use typewriter effect for the welcome message
    setTimeout(async () => {
      await typewriterEffect(getMessageText(welcomeMessage.content));
    }, 100);
  }

  // Auto-resize textarea based on content
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px'; // max-h-32 = 128px
  }

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <div className={`mobile-full-height w-full ${theme.bgPrimary} ${theme.textPrimary} flex flex-col`}>
      {/* HEADER SECTION */}
      <header className={`flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b ${theme.borderPrimary} ${theme.bgPrimary} z-10 relative`}>

        
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
            className={`ml-2 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full ${theme.bgSecondary} ${theme.bgHover} transition cursor-pointer`}
            title="New Chat"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-4 sm:h-4">
              <path d="M8 3.333v9.334M3.333 8h9.334" stroke={isDarkMode ? "#fff" : "#333"} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {/* Right side - Usage Counter, Upgrade Button, Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3 relative">
          {/* Usage Counter - show for both logged in and anonymous users */}
          {(user || dailyUsage.questionsAsked > 0 || dailyUsage.remaining < 5) && (
            <div className={`px-2 py-1 rounded-full text-xs ${
              dailyUsage.remaining === 0 
                ? 'bg-red-100 text-red-800 border-red-200' 
                : theme.bgSecondary + ' ' + theme.textSecondary + ' border ' + theme.borderPrimary
            }`}>
              {dailyUsage.remaining === 0 
                ? `${dailyUsage.questionsAsked}/${dailyUsage.limit} used` 
                : `${dailyUsage.remaining}/${dailyUsage.limit} left`
              }
            </div>
          )}
          <button 
            className="border border-[#4285F4] text-[#4285F4] bg-transparent px-3 py-1 rounded-full text-sm transition-all duration-200 cursor-pointer hover:bg-[#4285F4] hover:text-white"
            onClick={handlePremium}
          >
            Upgrade
          </button>
          <div className="relative" ref={menuRef}>
            <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition ${theme.bgSecondary} flex items-center justify-center`}
                 onClick={() => setMenuOpen(v => !v)}>
              {user ? (
                <span className={`${theme.textPrimary} text-xs font-medium`}>
                  {getUserInitials()}
                </span>
              ) : (
                <User size={16} className={theme.textSecondary} />
              )}
            </div>
            {menuOpen && (
              <div className={`absolute right-0 mt-2 w-36 sm:w-40 ${theme.bgSecondary} border ${theme.borderPrimary} rounded-lg shadow-lg z-50`}>
                {!user && (
                  <>
                    <button 
                      className={`block w-full text-left px-4 py-2.5 text-sm ${theme.bgHoverSecondary} ${theme.textPrimary} transition-all duration-200 cursor-pointer rounded-t-lg`} 
                      onClick={handleLogin}
                    >
                      Login
                    </button>
                    <button 
                      className={`block w-full text-left px-4 py-2.5 text-sm ${theme.bgHoverSecondary} ${theme.textPrimary} transition-all duration-200 cursor-pointer`} 
                      onClick={() => { setMenuOpen(false); navigate('/signup'); }}
                    >
                      Sign Up
                    </button>
                  </>
                )}
                {user && (
                  <button 
                    className={`block w-full text-left px-4 py-2.5 text-sm ${theme.bgHoverSecondary} ${theme.textPrimary} transition-all duration-200 cursor-pointer rounded-t-lg`} 
                    onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                  >
                    Profile
                  </button>
                )}
                <button 
                  className={`block w-full text-left px-4 py-2.5 text-sm ${theme.bgHoverSecondary} ${theme.textPrimary} transition-all duration-200 cursor-pointer ${!user ? 'rounded-t-lg' : ''}`}
                  onClick={handlePremium}
                >
                  Plans
                </button>
                <button 
                  className={`block w-full text-left px-4 py-2.5 text-sm ${theme.bgHoverSecondary} ${theme.textPrimary} transition-all duration-200 cursor-pointer ${!user ? 'rounded-b-lg' : ''}`}
                  onClick={() => { setMenuOpen(false); navigate('/'); }}
                >
                  Chat
                </button>
                {user && (
                  <button 
                    className={`block w-full text-left px-4 py-2.5 text-sm text-red-400 ${theme.bgHoverSecondary} hover:text-red-300 transition-all duration-200 cursor-pointer rounded-b-lg`} 
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                )}
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
            
            {/* Subject Option Buttons */}
            <div className="w-full max-w-2xl px-2 mb-6 sm:mb-6">
              <div className="space-y-2 sm:space-y-2">

                {/* Top row - 6 buttons on mobile, 5 on desktop */}
                <div className="flex flex-wrap sm:flex-nowrap justify-center gap-1.5 sm:gap-2">
                  <button onClick={() => handleSubjectClick('Math')} className="bg-blue-300 hover:bg-blue-400 text-blue-900 font-medium py-1.5 px-2.5 sm:px-3 rounded-full transition-all duration-500 cursor-pointer text-xs opacity-0 animate-[fadeInUp_0.6s_ease-out_0.1s_forwards] hover:scale-105 hover:shadow-lg transform">
                    Math
                  </button>
                  <button onClick={() => handleSubjectClick('Science')} className="bg-emerald-300 hover:bg-emerald-400 text-emerald-900 font-medium py-1.5 px-2.5 sm:px-3 rounded-full transition-all duration-500 cursor-pointer text-xs opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards] hover:scale-105 hover:shadow-lg transform">
                    Science
                  </button>
                  <button onClick={() => handleSubjectClick('Literature')} className="bg-rose-300 hover:bg-rose-400 text-rose-900 font-medium py-1.5 px-2.5 sm:px-3 rounded-full transition-all duration-500 cursor-pointer text-xs opacity-0 animate-[fadeInUp_0.6s_ease-out_0.3s_forwards] hover:scale-105 hover:shadow-lg transform">
                    Literature
                  </button>
                  <button onClick={() => handleSubjectClick('Art')} className="bg-amber-300 hover:bg-amber-400 text-amber-900 font-medium py-1.5 px-2.5 sm:px-3 rounded-full transition-all duration-500 cursor-pointer text-xs opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards] hover:scale-105 hover:shadow-lg transform">
                    Art
                  </button>
                  <button onClick={() => handleSubjectClick('Music')} className="bg-violet-300 hover:bg-violet-400 text-violet-900 font-medium py-1.5 px-2.5 sm:px-3 rounded-full transition-all duration-500 cursor-pointer text-xs opacity-0 animate-[fadeInUp_0.6s_ease-out_0.5s_forwards] hover:scale-105 hover:shadow-lg transform">
                    Music
                  </button>
                </div>
                {/* Bottom row - 5 buttons on mobile, 6 on desktop */}
                <div className="flex flex-wrap sm:flex-nowrap justify-center gap-1.5 sm:gap-2">
                  <button onClick={() => handleSubjectClick('History')} className="bg-orange-300 hover:bg-orange-400 text-orange-900 font-medium py-1.5 px-2.5 sm:px-3 rounded-full transition-all duration-500 cursor-pointer text-xs opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards] hover:scale-105 hover:shadow-lg transform">
                    History
                  </button>
                  <button onClick={() => handleSubjectClick('Physics')} className="bg-cyan-300 hover:bg-cyan-400 text-cyan-900 font-medium py-1.5 px-2.5 sm:px-3 rounded-full transition-all duration-500 cursor-pointer text-xs opacity-0 animate-[fadeInUp_0.6s_ease-out_0.7s_forwards] hover:scale-105 hover:shadow-lg transform">
                    Physics
                  </button>
                  <button onClick={() => handleSubjectClick('Chemistry')} className="bg-lime-300 hover:bg-lime-400 text-lime-900 font-medium py-1.5 px-2.5 sm:px-3 rounded-full transition-all duration-500 cursor-pointer text-xs opacity-0 animate-[fadeInUp_0.6s_ease-out_0.8s_forwards] hover:scale-105 hover:shadow-lg transform">
                    Chemistry
                  </button>
                  <button onClick={() => handleSubjectClick('Biology')} className="bg-pink-300 hover:bg-pink-400 text-pink-900 font-medium py-1.5 px-2.5 sm:px-3 rounded-full transition-all duration-500 cursor-pointer text-xs opacity-0 animate-[fadeInUp_0.6s_ease-out_0.9s_forwards] hover:scale-105 hover:shadow-lg transform">
                    Biology
                  </button>
                  <button onClick={() => handleSubjectClick('Geography')} className="bg-teal-300 hover:bg-teal-400 text-teal-900 font-medium py-1.5 px-2.5 sm:px-3 rounded-full transition-all duration-500 cursor-pointer text-xs opacity-0 animate-[fadeInUp_0.6s_ease-out_1.0s_forwards] hover:scale-105 hover:shadow-lg transform">
                    Geography
                  </button>
                  {/* Economics - hide on mobile, show on desktop */}
                  <button onClick={() => handleSubjectClick('Economics')} className="bg-purple-300 hover:bg-purple-400 text-purple-900 font-medium py-1.5 px-2.5 sm:px-3 rounded-full transition-all duration-500 cursor-pointer text-xs opacity-0 animate-[fadeInUp_0.6s_ease-out_1.1s_forwards] hover:scale-105 hover:shadow-lg transform hidden sm:inline-flex">
                    Economics
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full max-w-2xl px-2">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="w-full"
              >
                <div className={`flex items-center ${theme.bgSecondary} rounded-2xl px-4 py-2.5 sm:px-5 sm:py-2.5 shadow-lg`}>
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a question or upload homework"
                    className={`flex-1 bg-transparent border-none focus:outline-none ${theme.textPrimary} ${theme.inputPlaceholder} text-base min-w-0 resize-none min-h-[1.5rem] max-h-32 overflow-y-auto leading-6 py-0`}
                    rows={1}
                  />
                  
                  {/* Image upload section */}
                  <div className="relative ml-2" ref={welcomeImageOptionsRef}>
                    <button
                      type="button"
                      onClick={() => setShowWelcomeImageOptions(!showWelcomeImageOptions)}
                      className={`p-2 rounded-full ${theme.bgHover} transition-colors cursor-pointer`}
                      title="Upload homework image"
                    >
                      <Paperclip size={18} className={theme.textSecondary} />
                    </button>
                    
                    {showWelcomeImageOptions && (
                      <div className={`absolute bottom-full right-0 mb-2 ${theme.bgSecondary} border ${theme.borderPrimary} rounded-lg shadow-lg z-50 min-w-[150px]`}>
                        <button
                          type="button"
                          onClick={handleWelcomeCameraCapture}
                          className={`flex items-center gap-2 w-full px-3 py-2 text-sm ${theme.textPrimary} ${theme.bgHoverSecondary} rounded-t-lg transition-colors cursor-pointer`}
                        >
                          <Camera size={16} />
                          Take Photo
                        </button>
                        <button
                          type="button"
                          onClick={handleWelcomeFileUpload}
                          className={`flex items-center gap-2 w-full px-3 py-2 text-sm ${theme.textPrimary} ${theme.bgHoverSecondary} rounded-b-lg transition-colors cursor-pointer`}
                        >
                          <Upload size={16} />
                          Upload File
                        </button>
                      </div>
                    )}
                    
                    {/* Hidden file inputs */}
                    <input
                      ref={welcomeCameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <input
                      ref={welcomeFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#4285F4] p-2 rounded-full disabled:opacity-40 ml-2 sm:ml-3 flex-shrink-0 hover:bg-[#3367d6] transition-colors cursor-pointer disabled:cursor-not-allowed" 
                    disabled={(!input.trim() && !uploadedImage) || isLoading || dailyUsage.remaining <= 0}
                    title={dailyUsage.remaining <= 0 ? `Daily limit reached (${dailyUsage.limit} questions)${!user ? ' - Sign up for more!' : ''}` : undefined}
                  >
                    <SendIcon size={18} className="text-white sm:w-5 sm:h-5" />
                  </button>
                </div>
                
                {/* Show uploaded image preview */}
                {uploadedImage && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="relative">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded homework" 
                        className="w-16 h-16 object-cover rounded-lg border-2 border-blue-300"
                      />
                      <button
                        type="button"
                        onClick={removeUploadedImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                    <span className={`text-sm ${theme.textSecondary}`}>Image ready to send</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        ) : (
          /* CHAT MESSAGES WITH BOTTOM INPUT */
          <>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 space-y-3 sm:space-y-4 min-h-0">
              {messages.filter(m => m.role !== 'system').map((m, i) => {
                const messageText = getMessageText(m.content);
                const messageImages = getMessageImages(m.content);
                
                return (
                  <div
                    key={i}
                    className={`max-w-[90%] sm:max-w-2xl break-words whitespace-pre-wrap leading-relaxed text-base ${
                      m.role === 'user'
                        ? `ml-auto ${theme.bgTertiary} rounded-2xl px-4 py-2.5`
                        : 'mr-auto bg-[#3b87f6] rounded-2xl px-4 py-2.5'
                    }`}
                  >
                    {/* Render images if present */}
                    {messageImages.length > 0 && (
                      <div className="mb-2">
                        {messageImages.map((imageUrl, imgIndex) => (
                          <img 
                            key={imgIndex}
                            src={imageUrl} 
                            alt="Homework" 
                            className="max-w-full h-auto rounded-lg border-2 border-blue-300 mb-2"
                          />
                        ))}
                      </div>
                    )}
                    {/* Render text content */}
                    {messageText}
                  </div>
                );
              })}
              {/* Show "Thinking..." when loading */}
              {isLoading && (
                <div className="mr-auto max-w-[90%] sm:max-w-2xl px-4 py-2.5">
                  <div className={`flex items-center gap-2 ${theme.textSecondary} italic text-sm`}>
                    <span>Thinking</span>
                    <div className="flex gap-1">
                      <div className={`w-1 h-1 ${isDarkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{animationDelay: '0ms'}}></div>
                      <div className={`w-1 h-1 ${isDarkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{animationDelay: '150ms'}}></div>
                      <div className={`w-1 h-1 ${isDarkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            
            {/* BOTTOM INPUT BAR */}
            <div className={`flex-shrink-0 ${theme.bgPrimary} border-t ${theme.borderPrimary} px-4 sm:px-6 py-3 sm:py-4`}>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="w-full max-w-4xl mx-auto"
              >
                <div className={`flex items-center ${theme.bgSecondary} rounded-2xl px-4 py-2.5 sm:px-5 sm:py-2.5 shadow-lg`}>
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a question or upload homework"
                    className={`flex-1 bg-transparent border-none focus:outline-none ${theme.textPrimary} ${theme.inputPlaceholder} text-base min-w-0 resize-none min-h-[1.5rem] max-h-32 overflow-y-auto leading-6 py-0`}
                    rows={1}
                  />
                  
                  {/* Image upload section */}
                  <div className="relative ml-2" ref={chatImageOptionsRef}>
                    <button
                      type="button"
                      onClick={() => setShowChatImageOptions(!showChatImageOptions)}
                      className={`p-2 rounded-full ${theme.bgHover} transition-colors cursor-pointer`}
                      title="Upload homework image"
                    >
                      <Paperclip size={18} className={theme.textSecondary} />
                    </button>
                    
                    {showChatImageOptions && (
                      <div className={`absolute bottom-full right-0 mb-2 ${theme.bgSecondary} border ${theme.borderPrimary} rounded-lg shadow-lg z-50 min-w-[150px]`}>
                        <button
                          type="button"
                          onClick={handleChatCameraCapture}
                          className={`flex items-center gap-2 w-full px-3 py-2 text-sm ${theme.textPrimary} ${theme.bgHoverSecondary} rounded-t-lg transition-colors cursor-pointer`}
                        >
                          <Camera size={16} />
                          Take Photo
                        </button>
                        <button
                          type="button"
                          onClick={handleChatFileUpload}
                          className={`flex items-center gap-2 w-full px-3 py-2 text-sm ${theme.textPrimary} ${theme.bgHoverSecondary} rounded-b-lg transition-colors cursor-pointer`}
                        >
                          <Upload size={16} />
                          Upload File
                        </button>
                      </div>
                    )}
                    
                    {/* Hidden file inputs for chat */}
                    <input
                      ref={chatCameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <input
                      ref={chatFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#4285F4] p-2 rounded-full disabled:opacity-40 ml-2 sm:ml-3 flex-shrink-0 hover:bg-[#3367d6] transition-colors cursor-pointer disabled:cursor-not-allowed"
                    disabled={(!input.trim() && !uploadedImage) || isLoading || dailyUsage.remaining <= 0}
                    title={dailyUsage.remaining <= 0 ? `Daily limit reached (${dailyUsage.limit} questions)${!user ? ' - Sign up for more!' : ''}` : undefined}
                  >
                    <SendIcon size={18} className="text-white sm:w-5 sm:h-5" />
                  </button>
                </div>
                
                {/* Show uploaded image preview */}
                {uploadedImage && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="relative">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded homework" 
                        className="w-16 h-16 object-cover rounded-lg border-2 border-blue-300"
                      />
                      <button
                        type="button"
                        onClick={removeUploadedImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                    <span className={`text-sm ${theme.textSecondary}`}>Image ready to send</span>
                  </div>
                )}
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
                    5 Requests/Daily
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8C52FF] mr-2"></div>
                    150 Requests/Monthly
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

      {/* CAMERA MODAL */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Take Photo</h3>
              <button
                onClick={closeCameraModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XIcon size={24} />
              </button>
            </div>
            
            <div className="relative mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover rounded-lg bg-gray-200 dark:bg-gray-700"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={capturePhoto}
                className="flex-1 bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-[#3367d6] transition-colors"
              >
                📸 Capture Photo
              </button>
              <button
                onClick={closeCameraModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-black dark:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
          
          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}