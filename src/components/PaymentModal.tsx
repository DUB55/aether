import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Lock, ChevronDown, ChevronUp, CreditCard, Wallet } from 'lucide-react';
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
  const [paymentStatus, setPaymentStatus] = useState<'initial' | 'generating' | 'waiting' | 'success'>('initial');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showPaymentLink, setShowPaymentLink] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'paypal' | 'crypto'>('crypto');
  const [showNetworkDetails, setShowNetworkDetails] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Exodus wallet address - Tether USD (Native) on Polygon
  const DEPOSIT_ADDRESS = '0x46c89D2926Dec3281df78Fc7c3608889C7f5204F';

  useEffect(() => {
    // Generate a unique amount for tracking (e.g., 49.5127 instead of 49.50)
    const randomCents = Math.floor(Math.random() * 10000);
    const uniqueAmountValue = (plan.price + randomCents / 10000).toFixed(4);
    setUniqueAmount(uniqueAmountValue);
  }, [plan.price]);

  const handleGeneratePaymentLink = () => {
    setPaymentStatus('generating');
    
    // Simulate "Generating secure payment link" for 1 second
    setTimeout(() => {
      setPaymentStatus('waiting');
      setShowPaymentLink(true);
      setStartTime(new Date());
      
      // Start listening for payment
      const stopListening = listenForPayment(
        parseFloat(uniqueAmount),
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
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentMethodSelect = (method: 'card' | 'paypal' | 'crypto') => {
    if (method === 'card' || method === 'paypal') {
      setShowTooltip(method);
      setTimeout(() => setShowTooltip(null), 2000);
      return;
    }
    setSelectedPaymentMethod(method);
  };

  const roundedPrice = plan.price.toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
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
        <div className="p-6">
          {paymentStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Account Upgraded!
              </h3>
              <p className="text-lg text-slate-500 dark:text-slate-400 text-center mb-8">
                Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Order Summary */}
              <div className="space-y-6">
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
                        ${roundedPrice}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-[#333] pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-slate-900 dark:text-white">
                          Total
                        </span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                          ${roundedPrice}
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
                  <div className="grid grid-cols-3 gap-2">
                    <div className="relative">
                      <button
                        onClick={() => handlePaymentMethodSelect('card')}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                          selectedPaymentMethod === 'card'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#444] text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs">Card</span>
                      </button>
                      {showTooltip === 'card' && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-10">
                          Coming Soon
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => handlePaymentMethodSelect('paypal')}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                          selectedPaymentMethod === 'paypal'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#444] text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Wallet className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs">PayPal</span>
                      </button>
                      {showTooltip === 'paypal' && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-10">
                          Coming Soon
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handlePaymentMethodSelect('crypto')}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedPaymentMethod === 'crypto'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#444] text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Lock className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">Crypto</span>
                </button>
                  </div>
                </div>
              </div>

              {/* Right: Payment Details */}
              <div className="space-y-6">
                {!showPaymentLink ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <button
                      onClick={handleGeneratePaymentLink}
                      disabled={paymentStatus === 'generating'}
                      className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {paymentStatus === 'generating' ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </span>
                      ) : (
                        'Generate Secure Payment Link'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                      <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
                        Scan to Pay
                      </p>
                    </div>

                    {/* Deposit Address */}
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
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Exact Amount Required: <span className="font-mono">${uniqueAmount} USDT</span>
                      </div>
                    </div>

                    {/* Network Details Dropdown */}
                    <div>
                      <button
                        onClick={() => setShowNetworkDetails(!showNetworkDetails)}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      >
                        <span>Network Details</span>
                        {showNetworkDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {showNetworkDetails && (
                        <div className="mt-2 p-4 bg-slate-50 dark:bg-white/[0.06] rounded-lg text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          <div className="flex justify-between">
                            <span>Network:</span>
                            <span className="font-medium">Polygon</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Token:</span>
                            <span className="font-medium">USDT (Native)</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span>Status: Verifying network...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
