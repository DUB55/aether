import React, { useState, useEffect } from 'react';
import { X, Copy, Check, AlertCircle, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
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
  const [txid, setTxid] = useState('');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [uniqueAmount, setUniqueAmount] = useState<string>('');

  // Exodus USDT-Polygon wallet address (placeholder - replace with actual address)
  const DEPOSIT_ADDRESS = '0x1234567890123456789012345678901234567890';

  useEffect(() => {
    // Generate a unique amount for tracking (e.g., 15.0021 instead of 15.00)
    const randomCents = Math.floor(Math.random() * 10000);
    const uniqueAmountValue = (plan.price + randomCents / 10000).toFixed(4);
    setUniqueAmount(uniqueAmountValue);
  }, [plan.price]);

  const handleCopy = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyPayment = async () => {
    if (!txid.trim()) {
      toast.error('Please enter your transaction hash');
      return;
    }

    setIsVerifying(true);
    try {
      // This would call your backend API to verify the transaction on the blockchain
      // For now, we'll simulate the verification
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would verify against Polygonscan/Alchemy API
      // If verified, update user's subscription in Firebase
      onComplete(txid);
    } catch (error) {
      toast.error('Failed to verify transaction. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-[#333]">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Upgrade to {plan.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Secure crypto payment
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#222] text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Amount */}
          <div className="bg-slate-50 dark:bg-white/[0.06] rounded-xl p-4 mb-6">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Amount to pay
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              ${uniqueAmount} USDT
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Polygon Network (USDT)
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white dark:bg-[#222] p-8 rounded-xl border border-slate-200 dark:border-[#333]">
              <Smartphone className="w-32 h-32 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
              Copy the address below to send payment
            </p>
          </div>

          {/* Deposit Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Deposit Address
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-slate-100 dark:bg-[#222] rounded-lg text-sm text-slate-600 dark:text-slate-400 font-mono truncate">
                {DEPOSIT_ADDRESS}
              </div>
              <button
                onClick={handleCopy}
                className="p-3 rounded-lg bg-slate-100 dark:bg-[#222] hover:bg-slate-200 dark:hover:bg-[#333] text-slate-600 dark:text-slate-400 transition-colors"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Transaction Hash Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Transaction Hash (TXID)
            </label>
            <input
              type="text"
              value={txid}
              onChange={(e) => setTxid(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-slate-100 dark:bg-[#222] border border-slate-200 dark:border-[#333] rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Enter the transaction hash from your wallet after sending the payment
            </p>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-300">
              <p className="font-medium mb-1">Important:</p>
              <ul className="space-y-1 text-blue-800 dark:text-blue-400">
                <li>• Send exactly ${uniqueAmount} USDT</li>
                <li>• Use Polygon network (not Ethereum)</li>
                <li>• Transaction will be verified automatically</li>
                <li>• Account upgrade takes 1-5 minutes</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-[#333] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyPayment}
              disabled={!txid.trim() || isVerifying}
              className="flex-1 px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isVerifying ? 'Verifying...' : 'Verify Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
