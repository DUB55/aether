# Landing Page Variations Blueprint

## Overview
Create two distinct, production-ready landing page variations inspired by bolt.new design patterns.

---

## Variation 1: "Bento Grid Hero"

### Design Philosophy
- Clean, organized bento grid layout
- Card-based content organization
- Generous whitespace
- Subtle animations on card hover
- Dark theme with gradient accents

### Sections

#### 1. Navigation
- Sticky transparent header
- Logo left, nav links center, CTA right
- Background blur on scroll

#### 2. Hero Section (Bento Grid Layout)
```
+--------------------------------+------------------+
|                                |   INPUT CARD     |
|     MAIN HEADLINE              |   [Prompt input] |
|     (2 lines max)              |   [Templates]    |
|                                |                  |
+--------------------------------+------------------+
|  TRUST BADGES  |  FEATURE 1   |   FEATURE 2      |
+--------------------------------+------------------+
```

**Components:**
- Main headline card (spans 2 columns)
- Interactive input card with prompt field + templates dropdown
- Trust badges row (logos: Stripe, Vercel, etc.)
- Feature highlight cards (3 items)

**Content:**
- Headline: "Build production apps with AI"
- Subtext: "Type what you need. Get working code instantly."
- Input: Full prompt box with template selector
- Trust: "Trusted by 10,000+ developers"

#### 3. Live Demo Section
- Split layout: Code preview left, Live preview right
- Toggle between different example apps
- "Try it yourself" CTA

#### 4. Feature Grid (3x3 Bento)
```
+-----------+-----------+-----------+
|  CODE GEN |  PREVIEW  |  DEPLOY   |
+-----------+-----------+-----------+
|  STACKS   |  [IMAGE]  |  AUTH     |
+-----------+-----------+-----------+
|  DB       |  AI EDIT  |  EXPORT   |
+-----------+-----------+-----------+
```

**Cards:**
1. Code Generation - Real-time code writing
2. Instant Preview - Live reload
3. One-Click Deploy - Production hosting
4. Tech Stacks - React, Vue, Svelte support
5. Visual Centerpiece - App screenshot/video
6. Auth Integration - Firebase, Clerk, etc.
7. Database - Firestore, Supabase
8. AI Edit - Natural language edits
9. Export - Download or deploy

#### 5. Template Gallery
- Horizontal scrolling template cards
- Categories: E-commerce, SaaS, Marketing, Tools
- "View all templates" link

#### 6. Social Proof
- User testimonials in card format
- Tweet embeds or quote cards
- Star count / GitHub stats

#### 7. Pricing Section
- Simple 3-tier cards
- Monthly/Yearly toggle
- "Start free" emphasis

#### 8. FAQ
- Accordion-style questions
- 6-8 common questions

#### 9. Final CTA
- Simple centered section
- Large input field
- "Start building now"

#### 10. Footer
- Multi-column links
- Newsletter signup
- Social links

---

## Variation 2: "Immersive Dark"

### Design Philosophy
- Full-screen immersive sections
- Cinematic scroll experience
- Glowing gradient orbs
- Video/game-like feel
- Dark backgrounds with electric blue accents

### Sections

#### 1. Navigation
- Floating glass nav
- Logo + minimal links
- "Get Started" glow button

