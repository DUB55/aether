import React, { useState } from 'react';
import { X, Lock, CreditCard, Wallet, Apple, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import { createCharge, calculateTotalWithFee } from '@/lib/payment-service';
import type { SubscriptionTier } from '@/types';

interface PaymentModalProps {
  plan: {
    id: SubscriptionTier;
    name: string;
    price: number;
    period: string;
  };
  onClose: () => void;
  onComplete: () => void;
}

export function PaymentModal({ plan, onClose, onComplete }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'apple' | 'google'>('card');

  const basePrice = plan.price;
  const totalPrice = calculateTotalWithFee(basePrice);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Create charge with mock NexaPay API
      const response = await createCharge({
        amount: basePrice,
        currency: 'USD',
        userId: 'mock-user-id', // In production, this would come from Firebase auth
        planId: plan.id,
        description: `${plan.name} (${plan.period})`,
      });

      if (response.success && response.hostedUrl) {
        // In production, this would redirect to the actual hosted checkout
        // For mock mode, we simulate the redirect
        console.log('[PaymentModal] Redirecting to hosted checkout:', response.hostedUrl);
        
        // Simulate successful payment after redirect
        setTimeout(() => {
          setIsProcessing(false);
          onComplete();
          toast.success('Payment successful! Account upgraded.');
        }, 2000);
      } else {
        throw new Error(response.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('[PaymentModal] Payment error:', error);
      setIsProcessing(false);
      toast.error('Payment failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-[#333]">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">
              Complete your upgrade
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Lock className="w-4 h-4" />
              <span>Secure 256-bit encrypted checkout</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#222] text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-slate-50 dark:bg-white/[0.06] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  {plan.name} ({plan.period})
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ${basePrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Processing fee (3%)
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  ${(totalPrice - basePrice).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-[#333] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Payment Method
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedPaymentMethod('card')}
                className={`w-full px-4 py-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  selectedPaymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#444]'
                }`}
              >
                <CreditCard className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                <div className="text-left">
                  <div className="font-medium text-slate-900 dark:text-white">Credit Card</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Visa, Mastercard, Amex</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedPaymentMethod('apple')}
                className={`w-full px-4 py-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  selectedPaymentMethod === 'apple'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#444]'
                }`}
              >
                <Apple className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                <div className="text-left">
                  <div className="font-medium text-slate-900 dark:text-white">Apple Pay</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Fast checkout</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedPaymentMethod('google')}
                className={`w-full px-4 py-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  selectedPaymentMethod === 'google'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#444]'
                }`}
              >
                <Chrome className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                <div className="text-left">
                  <div className="font-medium text-slate-900 dark:text-white">Google Pay</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Fast checkout</div>
                </div>
              </button>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              `Pay $${totalPrice.toFixed(2)}`
            )}
          </button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Lock className="w-3 h-3" />
            <span>Secured by NexaPay.one</span>
          </div>
        </div>
      </div>
    </div>
  );
}
