# Aether Template System

This folder contains pre-built HTML templates with slot markers for the Aether platform.

## Purpose

These templates solve the problem of weak AI backends (g4f/pollinations) that can't generate complete applications from scratch. Instead, the AI only fills in slot markers like `{{BRAND_NAME}}` with appropriate content.

## Template Files

1. **landing-page.html** - SaaS/startup landing page with glassmorphism design
2. **portfolio.html** - Developer/designer portfolio with typed text effect
3. **dashboard.html** - Admin dashboard with charts and stats
4. **ecommerce.html** - Product showcase page with Apple-like aesthetic
5. **blog.html** - Editorial blog/content site with dark mode toggle
6. **app-tool.html** - Interactive app landing page with demo widget
7. **agency.html** - Creative agency/studio with bold typography
8. **restaurant.html** - Restaurant/local business with menu sections

## How to Generate Templates

Each template file is currently a placeholder. To generate the actual templates:

1. Open your AI IDE (Kiro or similar)
2. Use the prompts from `docs/TEMPLATE_SYSTEM_IMPLEMENTATION_PLAN.md`
3. Copy each PROMPT (1-8) and paste into your AI IDE
4. Save the generated HTML output to the corresponding file in this folder
5. Verify all `{{SLOT_NAME}}` markers are preserved in the output

## Slot Marker Format

All slot markers follow this format: `{{SLOT_NAME}}`

Examples:
- `{{BRAND_NAME}}` - Company or product name
- `{{PRIMARY_COLOR}}` - Main brand color (hex code)
- `{{HERO_HEADLINE}}` - Main headline text
- `{{FEATURE_1_TITLE}}` - Feature title

## Integration

These templates are used by:
- `/src/lib/template-matcher.ts` - Template detection and slot filling logic
- Chat API routes - Automatically detect when to use templates vs. direct AI generation

## Testing

After generating templates, test them by:
1. Opening each HTML file in a browser
2. Verifying the design looks professional
3. Checking that all slot markers are present (search for `{{`)
4. Testing responsive behavior on mobile/desktop

## Next Steps

See `docs/TEMPLATE_SYSTEM_IMPLEMENTATION_PLAN.md` for the complete implementation guide.
