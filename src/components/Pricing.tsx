"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Star, Zap, Shield, Globe, Users } from 'lucide-react'
import { toast } from 'sonner'

interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  billingCycle: string
  features: string[]
  limits?: {
    aiRequests?: number
    projects?: number
    storage?: string
  }
  popular?: boolean
}

interface PricingConfig {
  ads: {
    enabled: boolean
    placement: string
    provider: string
    publisherId: string
    adSlot: string
  }
  pricing: {
    enabled: boolean
    currency: string
    plans: PricingPlan[]
  }
  stripe: {
    publishableKey: string
    secretKey: string
    webhookSecret: string
  }
  ui: {
    showPricing: boolean
    showAds: boolean
    forceAdDisplay: boolean
  }
}

interface PricingProps {
  onPlanSelect?: (plan: PricingPlan) => void
  className?: string
}

export function Pricing({ onPlanSelect, className }: PricingProps) {
  const [config] = useState<PricingConfig>({
    ads: {
      enabled: false,
      placement: 'sidebar',
      provider: 'google-adsense',
      publisherId: 'ca-pub-12345678901234567890',
      adSlot: 'aether-sidebar-ad'
    },
    pricing: {
      enabled: true,
      currency: 'USD',
      plans: [
        {
          id: 'starter',
          name: 'Starter',
          description: 'Perfect for exploring Aether and building your first apps',
          price: 0,
          billingCycle: 'monthly',
          features: [
            'Unlimited Projects',
            'Access to Basic AI Models',
            'Instant Preview',
            'Community Support',
            'Free Deployment',
            'Basic Templates'
          ],
          limits: {
            aiRequests: 1000,
            projects: 10,
            storage: '1GB'
          },
          popular: true
        },
        {
          id: 'pro',
          name: 'Pro',
          description: 'Advanced features for power users who want more control',
          price: 0,
          billingCycle: 'monthly',
          features: [
            'Everything in Starter',
            'Advanced AI Models',
            'Priority Support',
            'Unlimited AI Requests',
            'Advanced Templates',
            'Custom Domains',
            'Priority Deployment'
          ],
          limits: {
            aiRequests: -1,
            projects: -1,
            storage: '100GB'
          },
          popular: false
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          description: 'For teams and organizations that need advanced features',
          price: 0,
          billingCycle: 'monthly',
          features: [
            'Everything in Pro',
            'Team Collaboration',
            'Advanced Analytics',
            'Custom Integrations',
            'Dedicated Support',
            'SLA Guarantee',
            'Custom AI Models',
            'White-label Options'
          ],
          limits: {
            aiRequests: -1,
            projects: -1,
            storage: 'Unlimited'
          }
        }
      ]
    },
    stripe: {
      publishableKey: 'pk_test_12345678901234567890',
      secretKey: 'sk_test_12345678901234567890',
      webhookSecret: 'whsec_12345678901234567890'
    },
    ui: {
      showPricing: true,
      showAds: false,
      forceAdDisplay: false
    }
  })
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan.id)
    if (onPlanSelect) {
      onPlanSelect(plan)
    }
    toast.success(`Selected ${plan.name} plan!`)
  }

  const handleBillingCycleChange = (cycle: 'monthly' | 'yearly') => {
    setBillingCycle(cycle)
  }

  const getDiscountedPrice = (price: number) => {
    if (billingCycle === 'yearly') {
      return Math.round(price * 10 * 0.8) / 10 // 20% discount for yearly
    }
    return price
  }

  const getYearlySavings = (monthlyPrice: number) => {
    const yearlyPrice = getDiscountedPrice(monthlyPrice)
    const savings = monthlyPrice * 12 - yearlyPrice
    return Math.round(savings)
  }

  return (
    <div className={`min-h-screen bg-[var(--bg)] ${className}`}>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-[var(--t)] mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-[var(--t2)] mb-8 max-w-2xl mx-auto">
              Choose the perfect plan for your needs. All plans include core features, with no hidden fees.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {config.pricing.plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] liquid-glass border border-[var(--bdr)] ${
                  selectedPlan === plan.id ? 'ring-2 ring-primary shadow-2xl' : ''
                }`}>
                  <CardHeader className="pb-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-3xl font-black text-[var(--t)]">
                          {plan.name}
                        </CardTitle>
                        <p className="text-[var(--t2)] text-base leading-relaxed">
                          {plan.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right pt-4 border-t border-[var(--bdr)]">
                      <div className="text-4xl font-black text-[var(--t)] mb-1">
                        Free
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-6">
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-[var(--t)] font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.limits && (
                      <div className="mt-6 pt-6 border-t border-[var(--bdr)]">
                        <h4 className="font-bold text-[var(--t)] mb-4 text-lg">Usage Limits</h4>
                        <div className="space-y-3 text-sm">
                          {plan.limits.aiRequests && (
                            <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg2)]">
                              <span className="text-[var(--t2)]">AI Requests</span>
                              <span className="font-bold text-[var(--t)]">{plan.limits.aiRequests.toLocaleString()}/month</span>
                            </div>
                          )}
                          {plan.limits.projects && (
                            <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg2)]">
                              <span className="text-[var(--t2)]">Projects</span>
                              <span className="font-bold text-[var(--t)]">{plan.limits.projects.toLocaleString()}</span>
                            </div>
                          )}
                          {plan.limits.storage && (
                            <div className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg2)]">
                              <span className="text-[var(--t2)]">Storage</span>
                              <span className="font-bold text-[var(--t)]">{plan.limits.storage}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="mt-6">
                  <Button
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full py-4 text-lg font-bold rounded-2xl transition-all duration-300 ${
                      selectedPlan === plan.id
                        ? 'bg-primary text-[var(--bg)] shadow-xl shadow-primary/20'
                        : 'bg-[var(--t)] text-[var(--bg)] hover:bg-primary hover:shadow-xl hover:shadow-primary/20'
                    }`}
                  >
                    {selectedPlan === plan.id ? 'Selected' : `Get Started`}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 liquid-glass rounded-xl border border-[var(--bdr)]">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--t)] mb-2">All Plans Include</h3>
              <ul className="space-y-3 text-left text-[var(--t2)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Unlimited Projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>AI-Powered Development</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Real-time Preview</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Free Deployment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Community Support</span>
                </li>
              </ul>
            </div>

            <div className="text-center p-8 liquid-glass rounded-xl border border-[var(--bdr)]">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--t)] mb-2">Enterprise Security</h3>
              <ul className="space-y-3 text-left text-[var(--t2)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Advanced Security</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>24/7 Monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>SLA Guarantee</span>
                </li>
              </ul>
            </div>

            <div className="text-center p-8 liquid-glass rounded-xl border border-[var(--bdr)]">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--t)] mb-2">Premium Support</h3>
              <ul className="space-y-3 text-left text-[var(--t2)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Priority Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Custom Integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>Advanced Analytics</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-20 text-center p-8 liquid-glass rounded-2xl border border-[var(--bdr)]">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-[var(--t)] mb-4">30-Day Money Back Guarantee</h3>
              <p className="text-[var(--t2)]">
                Not satisfied with Aether? Get a full refund within 30 days, no questions asked.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
