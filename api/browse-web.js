// API endpoint for web browsing
// Fetches web content for AI analysis and research

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    // Validate URL
    let validUrl
    try {
      validUrl = new URL(url)
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' })
    }

    // Fetch web content
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AetherAI/1.0; +https://aether.dev)',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
    }

    const text = await response.text()

    // Extract main content (simple extraction - in production use proper HTML parsing)
    const content = text
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000) // Limit to 10k characters

    return res.status(200).json({
      content,
      url: validUrl.toString(),
      title: extractTitle(text),
      length: content.length
    })
  } catch (error) {
    console.error('Web browsing error:', error)
    return res.status(500).json({ error: error.message || 'Failed to fetch web content' })
  }
}

function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return titleMatch ? titleMatch[1].trim() : 'Untitled'
}
