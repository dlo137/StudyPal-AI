import { CheckCircle, X, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';

interface DowngradeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromPlan: 'gold' | 'diamond';
  toPlan: 'free' | 'gold';
}

export function DowngradeSuccessModal({ isOpen, onClose, fromPlan, toPlan }: DowngradeSuccessModalProps) {
  const { isDarkMode } = useTheme();
  const themeClasses = getThemeClasses(isDarkMode);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleContinue = () => {
    onClose();
    navigate('/');
  };

  const getPlanName = (plan: 'free' | 'gold' | 'diamond') => {
    switch (plan) {
      case 'free':
        return 'Free Plan';
      case 'gold':
        return 'Gold Plan';
      case 'diamond':
        return 'Diamond Plan';
      default:
        return 'Plan';
    }
  };

  const getPlanIcon = (plan: 'free' | 'gold' | 'diamond') => {
    switch (plan) {
      case 'diamond':
        return Crown;
      case 'gold':
      case 'free':
      default:
        return Zap;
    }
  };

  const FromPlanIcon = getPlanIcon(fromPlan);
  const ToPlanIcon = getPlanIcon(toPlan);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${themeClasses.bgPrimary} rounded-2xl shadow-2xl max-w-md w-full mx-auto relative border ${themeClasses.borderPrimary}`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${themeClasses.textSecondary} hover:${themeClasses.textPrimary} transition-colors cursor-pointer`}
        >
          <X size={24} className="cursor-pointer" />
        </button>

        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={32} className="text-white" />
          </div>

          {/* Title */}
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-4`}>
            Plan Changed Successfully!
          </h2>

          {/* Plan Change Display */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {/* From Plan */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                <FromPlanIcon size={24} className="text-white" />
              </div>
              <span className={`text-sm ${themeClasses.textSecondary}`}>
                {getPlanName(fromPlan)}
              </span>
            </div>

            {/* Arrow */}
            <div className={`text-2xl ${themeClasses.textSecondary}`}>→</div>

            {/* To Plan */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center mb-2">
                <ToPlanIcon size={24} className="text-white" />
              </div>
              <span className={`text-sm ${themeClasses.textSecondary}`}>
                {getPlanName(toPlan)}
              </span>
            </div>
          </div>

          {/* Message */}
          <div className={`${themeClasses.bgSecondary} rounded-lg p-4 mb-6`}>
            <p className={`text-sm ${themeClasses.textPrimary} mb-2`}>
              <strong>You've been successfully downgraded to the {getPlanName(toPlan)}!</strong>
            </p>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              You'll continue to have access to your {getPlanName(fromPlan)} features until the end of your current billing cycle.
              {toPlan === 'gold' && fromPlan === 'diamond' && (
                <span className="block mt-2 font-medium">
                  Starting next cycle, you'll be billed for the Gold Plan.
                </span>
              )}
              {toPlan === 'free' && (
                <span className="block mt-2 font-medium">
                  No further charges will be made to your account.
                </span>
              )}
            </p>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all cursor-pointer hover:shadow-lg transform hover:scale-[1.02]"
          >
            Continue to Chat
          </button>
        </div>
      </div>
    </div>
  );
}
