// API endpoint for pricing configuration
// Reads from config/app-config.json for toggleable features

import { readFileSync } from 'fs'
import { join } from 'path'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Read config file
    const configPath = join(process.cwd(), 'config', 'app-config.json')
    const configData = readFileSync(configPath, 'utf-8')
    const config = JSON.parse(configData)

    // Return pricing-specific configuration
    const pricingConfig = {
      ads: config.ads,
      pricing: {
        enabled: config.pricing.enabled,
        stripeTestMode: config.pricing.stripeTestMode,
        currency: config.pricing.currency
      },
      ui: {
        showPricing: config.pricing.enabled,
        showAds: config.ads.enabled
      }
    }

    return res.status(200).json(pricingConfig)
  } catch (error) {
    console.error('Failed to load pricing config:', error)
    
    // Return default config if file doesn't exist or fails
    return res.status(200).json({
      ads: {
        enabled: false,
        placement: 'sidebar',
        provider: 'google-adsense',
        publisherId: 'ca-pub-12345678901234567890',
        adSlot: 'aether-sidebar-ad'
      },
      pricing: {
        enabled: true,
        stripeTestMode: true,
        currency: 'USD'
      },
      ui: {
        showPricing: true,
        showAds: false
      }
    })
  }
}
