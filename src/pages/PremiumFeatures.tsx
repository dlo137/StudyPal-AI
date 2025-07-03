import { ZapIcon, CrownIcon, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { XIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';
import { PaymentModal } from '../components/PaymentModal';
import { PaymentSuccessModal } from '../components/PaymentSuccessModal';
import { DowngradeSuccessModal } from '../components/DowngradeSuccessModal';
import { PlanChangeConfirmationModal } from '../components/PlanChangeConfirmationModal';
import { formatPrice, getPlanDetails } from '../lib/paymentService';
import { getUserPlan, downgradeToFreePlan, downgradeToGoldPlan } from '../lib/userPlanService';

export function PremiumFeatures() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'gold' | 'diamond' | null>(null);
  const [downgradeInfo, setDowngradeInfo] = useState<{from: 'gold' | 'diamond', to: 'free' | 'gold'} | null>(null);
  const [planChangeInfo, setPlanChangeInfo] = useState<{from: 'free' | 'gold' | 'diamond', to: 'free' | 'gold' | 'diamond'} | null>(null);
  const [currentUserPlan, setCurrentUserPlan] = useState<'free' | 'gold' | 'diamond'>('free');
  const [showFreeTrialText, setShowFreeTrialText] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { user, signOut } = useAuthContext();
  const { isDarkMode } = useTheme();
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

  // Fetch user's current plan
  useEffect(() => {
    if (user?.id) {
      getUserPlan(user.id, user.email).then(result => {
        if (result.success && result.user) {
          setCurrentUserPlan(result.user.plan_type);
        }
      });
    }
  }, [user?.id, user?.email]);

  function handleLogin() {
    setMenuOpen(false);
    navigate('/login');
  }

  function handleSignUp() {
    setMenuOpen(false);
    navigate('/signup');
  }

  function handleLogout() {
    setMenuOpen(false);
    signOut();
  }

  function handleChat() {
    setMenuOpen(false);
    navigate('/');
  }

  function handleSelectPlan(planType: 'gold' | 'diamond') {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    // Show confirmation modal before proceeding
    setPlanChangeInfo({ from: currentUserPlan, to: planType });
    setShowConfirmationModal(true);
  }

  function handleSelectFreePlan() {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Show confirmation modal if user is changing plans
    if (currentUserPlan !== 'free') {
      setPlanChangeInfo({ from: currentUserPlan, to: 'free' });
      setShowConfirmationModal(true);
    }
  }

  function handleSelectGoldPlan() {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Show confirmation modal before proceeding
    if (currentUserPlan !== 'gold') {
      setPlanChangeInfo({ from: currentUserPlan, to: 'gold' });
      setShowConfirmationModal(true);
    }
  }

  function handleConfirmPlanChange() {
    if (!planChangeInfo || !user) return;

    setShowConfirmationModal(false);
    
    const { from, to } = planChangeInfo;
    
    if (to === 'free') {
      // Downgrade to free
      downgradeToFreePlan(user.id, user.email).then(result => {
        if (result.success) {
          console.log('✅ User downgraded to free plan successfully');
          setCurrentUserPlan('free');
          setDowngradeInfo({ from: from as 'gold' | 'diamond', to: 'free' });
          setShowDowngradeModal(true);
        } else {
          console.error('❌ Failed to downgrade user to free plan:', result.error);
        }
      });
    } else if (to === 'gold') {
      if (from === 'diamond') {
        // Downgrade from diamond to gold
        downgradeToGoldPlan(user.id, user.email).then(result => {
          if (result.success) {
            console.log('✅ User downgraded to gold plan successfully');
            setCurrentUserPlan('gold');
            setDowngradeInfo({ from: 'diamond', to: 'gold' });
            setShowDowngradeModal(true);
          } else {
            console.error('❌ Failed to downgrade user to gold plan:', result.error);
          }
        });
      } else {
        // Upgrade to gold (show payment modal)
        setSelectedPlan('gold');
        setShowPaymentModal(true);
      }
    } else if (to === 'diamond') {
      // Upgrade to diamond (show payment modal)
      setSelectedPlan('diamond');
      setShowPaymentModal(true);
    }
    
    setPlanChangeInfo(null);
  }

  function handleCancelPlanChange() {
    setShowConfirmationModal(false);
    setPlanChangeInfo(null);
  }

  function handlePaymentSuccess() {
    setShowPaymentModal(false);
    setShowSuccessModal(true);
    // Keep selectedPlan for the success modal, will be cleared when success modal closes
  }

  function handlePaymentCancel() {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  }

  function handleSuccessModalClose() {
    setShowSuccessModal(false);
    // Update the current plan to reflect the new purchase
    if (selectedPlan) {
      setCurrentUserPlan(selectedPlan);
    }
    setSelectedPlan(null);
  }

  function handleDowngradeModalClose() {
    setShowDowngradeModal(false);
    setDowngradeInfo(null);
  }

  function handleStartFreeTrial() {
    setShowFreeTrialText(true);
    handleSelectPlan('diamond');
  }

  const goldPlan = getPlanDetails('gold');
  const diamondPlan = getPlanDetails('diamond');

  return (
    <div className={`min-h-screen ${themeClasses.bgPrimary} ${themeClasses.textPrimary} relative overflow-hidden flex flex-col`}>
      {/* Header with X button and PREMIUM text - stays at top */}
      <div className={`flex items-center justify-between px-4 sm:px-6 py-3 relative z-50 border-b ${themeClasses.borderPrimary}`}>
        <button 
          onClick={() => navigate('/')} 
          className={`${themeClasses.textPrimary} ${themeClasses.textSecondary} transition cursor-pointer p-2 ${themeClasses.bgHover} rounded-full`}
        >
          <XIcon size={24} />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 font-bold text-lg">
            PLANS
        </span>
        <div className="relative" ref={menuRef}>
          <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#4285F4] transition ${themeClasses.bgSecondary} flex items-center justify-center`}
               onClick={() => setMenuOpen(v => !v)}>
            {user ? (
              <span className={`${themeClasses.textPrimary} text-xs font-medium`}>
                {getUserInitials()}
              </span>
            ) : (
              <User size={16} className={themeClasses.textSecondary} />
            )}
          </div>
          {menuOpen && (
            <div className={`absolute right-0 mt-2 w-36 sm:w-40 ${themeClasses.bgSecondary} border ${themeClasses.borderPrimary} rounded-lg shadow-lg z-50`}>
              {!user && (
                <>
                  <button 
                    className={`block w-full text-left px-4 py-2.5 text-sm ${themeClasses.bgHoverSecondary} ${themeClasses.textPrimary} transition-all duration-200 cursor-pointer rounded-t-lg`} 
                    onClick={handleLogin}
                  >
                    Login
                  </button>
                  <button 
                    className={`block w-full text-left px-4 py-2.5 text-sm ${themeClasses.bgHoverSecondary} ${themeClasses.textPrimary} transition-all duration-200 cursor-pointer`} 
                    onClick={handleSignUp}
                  >
                    Sign Up
                  </button>
                </>
              )}
              {user && (
                <button 
                  className={`block w-full text-left px-4 py-2.5 text-sm ${themeClasses.bgHoverSecondary} ${themeClasses.textPrimary} transition-all duration-200 cursor-pointer rounded-t-lg`} 
                  onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                >
                  Profile
                </button>
              )}
              <button 
                className={`block w-full text-left px-4 py-2.5 text-sm ${themeClasses.bgHoverSecondary} ${themeClasses.textPrimary} transition-all duration-200 cursor-pointer ${!user ? 'rounded-t-lg' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Plans
              </button>
              <button 
                className={`block w-full text-left px-4 py-2.5 text-sm ${themeClasses.bgHoverSecondary} ${themeClasses.textPrimary} transition-all duration-200 cursor-pointer ${!user ? 'rounded-b-lg' : ''}`}
                onClick={handleChat}
              >
                Chat
              </button>
              {user && (
                <button 
                  className={`block w-full text-left px-4 py-2.5 text-sm text-red-400 ${themeClasses.bgHoverSecondary} hover:text-red-300 transition-all duration-200 cursor-pointer rounded-b-lg`} 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body Section - centered in remaining space */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative z-10 max-w-6xl mx-auto w-full px-3 sm:px-6 md:px-8 pb-[13px] sm:pb-0">
          {/* Title and Description Section */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8 pb-2">
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 md:mb-4">StudyPal: AI Homework Helper</h1>
            <p className={`text-sm sm:text-base md:text-lg ${themeClasses.textSecondary} max-w-2xl mx-auto px-2`}>
              Saves time and stress while ensuring clarity and quality in your homework, making it the smart choice for tackling assignments with ease.
            </p>
          </div>

          {/* Cards - 3 column layout on all screen sizes */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6 mb-4 sm:mb-6 pt-2 items-stretch" >
            {/* Card 1 */}
            <div className={`${isDarkMode ? 'bg-[#2a1052]/80' : 'bg-purple-50/80'} p-1.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border ${isDarkMode ? 'border-purple-500/30' : 'border-purple-200'} backdrop-blur-sm flex flex-col relative`}>
              <div className="bg-[#8C52FF] w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl mb-1 sm:mb-2 md:mb-3">
          <ZapIcon size={10} className="text-white sm:hidden" />
          <ZapIcon size={16} className="text-white hidden sm:block md:hidden" />
          <ZapIcon size={20} className="text-white hidden md:block" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-lg font-bold mb-1 sm:mb-2 md:mb-3">Free Plan</h3>
              <ul className={`space-y-0.5 sm:space-y-1.5 md:space-y-2 ${themeClasses.textSecondary} flex-1 text-xs sm:text-xs md:text-sm`}>
          <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
            <span>5 Requests/Daily</span>
          </li>
          <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
            <span>150 Requests/Monthly</span>
          </li>
          <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
            <span>Free Forever</span>
          </li>
          <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
            <span>No Credit Card Required</span>
          </li>
              </ul>
              <button
                onClick={() => currentUserPlan !== 'free' ? handleSelectFreePlan() : undefined}
                className={`mt-2 w-full text-white text-xs sm:text-sm py-1.5 sm:py-2 rounded-lg transition-opacity ${
                  currentUserPlan === 'free' 
                    ? 'bg-gray-500 cursor-default opacity-70' 
                    : 'bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] hover:opacity-90 cursor-pointer'
                }`}
                disabled={currentUserPlan === 'free'}
              >
                {currentUserPlan === 'free' ? 'Current Plan' : 'Choose Free'}
              </button>
            </div>

            {/* Card 2 - Gold Plan */}
            <div className={`${isDarkMode ? 'bg-[#2a1052]/80' : 'bg-purple-50/80'} p-1.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border ${isDarkMode ? 'border-purple-500/30' : 'border-purple-200'} backdrop-blur-sm flex flex-col relative`}>
              <div className="bg-[#8C52FF] w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl mb-1 sm:mb-2 md:mb-3">
          <ZapIcon size={10} className="text-white sm:hidden" />
          <ZapIcon size={16} className="text-white hidden sm:block md:hidden" />
          <ZapIcon size={20} className="text-white hidden md:block" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-lg font-bold mb-1 sm:mb-2 md:mb-3">Gold Plan</h3>
              <p className="text-xs sm:text-sm md:text-base font-bold text-[#8C52FF] mb-1 sm:mb-2">
                {formatPrice(goldPlan.price)}/month
              </p>
              <ul className={`space-y-0.5 sm:space-y-1.5 md:space-y-2 ${themeClasses.textSecondary} flex-1 text-xs sm:text-xs md:text-sm`}>
          <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
            <span>50 Requests/Daily</span>
          </li>
          <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
            <span>1.5K Requests/Monthly</span>
          </li>
          <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
            <span>Email Support</span>
          </li>
          <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
            <span>24/7 Available</span>
          </li>
              </ul>
              <button
                onClick={() => currentUserPlan !== 'gold' ? handleSelectGoldPlan() : undefined}
                className={`mt-2 w-full text-white text-xs sm:text-sm py-1.5 sm:py-2 rounded-lg transition-opacity ${
                  currentUserPlan === 'gold' 
                    ? 'bg-gray-500 cursor-default opacity-70' 
                    : 'bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] hover:opacity-90 cursor-pointer'
                }`}
                disabled={currentUserPlan === 'gold'}
              >
                {currentUserPlan === 'gold' ? 'Current Plan' : 'Choose Gold'}
              </button>
            </div>

            {/* Card 3 */}
            <div className={`${isDarkMode ? 'bg-[#2a1052]/80' : 'bg-purple-50/80'} p-1.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border ${isDarkMode ? 'border-purple-500/30' : 'border-purple-200'} backdrop-blur-sm flex flex-col relative`}>
              <div className="bg-[#8C52FF] w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl mb-1 sm:mb-2 md:mb-3">
                <CrownIcon size={10} className="text-white sm:hidden" />
                <CrownIcon size={16} className="text-white hidden sm:block md:hidden" />
                <CrownIcon size={20} className="text-white hidden md:block" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-lg font-bold mb-1 sm:mb-2 md:mb-3">
          Diamond Plan
              </h3>
              <p className="text-xs sm:text-sm md:text-base font-bold text-[#8C52FF] mb-1 sm:mb-2">
                {formatPrice(diamondPlan.price)}/month
              </p>
              <ul className={`space-y-0.5 sm:space-y-1.5 md:space-y-2 ${themeClasses.textSecondary} flex-1 text-xs sm:text-xs md:text-sm`}>
          <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
            <span>150 Requests/Daily</span>
          </li>
          <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
            <span>4.5K Requests/Monthly</span>
          </li>
          <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
            <span>Email Support</span>
          </li>
          <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
            <span>Export History</span>
          </li>
              </ul>
              <button
                onClick={() => currentUserPlan !== 'diamond' ? handleSelectPlan('diamond') : undefined}
                className={`mt-2 w-full text-white text-xs sm:text-sm py-1.5 sm:py-2 rounded-lg transition-opacity ${
                  currentUserPlan === 'diamond' 
                    ? 'bg-gray-500 cursor-default opacity-70' 
                    : 'bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] hover:opacity-90 cursor-pointer'
                }`}
                disabled={currentUserPlan === 'diamond'}
              >
                {currentUserPlan === 'diamond' ? 'Current Plan' : 'Choose Diamond'}
              </button>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="max-w-md mx-auto">
            <button 
              onClick={handleStartFreeTrial}
              className="w-full p-3 sm:p-4 rounded-xl bg-[#8C52FF] text-white font-bold shadow-lg shadow-purple-500/30 hover:bg-[#7a4ae6] transition-colors text-sm sm:text-base cursor-pointer"
            >
              Start Free Trial 
            </button>
            {showFreeTrialText && (
              <p className={`text-center text-xs sm:text-sm ${themeClasses.textMuted} mt-2`}>
                7-day free diamond trial, then {formatPrice(diamondPlan.price)}/month
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          planType={selectedPlan}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && selectedPlan && (
        <PaymentSuccessModal
          isOpen={showSuccessModal}
          planType={selectedPlan}
          onClose={handleSuccessModalClose}
        />
      )}

      {/* Downgrade Success Modal */}
      {showDowngradeModal && downgradeInfo && (
        <DowngradeSuccessModal
          isOpen={showDowngradeModal}
          fromPlan={downgradeInfo.from}
          toPlan={downgradeInfo.to}
          onClose={handleDowngradeModalClose}
        />
      )}

      {/* Plan Change Confirmation Modal */}
      {showConfirmationModal && planChangeInfo && (
        <PlanChangeConfirmationModal
          isOpen={showConfirmationModal}
          fromPlan={planChangeInfo.from}
          toPlan={planChangeInfo.to}
          onConfirm={handleConfirmPlanChange}
          onClose={handleCancelPlanChange}
        />
      )}
    </div>
  );
}