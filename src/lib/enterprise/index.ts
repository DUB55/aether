/**
 * Enterprise Systems Integration
 * Central export point for all enterprise features
 */

import { pluginManager, PluginManager } from '../plugin-system/plugin-manager';
import { backendServiceManager, BackendServiceManager } from '../backend-integrations/backend-service-manager';
import { figmaService, FigmaService } from '../figma-integration/figma-service';
import { interactiveChatManager, InteractiveChatManager } from '../interactive-chat/interactive-chat-manager';
import { enterpriseManager, EnterpriseManager } from './enterprise-manager';

export type { Plugin, PluginHook, PluginContext } from '../plugin-system/plugin-manager';
export type { BackendService, BackendConfig, DatabaseSchema } from '../backend-integrations/backend-service-manager';
export type { FigmaDesign, FigmaConfig, GeneratedCode } from '../figma-integration/figma-service';
export type { ChatSession, ChatQuestion, ChatContext, DesignSelection } from '../interactive-chat/interactive-chat-manager';
export type { Team, TeamMember, EnterpriseConfig, AuditLog } from './enterprise-manager';

export { pluginManager, PluginManager };
export { backendServiceManager, BackendServiceManager };
export { figmaService, FigmaService };
export { interactiveChatManager, InteractiveChatManager };
export { enterpriseManager, EnterpriseManager };

/**
 * Enterprise Systems Registry
 * Manages all enterprise systems and their integration
 */
export class EnterpriseSystemsRegistry {
  private systems: Map<string, any> = new Map();

  constructor() {
    this.registerSystem('pluginManager', pluginManager);
    this.registerSystem('backendServiceManager', backendServiceManager);
    this.registerSystem('figmaService', figmaService);
    this.registerSystem('interactiveChatManager', interactiveChatManager);
    this.registerSystem('enterpriseManager', enterpriseManager);
  }

  registerSystem(name: string, system: any): void {
    this.systems.set(name, system);
    console.log(`[EnterpriseRegistry] Registered system: ${name}`);
  }

  getSystem(name: string): any {
    return this.systems.get(name);
  }

  getAllSystems(): Map<string, any> {
    return this.systems;
  }

  async initializeAll(): Promise<void> {
    console.log('[EnterpriseRegistry] Initializing all enterprise systems...');
    
    for (const [name, system] of this.systems) {
      try {
        if (typeof system.initialize === 'function') {
          await system.initialize();
          console.log(`[EnterpriseRegistry] Initialized: ${name}`);
        }
      } catch (error) {
        console.error(`[EnterpriseRegistry] Failed to initialize ${name}:`, error);
      }
    }
    
    console.log('[EnterpriseRegistry] All enterprise systems ready');
  }
}

// Global registry instance
export const enterpriseSystemsRegistry = new EnterpriseSystemsRegistry();
