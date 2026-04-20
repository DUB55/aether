import { pluginManager, Plugin } from '../../src/lib/plugin-system/plugin-manager';

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, query } = req;
    const pluginId = query.id;

    switch (method) {
      case 'GET':
        if (pluginId) {
          // Get specific plugin
          const plugin = pluginManager.getPlugin(pluginId);
          if (!plugin) {
            return res.status(404).json({ error: 'Plugin not found' });
          }
          return res.status(200).json(plugin);
        } else {
          // Get all plugins
          const plugins = pluginManager.getPlugins();
          return res.status(200).json(plugins);
        }

      case 'POST':
        // Register new plugin
        const pluginData: Plugin = req.body;
        await pluginManager.register(pluginData);
        return res.status(201).json({ message: 'Plugin registered successfully', plugin: pluginData });

      case 'PUT':
        // Update plugin (enable/disable)
        if (!pluginId) {
          return res.status(400).json({ error: 'Plugin ID required' });
        }
        
        const { enabled } = req.body;
        if (enabled !== undefined) {
          if (enabled) {
            await pluginManager.enable(pluginId);
          } else {
            await pluginManager.disable(pluginId);
          }
        }
        
        const updatedPlugin = pluginManager.getPlugin(pluginId);
        return res.status(200).json(updatedPlugin);

      case 'DELETE':
        // Unregister plugin
        if (!pluginId) {
          return res.status(400).json({ error: 'Plugin ID required' });
        }
        
        await pluginManager.unregister(pluginId);
        return res.status(200).json({ message: 'Plugin unregistered successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[Plugin API] Error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
}
