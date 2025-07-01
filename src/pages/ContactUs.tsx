import { XIcon, User, Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

export function ContactUs() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const { isDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const menuRef = useRef<HTMLDivElement | null>(null);
  
  const themeClasses = getThemeClasses(isDarkMode);

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

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.firstName && user.user_metadata?.lastName 
          ? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
          : user.email?.split('@')[0] || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleLogout = () => {
    setMenuOpen(false);
    signOut();
  };

  const goto = (path: string) => { setMenuOpen(false); navigate(path); };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate form submission (replace with actual implementation)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen ${themeClasses.bgPrimary} ${themeClasses.textPrimary}`}>
      {/* ── header ──────────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b ${themeClasses.borderPrimary} relative z-50`}>
        <button onClick={() => navigate(-1)} className={`p-2 ${themeClasses.bgHover} rounded-full`}>
          <XIcon size={24} />
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">
          CONTACT US
        </span>

        <div ref={menuRef} className="relative">
          <div
            className={`h-8 w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition ${themeClasses.bgSecondary} flex items-center justify-center`}
            onClick={() => setMenuOpen(v => !v)}
          >
            {user ? (
              <span className={`${themeClasses.textPrimary} text-xs font-medium`}>
                {getUserInitials()}
              </span>
            ) : (
              <User size={16} className={themeClasses.textSecondary} />
            )}
          </div>

          {menuOpen && (
            <div className={`absolute right-0 mt-2 w-40 ${themeClasses.bgSecondary} border ${themeClasses.borderPrimary} rounded-lg shadow-lg`}>
              {!user && (
                <>
                  <button onClick={() => goto('/login')} className={`block w-full px-4 py-2 text-left ${themeClasses.bgHoverSecondary} rounded-t-lg`}>Login</button>
                  <button onClick={() => goto('/signup')} className={`block w-full px-4 py-2 text-left ${themeClasses.bgHoverSecondary}`}>Sign&nbsp;Up</button>
                </>
              )}
              <button onClick={() => goto('/profile')} className={`block w-full px-4 py-2 text-left ${themeClasses.bgHoverSecondary} ${!user ? '' : 'rounded-t-lg'}`}>Profile</button>
              <button onClick={() => goto('/premium')} className={`block w-full px-4 py-2 text-left ${themeClasses.bgHoverSecondary}`}>Get&nbsp;Premium</button>
              <button onClick={() => goto('/')} className={`block w-full px-4 py-2 text-left ${themeClasses.bgHoverSecondary} ${!user ? 'rounded-b-lg' : ''}`}>Chat</button>
              {user && (
                <button onClick={handleLogout} className={`block w-full px-4 py-2 text-left text-red-400 ${themeClasses.bgHoverSecondary} hover:text-red-300 rounded-b-lg`}>Logout</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── body ────────────────────────────────────────────── */}
      <div className="flex-grow py-8 px-4 sm:px-6">
        <main className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] bg-clip-text text-transparent">
              Get In Touch
            </h1>
            <p className={`text-xl ${themeClasses.textSecondary} max-w-2xl mx-auto`}>
              We're here to help! Reach out to us with any questions, feedback, or support needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className={`${themeClasses.bgSecondary} p-8 rounded-lg border ${themeClasses.borderPrimary}`}>
              <h2 className={`text-2xl font-bold mb-6 ${themeClasses.textPrimary}`}>Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className={`mb-6 p-4 ${isDarkMode ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-200'} border rounded-lg ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className={`mb-6 p-4 ${isDarkMode ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200'} border rounded-lg ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>
                  Something went wrong. Please try again later.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium mb-2 ${themeClasses.textPrimary}`}>Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full rounded-lg ${themeClasses.inputBg} border ${themeClasses.inputBorder} px-4 py-2.5 ${themeClasses.inputPlaceholder} focus:outline-none ${themeClasses.inputFocus} transition`}
                    placeholder="Your full name"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-2 ${themeClasses.textPrimary}`}>Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full rounded-lg ${themeClasses.inputBg} border ${themeClasses.inputBorder} px-4 py-2.5 ${themeClasses.inputPlaceholder} focus:outline-none ${themeClasses.inputFocus} transition`}
                    placeholder="your.email@example.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="subject" className={`block text-sm font-medium mb-2 ${themeClasses.textPrimary}`}>Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className={`w-full rounded-lg ${themeClasses.inputBg} border ${themeClasses.inputBorder} px-4 py-2.5 ${themeClasses.inputPlaceholder} focus:outline-none ${themeClasses.inputFocus} transition`}
                    placeholder="How can we help you?"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="message" className={`block text-sm font-medium mb-2 ${themeClasses.textPrimary}`}>Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className={`w-full rounded-lg ${themeClasses.inputBg} border ${themeClasses.inputBorder} px-4 py-2.5 ${themeClasses.inputPlaceholder} focus:outline-none ${themeClasses.inputFocus} transition resize-y`}
                    placeholder="Tell us more about your question or feedback..."
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className={`${themeClasses.bgSecondary} p-6 rounded-lg border ${themeClasses.borderPrimary}`}>
                <h3 className={`text-xl font-semibold mb-4 ${themeClasses.textPrimary}`}>Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8C52FF]/20 flex items-center justify-center">
                      <Mail size={20} className="text-[#8C52FF]" />
                    </div>
                    <div>
                      <p className={`font-medium ${themeClasses.textPrimary}`}>Email</p>
                      <p className={themeClasses.textSecondary}>support@studypal-ai.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#5CE1E6]/20 flex items-center justify-center">
                      <Phone size={20} className="text-[#5CE1E6]" />
                    </div>
                    <div>
                      <p className={`font-medium ${themeClasses.textPrimary}`}>Phone</p>
                      <p className={themeClasses.textSecondary}>+1 (555) 123-4567</p>
                    </div>
                  </div>


                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
