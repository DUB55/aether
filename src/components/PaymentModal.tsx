import React, { useState, useEffect } from 'react';
import { X, Copy, Check, AlertCircle, Loader2, Sparkles, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { listenForPayment } from '@/lib/blockchain-verification';
import type { SubscriptionTier } from '@/types';

interface PaymentModalProps {
  plan: {
    id: SubscriptionTier;
    name: string;
    price: number;
    period: string;
  };
  onClose: () => void;
  onComplete: (transactionHash: string) => void;
}

export function PaymentModal({ plan, onClose, onComplete }: PaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [uniqueAmount, setUniqueAmount] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'securing' | 'waiting' | 'success'>('securing');
  const [startTime, setStartTime] = useState<Date>(new Date());

  // Exodus wallet address - Tether USD (Native) on Polygon
  const DEPOSIT_ADDRESS = '0x46c89D2926Dec3281df78Fc7c3608889C7f5204F';

  useEffect(() => {
    // Generate a unique amount for tracking (e.g., 15.0021 instead of 15.00)
    const randomCents = Math.floor(Math.random() * 10000);
    const uniqueAmountValue = (plan.price + randomCents / 10000).toFixed(4);
    setUniqueAmount(uniqueAmountValue);

    // Simulate "Securing Connection" for 2 seconds
    setTimeout(() => {
      setPaymentStatus('waiting');
      setStartTime(new Date());
      
      // Start listening for payment
      const stopListening = listenForPayment(
        parseFloat(uniqueAmountValue),
        (txHash, from, value) => {
          console.log('[PaymentModal] Payment detected:', { txHash, from, value });
          setPaymentStatus('success');
          onComplete(txHash);
        },
        new Date()
      );

      // Cleanup on unmount
      return () => {
        stopListening();
      };
    }, 2000);
  }, [plan.price, onComplete]);

  const handleCopy = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-[#333]">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Upgrade to {plan.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Secure checkout
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#222] text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentStatus === 'securing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Securing Connection
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                Establishing secure payment gateway...
              </p>
            </div>
          )}

          {paymentStatus === 'waiting' && (
            <div className="space-y-6">
              {/* Amount */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 text-center">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Amount to pay
                </div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  ${uniqueAmount} USDT
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Shield className="w-4 h-4" />
                  <span>Polygon Network (USDT)</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-[#222] p-6 rounded-2xl border-2 border-blue-500 shadow-xl">
                  <QRCodeSVG
                    value={`polygon:${DEPOSIT_ADDRESS}?amount=${uniqueAmount}`}
                    size={200}
                    level="H"
                    includeMargin={false}
                    className="rounded-lg"
                  />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Scan to Pay via Secure Gateway
                  </p>
                </div>
              </div>

              {/* Deposit Address (masked) */}
              <div className="bg-slate-50 dark:bg-white/[0.06] rounded-xl p-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Payment Address
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-white dark:bg-[#111] rounded-lg text-sm text-slate-600 dark:text-slate-400 font-mono truncate">
                    {DEPOSIT_ADDRESS.slice(0, 6)}...{DEPOSIT_ADDRESS.slice(-4)}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-900 dark:text-green-300">
                  <p className="font-medium mb-1">Automatic Detection</p>
                  <p className="text-green-800 dark:text-green-400">
                    Your payment will be detected automatically. No need to enter transaction details.
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Waiting for payment...</span>
              </div>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Payment Successful!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
                Your account has been upgraded to {plan.name}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
