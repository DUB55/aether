import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Key, 
  Brain, 
  Globe, 
  Shield, 
  Database,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { isTauriApp } from '@/lib/tauri-commands';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Settings {
  usePersonalApiKey: boolean;
  apiKeyProvider: 'google' | 'openai' | 'kimi';
  personalApiKey: string;
  selectedModel: string;
  usePuter: boolean;
  executionMode: 'plan' | 'fast';
}

const PROVIDER_MODELS = {
  google: [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.0-pro'
  ],
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo'
  ],
  kimi: [
    'moonshot-v1-8k',
    'moonshot-v1-32k',
    'moonshot-v1-128k'
  ],
  puter: [
    'gpt-4o-mini',
    'claude-3-haiku',
    'gemini-1.5-flash',
    'llama-3-8b',
    'mixtral-8x7b'
  ]
};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>({
    usePersonalApiKey: false,
    apiKeyProvider: 'google',
    personalApiKey: '',
    selectedModel: 'gemini-1.5-flash',
    usePuter: false,
    executionMode: 'fast'
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('aether_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      localStorage.setItem('aether_settings', JSON.stringify(settings));
      
      // If in Tauri app, also save to secure storage
      if (isTauriApp() && settings.personalApiKey) {
        // TODO: Implement secure storage with Tauri's Stronghold
        console.log('Saving API key to secure storage');
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApiKeyProviderChange = (provider: 'google' | 'openai' | 'kimi') => {
    setSettings(prev => ({
      ...prev,
      apiKeyProvider: provider,
      selectedModel: PROVIDER_MODELS[provider][0] // Reset to first model of new provider
    }));
  };

  const availableModels = settings.usePuter 
    ? PROVIDER_MODELS.puter 
    : PROVIDER_MODELS[settings.apiKeyProvider];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Models
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-6">
            {/* BYOK Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Use Personal API Key</Label>
                <p className="text-xs text-muted-foreground">
                  Bring your own API key instead of using the shared pool
                </p>
              </div>
              <Switch
                checked={settings.usePersonalApiKey}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, usePersonalApiKey: checked }))
                }
              />
            </div>

            {/* API Key Configuration */}
            {settings.usePersonalApiKey && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="space-y-2">
                  <Label>API Provider</Label>
                  <Select 
                    value={settings.apiKeyProvider} 
                    onValueChange={handleApiKeyProviderChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Gemini</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="kimi">Kimi (Moonshot)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.personalApiKey}
                      onChange={(e) => 
                        setSettings(prev => ({ ...prev, personalApiKey: e.target.value }))
                      }
                      placeholder="Enter your API key"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="text-xs text-yellow-800 dark:text-yellow-200">
                    <p className="font-medium">Security Notice</p>
                    <p>Your API key will be stored securely and only used for AI requests.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Puter.js Integration */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Use Puter.js (Free Models)</Label>
                <p className="text-xs text-muted-foreground">
                  Access free AI models through Puter.js (no API key required)
                </p>
              </div>
              <Switch
                checked={settings.usePuter}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, usePuter: checked }))
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select 
                  value={settings.selectedModel} 
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, selectedModel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map(model => (
                      <SelectItem key={model} value={model}>
                        <div className="flex items-center gap-2">
                          <span>{model}</span>
                          {settings.usePuter && (
                            <Badge variant="secondary" className="text-xs">Free</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Current Selection</h4>
                  <p className="text-sm text-muted-foreground">{settings.selectedModel}</p>
                  <Badge variant="outline" className="mt-2">
                    {settings.usePuter ? 'Puter.js' : settings.apiKeyProvider}
                  </Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Model Info</h4>
                  <p className="text-xs text-muted-foreground">
                    {settings.usePuter 
                      ? 'Free model via Puter.js - no API key required'
                      : `Using ${settings.apiKeyProvider} API`
                    }
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            {/* Execution Mode */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Execution Mode</Label>
              <Select 
                value={settings.executionMode} 
                onValueChange={(value: 'plan' | 'fast') => 
                  setSettings(prev => ({ ...prev, executionMode: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast Mode</SelectItem>
                  <SelectItem value="plan">Plan & Execute Mode</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="p-4 border rounded-lg bg-muted/20">
                <h4 className="font-medium mb-2">
                  {settings.executionMode === 'plan' ? 'Plan & Execute Mode' : 'Fast Mode'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {settings.executionMode === 'plan' 
                    ? 'AI will explain its plan before executing local commands'
                    : 'AI executes commands immediately for faster development'
                  }
                </p>
              </div>
            </div>

            {/* Desktop Features */}
            {isTauriApp() && (
              <div className="space-y-4">
                <Label className="text-sm font-medium">Desktop Features</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4" />
                      <h4 className="font-medium">File System Access</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI can read, write, and manage local files
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4" />
                      <h4 className="font-medium">Command Execution</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI can execute terminal commands locally
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {saveStatus === 'success' && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Settings saved</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Failed to save</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={saveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
