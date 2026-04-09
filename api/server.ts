import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GeminiService } from "./gemini-service";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Pool
const geminiKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);

if (geminiKeys.length === 0) {
  console.warn("WARNING: No Gemini API keys configured. AI service will not work. Please set GEMINI_API_KEYS environment variable (comma-separated, no spaces). GEMINI_API_KEY is also supported as fallback.");
}

const geminiService = new GeminiService(geminiKeys);

async function startServer() {
  const app = express();
  const PORT = process.argv.includes('--port') ? 
    parseInt(process.argv[process.argv.indexOf('--port') + 1]) : 3000;

  // WebContainer Security Headers
  app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    next();
  });

  app.use(express.json());

  // Proxy endpoint for Google profile images to bypass COEP blocking
  app.get("/api/proxy/image", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).send('URL parameter is required');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).send('Failed to fetch image');
      }

      const imageBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.send(Buffer.from(imageBuffer));
    } catch (error) {
      console.error('[Proxy] Error fetching image:', error);
      res.status(500).send('Failed to proxy image');
    }
  });

  // AI Proxy Route with Key Pool & Failover
  app.post("/api/ai/chat", async (req, res) => {
    const { input, history, personality, thinking_mode, provider, model, gemini_api_key, files, image } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }

    try {
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

      await geminiService.chat({
        input,
        history: history || [],
        personality,
        thinking_mode,
        forceDub5: provider === "dub5",
        model,
        customApiKey: gemini_api_key,
        files,
        image,
        onProvider: (provider, model) => {
          res.write(`data: ${JSON.stringify({ provider, model })}\n\n`);
        },
        onChunk: (chunk) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
      });

      clearInterval(heartbeat);
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("AI Service Error:", error);
      // If we haven't sent headers yet, send a JSON error
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
      } else {
        // Otherwise send an error event in the stream
        res.write(`data: ${JSON.stringify({ error: error.message || "Internal Server Error" })}\n\n`);
        res.end();
      }
    }
  });

  // GitHub OAuth Routes
  app.get("/api/auth/github/url", (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: "GITHUB_CLIENT_ID not configured" });
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;
    res.json({ url });
  });

  app.get("/api/auth/github/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("No code provided");
    }

    try {
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error_description || data.error);
      }

      // Send success message to parent window and close popup
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', token: '${data.access_token}' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("GitHub Auth Error:", error);
      res.status(500).send("GitHub Authentication Failed");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
