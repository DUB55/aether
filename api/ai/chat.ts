import { MultiProviderService } from '../../server/multi-provider-service';

// Initialize the multi-provider service
const multiProviderService = new MultiProviderService();

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { input, history, personality, thinking_mode, provider, model, custom_api_key, files, image } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }

    console.log('[Vercel AI] Request received:', { input: input.substring(0, 50), hasHistory: !!history, provider, model });

    // Set headers for SSE
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    });

    // Send a heartbeat every 15 seconds to keep the connection alive
    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 15000);

    await multiProviderService.chat({
      input,
      history: history || [],
      personality,
      thinking_mode,
      forceProvider: provider === "dub5" ? undefined : provider,
      model,
      customApiKey: custom_api_key,
      files,
      image,
      onProvider: (providerName, model) => {
        console.log('[Vercel AI] Using provider:', providerName, 'model:', model);
        res.write(`data: ${JSON.stringify({ provider: providerName, model })}\n\n`);
      },
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
    });

    clearInterval(heartbeat);
    res.write("data: [DONE]\n\n");
    res.end();

  } catch (error) {
    console.error('[Vercel AI] Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
}
