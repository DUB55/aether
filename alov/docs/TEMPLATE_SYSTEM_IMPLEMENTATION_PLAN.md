# Template System Implementation Plan

## Overview

This document outlines the complete strategy for implementing a template-based system in Aether to work around limitations of weak AI backends (g4f/pollinations). The core principle: pre-built templates with slot markers that the AI fills in, rather than generating entire applications from scratch.

## The Core Strategy

The bad AI backend (g4f/pollinations) can't handle complex prompts or large contexts. The fix: pre-built templates with clear slot markers. The AI only needs to fill in small pieces, not architect entire apps from scratch.

### How It Works

1. Your coding AI IDE generates beautiful, complete templates
2. Templates have `{{SLOT_NAME}}` markers where the bad AI fills in content
3. The bad AI gets a short, focused prompt: "fill in these slots based on: [user request]"
4. Aether injects the filled slots into the template

---

## Phase 1: Templates to Generate

You need 8 template categories. Below is every prompt, ready to use.

### PROMPT 1 — Landing Page Template

```
Create a complete, stunning single-file HTML landing page template for a SaaS/startup product.

Requirements:
- Fully self-contained: all CSS in <style>, all JS in <script>
- Modern glassmorphism + gradient design, dark theme
- Sections: hero, features (3 cards), social proof/stats, CTA, footer
- Smooth scroll animations using Intersection Observer (no external libs)
- Responsive mobile-first
- Uses CSS custom properties for easy theming

Replace ALL specific content with these EXACT slot markers (keep the markers literally in the file):
- {{PRIMARY_COLOR}} — main brand color hex (used in CSS variables)
- {{SECONDARY_COLOR}} — accent color hex
- {{BRAND_NAME}} — company/product name
- {{HERO_HEADLINE}} — main hero headline
- {{HERO_SUBHEADLINE}} — hero supporting text
- {{HERO_CTA_TEXT}} — primary CTA button text
- {{FEATURE_1_TITLE}}, {{FEATURE_1_DESC}}
- {{FEATURE_2_TITLE}}, {{FEATURE_2_DESC}}
- {{FEATURE_3_TITLE}}, {{FEATURE_3_DESC}}
- {{STAT_1_NUMBER}}, {{STAT_1_LABEL}}
- {{STAT_2_NUMBER}}, {{STAT_2_LABEL}}
- {{STAT_3_NUMBER}}, {{STAT_3_LABEL}}
- {{FOOTER_TAGLINE}}

Make it visually exceptional — the kind of page that wins design awards.
Output only the complete HTML file.
```

### PROMPT 2 — Portfolio Template

```
Create a complete single-file HTML personal portfolio template for a developer/designer.

Requirements:
- Fully self-contained: all CSS in <style>, all JS in <script>
- Aesthetic: minimal, elegant, dark bg with subtle grid or noise texture, neon accent
- Sections: nav, hero with typed-text effect (vanilla JS), about, skills (animated bars or tags), projects grid (6 cards), contact form (UI only, no backend)
- Smooth page transitions and hover effects
- Responsive

Replace ALL specific content with these EXACT slot markers:
- {{ACCENT_COLOR}} — neon accent color
- {{OWNER_NAME}} — person's name
- {{OWNER_TITLE}} — e.g. "Full Stack Developer"
- {{OWNER_BIO}} — 2-sentence bio
- {{TYPED_STRINGS}} — comma-separated strings for the typing animation e.g. "I build things,I design stuff"
- {{SKILL_1}} through {{SKILL_8}} — skill tag names
- {{PROJECT_1_TITLE}}, {{PROJECT_1_DESC}}, {{PROJECT_1_TAGS}}
- {{PROJECT_2_TITLE}}, {{PROJECT_2_DESC}}, {{PROJECT_2_TAGS}}
- {{PROJECT_3_TITLE}}, {{PROJECT_3_DESC}}, {{PROJECT_3_TAGS}}
- {{CONTACT_EMAIL}}

Output only the complete HTML file with slot markers intact.
```

