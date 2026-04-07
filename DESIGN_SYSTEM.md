# Aether Design System & UI Guidelines

This document defines the visual language, interface rules, and interaction patterns for Aether. Our goal is to create a world-class, professional engineering tool that feels precise, intentional, and high-performance.

## 1. Design Philosophy
- **Engineering Excellence**: The UI should reflect the precision of the code it generates. Every pixel must have a functional justification.
- **Subtlety over Spectacle**: Avoid loud gradients, excessive glows, or "AI-generated" aesthetic tropes. Use depth, borders, and typography to create hierarchy.
- **Performance-First**: Interactions must feel instantaneous. Motion should be used to guide the eye, not to hide latency.
- **Dark-Mode Native**: Aether is designed for deep-work environments. We use a sophisticated neutral palette that reduces eye strain while maintaining high legibility.

---

## 2. Typography
We use a strict dual-font system to separate interface controls from technical data.

### Primary Sans: Inter
- **Usage**: All UI labels, buttons, navigation, and body text.
- **Weights**: 
  - `400 (Regular)`: Body text and secondary labels.
  - `500 (Medium)`: Primary buttons and active states.
  - `600 (Semibold)`: Section headings.
  - `700 (Bold)`: Page titles and critical callouts.
- **Rules**:
  - Use `tracking-tight` (-0.02em) for headings above 20px.
  - Standard UI text is `14px` (0.875rem).
  - Secondary metadata is `12px` (0.75rem).

### Technical Mono: JetBrains Mono
- **Usage**: Code editor, terminal output, file paths, logs, and raw data.
- **Size**: Standardized at `12.5px` or `13px` for maximum information density without sacrificing legibility.
- **Ligatures**: Enabled for better symbol recognition in code.

---

## 3. Color System
Our palette is built on a neutral scale with a single, high-energy accent.

### 3.1. Dark Mode (Default)
- **Base Background**: `#0c0c0e` (Deep charcoal).
- **Surface (Low)**: `#161618` (Sidebars, secondary panels).
- **Surface (High)**: `#1c1c1f` (Cards, modals, active tabs).
- **Border (Subtle)**: `rgba(255, 255, 255, 0.06)` (Standard hairline border).
- **Border (Strong)**: `rgba(255, 255, 255, 0.12)` (Active inputs, dividers).

### 3.2. Pure Black Mode (OLED Optimized)
- **Base Background**: `#000000` (Absolute black).
- **Surface (Low)**: `#09090b` (Sidebars, secondary panels).
- **Surface (High)**: `#121214` (Cards, modals, active tabs).
- **Border (Subtle)**: `rgba(255, 255, 255, 0.04)` (Standard hairline border).
- **Border (Strong)**: `rgba(255, 255, 255, 0.08)` (Active inputs, dividers).

### 3.3. Light Mode (Professional)
- **Base Background**: `#f8fafc` (Slate-50).
- **Surface (Low)**: `#f1f5f9` (Slate-100).
- **Surface (High)**: `#ffffff` (White).
- **Border (Subtle)**: `rgba(0, 0, 0, 0.06)` (Standard hairline border).
- **Border (Strong)**: `rgba(0, 0, 0, 0.12)` (Active inputs, dividers).
- **Text (Primary)**: `#0f172a` (Slate-900).
- **Text (Secondary)**: `#475569` (Slate-600).

### 3.4. Accents & Semantics
- **Primary**: `hsl(221.2 83.2% 53.3%)` (Vibrant Blue). Used for primary actions and focus states.
- **Success**: Emerald-500. Used for "Saved", "Deployed", and "Success" states.
- **Warning**: Amber-500. Used for "Unsaved changes" or "Quota near limit".
- **Destructive**: Rose-500. Used for "Delete", "Stop", and "Error" states.

---

