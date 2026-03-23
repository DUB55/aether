# Template System Integration Example

This document provides a complete example of how to integrate the template system into Aether's existing chat API.

## Current Chat API Structure

Your chat API is likely located at `src/app/api/chat/route.ts` or similar. The current flow probably looks like:

```typescript
// Current flow (simplified)
export async function POST(req: Request) {
  const { message, projectId } = await req.json();
  
  // Call AI backend with full prompt
  const aiResponse = await callAIBackend(message);
  
  // Save generated code
  await saveToProject(projectId, aiResponse);
  
  return Response.json({ success: true });
}
```

## Enhanced Flow with Template System

Here's the complete enhanced version:

```typescript
import { 
  detectTemplate, 
  loadTemplate, 
  extractSlots, 
  fillTemplate, 
  buildSlotFillPrompt,
  buildDirectCodePrompt,
  parseSlotValues 
} from '@/lib/template-matcher';

export async function POST(req: Request) {
  const { message, projectId } = await req.json();
  
  // STEP 1: Check if message matches a template
  const templateFile = detectTemplate(message);
  
  if (templateFile) {
    console.log(`✨ Using template: ${templateFile}`);
    
    try {
      // STEP 2: Load the template
      const templateHtml = await loadTemplate(templateFile);
      
      // STEP 3: Extract slot markers
      const slots = extractSlots(templateHtml);
      console.log(`Found ${slots.length} slots to fill`);
      
      // STEP 4: Build minimal prompt for AI
      const slotPrompt = buildSlotFillPrompt(message, slots);
      
      // STEP 5: Call AI backend with SHORT prompt
      const aiResponse = await callAIBackend(slotPrompt);
      
      // STEP 6: Parse the JSON response
      const slotValues = parseSlotValues(aiResponse);
      
      // STEP 7: Fill the template
      const finalHtml = fillTemplate(templateHtml, slotValues);
      
      // STEP 8: Save to user's project
      await saveToProject(projectId, 'index.html', finalHtml);
      
      return Response.json({
        success: true,
        message: `I've generated your ${templateFile.replace('.html', '')} using a professional template and customized it for your request. Open the preview to see it!`,
        usingTemplate: true,
        templateUsed: templateFile,
        slotsFilled: Object.keys(slotValues).length
      });
      
    } catch (error) {
      console.error('Template system error:', error);
      // Fall through to normal flow on error
    }
  }
  
  // STEP 9: Fallback to normal AI flow if no template or error
  console.log('Using direct code generation');
  const directPrompt = buildDirectCodePrompt(message);
  const aiResponse = await callAIBackend(directPrompt);
  
  // Clean up response (remove markdown if present)
  const cleanedCode = aiResponse
    .replace(/```html\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  await saveToProject(projectId, 'index.html', cleanedCode);
  
  return Response.json({
    success: true,
    message: 'Generated your custom page',
    usingTemplate: false
  });
}
```

## Handling Different AI Backends

### For g4f

```typescript
async function callAIBackend(prompt: string): Promise<string> {
  const response = await fetch('https://api.g4f.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}
```

### For Pollinations

```typescript
async function callAIBackend(prompt: string): Promise<string> {
  const response = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai'
    })
  });
  
  return response.text();
}
```

## UI Integration

### Add Template Indicator in Chat

```typescript
// In your chat component
{message.usingTemplate && (
  <div className="flex items-center gap-2 text-sm text-purple-400 mb-2">
    <Sparkles className="w-4 h-4" />
    <span>Using template system</span>
  </div>
)}
```

### Show Template Selection (Optional)

```typescript
// Let users manually choose templates
const TEMPLATE_OPTIONS = [
  { value: 'landing-page.html', label: 'Landing Page', icon: '🚀' },
  { value: 'portfolio.html', label: 'Portfolio', icon: '💼' },
  { value: 'dashboard.html', label: 'Dashboard', icon: '📊' },
  { value: 'ecommerce.html', label: 'E-commerce', icon: '🛍️' },
  { value: 'blog.html', label: 'Blog', icon: '📝' },
  { value: 'app-tool.html', label: 'App/Tool', icon: '🔧' },
  { value: 'agency.html', label: 'Agency', icon: '🎨' },
  { value: 'restaurant.html', label: 'Restaurant', icon: '🍽️' },
];

// In your UI
<Select onValueChange={setSelectedTemplate}>
  {TEMPLATE_OPTIONS.map(opt => (
    <SelectItem key={opt.value} value={opt.value}>
      {opt.icon} {opt.label}
    </SelectItem>
  ))}
</Select>
```

## Error Handling

### Robust Error Handling

```typescript
try {
  const templateHtml = await loadTemplate(templateFile);
  const slots = extractSlots(templateHtml);
  
  if (slots.length === 0) {
    throw new Error('No slots found in template');
  }
  
  const slotPrompt = buildSlotFillPrompt(message, slots);
  const aiResponse = await callAIBackend(slotPrompt);
  
  if (!aiResponse || aiResponse.trim().length === 0) {
    throw new Error('Empty AI response');
  }
  
  const slotValues = parseSlotValues(aiResponse);
  
  if (Object.keys(slotValues).length === 0) {
    throw new Error('Failed to parse slot values');
  }
  
  const finalHtml = fillTemplate(templateHtml, slotValues);
  
  // Verify HTML is valid
  if (!finalHtml.includes('<!DOCTYPE html>')) {
    throw new Error('Invalid HTML generated');
  }
  
  await saveToProject(projectId, 'index.html', finalHtml);
  
  return Response.json({ success: true, usingTemplate: true });
  
} catch (error) {
  console.error('Template system error:', error);
  
  // Log for debugging
  await logError({
    type: 'template_system_error',
    templateFile,
    message: error.message,
    userPrompt: message
  });
  
  // Fall back to direct generation
  return generateDirectly(message, projectId);
}
```

## Testing the Integration

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { detectTemplate, extractSlots, fillTemplate } from '@/lib/template-matcher';

describe('Template System', () => {
  it('should detect landing page template', () => {
    expect(detectTemplate('create a landing page')).toBe('landing-page.html');
    expect(detectTemplate('build a saas site')).toBe('landing-page.html');
  });
  
  it('should extract slots from template', () => {
    const template = '<h1>{{TITLE}}</h1><p>{{DESCRIPTION}}</p>';
    const slots = extractSlots(template);
    expect(slots).toEqual(['{{TITLE}}', '{{DESCRIPTION}}']);
  });
  
  it('should fill template slots', () => {
    const template = '<h1>{{TITLE}}</h1>';
    const result = fillTemplate(template, { TITLE: 'Hello World' });
    expect(result).toBe('<h1>Hello World</h1>');
  });
});
```

### Integration Tests

```typescript
describe('Chat API with Templates', () => {
  it('should use template for landing page request', async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'create a landing page for my startup',
        projectId: 'test-123'
      })
    });
    
    const data = await response.json();
    expect(data.usingTemplate).toBe(true);
    expect(data.templateUsed).toBe('landing-page.html');
  });
  
  it('should fall back to direct generation for unknown requests', async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'create something weird',
        projectId: 'test-123'
      })
    });
    
    const data = await response.json();
    expect(data.usingTemplate).toBe(false);
  });
});
```

## Performance Optimization

### Cache Templates

```typescript
const templateCache = new Map<string, string>();