### PROMPT 3 — Dashboard/Admin Template

```
Create a complete single-file HTML admin dashboard template.

Requirements:
- Fully self-contained (no external dependencies)
- Layout: fixed sidebar nav + main content area with top bar
- Dark theme, professional, like Linear or Vercel's dashboard
- Components included: sidebar with nav items, stats row (4 cards), a bar chart (drawn with pure CSS or canvas vanilla JS), a recent activity table, a line chart
- Sidebar collapsible on mobile
- All charts use vanilla JS only — no Chart.js or any library

Replace ALL specific content with slot markers:
- {{BRAND_NAME}} — dashboard product name
- {{PRIMARY_COLOR}} — sidebar/accent color
- {{NAV_ITEM_1}} through {{NAV_ITEM_5}} — sidebar navigation labels
- {{STAT_1_LABEL}}, {{STAT_1_VALUE}}, {{STAT_1_CHANGE}}
- {{STAT_2_LABEL}}, {{STAT_2_VALUE}}, {{STAT_2_CHANGE}}
- {{STAT_3_LABEL}}, {{STAT_3_VALUE}}, {{STAT_3_CHANGE}}
- {{STAT_4_LABEL}}, {{STAT_4_VALUE}}, {{STAT_4_CHANGE}}
- {{PAGE_TITLE}} — main content area heading
- {{TABLE_HEADER_1}}, {{TABLE_HEADER_2}}, {{TABLE_HEADER_3}}, {{TABLE_HEADER_4}}

Output only the complete HTML file.
```

### PROMPT 4 — E-commerce / Product Page Template

```
Create a complete single-file HTML e-commerce product showcase page.

Requirements:
- Self-contained, no external dependencies
- Sections: sticky nav with cart icon, hero product display (large image area using CSS gradients as placeholder), product details + buy section, features grid, reviews section (3 reviews), footer
- Premium aesthetic — think Apple product page vibes
- Add to cart button with satisfying click animation (vanilla JS)
- Responsive

Slot markers:
- {{BRAND_NAME}}
- {{PRIMARY_COLOR}}, {{SECONDARY_COLOR}}
- {{PRODUCT_NAME}}
- {{PRODUCT_TAGLINE}}
- {{PRODUCT_PRICE}}
- {{PRODUCT_DESCRIPTION}} — 2-3 sentences
- {{FEATURE_1_TITLE}}, {{FEATURE_1_DESC}}
- {{FEATURE_2_TITLE}}, {{FEATURE_2_DESC}}
- {{FEATURE_3_TITLE}}, {{FEATURE_3_DESC}}
- {{FEATURE_4_TITLE}}, {{FEATURE_4_DESC}}
- {{REVIEW_1_AUTHOR}}, {{REVIEW_1_TEXT}}, {{REVIEW_1_RATING}}
- {{REVIEW_2_AUTHOR}}, {{REVIEW_2_TEXT}}, {{REVIEW_2_RATING}}

Output only the complete HTML file.
```

### PROMPT 5 — Blog / Content Site Template

```
Create a complete single-file HTML blog/content site template.

Requirements:
- Self-contained
- Aesthetic: clean editorial, like Medium meets Substack — light and dark mode toggle (vanilla JS)
- Sections: header with nav + dark mode toggle, hero post (large featured), article grid (6 cards), newsletter signup section (UI only), footer
- Typography-first design with beautiful font sizing hierarchy (use system fonts or Google Fonts via @import)
- Smooth dark/light transition

Slot markers:
- {{BLOG_NAME}}
- {{BLOG_TAGLINE}}
- {{ACCENT_COLOR}}
- {{FEATURED_POST_TITLE}}, {{FEATURED_POST_EXCERPT}}, {{FEATURED_POST_CATEGORY}}, {{FEATURED_POST_DATE}}
- {{POST_1_TITLE}}, {{POST_1_EXCERPT}}, {{POST_1_CATEGORY}}, {{POST_1_DATE}}
- {{POST_2_TITLE}}, {{POST_2_EXCERPT}}, {{POST_2_CATEGORY}}, {{POST_2_DATE}}
- {{POST_3_TITLE}}, {{POST_3_EXCERPT}}, {{POST_3_CATEGORY}}, {{POST_3_DATE}}
- {{NEWSLETTER_HEADLINE}}
- {{NEWSLETTER_SUBTEXT}}

Output only the complete HTML file.
```

