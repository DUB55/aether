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
  const [config, setConfig] = useState<PricingConfig | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    // Load pricing configuration
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/pricing-config')
        const data = await response.json()
        setConfig(data)
      } catch (error) {
        console.error('Failed to load pricing config:', error)
        // Use default config if API fails
        setConfig({
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
                price: 29,
                billingCycle: 'monthly',
                features: [
                  'Everything in Starter',
                  'Advanced AI Models',
                  'Priority Support',
                  'Custom Domains',
                  'Advanced Analytics',
                  'Premium Templates',
                  'Agent Mode Access'
                ],
                limits: {
                  aiRequests: 10000,
                  projects: 100,
                  storage: '10GB'
                },
                popular: false
              },
              {
                id: 'enterprise',
                name: 'Enterprise',
                description: 'Maximum power and security for large-scale applications',
                price: 99,
                billingCycle: 'monthly',
                features: [
                  'Everything in Pro',
                  'Dedicated AI Resources',
                  '24/7 Support',
                  'SLA Guarantees',
                  'Custom Integrations',
                  'Advanced Security',
                  'Unlimited Everything'
                ],
                limits: {
                  aiRequests: 999999,
                  projects: 999999,
                  storage: 'unlimited'
                },
                popular: false
              }
            ]
          },
          stripe: {
            publishableKey: 'pk_test_51234567890abcdef',
            secretKey: 'sk_test_51234567890abcdef',
            webhookSecret: 'whsec_test_51234567890abcdef'
          },
          ui: {
            showPricing: true,
            showAds: false,
            forceAdDisplay: false
          }
        })
      }
    }

    loadConfig()
  }, [])

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

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${className}`}>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Choose the perfect plan for your needs. All plans include core features, with no hidden fees.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-slate-200">
              <button
                onClick={() => handleBillingCycleChange('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => handleBillingCycleChange('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Yearly
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
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
                {plan.popular && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-orange-500 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  selectedPlan === plan.id ? 'ring-2 ring-primary shadow-xl' : ''
                }`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                          {plan.name}
                        </CardTitle>
                        <p className="text-slate-600 text-sm mt-1">
                          {plan.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-slate-900 mb-2">
                          ${getDiscountedPrice(plan.price)}
                          <span className="text-lg text-slate-600 font-normal">
                            /{billingCycle === 'yearly' ? 'year' : 'month'}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && (
                          <div className="text-sm text-green-600 mb-2">
                            Save ${getYearlySavings(plan.price)}/year
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.limits && (
                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <h4 className="font-semibold text-slate-900 mb-4">Limits</h4>
                        <div className="space-y-2 text-sm text-slate-600">
                          {plan.limits.aiRequests && (
                            <div className="flex justify-between">
                              <span>AI Requests</span>
                              <span className="font-medium">{plan.limits.aiRequests.toLocaleString()}/month</span>
                            </div>
                          )}
                          {plan.limits.projects && (
                            <div className="flex justify-between">
                              <span>Projects</span>
                              <span className="font-medium">{plan.limits.projects.toLocaleString()}</span>
                            </div>
                          )}
                          {plan.limits.storage && (
                            <div className="flex justify-between">
                              <span>Storage</span>
                              <span className="font-medium">{plan.limits.storage}</span>
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
                    className={`w-full py-3 text-lg font-semibold transition-colors ${
                      selectedPlan === plan.id
                        ? 'bg-primary text-white'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
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
            <div className="text-center p-8 bg-white rounded-xl border border-slate-200">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">All Plans Include</h3>
              <ul className="space-y-3 text-left text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Unlimited Projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>AI-Powered Development</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Real-time Preview</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Free Deployment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Community Support</span>
                </li>
              </ul>
            </div>

            <div className="text-center p-8 bg-white rounded-xl border border-slate-200">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise Security</h3>
              <ul className="space-y-3 text-left text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Advanced Security</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>24/7 Monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>SLA Guarantee</span>
                </li>
              </ul>
            </div>

            <div className="text-center p-8 bg-white rounded-xl border border-slate-200">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Support</h3>
              <ul className="space-y-3 text-left text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Priority Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Custom Integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Advanced Analytics</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-20 text-center p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-green-800 mb-4">30-Day Money Back Guarantee</h3>
              <p className="text-green-700">
                Not satisfied with Aether? Get a full refund within 30 days, no questions asked.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