## 4. Layout & Spacing
- **The 4px Grid**: All dimensions, margins, and paddings must be multiples of 4px.
- **Bento Grid Architecture**: Use modular, self-contained cards to organize information.
- **Information Density**: Aether is a pro tool. We favor density over white space, but maintain clarity through strict alignment.
- **Border Radii**:
  - **Large Containers**: `24px` to `32px`.
  - **Components (Buttons/Inputs)**: `12px`.
  - **Small UI (Tooltips/Tags)**: `6px`.

---

## 5. Component Patterns

### Buttons
- **Primary**: Solid background, high-contrast text. No gradient. Subtle `hover:scale-[1.02]` and `active:scale-[0.98]`.
- **Secondary**: `bg-white/5` with a subtle border.
- **Ghost**: No background or border until hover. Used for secondary navigation.

### Inputs & Textareas
- **Background**: `#161618`.
- **Border**: `1px solid rgba(255, 255, 255, 0.1)`.
- **Focus State**: Border color changes to Primary, with a subtle `ring-4 ring-primary/10`.

### The "Liquid Glass" Card
- **Pattern**: `bg-white/[0.03]` + `backdrop-blur-xl` + `border-white/[0.08]`.
- **Shadow**: Use a large, soft shadow with `0 12px 48px -12px rgba(0, 0, 0, 0.5)`.

---

## 6. Motion & Interaction
- **Easing**: Use `cubic-bezier(0.4, 0, 0.2, 1)` for all transitions.
- **Duration**: 
  - Micro-interactions (hover): `150ms`.
  - Panel transitions: `300ms`.
  - Page transitions: `500ms`.
- **Feedback**: Every click must have a visual response (scale change, background shift, or haptic-like animation).

---

## 7. Iconography
Icons are functional indicators, not decorative illustrations. To avoid a "vibey" look, icons must be used with mathematical precision.

- **Library**: `Lucide React`.
- **Stroke Weight**: Always use `stroke-width={2}`. Never use "Thin" or "Light" weights, as they feel fragile and less engineered.
- **Sizing System**:
  - **Micro (Metadata/Inline)**: `14px`. Use for tags, file sizes, and inline status indicators.
  - **Standard (UI Controls)**: `18px`. The default for buttons, nav items, and input decorators.
  - **Action (Primary Buttons)**: `20px`. Used for main CTA buttons.
  - **Hero (Feature Sections)**: `24px`. Used in landing page feature grids.
- **Color Rules**:
  - **Default**: Use `text-slate-400` or `text-white/40`. Icons should never be brighter than the text they accompany unless active.
  - **Active**: Use `text-primary` or `text-white`.
  - **Semantic**: Use `text-emerald-500` (Success), `text-rose-500` (Error), or `text-amber-500` (Warning) only for status-critical icons.
- **Alignment**: Icons must be perfectly centered within their hit area. If paired with text, use a `gap-2` (8px) or `gap-3` (12px) and ensure vertical optical alignment (usually `items-center`).
- **Meaning & Selection**:
  - Use literal icons over metaphorical ones (e.g., `Folder` for directories, `FileCode` for source files).
  - Avoid "sparkle" or "magic" icons for AI features unless they represent a specific "Generate" action. Prefer `Brain`, `Cpu`, or `Terminal` for technical AI contexts.
- **Interaction**: Icons should never spin or bounce unless indicating an active background process (e.g., `Loader2` with `animate-spin`).

---

## 8. Content & Tone
- **Voice**: Professional, helpful, and concise.
- **Avoid**: "AI-speak" (e.g., "I am processing your request...").
- **Prefer**: Direct action labels (e.g., "Generating Code...", "Syncing Files...").
- **Error States**: Always provide a clear reason and a suggested next step.

---

## 9. Consistency Checklist
1. Is the font size for metadata exactly 12px?
2. Does the border color match the `rgba(255, 255, 255, 0.06)` standard?
3. Is the primary blue used sparingly for maximum impact?
4. Do all modals have a `backdrop-blur` background?
5. Is the "Liquid Glass" effect applied consistently to all floating panels?
