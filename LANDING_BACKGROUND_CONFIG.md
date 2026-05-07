# Landing Page Background Configuration

This document explains how to configure the landing page background effects for your Aether application.

## Configuration File

All background settings are controlled via `src/config/landing.ts`. Edit the `landingBackgroundConfig` object to customize your landing page.

```typescript
export const landingBackgroundConfig: LandingBackgroundConfig = {
  gradientStyle: 'drifting-orbs',  // Change to desired style
  animationBehavior: 'default',   // Change to desired behavior
  colorPalette: 'default',         // Change to desired palette
  enabled: true                    // Set to false to disable
}
```

## Gradient Styles

Choose from 6 different gradient styles:

### 1. `drifting-orbs` (Default)
Three large, soft-edged circular gradient orbs float independently across the background. Each orb uses a radial gradient with 120px blur, creating a dreamy, atmospheric quality.

- **Orb 1**: 28-second figure-8 pattern from upper-left toward center
- **Orb 2**: 34-second diagonal movement with scale pulsing (0.9 → 1.1)
- **Orb 3**: 40-second wide arc across the lower portion
- **Blend mode**: screen (colors add together where they overlap)
- **Vibe**: Calm, premium, slightly hypnotic

### 2. `liquid-mesh`
A single full-screen gradient with 5-6 color stops at irregular positions. The stop positions slowly migrate, causing the entire background to morph like oil on water.

- **Animation**: 25-second morphing cycle
- **Style**: Continuous fluid surface, no hard edges
- **Vibe**: Stripe/Linear marketing page energy

### 3. `conic-sweep`
A conic gradient (colors arranged around a central point like pie slices) rotating slowly.

- **Animation**: One full revolution every 60 seconds
- **Blur**: Heavy blur softens slice boundaries into a swirling vortex
- **Vibe**: Energetic and directional

### 4. `static-mesh-noise`
The gradient itself doesn't move — instead, an animated grain/noise layer scrolls or flickers on top.

- **Animation**: Static gradient with animated grain overlay
- **Performance**: Cheaper to render, very stable
- **Vibe**: Cinematic film grain, editorial/brutalist

### 5. `diagonal-wash`
A two-color linear gradient with the angle rotating subtly between 110° and 130°.

- **Animation**: 20-second angle rotation
- **Style**: Minimal, restrained, almost imperceptible
- **Vibe**: Background whispers, foreground is the star

### 6. `particle-field`
No gradients — 40-80 tiny glowing dots floating upward at varying speeds, like fireflies or dust in a sunbeam.

- **Animation**: Particles float upward with varying speeds (10-30s)
- **Style**: Each dot has soft glow and slight color variance
- **Vibe**: Whimsical, great for creative tools

## Animation Behaviors

Choose from 6 different animation behaviors (works best with `drifting-orbs` style):

### 1. `default` (Default)
Independent orbital movement with the original drifting patterns.

### 2. `breathing-pulse`
Orbs stay in fixed positions but slowly scale up and down (0.8 → 1.3) and fade opacity (40% → 80%) in sync with a 6-second "breath."

- **Vibe**: Meditative, calming — perfect for wellness/focus apps

### 3. `parallax-scroll`
Orbs only move in response to scroll position — top orb scrolls slower than the page, bottom orb scrolls faster.

- **Effect**: Creates sense of depth and 3D space
- **Vibe**: Modern and tactile

### 4. `cursor-reactive`
A single large orb follows the user's mouse with elastic easing (lags behind by ~300ms). Two smaller orbs sit static in the corners.

- **Effect**: Interactive orb feels alive and responsive
- **Vibe**: Great for portfolio sites

### 5. `beat-driven-bursts`
Orbs sit still 90% of the time, then every 8 seconds one briefly expands and brightens like a heartbeat or soft camera flash.

- **Effect**: Mostly calm with rare moments of energy
- **Vibe**: Keeps eye returning without being distracting

### 6. `color-shift-cycle`
Positions are completely static, but colors cycle through the spectrum on a 45-second loop.

- **Animation**: Blue → purple → magenta → orange → back to blue
- **Vibe**: Synthwave/retrowave aesthetic

## Color Palettes

Choose from 7 different color palettes:

### 1. `default` (Default)
- Indigo, purple, pink
- Calm, premium, AI product vibe

### 2. `arctic`
- Icy whites, pale cyans, soft silvers
- Cold, clean, medical/financial

### 3. `volcanic`
- Deep charcoals with molten orange and crimson
- Bold, dramatic, gaming

### 4. `botanical`
- Sage, moss, terracotta, cream
- Organic, earthy, wellness

### 5. `cyberpunk`
- Hot magenta, electric cyan, acid yellow on near-black
- Loud, futuristic

### 6. `pastel-dream`
- Baby pink, mint, lavender, peach
- Soft, friendly, consumer apps

### 7. `monochrome-luxe`
- Five shades of a single hue (e.g., all blues from navy to sky)
- Sophisticated, restrained, editorial

## Combinations

You can mix and match gradient styles, animation behaviors, and color palettes to create unique effects. Here are some popular combinations:

### Premium SaaS
```typescript
gradientStyle: 'drifting-orbs'
animationBehavior: 'breathing-pulse'
colorPalette: 'default'
```

### Gaming/Entertainment
```typescript
gradientStyle: 'conic-sweep'
animationBehavior: 'beat-driven-bursts'
colorPalette: 'volcanic'
```

### Wellness/Meditation
```typescript
gradientStyle: 'liquid-mesh'
animationBehavior: 'breathing-pulse'
colorPalette: 'botanical'
```

### Creative/Portfolio
```typescript
gradientStyle: 'drifting-orbs'
animationBehavior: 'cursor-reactive'
colorPalette: 'pastel-dream'
```

### Minimalist/Editorial
```typescript
gradientStyle: 'diagonal-wash'
animationBehavior: 'default'
colorPalette: 'monochrome-luxe'
```

### Futuristic/Tech
```typescript
gradientStyle: 'particle-field'
animationBehavior: 'color-shift-cycle'
colorPalette: 'cyberpunk'
```

## Accessibility

All animations automatically respect the `prefers-reduced-motion` system preference. Users who have reduced motion enabled will see a static background or no background effects at all.

## Performance

- All transforms use `translate3d` for GPU acceleration
- SVG grain overlay at 3.5% opacity prevents color banding
- `willChange` property hints to browser for optimized rendering
- Animations can be completely disabled by setting `enabled: false`

## Customization

To add custom color palettes or gradient styles, edit `src/config/landing.ts`:

```typescript
export const colorPalettes: Record<ColorPalette, string[]> = {
  // Add your custom palette here
  'my-custom': [
    'rgba(r, g, b, 0.6)',
    'rgba(r, g, b, 0.5)',
    'rgba(r, g, b, 0.4)',
  ],
}
```

Then update the types and config accordingly.
