import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import { GeminiService } from "./server/gemini-service";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Pool
const geminiKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);
const geminiService = new GeminiService(geminiKeys);

async function startServer() {
  const app = express();
  const PORT = process.argv.includes('--port') ? 
    parseInt(process.argv[process.argv.indexOf('--port') + 1]) : 3000;

  // Create HTTP server
  const server = createHttpServer(app);

  // WebSocket server for real-time collaboration
  const wss = new WebSocketServer({ server, path: '/collab' });

  // Store active connections per project
  const projectConnections = new Map<string, Set<WebSocket>>();
  const userConnections = new Map<WebSocket, { projectId: string; userId: string }>();

  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const projectId = url.pathname.split('/')[2];
    const userId = url.searchParams.get('userId');

    if (!projectId || !userId) {
      ws.close();
      return;
    }

    console.log(`[WebSocket] User ${userId} connected to project ${projectId}`);

    // Store connection
    if (!projectConnections.has(projectId)) {
      projectConnections.set(projectId, new Set());
    }
    projectConnections.get(projectId)!.add(ws);
    userConnections.set(ws, { projectId, userId });

    // Notify other users
    broadcastToProject(projectId, ws, {
      type: 'user_join',
      userId,
      projectId,
      data: { userId, name: `User ${userId.substring(0, 8)}`, color: getRandomColor() },
      timestamp: Date.now()
    });

    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data);
        // Broadcast to all other users in the project
        broadcastToProject(projectId, ws, message);
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      console.log(`[WebSocket] User ${userId} disconnected from project ${projectId}`);
      
      // Remove from project connections
      const connections = projectConnections.get(projectId);
      if (connections) {
        connections.delete(ws);
        if (connections.size === 0) {
          projectConnections.delete(projectId);
        }
      }
      userConnections.delete(ws);

      // Notify other users
      broadcastToProject(projectId, ws, {
        type: 'user_leave',
        userId,
        projectId,
        data: {},
        timestamp: Date.now()
      });
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
    });
  });

  function broadcastToProject(projectId: string, excludeWs: WebSocket, message: any) {
    const connections = projectConnections.get(projectId);
    if (connections) {
      connections.forEach((ws) => {
        if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  function getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // WebContainer Security Headers
  app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    next();
  });

  app.use(express.json());

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

  // Free Image Generation using Pollinations AI (no API key required)
  app.post("/api/generate-image", async (req, res) => {
    const { prompt, size = "1024x1024" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    try {
      // Use Pollinations AI - completely free, no API key needed
      // URL format: https://image.pollinations.ai/prompt/{prompt}?width={width}&height={height}&nologo=true
      const encodedPrompt = encodeURIComponent(prompt);
      const [width, height] = size.split('x');
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${Date.now()}`;

      res.json({ imageUrl, prompt });
    } catch (error: any) {
      console.error("Image generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
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

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server running on ws://localhost:${PORT}/collab`);
  });
}

startServer();
