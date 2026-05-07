/**
 * Landing Page Background Configuration
 * 
 * Choose your preferred background style, animation behavior, and color palette.
 * These settings control the visual appearance of the landing page background.
 */

export type GradientStyle = 
  | 'drifting-orbs'      // Original: Three floating radial orbs
  | 'liquid-mesh'        // Fluid morphing gradient with 5-6 color stops
  | 'conic-sweep'        // Rotating conic gradient vortex
  | 'static-mesh-noise'  // Static gradient with animated grain overlay
  | 'diagonal-wash'      // Two-color linear gradient with rotating angle
  | 'particle-field'     // Floating glowing dots like fireflies

export type AnimationBehavior = 
  | 'default'            // Original: Independent orbital movement
  | 'breathing-pulse'   // Fixed positions, scale/opacity breathing
  | 'parallax-scroll'    // Movement responds to scroll position
  | 'cursor-reactive'    // Orb follows mouse with elastic easing
  | 'beat-driven-bursts' // Periodic expansion bursts every 8 seconds
  | 'color-shift-cycle'  // Static positions, colors cycle through spectrum

export type ColorPalette = 
  | 'default'            // Original: Indigo, purple, pink
  | 'arctic'             // Icy whites, pale cyans, soft silvers
  | 'volcanic'           // Deep charcoals, molten orange, crimson
  | 'botanical'          // Sage, moss, terracotta, cream
  | 'cyberpunk'          // Hot magenta, electric cyan, acid yellow
  | 'pastel-dream'       // Baby pink, mint, lavender, peach
  | 'monochrome-luxe'    // Five shades of single hue

export interface LandingBackgroundConfig {
  gradientStyle: GradientStyle
  animationBehavior: AnimationBehavior
  colorPalette: ColorPalette
  enabled: boolean
}

/**
 * DEFAULT CONFIGURATION
 * Edit these values to change your landing page background
 */
export const landingBackgroundConfig: LandingBackgroundConfig = {
  gradientStyle: 'drifting-orbs',  // Change to 'liquid-mesh', 'conic-sweep', etc.
  animationBehavior: 'default',   // Change to 'breathing-pulse', 'parallax-scroll', etc.
  colorPalette: 'default',         // Change to 'arctic', 'volcanic', etc.
  enabled: true                    // Set to false to disable background effects
}

/**
 * COLOR PALETTE DEFINITIONS
 */
export const colorPalettes: Record<ColorPalette, string[]> = {
  default: [
    'rgba(99, 102, 241, 0.9)',   // Indigo
    'rgba(168, 85, 247, 0.8)',   // Purple
    'rgba(236, 72, 153, 0.7)',   // Pink
  ],
  arctic: [
    'rgba(224, 242, 251, 0.6)',  // Pale cyan
    'rgba(203, 213, 225, 0.5)',  // Silver
    'rgba(241, 245, 249, 0.4)',  // Ice white
  ],
  volcanic: [
    'rgba(31, 41, 55, 0.7)',     // Charcoal
    'rgba(249, 115, 22, 0.6)',   // Orange
    'rgba(220, 38, 38, 0.5)',    // Crimson
  ],
  botanical: [
    'rgba(134, 169, 132, 0.6)',  // Sage
    'rgba(85, 107, 47, 0.5)',    // Moss
    'rgba(210, 180, 140, 0.4)',  // Terracotta
  ],
  cyberpunk: [
    'rgba(236, 72, 153, 0.7)',   // Hot magenta
    'rgba(6, 182, 212, 0.6)',    // Electric cyan
    'rgba(234, 179, 8, 0.5)',    // Acid yellow
  ],
  'pastel-dream': [
    'rgba(252, 205, 229, 0.6)',  // Baby pink
    'rgba(157, 234, 224, 0.5)',  // Mint
    'rgba(216, 191, 216, 0.4)',  // Lavender
  ],
  'monochrome-luxe': [
    'rgba(30, 58, 138, 0.7)',     // Navy
    'rgba(59, 130, 246, 0.6)',   // Blue
    'rgba(96, 165, 250, 0.5)',   // Sky blue
    'rgba(147, 197, 253, 0.4)',  // Light blue
    'rgba(191, 219, 254, 0.3)',  // Pale blue
  ],
}
