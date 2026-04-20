import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { backendServiceManager, BackendService } from '@/lib/enterprise'
import { Database, Server, CheckCircle, XCircle, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface BackendIntegrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
}

export function BackendIntegrationDialog({ open, onOpenChange, projectId }: BackendIntegrationDialogProps) {
  const [selectedType, setSelectedType] = useState<'supabase' | 'firebase' | 'postgresql' | 'mongodb' | 'mysql' | 'custom'>('supabase')
  const [config, setConfig] = useState({
    id: '',
    name: '',
    apiKey: '',
    projectId: '',
    authDomain: '',
    connectionString: '',
    customConfig: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      const service: BackendService = {
        id: config.id || `${selectedType}-${Date.now()}`,
        name: config.name || `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Instance`,
        type: selectedType,
        config: {
          apiKey: config.apiKey,
          projectId: config.projectId,
          authDomain: config.authDomain,
          connectionString: config.connectionString,
          customConfig: config.customConfig ? JSON.parse(config.customConfig) : undefined
        },
        status: 'disconnected'
      }

      await backendServiceManager.register(service)
      await backendServiceManager.connect(service.id)
      
      toast.success('Backend connected successfully!')
      onOpenChange(false)
      
      // Reset form
      setConfig({
        id: '',
        name: '',
        apiKey: '',
        projectId: '',
        authDomain: '',
        connectionString: '',
        customConfig: ''
      })
    } catch (error) {
      toast.error('Failed to connect to backend')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderSupabaseConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="supabase-api-key">API Key</Label>
        <Input
          id="supabase-api-key"
          type="password"
          placeholder="your-supabase-anon-key"
          value={config.apiKey}
          onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
        />
        <p className="text-xs text-gray-500">
          Get your API key from Supabase dashboard → Settings → API
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="supabase-project-id">Project ID</Label>
        <Input
          id="supabase-project-id"
          placeholder="your-project-id"
          value={config.projectId}
          onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
        />
        <p className="text-xs text-gray-500">
          Found in your Supabase project URL: https://[project-id].supabase.co
        </p>
      </div>
    </div>
  )

  const renderFirebaseConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firebase-api-key">API Key</Label>
        <Input
          id="firebase-api-key"
          type="password"
          placeholder="your-firebase-api-key"
          value={config.apiKey}
          onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="firebase-project-id">Project ID</Label>
        <Input
          id="firebase-project-id"
          placeholder="your-firebase-project-id"
          value={config.projectId}
          onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="firebase-auth-domain">Auth Domain</Label>
        <Input
          id="firebase-auth-domain"
          placeholder="your-project.firebaseapp.com"
          value={config.authDomain}
          onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
        />
      </div>
    </div>
  )

  const renderPostgreSQLConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="postgresql-connection">Connection String</Label>
        <Input
          id="postgresql-connection"
          type="password"
          placeholder="postgresql://user:password@host:port/database"
          value={config.connectionString}
          onChange={(e) => setConfig({ ...config, connectionString: e.target.value })}
        />
      </div>
    </div>
  )

  const renderMongoDBConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mongodb-connection">Connection String</Label>
        <Input
          id="mongodb-connection"
          type="password"
          placeholder="mongodb+srv://user:password@host/database"
          value={config.connectionString}
          onChange={(e) => setConfig({ ...config, connectionString: e.target.value })}
        />
      </div>
    </div>
  )

  const renderMySQLConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mysql-connection">Connection String</Label>
        <Input
          id="mysql-connection"
          type="password"
          placeholder="mysql://user:password@host:port/database"
          value={config.connectionString}
          onChange={(e) => setConfig({ ...config, connectionString: e.target.value })}
        />
      </div>
    </div>
  )

  const renderCustomConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="custom-config">Custom Configuration (JSON)</Label>
        <textarea
          id="custom-config"
          className="w-full h-32 px-3 py-2 border rounded-md"
          placeholder='{"endpoint": "https://api.example.com", "apiKey": "your-key"}'
          value={config.customConfig}
          onChange={(e) => setConfig({ ...config, customConfig: e.target.value })}
        />
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Backend Integration
          </DialogTitle>
        </DialogHeader>

        <Tabs className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <button
              className={`px-3 py-1.5 text-sm rounded-md ${selectedType === 'supabase' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setSelectedType('supabase')}
            >
              Supabase
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-md ${selectedType === 'firebase' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setSelectedType('firebase')}
            >
              Firebase
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-md ${selectedType === 'postgresql' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setSelectedType('postgresql')}
            >
              PostgreSQL
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-md ${selectedType === 'mongodb' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setSelectedType('mongodb')}
            >
              MongoDB
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-md ${selectedType === 'mysql' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setSelectedType('mysql')}
            >
              MySQL
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-md ${selectedType === 'custom' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setSelectedType('custom')}
            >
              Custom
            </button>
          </TabsList>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backend-name">Instance Name</Label>
                <Input
                  id="backend-name"
                  placeholder="My Backend"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                />
              </div>
            </div>

            {selectedType === 'supabase' && renderSupabaseConfig()}
            {selectedType === 'firebase' && renderFirebaseConfig()}
            {selectedType === 'postgresql' && renderPostgreSQLConfig()}
            {selectedType === 'mongodb' && renderMongoDBConfig()}
            {selectedType === 'mysql' && renderMySQLConfig()}
            {selectedType === 'custom' && renderCustomConfig()}
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? 'Connecting...' : 'Connect Backend'}
          </Button>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Connected Services</CardTitle>
          </CardHeader>
          <CardContent>
            {backendServiceManager.getServices().length === 0 ? (
              <p className="text-sm text-gray-500">No backend services connected</p>
            ) : (
              <div className="space-y-2">
                {backendServiceManager.getServices().map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      <span className="text-sm font-medium">{service.name}</span>
                      <span className="text-xs text-gray-500">({service.type})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {service.status === 'connected' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