### PROMPT 6 — App/Tool Landing Page (Interactive)

```
Create a complete single-file HTML interactive app landing page template.

Requirements:
- Self-contained
- Must include a working interactive demo widget IN the page itself — e.g. a fake "try it now" section where the user types input and sees a simulated AI/tool response (vanilla JS, fully fake/mocked)
- Sections: nav, hero with animated background (CSS particles or gradient animation), interactive demo section, pricing (3 tiers), FAQ accordion (vanilla JS), CTA, footer
- Modern SaaS aesthetic, dark theme with vivid gradients

Slot markers:
- {{BRAND_NAME}}, {{PRIMARY_COLOR}}, {{SECONDARY_COLOR}}
- {{HERO_HEADLINE}}, {{HERO_SUBHEADLINE}}
- {{TOOL_DESCRIPTION}} — what the tool does, used in demo placeholder text
- {{DEMO_PLACEHOLDER}} — input placeholder text for interactive demo
- {{DEMO_SAMPLE_OUTPUT}} — sample output shown in demo
- {{PLAN_1_NAME}}, {{PLAN_1_PRICE}}, {{PLAN_1_FEATURES}} — comma-separated
- {{PLAN_2_NAME}}, {{PLAN_2_PRICE}}, {{PLAN_2_FEATURES}}
- {{PLAN_3_NAME}}, {{PLAN_3_PRICE}}, {{PLAN_3_FEATURES}}
- {{FAQ_1_Q}}, {{FAQ_1_A}}
- {{FAQ_2_Q}}, {{FAQ_2_A}}
- {{FAQ_3_Q}}, {{FAQ_3_A}}

Output only the complete HTML file.
```

### PROMPT 7 — Agency / Creative Studio Template

```
Create a complete single-file HTML creative agency/studio template.

Requirements:
- Self-contained
- Bold, award-winning design aesthetic — heavy typography, large text, horizontal scroll section or sticky scroll effect (vanilla JS)
- Sections: full-screen nav overlay (hamburger menu, vanilla JS), hero with large animated headline, services (4 items), work showcase (6 project cards with hover overlay), team (3 members), contact section, footer
- Cursor custom effect (subtle, not annoying)
- Monochrome base with one vivid accent color

Slot markers:
- {{AGENCY_NAME}}, {{ACCENT_COLOR}}
- {{HERO_LINE_1}}, {{HERO_LINE_2}} — two lines of hero text
- {{AGENCY_TAGLINE}}
- {{SERVICE_1_TITLE}}, {{SERVICE_1_DESC}}
- {{SERVICE_2_TITLE}}, {{SERVICE_2_DESC}}
- {{SERVICE_3_TITLE}}, {{SERVICE_3_DESC}}
- {{SERVICE_4_TITLE}}, {{SERVICE_4_DESC}}
- {{WORK_1_TITLE}}, {{WORK_1_CATEGORY}}
- {{WORK_2_TITLE}}, {{WORK_2_CATEGORY}}
- {{WORK_3_TITLE}}, {{WORK_3_CATEGORY}}
- {{TEAM_1_NAME}}, {{TEAM_1_ROLE}}
- {{TEAM_2_NAME}}, {{TEAM_2_ROLE}}
- {{TEAM_3_NAME}}, {{TEAM_3_ROLE}}
- {{CONTACT_EMAIL}}

Output only the complete HTML file.
```

### PROMPT 8 — Restaurant / Local Business Template

