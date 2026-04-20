import { figmaService, FigmaConfig, GeneratedCode } from '../../src/lib/figma-integration/figma-service';

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, query } = req;

    switch (method) {
      case 'POST':
        const { action, figmaUrl, accessToken, framework, styling, components } = req.body;

        if (action === 'configure') {
          // Configure Figma service
          const config: FigmaConfig = {
            accessToken: accessToken || process.env.FIGMA_ACCESS_TOKEN,
            projectId: query.projectId
          };
          figmaService.configure(config);
          return res.status(200).json({ message: 'Figma service configured successfully' });
        }

        if (action === 'fetch-design') {
          // Fetch design from Figma
          if (!figmaUrl) {
            return res.status(400).json({ error: 'Figma URL required' });
          }

          // Use provided access token or fall back to environment variable
          const token = accessToken || process.env.FIGMA_ACCESS_TOKEN;
          if (!token) {
            return res.status(400).json({ error: 'Figma access token required' });
          }

          figmaService.configure({ accessToken: token, projectId: query.projectId });
          const design = await figmaService.fetchDesign(figmaUrl);
          return res.status(200).json(design);
        }

        if (action === 'generate-code') {
          // Generate code from Figma design
          const { design } = req.body;
          if (!design) {
            return res.status(400).json({ error: 'Design data required' });
          }

          const code: GeneratedCode = await figmaService.generateCode(design, {
            framework: framework || 'react',
            styling: styling || 'tailwind',
            components: components !== undefined ? components : true
          });

          return res.status(200).json(code);
        }

        if (action === 'validate-token') {
          // Validate Figma access token
          const token = accessToken || process.env.FIGMA_ACCESS_TOKEN;
          if (!token) {
            return res.status(400).json({ error: 'Figma access token required' });
          }

          figmaService.configure({ accessToken: token, projectId: query.projectId });
          const isValid = await figmaService.validateToken();
          return res.status(200).json({ valid: isValid });
        }

        return res.status(400).json({ error: 'Invalid action' });

      case 'GET':
        if (query.action === 'validate-token') {
          // Validate Figma access token from environment
          const token = process.env.FIGMA_ACCESS_TOKEN;
          if (!token) {
            return res.status(400).json({ error: 'Figma access token not configured' });
          }

          figmaService.configure({ accessToken: token, projectId: query.projectId });
          const isValid = await figmaService.validateToken();
          return res.status(200).json({ valid: isValid });
        }

        return res.status(400).json({ error: 'Invalid action' });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[Figma API] Error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
}
