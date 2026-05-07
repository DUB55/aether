"use client"

import React, { useState } from 'react';
import { Check, Zap, Lock, Crown, Building2 } from 'lucide-react';
import { PaymentModal } from '@/components/PaymentModal';
import { useFirebase } from '@/components/FirebaseProvider';
import { toast } from 'sonner';
import type { SubscriptionTier } from '@/types';

export function Pricing() {
  const { user } = useFirebase();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const plans = [
    {
      id: 'free' as SubscriptionTier,
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started with AI-powered development',
      icon: Lock,
      features: [
        'Basic AI code generation',
        '3 projects',
        'Community support',
        'Standard templates',
      ],
      limitations: [
        'No connectors',
        'No advanced AI features',
        'No collaboration',
      ],
      cta: 'Current Plan',
      disabled: true,
    },
    {
      id: 'starter' as SubscriptionTier,
      name: 'Starter',
      price: 15,
      period: 'month',
      description: 'For individual developers who need more power',
      icon: Zap,
      features: [
        'Everything in Free',
        '10 connectors',
        'Advanced AI features',
        '10 projects',
        'Priority support',
        'Custom templates',
      ],
      limitations: [
        'No team collaboration',
        'Limited connector access',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      id: 'pro' as SubscriptionTier,
      name: 'Pro',
      price: 49,
      period: 'month',
      description: 'For professional teams building production apps',
      icon: Crown,
      features: [
        'Everything in Starter',
        'Unlimited connectors',
        'Unlimited projects',
        'Team collaboration (5 users)',
        'Advanced analytics',
        'API access',
        'Dedicated support',
      ],
      limitations: [],
      cta: 'Get Started',
    },
    {
      id: 'enterprise' as SubscriptionTier,
      name: 'Enterprise',
      price: 199,
      period: 'month',
      description: 'For large organizations with custom needs',
      icon: Building2,
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'Custom integrations',
        'SLA guarantee',
        'White-label options',
        'On-premise deployment',
        '24/7 dedicated support',
      ],
      limitations: [],
      cta: 'Contact Sales',
    },
  ];

  const handlePlanSelect = (planId: SubscriptionTier) => {
    if (!user) {
      toast.error('Please sign in to upgrade your plan');
      return;
    }

    if (planId === 'free') {
      toast.info('You are already on the Free plan');
      return;
    }

    if (planId === 'enterprise') {
      toast.info('Enterprise plans require custom pricing. Contact sales@aether.ai');
      return;
    }

    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async () => {
    const { upgradeSubscription } = useFirebase();
    
    try {
      // Submit the subscription upgrade request (webhook will confirm)
      await upgradeSubscription(selectedPlan!, 'nexapay-mock-charge-id', plans.find(p => p.id === selectedPlan)!.price);
      
      toast.success('Payment submitted! Your account will be upgraded once the payment is confirmed.');
      
      setShowPaymentModal(false);
      setSelectedPlan(null);
    } catch (error) {
      toast.error('Failed to process payment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--t)] mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-[var(--t2)] max-w-2xl mx-auto">
            All plans include AI-powered development with BYOK (Bring Your Own Key). 
            Connectors require paid plans - you provide your own API keys, we pay $0.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-[var(--bg2)] rounded-2xl border ${
                plan.popular
                  ? 'border-primary shadow-xl shadow-primary/10'
                  : 'border-[var(--bdr)]'
              } p-6 transition-all hover:border-primary/30 ${
                plan.disabled ? 'opacity-60' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-[var(--bg)] text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  plan.popular ? 'bg-primary' : 'bg-[var(--bg)]'
                }`}>
                  <plan.icon className={`w-6 h-6 ${
                    plan.popular ? 'text-[var(--bg)]' : 'text-[var(--t2)]'
                  }`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--t)]">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[var(--t2)]">
                    {plan.description}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[var(--t)]">
                    ${plan.price}
                  </span>
                  <span className="text-[var(--t2)]">
                    /{plan.period}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--t2)]">
                      {feature}
                    </span>
                  </div>
                ))}
                {plan.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Lock className="w-5 h-5 text-[var(--t3)] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--t3)]">
                      {limitation}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={plan.disabled}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                  plan.disabled
                    ? 'bg-[var(--bg)] text-[var(--t3)] cursor-not-allowed'
                    : plan.popular
                    ? 'bg-primary hover:bg-primary/90 text-[var(--bg)]'
                    : 'bg-[var(--bg)] hover:bg-[var(--bg3)] text-[var(--t)]'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Connector Info */}
        <div className="bg-[var(--bg2)] rounded-2xl border border-[var(--bdr)] p-8 mb-12">
          <h2 className="text-2xl font-semibold text-[var(--t)] mb-4">
            Connector Access by Plan
          </h2>
          <p className="text-[var(--t2)] mb-6">
            Connectors require paid plans. You provide your own API keys (BYOK), so you pay for the services you use directly to the provider.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-[var(--bg)]">
              <h3 className="font-semibold text-[var(--t)] mb-2">Free</h3>
              <p className="text-sm text-[var(--t2)]">No connectors available</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/20">
              <h3 className="font-semibold text-[var(--t)] mb-2">Starter</h3>
              <p className="text-sm text-[var(--t2)]">10 connectors included</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/20">
              <h3 className="font-semibold text-[var(--t)] mb-2">Pro & Enterprise</h3>
              <p className="text-sm text-[var(--t2)]">Unlimited connectors</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-[var(--bg2)] rounded-2xl border border-[var(--bdr)] p-8">
          <h2 className="text-2xl font-semibold text-[var(--t)] mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-[var(--t)] mb-2">
                How does the crypto payment work?
              </h3>
              <p className="text-[var(--t2)]">
                We use a direct crypto payment system. You'll receive a deposit address to send USDT (Polygon network). 
                Once your transaction is confirmed on the blockchain, your account is automatically upgraded.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--t)] mb-2">
                What is BYOK?
              </h3>
              <p className="text-[var(--t2)]">
                BYOK (Bring Your Own Key) means you provide your own API keys for connectors like Stripe, Shopify, etc. 
                You pay the providers directly, keeping costs transparent and ensuring zero operational overhead.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--t)] mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-[var(--t2)]">
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--t)] mb-2">
                Do you store my payment information?
              </h3>
              <p className="text-[var(--t2)]">
                No. We use direct blockchain payments and never store your payment information or wallet addresses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && selectedPlan && (
        <PaymentModal
          plan={plans.find(p => p.id === selectedPlan)!}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
