import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { createPaymentIntent, confirmPayment, formatPrice, getPlanDetails } from '../lib/paymentService';
import { useAuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/theme';
import { CreditCard, Lock, CheckCircle, XCircle } from 'lucide-react';

interface PaymentFormProps {
  planType: 'gold' | 'diamond';
  onSuccess: () => void;
  onCancel: () => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

function CheckoutForm({ planType, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuthContext();
  const { isDarkMode } = useTheme();
  const themeClasses = getThemeClasses(isDarkMode);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const plan = getPlanDetails(planType);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment intent
      const paymentResult = await createPaymentIntent({
        planType,
        userEmail: user?.email,
        userId: user?.id,
      });

      if (!paymentResult.success || !paymentResult.paymentIntent) {
        throw new Error(paymentResult.error || 'Failed to create payment intent');
      }

      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: user?.email,
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Confirm payment
      const confirmResult = await confirmPayment(
        paymentResult.paymentIntent.client_secret,
        paymentMethod.id
      );

      if (!confirmResult.success) {
        throw new Error(confirmResult.error || 'Payment failed');
      }

      setSucceeded(true);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className={`${themeClasses.bgSecondary} p-8 rounded-lg border ${themeClasses.borderPrimary} text-center`}>
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className={`text-xl font-bold ${themeClasses.textPrimary} mb-2`}>Payment Successful!</h3>
        <p className={themeClasses.textSecondary}>
          Welcome to {plan.name}! Your subscription is now active.
        </p>
      </div>
    );
  }

  return (
    <div className={`${themeClasses.bgSecondary} p-8 rounded-lg border ${themeClasses.borderPrimary}`}>
      <div className="mb-6">
        <h3 className={`text-xl font-bold ${themeClasses.textPrimary} mb-2`}>
          Subscribe to {plan.name}
        </h3>
        <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>
          {formatPrice(plan.price)}/month
        </p>
        <p className={`text-sm ${themeClasses.textSecondary} mt-2`}>
          7-day free trial, then {formatPrice(plan.price)} per month
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
            <CreditCard size={16} className="inline mr-2" />
            Card Information
          </label>
          <div className={`p-4 border ${themeClasses.borderPrimary} rounded-lg ${themeClasses.bgPrimary}`}>
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        {error && (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <XCircle size={20} className="text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-500">
          <Lock size={16} className="mr-2" />
          Your payment information is secure and encrypted
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 px-6 py-3 border ${themeClasses.borderPrimary} rounded-lg ${themeClasses.textPrimary} ${themeClasses.bgHover} transition`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="flex-1 bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : `Subscribe ${formatPrice(plan.price)}/month`}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className={`font-medium ${themeClasses.textPrimary} mb-3`}>What's included:</h4>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className={`flex items-center text-sm ${themeClasses.textSecondary}`}>
              <CheckCircle size={16} className="text-green-500 mr-2" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PaymentModal({ planType, onSuccess, onCancel }: PaymentFormProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <Elements stripe={stripePromise}>
          <CheckoutForm
            planType={planType}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      </div>
    </div>
  );
}
