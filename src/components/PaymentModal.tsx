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
  hidePostalCode: false,
  disableLink: true,
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
  const [stripeLoading, setStripeLoading] = useState(true);

  const plan = getPlanDetails(planType);

  // Check if Stripe has loaded
  React.useEffect(() => {
    // More detailed logging
    console.log('🔍 Stripe useEffect triggered:', {
      stripe,
      stripeType: typeof stripe,
      stripeIsNull: stripe === null,
      stripeIsUndefined: stripe === undefined
    });
    
    if (stripe !== undefined) {
      setStripeLoading(false);
      if (!stripe) {
        console.error('❌ Stripe is null after loading');
        setError('Payment system failed to load. Please check your internet connection and try again.');
      } else {
        console.log('✅ Stripe is ready for payments');
        setError(null); // Clear any previous errors
      }
    }
  }, [stripe]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Payment system not ready. Please try again.');
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
          <div className={`p-4 border ${themeClasses.borderPrimary} rounded-lg ${themeClasses.bgPrimary} ${!stripe ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {stripeLoading ? (
              <div className="py-3 text-center text-gray-500">
                Loading payment form...
              </div>
            ) : !stripe ? (
              <div className="py-3 text-center text-red-500">
                Payment system unavailable
              </div>
            ) : (
              <CardElement 
                options={{
                  ...CARD_ELEMENT_OPTIONS,
                  hidePostalCode: false,
                  disableLink: true,
                  disabled: !stripe,
                }} 
              />
            )}
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
            className={`flex-1 px-6 py-3 border ${themeClasses.borderPrimary} rounded-lg ${themeClasses.textPrimary} ${themeClasses.bgHover} transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-gray-400 cursor-pointer`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isProcessing || stripeLoading}
            className="flex-1 bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer"
          >
            {stripeLoading ? 'Loading...' : isProcessing ? 'Processing...' : `Subscribe ${formatPrice(plan.price)}/month`}
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
  const { isDarkMode } = useTheme();
  const themeClasses = getThemeClasses(isDarkMode);
  const [stripeReady, setStripeReady] = React.useState(false);
  const [stripeError, setStripeError] = React.useState<string | null>(null);

  // Wait for Stripe promise to resolve
  React.useEffect(() => {
    if (stripePromise) {
      stripePromise
        .then((stripe) => {
          if (stripe) {
            console.log('✅ PaymentModal: Stripe promise resolved successfully');
            setStripeReady(true);
          } else {
            console.error('❌ PaymentModal: Stripe promise resolved to null');
            setStripeError('Invalid Stripe configuration');
          }
        })
        .catch((error) => {
          console.error('❌ PaymentModal: Stripe promise rejected:', error);
          setStripeError(error.message || 'Failed to load payment system');
        });
    } else {
      setStripeError('Stripe not initialized');
    }
  }, []);

  // Debug the stripePromise
  console.log('💳 PaymentModal Stripe Debug:', {
    stripePromiseExists: !!stripePromise,
    stripePromiseType: typeof stripePromise,
    stripePromiseValue: stripePromise,
    stripeReady,
    stripeError
  });

  // Handle case where Stripe failed to initialize
  if (!stripePromise || stripeError) {
    console.error('❌ PaymentModal: stripePromise is null or error occurred:', stripeError);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full">
          <div className={`${themeClasses.bgSecondary} p-8 rounded-lg border ${themeClasses.borderPrimary} text-center`}>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className={`text-xl font-bold ${themeClasses.textPrimary} mb-2`}>Payment System Configuration Error</h3>
            <p className={themeClasses.textSecondary} mb-4>
              {stripeError || 'The payment system is not properly configured. This usually means the Stripe publishable key is missing.'}
            </p>
            <div className={`text-xs ${themeClasses.textMuted} mb-6 text-left bg-gray-100 p-3 rounded`}>
              <strong>For developers:</strong><br/>
              • Check browser console for detailed error messages<br/>
              • Ensure VITE_STRIPE_PUBLISHABLE_KEY is set in environment variables<br/>
              • Verify the key starts with 'pk_test_' or 'pk_live_'
            </div>
            <button
              onClick={onCancel}
              className={`w-full px-6 py-3 border ${themeClasses.borderPrimary} rounded-lg ${themeClasses.textPrimary} ${themeClasses.bgHover} transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-gray-400 cursor-pointer`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while Stripe is initializing
  if (!stripeReady) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full">
          <div className={`${themeClasses.bgSecondary} p-8 rounded-lg border ${themeClasses.borderPrimary} text-center`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className={`text-xl font-bold ${themeClasses.textPrimary} mb-2`}>Initializing Payment System</h3>
            <p className={themeClasses.textSecondary}>
              Please wait while we set up secure payment processing...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
