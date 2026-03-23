/**
 * Template Matcher Utility
 * 
 * This module handles template detection, loading, and slot filling for the Aether platform.
 * It enables weak AI backends to fill pre-built templates instead of generating entire apps.
 */

const TEMPLATE_MAP: Record<string, string> = {
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

/**
 * Detects which template to use based on keywords in the user's prompt
 * @param userPrompt - The user's request/prompt
 * @returns Template filename or null if no match found
 */
export function detectTemplate(userPrompt: string): string | null {
  const lower = userPrompt.toLowerCase();
  for (const [keyword, template] of Object.entries(TEMPLATE_MAP)) {
    if (lower.includes(keyword)) return template;
  }
  return null;
}

/**
 * Loads a template file from the public/templates directory
 * @param filename - Template filename (e.g., 'landing-page.html')
 * @returns Template HTML content as string
 */
export async function loadTemplate(filename: string): Promise<string> {
  const res = await fetch(`/templates/${filename}`);
  if (!res.ok) {
    throw new Error(`Failed to load template: ${filename}`);
  }
  return res.text();
}

/**
 * Extracts all slot markers from a template
 * Slot markers follow the format: {{SLOT_NAME}}
 * @param template - Template HTML string
 * @returns Array of unique slot marker strings (including the {{ }} delimiters)
 */
export function extractSlots(template: string): string[] {
  const matches = template.match(/\{\{[A-Z_0-9]+\}\}/g) || [];
  return [...new Set(matches)];
}

/**
 * Fills template slots with provided values
 * @param template - Template HTML string with slot markers
 * @param slots - Object mapping slot names to their values
 * @returns Template with all slots filled
 */
export function fillTemplate(template: string, slots: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(slots)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

/**
 * Builds a minimal prompt for the AI to fill template slots
 * This is the key to making weak AI backends work - they only need to fill slots, not generate code
 * @param userRequest - The user's original request
 * @param slots - Array of slot markers to fill
 * @returns Formatted prompt for the AI backend
 */
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

/**
 * Builds a fallback prompt for direct code generation when no template matches
 * Constrains output size to prevent the AI from hitting character limits mid-generation
 * @param userRequest - The user's original request
 * @returns Formatted prompt for direct HTML generation
 */
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

/**
 * Parses AI response to extract slot values
 * Handles both valid JSON and malformed responses with regex fallback
 * @param aiResponse - Raw response from AI backend
 * @returns Object mapping slot names to values
 */
export function parseSlotValues(aiResponse: string): Record<string, string> {
  let slotValues: Record<string, string> = {};
  
  try {
    // Try parsing as valid JSON first
    slotValues = JSON.parse(aiResponse);
  } catch {
    // Fallback: extract key:value pairs with regex if JSON is malformed
    const pairs = aiResponse.match(/"([A-Z_0-9]+)":\s*"([^"]+)"/g) || [];
    pairs.forEach(pair => {
      const [key, val] = pair.split('":');
      if (key && val) {
        slotValues[key.replace(/"/g, '')] = val.trim().replace(/^"|"$/g, '');
      }
    });
  }
  
  return slotValues;
}