export async function loadTemplate(filename: string): Promise<string> {
  if (templateCache.has(filename)) {
    return templateCache.get(filename)!;
  }
  
  const res = await fetch(`/templates/${filename}`);
  const content = await res.text();
  
  templateCache.set(filename, content);
  return content;
}
```

### Preload Templates on Server Start

```typescript
// In your server initialization
const TEMPLATE_FILES = [
  'landing-page.html',
  'portfolio.html',
  'dashboard.html',
  'ecommerce.html',
  'blog.html',
  'app-tool.html',
  'agency.html',
  'restaurant.html'
];

async function preloadTemplates() {
  await Promise.all(
    TEMPLATE_FILES.map(file => loadTemplate(file))
  );
  console.log('✅ Templates preloaded');
}

// Call on server start
preloadTemplates();
```

## Monitoring & Analytics

### Track Template Usage

```typescript
// Track which templates are most popular
const templateUsageStats = {
  'landing-page.html': 0,
  'portfolio.html': 0,
  // ... etc
};

function trackTemplateUsage(templateFile: string) {
  templateUsageStats[templateFile]++;
  
  // Log to analytics service
  analytics.track('template_used', {
    template: templateFile,
    timestamp: Date.now()
  });
}
```

### Monitor Success Rate

```typescript
const metrics = {
  templateSuccess: 0,
  templateFailure: 0,
  directSuccess: 0,
  directFailure: 0
};

function recordMetric(type: keyof typeof metrics) {
  metrics[type]++;
  
  // Log every 100 requests
  const total = Object.values(metrics).reduce((a, b) => a + b, 0);
  if (total % 100 === 0) {
    console.log('Template System Metrics:', metrics);
  }
}
```

## Next Steps

1. Copy the enhanced POST handler into your chat API route
2. Test with various prompts
3. Monitor error logs and success rates
4. Iterate on template detection keywords
5. Add UI indicators for better UX
6. Implement caching for production

## Troubleshooting

### Templates not loading
- Check that files exist in `public/templates/`
- Verify fetch path is correct (`/templates/` not `/public/templates/`)

### Slots not being filled
- Log the AI response to see what format it's returning
- Check parseSlotValues() is handling the response format
- Verify slot names match exactly (case-sensitive)

### Poor quality output
- Review the buildSlotFillPrompt() instructions
- Add more specific constraints for your use case
- Consider post-processing slot values (trim, validate, etc.)