#### 2. Hero Section (Full Screen)
```
┌─────────────────────────────────────┐
│                                     │
│    [Glowing orbs background]        │
│                                     │
│     THE FUTURE OF                   │
│     WEB DEVELOPMENT                   │
│     ─────────────────               │
│                                     │
│     Describe your app.              │
│     Watch it come alive.            │
│                                     │
│     [              INPUT            ]│
│     [Start Building →]              │
│                                     │
│     Scroll to explore ↓             │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Animated gradient orbs (blue/purple)
- Massive typography (8xl+)
- Centered prompt input
- Scroll indicator animation

#### 3. How It Works (Scroll-triggered)
- Step 1: "Describe" - Type your idea
- Step 2: "Generate" - AI writes code
- Step 3: "Preview" - See it instantly
- Step 4: "Deploy" - Go live

Each step full viewport with:
- Large number indicator
- Split screen (text left, visual right)
- Scroll-triggered animations

#### 4. Feature Showcase (Horizontal Scroll)
- Horizontal scrolling section
- Each feature = full viewport card
- Parallax effects
- Auto-playing video demos

**Features:**
1. AI Code Generation
2. Real-time Preview
3. One-click Deploy
4. Database Integration
5. Authentication

#### 5. Live Code Demo
- Full-width terminal-style editor
- Typing animation of AI generating code
- Side-by-side with live preview
- "This was built in 30 seconds" text

#### 6. Wall of Love (Testimonials)
- Masonry grid layout
- Auto-scrolling
- Mix of tweets, screenshots, quotes
- Real user avatars

#### 7. Built With Aether
- Logo cloud of companies/startups
- "Join 10,000+ developers"
- Case study snippets

#### 8. Tech Stack
- Grid of technology icons
- React, TypeScript, Tailwind, Firebase, etc.
- Hover reveals details

#### 9. Pricing (Minimal)
- Two options: Free / Pro
- Large price display
- Feature checklist
- "No credit card required"

#### 10. Final CTA (Full Screen)
- Dark gradient background
- Centered headline: "What will you build?"
- Giant input field
- Animated button

---

## Variation 3: "Pixel Perfect bolt.new Clone"

### Design Philosophy
- EXACT replica of bolt.new aesthetic (as of screenshot)
- Deep black background (#000000)
- Glowing blue gradient arc at hero top
- Centered, minimal hero with massive input
- Floating template suggestion pills
- Card-based feature showcase with dark glassmorphism
- Stats with large typography
- Role-based superpowers grid

### Visual Reference Analysis

#### Color Palette (Exact)
```css
--bg-primary: #000000;
--bg-card: #0a0a0a;
--bg-card-hover: #111111;
--border: #222222;
--border-hover: #333333;
--text-primary: #ffffff;
--text-secondary: #a0a0a0;
--text-muted: #666666;
--accent-blue: #3b82f6;
--accent-glow: rgba(59, 130, 246, 0.5);
--gradient-arc: linear-gradient(180deg, rgba(59,130,246,0.3) 0%, transparent 70%);
```

#### Top Navigation
- Logo: "bolt" (text logo) left
- Center: minimal nav links
- Right: "Get started for free" button (blue outline)
- Height: ~60px
- Background: transparent initially, blur on scroll

---

### Section 1: Hero (Full Viewport)

#### Glowing Arc (Signature Element)
```
┌─────────────────────────────────────────────────────────┐
│  ╭─────────────────────────────────────────────────╮    │
│  │  Blue gradient glow arc (CSS radial-gradient)   │    │
│  ╰─────────────────────────────────────────────────╯    │
│                                                         │
│              "What will you build today?"               │
│                                                         │
│     "Your new app is being written, run, and in Prod."  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  what do you want to build?        [Build →]   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  chrome extension  landing page  invoice  base64  ocr   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**
- Arc: CSS `radial-gradient` or SVG, positioned absolute top
- Arc color: Blue (#3b82f6) with fade to transparent
- Headline: 48-56px, font-weight 700, white, centered
- Subtext: 16px, gray (#a0a0a0), centered
- Input container: max-width 680px, centered
- Input field: Dark bg (#111), rounded-lg, padding 16px 20px
- Input placeholder: "what do you want to build?"
- Button: Blue (#3b82f6), white text, rounded-md, "Build →"
- Template pills: Small rounded pills, dark bg with border, hover:border-blue

**Template Pills:**
- chrome extension
- landing page
- invoice
- base64
- ocr
- Style: `bg-[#111] border border-[#222] rounded-full px-3 py-1 text-sm text-gray-400 hover:border-blue-500/50`

---

### Section 2: Feature Showcase

#### Headline
"Empowering projects & builders with the most powerful coding agents"

**Layout:**
- Full-width cards in bento grid
- Cards have subtle gradient borders
- Internal content: feature previews, code snippets, UI mockups

**Card Style:**
```css
background: linear-gradient(180deg, #0a0a0a 0%, #050505 100%);
border: 1px solid #222;
border-radius: 16px;
padding: 24px;
```

**Cards Content:**
1. AI Chat interface mockup (left)
2. Code generation preview (right)
3. Terminal/command output (bottom)

---

### Section 3: Stats + Design System

#### Left Card - Stats
```
┌─────────────────────────┐
│                         │
│         98%             │
│   Build without flow    │
│                         │
│  ┌─────────────────┐    │
│  │  Command palette│    │
│  │  preview        │    │
│  └─────────────────┘    │
│                         │
└─────────────────────────┘
```

#### Right Card - Design System
```
┌─────────────────────────┐
│ Built with your design  │
│ system                  │
│                         │
│ [UI Components preview] │
│                         │
│         1000x           │
│                         │
└─────────────────────────┘
```

**Style:**
- Stats: 72px font, bold, white
- Label below: 14px, gray
- Cards side by side on desktop, stacked mobile

---

### Section 4: Scale Features

#### Headline
"Everything you need to scale. Built in."

**Three Cards:**

1. **Left Card** - "Infinitely scalable infrastructure"
   - Blue wave/graph visualization
   - M-shaped blue line graphic

2. **Center Card** - Performance metric
   - "100" badge
   - Blue gradient element

3. **Right Card** - Capabilities
   - Security icon
   - "Next-level security"

**Card Layout:**
```
+-------------+-------------+-------------+
|  CARD 1     |   CARD 2    |   CARD 3    |
|  (graph)    |   (metric)  |  (security) |
+-------------+-------------+-------------+
```

---

### Section 5: Role Superpowers

#### Headline
"Whatever your role Bolt gives you superpowers"

**Bento Grid Layout (2 rows):**

**Row 1:**
- Left: Large card - "Founder" - Full startup stack
- Right: 2 stacked cards - "Product Manager" + "Designer"

**Row 2:**
- Left: Card with chart/emoji
- Center: Card with "working on laptop" visual
- Right: "Easy integrations" list

**Card Style:**
- Dark background (#0a0a0a)
- Subtle border (#222)
- Rounded corners (16px)
- Internal content: screenshots, icons, mini-charts

---

### Section 6: Final CTA

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│     "Ready to build something amazing?"                 │
│                                                         │
│     "Go from idea to production in minutes."            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  what do you want to build?        [Build →]   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Same template pills as hero]                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Section 7: Footer

```
┌─────────────────────────────────────────────────────────┐
│  bolt              Product   Resources   Company   Legal  │
│                    Editor   Docs       About      Privacy│
│                    ...      ...        ...        ...    │
├─────────────────────────────────────────────────────────┤
│  © 2026 bolt.new      [Discord] [GitHub] [X]            │
└─────────────────────────────────────────────────────────┘
```

**Style:**
- Darker background (#050505)
- 4-column link grid
- Social icons bottom right
- Small text, gray

---

### Implementation Notes for Variation 3

**Critical CSS Properties:**
```css
/* Hero Arc */
.hero-arc {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 150%;
  height: 100%;
  background: radial-gradient(ellipse at center top, 
    rgba(59, 130, 246, 0.4) 0%, 
    rgba(59, 130, 246, 0.1) 40%, 
    transparent 70%);
  pointer-events: none;
}

/* Card Glow Border */
.card-glow {
  position: relative;
  background: #0a0a0a;
  border-radius: 16px;
}
.card-glow::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(180deg, rgba(59,130,246,0.3), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
}

/* Template Pills */
.template-pill {
  background: #111;
  border: 1px solid #222;
  border-radius: 9999px;
  padding: 8px 16px;
  font-size: 14px;
  color: #888;
  transition: all 0.2s;
}
.template-pill:hover {
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
}
```

**Required Assets:**
1. bolt logo (text-based: "bolt")
2. Feature card internal graphics (can use CSS shapes initially)
3. M-shaped graph SVG
4. Security/Shield icon
5. Role-specific illustrations

**Animation Specs:**
- Arc: Subtle pulse glow (CSS animation, 4s loop)
- Cards: Fade up on scroll (0.6s ease-out)
- Pills: Hover scale 1.02
- Input: Focus ring glow (blue)

---

## Shared Components Library

### New Components to Create

1. **BentoCard** - Reusable bento grid card
   - Props: size (small/medium/large), title, description, icon, children
   - Hover: Scale + shadow lift
   - Border: Subtle gradient on hover

2. **GradientOrb** - Animated background orb
   - Props: color, size, position, animate
   - CSS: blur, opacity pulse, float animation

3. **TypingAnimation** - Typewriter effect
   - Props: text, speed, cursor
   - Used in: Hero, code demos

4. **ScrollReveal** - Intersection observer wrapper
   - Props: direction (up/down/left/right), delay
   - Used in: All sections

5. **HorizontalScroll** - Scroll snap container
   - Props: items, autoPlay
   - Used in: Features, Templates

6. **GlowButton** - Primary CTA with glow effect
   - Props: children, href, size
   - Effect: Box-shadow pulse

7. **TemplateCard** - Preview card for templates
   - Props: name, category, image, description
   - Hover: Scale + preview overlay

8. **TestimonialCard** - Social proof component
   - Props: quote, author, role, avatar, source

### Animation Specifications

```typescript
// Framer Motion variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const scaleOnHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.3 } }
};
```

---

## File Structure

```
src/
  landing-variations/
    components/
      BentoCard.tsx
      GradientOrb.tsx
      TypingAnimation.tsx
      ScrollReveal.tsx
      GlowButton.tsx
      TemplateCard.tsx
      TestimonialCard.tsx
      FeatureShowcase.tsx
    
    sections/
      HeroBento.tsx          # Variation 1
      HeroImmersive.tsx      # Variation 2
      
      FeaturesGrid.tsx       # Variation 1
      FeaturesScroll.tsx     # Variation 2
      
      HowItWorks.tsx         # Variation 2
      LiveDemo.tsx           # Both
      Templates.tsx          # Variation 1
      SocialProof.tsx        # Both
      Pricing.tsx            # Both
      FAQ.tsx                # Variation 1
      FinalCTA.tsx           # Both
    
    pages/
      LandingVariation1.tsx  # Bento Grid
      LandingVariation2.tsx  # Immersive Dark
    
    hooks/
      useScrollProgress.ts
      useInView.ts
    
    utils/
      animations.ts
```

---

## Implementation Phases

### Phase 1: Shared Components (2-3 hours)
- Create BentoCard, GlowButton, ScrollReveal
- Set up animation utilities
- Test components in isolation

### Phase 2: Variation 1 - Bento Grid (4-5 hours)
- Build HeroBento section
- Create FeaturesGrid
- Templates + Pricing sections
- Footer integration
- Responsive testing

### Phase 3: Variation 2 - Immersive Dark (4-5 hours)
- Build HeroImmersive with orbs
- Create scroll-triggered HowItWorks
- Horizontal scroll features
- Full-screen sections
- Responsive testing

### Phase 4: Integration (1 hour)
- Add routes: /v1, /v2 or /landing-a, /landing-b
- Connect to main app
- Final testing

---

## Color Palettes

### Variation 1 (Bento - Clean)
```css
--bg: #0a0a0f;
--bg-card: #12121a;
--border: #1f1f2e;
--text: #fafafa;
--text-muted: #a1a1aa;
--accent: #5063F0;
--accent-hover: #4765EE;
--gradient-start: #5063F0;
--gradient-end: #6b7ce5;
```

### Variation 2 (Immersive - Glow)
```css
--bg: #02040a;
--bg-card: #0a0f1a;
--border: rgba(80, 99, 240, 0.2);
--text: #ffffff;
--text-muted: #94a3b8;
--accent: #5063F0;
--accent-glow: rgba(80, 99, 240, 0.5);
--gradient-start: #5063F0;
--gradient-mid: #6b7ce5;
--gradient-end: #818cf8;
--orb-1: #5063F0;
--orb-2: #6b7ce5;
--orb-3: #818cf8;
```

---

## Key Design Decisions

1. **Hero headline**: Max 2 lines, 5-8 words
2. **Primary CTA**: Always visible, never hidden
3. **Input field**: Large, centered, placeholder text that inspires
4. **Trust signals**: Above fold, recognizable logos
5. **Animations**: Purposeful, not decorative - guide attention
6. **Mobile**: Both variations work on mobile, may simplify bento to stack

---

## Success Metrics

- Load time: < 3s for both variations
- Lighthouse score: > 90 for all metrics
- Responsive: Works on all screen sizes
- Accessibility: WCAG 2.1 AA compliant
- Conversion: Clear CTAs at each scroll breakpoint

---

## Next Steps

1. Get user feedback on which variation to build first
2. Approve or modify color palettes
3. Provide any specific content/copy preferences
4. Confirm if both variations should have identical content or different positioning
