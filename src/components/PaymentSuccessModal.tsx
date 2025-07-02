import { CheckCircle, X, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';
import { updateUserPlan } from '../lib/userPlanService';
import { useAuthContext } from '../contexts/AuthContext';
import { useEffect } from 'react';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'gold' | 'diamond';
}

export function PaymentSuccessModal({ isOpen, onClose, planType }: PaymentSuccessModalProps) {
  const { isDarkMode } = useTheme();
  const themeClasses = getThemeClasses(isDarkMode);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  if (!isOpen) return null;

  // Update user plan when modal opens
  useEffect(() => {
    if (isOpen && user?.id && planType) {
      updateUserPlan({
        userId: user.id,
        planType: planType,
        userEmail: user.email
      }).then(result => {
        if (result.success) {
          console.log('✅ User plan updated to:', planType);
        } else {
          console.error('❌ Failed to update user plan:', result.error);
        }
      });
    }
  }, [isOpen, user?.id, planType]);

  const handleStartUsingPlan = () => {
    onClose();
    navigate('/');
  };

  const planDetails = {
    gold: {
      name: 'Gold Plan',
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
      features: ['50 Requests/Daily', '1.5K Requests/Monthly', 'Email Support']
    },
    diamond: {
      name: 'Diamond Plan', 
      icon: Crown,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500',
      features: ['150 Requests/Daily', '4.5K Requests/Monthly', 'Priority Support']
    }
  };

  const plan = planDetails[planType];
  const IconComponent = plan.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${themeClasses.bgPrimary} rounded-2xl shadow-2xl max-w-md w-full mx-4 border ${themeClasses.borderPrimary} overflow-hidden`}>
        {/* Header with close button */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-1 rounded-full ${themeClasses.textSecondary} hover:${themeClasses.bgHover} transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Success content */}
        <div className="px-6 pb-6 text-center">
          {/* Success icon */}
          <div className="relative mb-6">
            <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={40} className="text-white" />
            </div>
            
            {/* Plan icon overlay */}
            <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 ${plan.bgColor} rounded-full flex items-center justify-center border-4 ${themeClasses.bgPrimary}`}>
              <IconComponent size={16} className="text-white" />
            </div>
          </div>

          {/* Success message */}
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-2`}>
            Payment Successful! 🎉
          </h2>
          
          <p className={`text-lg ${themeClasses.textSecondary} mb-6`}>
            Welcome to your <span className={`font-semibold ${plan.color}`}>{plan.name}</span>!<br/>
            <span className={`text-sm ${themeClasses.textMuted}`}>Your status has been updated to {plan.name.replace(' Plan', ' Member')}</span>
          </p>

          {/* Plan features */}
          <div className={`${themeClasses.bgSecondary} rounded-lg p-4 mb-6`}>
            <h3 className={`font-semibold ${themeClasses.textPrimary} mb-3`}>You now have access to:</h3>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className={`flex items-center ${themeClasses.textSecondary} text-sm`}>
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleStartUsingPlan}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
            >
              Start Using Your Plan
            </button>
            
            <button
              onClick={onClose}
              className={`w-full ${themeClasses.textSecondary} hover:${themeClasses.textPrimary} transition-colors text-sm`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
