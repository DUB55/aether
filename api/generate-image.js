// API endpoint for AI image generation
// This endpoint integrates with OpenAI's DALL-E API for image generation

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, size = '1024x1024', quality = 'standard' } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  try {
    // Get OpenAI API key from environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY

    // Try OpenAI DALL-E API first
    if (openaiApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: size,
            quality: quality,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const imageUrl = data.data[0].url
          return res.status(200).json({ imageUrl, provider: 'openai' })
        } else {
          const errorData = await response.json()
          console.warn('OpenAI API failed, falling back to Pollinations:', errorData.error?.message)
        }
      } catch (openaiError) {
        console.warn('OpenAI API error, falling back to Pollinations:', openaiError.message)
      }
    }

    // Fallback to Pollinations AI (free, no API key required)
    const encodedPrompt = encodeURIComponent(prompt)
    const [width, height] = size.split('x').map(Number) || [1024, 1024]
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${Math.random()}`
    
    console.log('Using Pollinations AI fallback for image generation')
    return res.status(200).json({ imageUrl: pollinationsUrl, provider: 'pollinations' })
  } catch (error) {
    console.error('Image generation error:', error)
    return res.status(500).json({ error: error.message || 'Failed to generate image' })
  }
}
