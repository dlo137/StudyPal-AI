import { AlertTriangle, X, Crown, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';
import { formatPrice, getPlanDetails } from '../lib/paymentService';

interface PlanChangeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromPlan: 'free' | 'gold' | 'diamond';
  toPlan: 'free' | 'gold' | 'diamond';
}

export function PlanChangeConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  fromPlan, 
  toPlan 
}: PlanChangeConfirmationModalProps) {
  const { isDarkMode } = useTheme();
  const themeClasses = getThemeClasses(isDarkMode);

  if (!isOpen) return null;

  const getPlanDisplayName = (plan: 'free' | 'gold' | 'diamond') => {
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

  const getPlanBgColor = (plan: 'free' | 'gold' | 'diamond') => {
    switch (plan) {
      case 'diamond':
        return 'bg-purple-500';
      case 'gold':
        return 'bg-yellow-500';
      case 'free':
      default:
        return 'bg-gray-500';
    }
  };

  const isUpgrade = (fromPlan === 'free' && (toPlan === 'gold' || toPlan === 'diamond')) || 
                   (fromPlan === 'gold' && toPlan === 'diamond');
  const isDowngrade = (fromPlan === 'diamond' && (toPlan === 'gold' || toPlan === 'free')) || 
                     (fromPlan === 'gold' && toPlan === 'free');

  const FromPlanIcon = getPlanIcon(fromPlan);
  const ToPlanIcon = getPlanIcon(toPlan);

  const getChangeMessage = () => {
    if (isUpgrade) {
      return {
        title: "Confirm Plan Upgrade",
        message: `You're about to upgrade from the ${getPlanDisplayName(fromPlan)} to the ${getPlanDisplayName(toPlan)}.`,
        details: (toPlan === 'gold' || toPlan === 'diamond') ? `You'll be charged ${formatPrice(getPlanDetails(toPlan).price)}/month starting immediately.` : '',
        confirmText: "Upgrade Now",
        confirmStyle: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
      };
    } else if (isDowngrade) {
      return {
        title: "Confirm Plan Downgrade",
        message: `You're about to downgrade from the ${getPlanDisplayName(fromPlan)} to the ${getPlanDisplayName(toPlan)}.`,
        details: toPlan === 'free' 
          ? "You'll lose access to premium features and no further charges will be made."
          : `You'll be charged ${formatPrice(getPlanDetails(toPlan as 'gold' | 'diamond').price)}/month starting next billing cycle.`,
        confirmText: "Downgrade",
        confirmStyle: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
      };
    } else {
      return {
        title: "Confirm Plan Change",
        message: `You're about to change from the ${getPlanDisplayName(fromPlan)} to the ${getPlanDisplayName(toPlan)}.`,
        details: '',
        confirmText: "Confirm Change",
        confirmStyle: "bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] hover:opacity-90"
      };
    }
  };

  const changeInfo = getChangeMessage();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${themeClasses.bgPrimary} rounded-2xl shadow-2xl max-w-md w-full mx-4 border ${themeClasses.borderPrimary} overflow-hidden`}>
        {/* Header with close button */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-1 rounded-full ${themeClasses.textSecondary} hover:${themeClasses.bgHover} transition-colors cursor-pointer`}
          >
            <X size={20} className="cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Warning icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
              <AlertTriangle size={32} className="text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className={`text-xl font-bold ${themeClasses.textPrimary} mb-4 text-center`}>
            {changeInfo.title}
          </h2>

          {/* Plan Change Visualization */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {/* From Plan */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 ${getPlanBgColor(fromPlan)} rounded-full flex items-center justify-center mb-2`}>
                <FromPlanIcon size={24} className="text-white" />
              </div>
              <span className={`text-sm ${themeClasses.textSecondary} text-center`}>
                {getPlanDisplayName(fromPlan)}
              </span>
            </div>

            {/* Arrow */}
            <div className={`text-2xl ${themeClasses.textSecondary}`}>→</div>

            {/* To Plan */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 ${getPlanBgColor(toPlan)} rounded-full flex items-center justify-center mb-2`}>
                <ToPlanIcon size={24} className="text-white" />
              </div>
              <span className={`text-sm ${themeClasses.textSecondary} text-center`}>
                {getPlanDisplayName(toPlan)}
              </span>
            </div>
          </div>

          {/* Message */}
          <div className={`${themeClasses.bgSecondary} rounded-lg p-4 mb-6`}>
            <p className={`text-sm ${themeClasses.textPrimary} mb-2`}>
              {changeInfo.message}
            </p>
            {changeInfo.details && (
              <p className={`text-sm ${themeClasses.textSecondary} font-medium`}>
                {changeInfo.details}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              className={`w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg cursor-pointer hover:shadow-xl transform hover:scale-[1.02] ${changeInfo.confirmStyle}`}
            >
              {changeInfo.confirmText}
            </button>
            
            <button
              onClick={onClose}
              className={`w-full ${themeClasses.textSecondary} hover:${themeClasses.textPrimary} transition-colors text-sm cursor-pointer hover:underline`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
