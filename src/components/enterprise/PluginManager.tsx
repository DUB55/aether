import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { pluginManager, Plugin } from '@/lib/enterprise'
import { Plus, Trash2, Power, PowerOff, Settings, Download, Upload, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PluginManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PluginManager({ open, onOpenChange }: PluginManagerProps) {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [showAddPlugin, setShowAddPlugin] = useState(false)
  const [newPlugin, setNewPlugin] = useState({
    id: '',
    name: '',
    version: '1.0.0',
    description: '',
    author: '',
    type: 'integration' as Plugin['type'],
    config: ''
  })

  useEffect(() => {
    if (open) {
      loadPlugins()
    }
  }, [open])

  const loadPlugins = () => {
    const allPlugins = pluginManager.getPlugins()
    setPlugins(allPlugins)
  }

  const handleTogglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await pluginManager.enable(pluginId)
        toast.success('Plugin enabled')
      } else {
        await pluginManager.disable(pluginId)
        toast.success('Plugin disabled')
      }
      loadPlugins()
    } catch (error) {
      toast.error('Failed to toggle plugin')
      console.error(error)
    }
  }

  const handleDeletePlugin = async (pluginId: string) => {
    try {
      await pluginManager.unregister(pluginId)
      toast.success('Plugin deleted')
      loadPlugins()
    } catch (error) {
      toast.error('Failed to delete plugin')
      console.error(error)
    }
  }

  const handleAddPlugin = async () => {
    try {
      const plugin: Plugin = {
        id: newPlugin.id,
        name: newPlugin.name,
        version: newPlugin.version,
        description: newPlugin.description,
        author: newPlugin.author,
        type: newPlugin.type,
        enabled: true,
        config: newPlugin.config ? JSON.parse(newPlugin.config) : undefined
      }

      await pluginManager.register(plugin)
      toast.success('Plugin added successfully')
      setShowAddPlugin(false)
      setNewPlugin({
        id: '',
        name: '',
        version: '1.0.0',
        description: '',
        author: '',
        type: 'integration',
        config: ''
      })
      loadPlugins()
    } catch (error) {
      toast.error('Failed to add plugin')
      console.error(error)
    }
  }

  const handleExportPlugins = () => {
    const pluginData = JSON.stringify(plugins, null, 2)
    const blob = new Blob([pluginData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'aether-plugins.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Plugins exported')
  }

  const handleImportPlugins = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const importedPlugins = JSON.parse(e.target?.result as string)
        for (const plugin of importedPlugins) {
          await pluginManager.register(plugin)
        }
        toast.success('Plugins imported successfully')
        loadPlugins()
      } catch (error) {
        toast.error('Failed to import plugins')
        console.error(error)
      }
    }
    reader.readAsText(file)
  }

  const getPluginTypeColor = (type: Plugin['type']) => {
    const colors = {
      backend: 'bg-blue-500',
      frontend: 'bg-green-500',
      integration: 'bg-purple-500',
      'ai-provider': 'bg-orange-500',
      'design-tool': 'bg-pink-500'
    }
    return colors[type] || 'bg-gray-500'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Plugin Manager
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="installed" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="installed">Installed Plugins</TabsTrigger>
              <TabsTrigger value="add">Add Plugin</TabsTrigger>
              <TabsTrigger value="marketplace">Plugin Marketplace</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPlugins}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('plugin-import')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <input
                id="plugin-import"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportPlugins}
              />
            </div>
          </div>

          <TabsContent value="installed">
            {plugins.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No plugins installed</p>
                <p className="text-sm text-gray-400">Add plugins to extend Aether functionality</p>
              </div>
            ) : (
              <div className="space-y-4">
                {plugins.map((plugin) => (
                  <Card key={plugin.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{plugin.name}</CardTitle>
                            <Badge className={getPluginTypeColor(plugin.type)}>
                              {plugin.type}
                            </Badge>
                            <Badge variant="outline">v{plugin.version}</Badge>
                          </div>
                          <CardDescription>{plugin.description}</CardDescription>
                          <p className="text-sm text-gray-500 mt-1">By {plugin.author}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={plugin.enabled}
                            onCheckedChange={(checked) => handleTogglePlugin(plugin.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePlugin(plugin.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {plugin.config && (
                      <CardContent>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                          {JSON.stringify(plugin.config, null, 2)}
                        </pre>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add Custom Plugin</CardTitle>
                <CardDescription>
                  Create and register a custom plugin to extend Aether functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plugin-id">Plugin ID</Label>
                    <Input
                      id="plugin-id"
                      placeholder="my-custom-plugin"
                      value={newPlugin.id}
                      onChange={(e) => setNewPlugin({ ...newPlugin, id: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plugin-name">Plugin Name</Label>
                    <Input
                      id="plugin-name"
                      placeholder="My Custom Plugin"
                      value={newPlugin.name}
                      onChange={(e) => setNewPlugin({ ...newPlugin, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plugin-version">Version</Label>
                    <Input
                      id="plugin-version"
                      placeholder="1.0.0"
                      value={newPlugin.version}
                      onChange={(e) => setNewPlugin({ ...newPlugin, version: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plugin-author">Author</Label>
                    <Input
                      id="plugin-author"
                      placeholder="Your Name"
                      value={newPlugin.author}
                      onChange={(e) => setNewPlugin({ ...newPlugin, author: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plugin-type">Plugin Type</Label>
                  <select
                    id="plugin-type"
                    className="w-full px-3 py-2 border rounded-md"
                    value={newPlugin.type}
                    onChange={(e) => setNewPlugin({ ...newPlugin, type: e.target.value as Plugin['type'] })}
                  >
                    <option value="backend">Backend Integration</option>
                    <option value="frontend">Frontend Extension</option>
                    <option value="integration">Third-party Integration</option>
                    <option value="ai-provider">AI Provider</option>
                    <option value="design-tool">Design Tool</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plugin-description">Description</Label>
                  <Textarea
                    id="plugin-description"
                    placeholder="Describe what this plugin does..."
                    value={newPlugin.description}
                    onChange={(e) => setNewPlugin({ ...newPlugin, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plugin-config">Configuration (JSON)</Label>
                  <Textarea
                    id="plugin-config"
                    placeholder='{"apiKey": "your-key", "endpoint": "https://api.example.com"}'
                    value={newPlugin.config}
                    onChange={(e) => setNewPlugin({ ...newPlugin, config: e.target.value })}
                  />
                </div>

                <Button onClick={handleAddPlugin} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Plugin
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketplace">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Supabase Integration</CardTitle>
                  <CardDescription>
                    Connect to Supabase backend with automatic code generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => toast.info('Coming soon')}>
                    Install
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Figma Integration</CardTitle>
                  <CardDescription>
                    Import Figma designs and convert to code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => toast.info('Coming soon')}>
                    Install
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom AI Provider</CardTitle>
                  <CardDescription>
                    Add custom AI providers beyond the default ones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => toast.info('Coming soon')}>
                    Install
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