```
Create a complete single-file HTML restaurant/local business template.

Requirements:
- Self-contained
- Warm, premium feel — think high-end restaurant website
- Sections: sticky nav, full-screen hero with background gradient (as image placeholder), about section, menu section (3 categories, 3 items each), gallery grid (CSS gradient placeholders styled as food photos), reservation form (UI only), footer
- Parallax effect on hero (CSS only or minimal JS)
- Elegant serif/sans-serif font pairing via Google Fonts @import

Slot markers:
- {{RESTAURANT_NAME}}, {{RESTAURANT_TAGLINE}}
- {{PRIMARY_COLOR}}, {{ACCENT_COLOR}}
- {{ABOUT_TEXT}} — 2-3 sentences
- {{MENU_CAT_1}}, {{MENU_CAT_2}}, {{MENU_CAT_3}} — category names
- {{MENU_ITEM_1_NAME}}, {{MENU_ITEM_1_DESC}}, {{MENU_ITEM_1_PRICE}}
- {{MENU_ITEM_2_NAME}}, {{MENU_ITEM_2_DESC}}, {{MENU_ITEM_2_PRICE}}
- {{MENU_ITEM_3_NAME}}, {{MENU_ITEM_3_DESC}}, {{MENU_ITEM_3_PRICE}}
- {{MENU_ITEM_4_NAME}}, {{MENU_ITEM_4_DESC}}, {{MENU_ITEM_4_PRICE}}
- {{MENU_ITEM_5_NAME}}, {{MENU_ITEM_5_DESC}}, {{MENU_ITEM_5_PRICE}}
- {{MENU_ITEM_6_NAME}}, {{MENU_ITEM_6_DESC}}, {{MENU_ITEM_6_PRICE}}
- {{PHONE}}, {{ADDRESS}}, {{HOURS}}

Output only the complete HTML file.
```

---

## Phase 2: How to Wire It Into Aether

### Step 1 — Store the Templates

After your IDE generates the 8 HTML files, save them in your Aether repo:

```
/public/templates/
  landing-page.html
  portfolio.html
  dashboard.html
  ecommerce.html
  blog.html
  app-tool.html
  agency.html
  restaurant.html
```

### Step 2 — Template Detector Utility

Create `/src/lib/template-matcher.ts`:

```typescript
const TEMPLATE_MAP = {
  'landing': 'landing-page.html',
  'saas': 'landing-page.html',
  'startup': 'landing-page.html',
  'portfolio': 'portfolio.html',
  'developer': 'portfolio.html',
  'resume': 'portfolio.html',
  'dashboard': 'dashboard.html',
  'admin': 'dashboard.html',
  'analytics': 'dashboard.html',
  'shop': 'ecommerce.html',
  'store': 'ecommerce.html',
  'product': 'ecommerce.html',
  'blog': 'blog.html',
  'magazine': 'blog.html',
  'news': 'blog.html',
  'tool': 'app-tool.html',
  'app': 'app-tool.html',
  'pricing': 'app-tool.html',
  'agency': 'agency.html',
  'studio': 'agency.html',
  'creative': 'agency.html',
  'restaurant': 'restaurant.html',
  'cafe': 'restaurant.html',
  'food': 'restaurant.html',
  'business': 'restaurant.html',
};

export function detectTemplate(userPrompt: string): string | null {
  const lower = userPrompt.toLowerCase();
  for (const [keyword, template] of Object.entries(TEMPLATE_MAP)) {
    if (lower.includes(keyword)) return template;
  }
  return null;
}

export async function loadTemplate(filename: string): Promise<string> {
  const res = await fetch(`/templates/${filename}`);
  return res.text();
}

export function extractSlots(template: string): string[] {
  const matches = template.match(/\{\{[A-Z_0-9]+\}\}/g) || [];
  return [...new Set(matches)];
}

export function fillTemplate(template: string, slots: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(slots)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}
```

### Step 3 — The Short AI Prompt

