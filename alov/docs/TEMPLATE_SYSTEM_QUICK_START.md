# Template System Quick Start Guide

## Overview

This guide provides a quick reference for implementing the template system in Aether.

## Files Created

### Documentation
- `docs/TEMPLATE_SYSTEM_IMPLEMENTATION_PLAN.md` - Complete implementation plan with all prompts

### Template Files (Placeholders)
- `public/templates/landing-page.html`
- `public/templates/portfolio.html`
- `public/templates/dashboard.html`
- `public/templates/ecommerce.html`
- `public/templates/blog.html`
- `public/templates/app-tool.html`
- `public/templates/agency.html`
- `public/templates/restaurant.html`
- `public/templates/README.md`

### Utility Code
- `src/lib/template-matcher.ts` - Complete template detection and slot filling logic

## Implementation Checklist

### Phase 1: Generate Templates (1-2 hours)

- [ ] Open `docs/TEMPLATE_SYSTEM_IMPLEMENTATION_PLAN.md`
- [ ] Copy PROMPT 1 and generate landing-page.html
- [ ] Copy PROMPT 2 and generate portfolio.html
- [ ] Copy PROMPT 3 and generate dashboard.html
- [ ] Copy PROMPT 4 and generate ecommerce.html
- [ ] Copy PROMPT 5 and generate blog.html
- [ ] Copy PROMPT 6 and generate app-tool.html
- [ ] Copy PROMPT 7 and generate agency.html
- [ ] Copy PROMPT 8 and generate restaurant.html
- [ ] Verify each template has all `{{SLOT}}` markers intact
- [ ] Test each template in a browser

### Phase 2: Integration (1-2 hours)

- [ ] Locate your chat API handler (likely in `src/app/api/chat/route.ts` or similar)
- [ ] Import template-matcher functions
- [ ] Add template detection logic before normal AI flow
- [ ] Test with sample prompts

### Phase 3: Testing (30 minutes)

Test with these prompts:
- [ ] "Create a landing page for a SaaS product called CloudSync"
- [ ] "Make me a portfolio site for a React developer named Sarah"
- [ ] "Build a dashboard for an analytics platform"
- [ ] "Create a product page for wireless headphones"

### Phase 4: Polish (30 minutes)

- [ ] Add UI indicator when template system is used
- [ ] Improve error handling for JSON parse failures
- [ ] Add logging for debugging
- [ ] Update user-facing documentation

## Integration Example

Here's how to integrate into your chat API:

```typescript
import { 
  detectTemplate, 
  loadTemplate, 
  extractSlots, 
  fillTemplate, 
  buildSlotFillPrompt,
  parseSlotValues 
} from '@/lib/template-matcher';

// Inside your chat handler:
export async function POST(req: Request) {
  const { message } = await req.json();
  
  // Check if message matches a template
  const templateFile = detectTemplate(message);
  
  if (templateFile) {
    // Load the template
    const templateHtml = await loadTemplate(templateFile);
    
    // Extract slot markers
    const slots = extractSlots(templateHtml);
    
    // Build minimal prompt for AI
    const slotPrompt = buildSlotFillPrompt(message, slots);
    
    // Call your AI backend (g4f/pollinations)
    const aiResponse = await callYourAIBackend(slotPrompt);
    
    // Parse the response
    const slotValues = parseSlotValues(aiResponse);
    
    // Fill the template
    const finalHtml = fillTemplate(templateHtml, slotValues);
    
    // Save to user's project
    await saveToProject('index.html', finalHtml);
    
    return Response.json({
      success: true,
      message: `Generated ${templateFile.replace('.html', '')} template`,
      usingTemplate: true
    });
  }
  
  // Fall through to normal AI flow if no template matches
  // ... existing code ...
}
```

## Testing Template Detection

```typescript
import { detectTemplate } from '@/lib/template-matcher';

// Test cases
console.log(detectTemplate("create a landing page")); // "landing-page.html"
console.log(detectTemplate("build a portfolio")); // "portfolio.html"
console.log(detectTemplate("make a dashboard")); // "dashboard.html"
console.log(detectTemplate("random request")); // null
```

## Testing Slot Extraction

```typescript
import { extractSlots } from '@/lib/template-matcher';

const template = `
  <h1>{{BRAND_NAME}}</h1>
  <p>{{HERO_HEADLINE}}</p>
  <div style="color: {{PRIMARY_COLOR}}">
`;

console.log(extractSlots(template));
// Output: ['{{BRAND_NAME}}', '{{HERO_HEADLINE}}', '{{PRIMARY_COLOR}}']
```

## Common Issues & Solutions

### Issue: Template not detected
**Solution**: Check TEMPLATE_MAP in template-matcher.ts and add more keywords

### Issue: Slots not filled
**Solution**: Verify AI response is valid JSON, check parseSlotValues() fallback logic

### Issue: Template looks broken
**Solution**: Verify all {{SLOT}} markers were preserved during generation

### Issue: AI returns markdown instead of JSON
**Solution**: The buildSlotFillPrompt() explicitly requests raw JSON, but you may need to strip markdown code blocks from the response

## Next Steps

1. Generate all 8 templates using the prompts
2. Test template-matcher.ts functions
3. Integrate into chat API
4. Test end-to-end with real user prompts
5. Monitor and iterate based on results

## Support

For detailed information, see:
- `docs/TEMPLATE_SYSTEM_IMPLEMENTATION_PLAN.md` - Full implementation plan
- `public/templates/README.md` - Template folder documentation
- `src/lib/template-matcher.ts` - Source code with inline documentation
