import { backendServiceManager, BackendService } from '../../src/lib/backend-integrations/backend-service-manager';

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
    const serviceId = query.id;

    switch (method) {
      case 'GET':
        if (serviceId) {
          // Get specific backend service
          const service = backendServiceManager.getService(serviceId);
          if (!service) {
            return res.status(404).json({ error: 'Backend service not found' });
          }
          return res.status(200).json(service);
        } else if (query.action === 'schema') {
          // Get database schema
          const schema = await backendServiceManager.getSchema();
          return res.status(200).json(schema);
        } else if (query.action === 'generate-code') {
          // Generate integration code
          const serviceId = query.serviceId;
          if (!serviceId) {
            return res.status(400).json({ error: 'Service ID required' });
          }
          const service = backendServiceManager.getService(serviceId);
          if (!service) {
            return res.status(404).json({ error: 'Backend service not found' });
          }
          const code = await backendServiceManager.generateIntegrationCode(service);
          return res.status(200).json({ code });
        } else {
          // Get all backend services
          const services = backendServiceManager.getServices();
          return res.status(200).json(services);
        }

      case 'POST':
        // Register new backend service
        const serviceData: BackendService = req.body;
        await backendServiceManager.register(serviceData);
        return res.status(201).json({ message: 'Backend service registered successfully', service: serviceData });

      case 'PUT':
        // Connect to backend service
        if (!serviceId) {
          return res.status(400).json({ error: 'Service ID required' });
        }
        
        if (req.body.action === 'connect') {
          await backendServiceManager.connect(serviceId);
          return res.status(200).json({ message: 'Backend service connected successfully' });
        } else if (req.body.action === 'disconnect') {
          await backendServiceManager.disconnect();
          return res.status(200).json({ message: 'Backend service disconnected successfully' });
        } else if (req.body.action === 'execute') {
          // Execute operation on backend
          const result = await backendServiceManager.execute(req.body.operation);
          return res.status(200).json(result);
        }
        
        return res.status(400).json({ error: 'Invalid action' });

      case 'DELETE':
        // Disconnect from backend service
        await backendServiceManager.disconnect();
        return res.status(200).json({ message: 'Backend service disconnected successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[Backend API] Error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
}