This is the key piece. The AI backend only needs to fill slots, not write code. Create a function that builds a minimal prompt:

```typescript
export function buildSlotFillPrompt(userRequest: string, slots: string[]): string {
  return `You are a JSON generator. Given a website request, output ONLY a valid JSON object filling these slots.

Request: "${userRequest}"

Slots to fill:
${slots.join('\n')}

Rules:
- Output ONLY raw JSON, no markdown, no explanation
- Keep values short and punchy (headlines max 8 words, descriptions max 20 words)
- Make content match the request theme
- For colors use hex codes like #6366f1

JSON:`;
}
```

The AI backend goes from being asked "build me an entire app" (which it fails at) to "fill in these 15 text fields as JSON" — which even weak models handle well.

### Step 4 — Wire It Into the Chat Flow

In your existing chat API handler (wherever you call g4f/pollinations), add this logic before the normal flow:

```typescript
import { detectTemplate, loadTemplate, extractSlots, fillTemplate, buildSlotFillPrompt } from '@/lib/template-matcher';

// Inside your chat handler:
const templateFile = detectTemplate(userMessage);

if (templateFile) {
  const templateHtml = await loadTemplate(templateFile);
  const slots = extractSlots(templateHtml);
  const slotPrompt = buildSlotFillPrompt(userMessage, slots);
  
  // Call your AI backend with the SHORT slot prompt
  const aiResponse = await callAIBackend(slotPrompt);
  
  // Parse the JSON
  let slotValues: Record<string, string> = {};
  try {
    slotValues = JSON.parse(aiResponse);
  } catch {
    // Fallback: extract key:value pairs with regex if JSON is malformed
    const pairs = aiResponse.match(/"([A-Z_]+)":\s*"([^"]+)"/g) || [];
    pairs.forEach(pair => {
      const [key, val] = pair.split('":');
      slotValues[key.replace('"', '')] = val.trim().replace(/^"|"$/g, '');
    });
  }
  
  const finalHtml = fillTemplate(templateHtml, slotValues);
  
  // Create the file in the user's project
  await createFile('index.html', finalHtml);
  return `I've generated your ${templateFile.replace('.html','')} using a professional template and customized it for your request. Open the preview to see it!`;
}

// Otherwise fall through to normal AI flow
```

---

## Phase 3: Today's Execution Order

Do these in order, each step is ~1-2 hours:

1. **Morning (setup)**: Run all 8 prompts in your AI IDE, save the output HTML files into `/public/templates/`. Verify each one looks beautiful in a browser and all `{{SLOT}}` markers are present.

2. **Midday (code)**: Create `template-matcher.ts` with the 4 functions above. Test `extractSlots()` on one of your templates to confirm it picks up all markers.

3. **Afternoon (integration)**: Wire the detection + fill logic into your existing chat API route. Test with prompts like "make me a portfolio site for a React developer named Sarah" and check the preview.

4. **Evening (polish)**: Add a small UI indicator in Aether's chat saying "✨ Using template system" when a template is detected. Handle the JSON parse failure fallback gracefully so the page never breaks.

---

## Fallback for When No Template Matches

Keep the existing AI flow as-is. But improve its prompt slightly to constrain output size:

```typescript
export function buildDirectCodePrompt(userRequest: string): string {
  return `Create a single self-contained HTML file for: "${userRequest}"

Rules:
- Output ONLY the HTML, starting with <!DOCTYPE html>
- All CSS in <style>, all JS in <script>
- Dark modern design, mobile responsive
- Keep total output under 200 lines
- No external dependencies except Google Fonts

HTML:`;
}
```

The "under 200 lines" constraint prevents the model from running into its character limit mid-output, which is what causes broken code today.

---

## Summary

This template system transforms Aether from relying on weak AI to generate entire apps (which fails) to using weak AI to fill in pre-built, professionally designed templates (which succeeds). The templates are generated once by a strong AI IDE, then reused infinitely with slot-filling by the weak backend.
