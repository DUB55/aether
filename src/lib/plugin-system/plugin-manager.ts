/**
 * Aether Plugin System - Core Architecture
 * Enables extensibility and custom integrations without modifying core codebase
 */

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  type: 'backend' | 'frontend' | 'integration' | 'ai-provider' | 'design-tool';
  enabled: boolean;
  config?: Record<string, any>;
  dependencies?: string[];
}

export interface PluginHook {
  name: string;
  handler: (...args: any[]) => any | Promise<any>;
  priority?: number;
}

export interface PluginContext {
  project: any;
  user: any;
  config: Record<string, any>;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (data: any) => void) => void;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private hooks: Map<string, PluginHook[]> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * Register a plugin
   */
  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already registered`);
    }

    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin ${plugin.id} requires ${dep} to be installed`);
        }
      }
    }

    this.plugins.set(plugin.id, { ...plugin, enabled: true });
    console.log(`[PluginManager] Registered plugin: ${plugin.name} (${plugin.id})`);
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    this.plugins.delete(pluginId);
    console.log(`[PluginManager] Unregistered plugin: ${plugin.name} (${pluginId})`);
  }

  /**
   * Enable a plugin
   */
  async enable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    plugin.enabled = true;
    console.log(`[PluginManager] Enabled plugin: ${plugin.name} (${pluginId})`);
  }

  /**
   * Disable a plugin
   */
  async disable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    plugin.enabled = false;
    console.log(`[PluginManager] Disabled plugin: ${plugin.name} (${pluginId})`);
  }

  /**
   * Register a hook for a plugin
   */
  registerHook(hook: PluginHook): void {
    if (!this.hooks.has(hook.name)) {
      this.hooks.set(hook.name, []);
    }
    this.hooks.get(hook.name)!.push(hook);
    // Sort by priority (higher priority first)
    this.hooks.get(hook.name)!.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Execute a hook
   */
  async executeHook(hookName: string, ...args: any[]): Promise<any[]> {
    const hooks = this.hooks.get(hookName) || [];
    const results = [];

    for (const hook of hooks) {
      try {
        const result = await hook.handler(...args);
        results.push(result);
      } catch (error) {
        console.error(`[PluginManager] Hook ${hookName} failed:`, error);
      }
    }

    return results;
  }

  /**
   * Emit an event
   */
  emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`[PluginManager] Event listener for ${event} failed:`, error);
      }
    });
  }

  /**
   * Listen for an event
   */
  on(event: string, handler: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(handler);
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get enabled plugins
   */
  getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).filter(p => p.enabled);
  }

  /**
   * Get plugin by ID
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get plugins by type
   */
  getPluginsByType(type: Plugin['type']): Plugin[] {
    return Array.from(this.plugins.values()).filter(p => p.type === type);
  }

  /**
   * Create plugin context for a plugin
   */
  createContext(project: any, user: any): PluginContext {
    return {
      project,
      user,
      config: {},
      emit: (event: string, data: any) => this.emit(event, data),
      on: (event: string, handler: (data: any) => void) => this.on(event, handler),
    };
  }
}

// Global plugin manager instance
export const pluginManager = new PluginManager();
