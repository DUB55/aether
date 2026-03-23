# Phase 1: The "Liquid" Design System (Visual Polish)

**Objective:** Create a visceral, "magical" user interface that feels alive. We will move away from standard flat design to a multi-layered, glassmorphic aesthetic with fluid animations.

## 1.1 Design System Foundation (`globals.css` & `tailwind.config`)
- [ ] **Define Color Palette:**
    - Background: Deep void black (`#030303`) instead of gray.
    - Surface: Translucent glass layers (`rgba(255,255,255,0.03)`).
    - Accents: Subtle gradients rather than flat colors.
- [ ] **Typography:**
    - Integrate `Geist Sans` (or similar premium font).
    - Optimize line-heights and letter-spacing for code readability.
- [ ] **Glassmorphism Utilities:**
    - Create `.glass` utility: `backdrop-filter: blur(12px)`, `border: 1px solid rgba(255,255,255,0.08)`.
    - Create `.glass-hover` effects.

## 1.2 Micro-Interactions (Framer Motion)
- [ ] **Page Transitions:** Smooth cross-dissolve between routes.
- [ ] **Component Entry:** Spring-based animations for modals, dropdowns, and panels.
- [ ] **Button States:** Scale down on click, glow on hover.

## 1.3 Component Refinement
- [ ] **Layout (`layout.tsx`):** Apply the new global background and font.
- [ ] **Navbar:** Convert to a floating glass header.
- [ ] **Terminal:** Style xterm.js to blend with the glass theme (custom scrollbars, padding).
- [x] **Editor:** Customize Monaco theme to match the new palette.

## Detailed Progress
- [x] **Step 1:** Update `globals.css` with new variables.
- [x] **Step 2:** Configure Tailwind to use new variables.
- [x] **Step 3:** Apply global styles to `layout.tsx`.
- [x] **Step 4:** Refactor `Navbar` to be "Liquid Glass".
- [x] **Step 5:** Refactor `TerminalPanel` to use "Liquid Glass" theme.
- [x] **Step 6:** Refactor `Editor` to use "Liquid Glass" theme (transparent Monaco).
