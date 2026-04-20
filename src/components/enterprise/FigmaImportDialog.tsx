import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { figmaService } from '@/lib/enterprise'
import { PenTool, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface FigmaImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
  onImportComplete?: (code: any) => void
}

export function FigmaImportDialog({ open, onOpenChange, projectId, onImportComplete }: FigmaImportDialogProps) {
  const [figmaUrl, setFigmaUrl] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<any>(null)
  const [framework, setFramework] = useState<'react' | 'vue' | 'svelte' | 'vanilla'>('react')
  const [styling, setStyling] = useState<'tailwind' | 'css' | 'styled-components'>('tailwind')

  const handleImport = async () => {
    setIsLoading(true)
    try {
      // Configure Figma service
      figmaService.configure({
        accessToken: accessToken,
        projectId: projectId
      })

      // Fetch design from Figma
      const design = await figmaService.fetchDesign(figmaUrl)
      toast.success('Design fetched from Figma!')

      // Generate code
      const code = await figmaService.generateCode(design, {
        framework,
        styling,
        components: true
      })

      setGeneratedCode(code)
      toast.success('Code generated successfully!')
    } catch (error) {
      toast.error('Failed to import from Figma')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyCode = () => {
    if (generatedCode && onImportComplete) {
      onImportComplete(generatedCode)
      toast.success('Code applied to project!')
      onOpenChange(false)
      setGeneratedCode(null)
      setFigmaUrl('')
      setAccessToken('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            Import from Figma
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Figma Configuration</CardTitle>
              <CardDescription>
                Connect to Figma and import your designs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="figma-url">Figma File URL</Label>
                <Input
                  id="figma-url"
                  placeholder="https://figma.com/file/your-file-key/your-design"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Paste the URL of your Figma design file
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="figma-token">Figma Access Token</Label>
                <Input
                  id="figma-token"
                  type="password"
                  placeholder="your-figma-access-token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Get your token from Figma → Help → Account → Personal Access Tokens
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="framework">Framework</Label>
                  <select
                    id="framework"
                    className="w-full px-3 py-2 border rounded-md"
                    value={framework}
                    onChange={(e) => setFramework(e.target.value as any)}
                  >
                    <option value="react">React</option>
                    <option value="vue">Vue</option>
                    <option value="svelte">Svelte</option>
                    <option value="vanilla">Vanilla JS</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="styling">Styling</Label>
                  <select
                    id="styling"
                    className="w-full px-3 py-2 border rounded-md"
                    value={styling}
                    onChange={(e) => setStyling(e.target.value as any)}
                  >
                    <option value="tailwind">Tailwind CSS</option>
                    <option value="css">CSS</option>
                    <option value="styled-components">Styled Components</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleImport} disabled={isLoading || !figmaUrl || !accessToken} className="w-full">
                {isLoading ? 'Importing...' : 'Import Design'}
              </Button>
            </CardContent>
          </Card>

          {generatedCode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Generated Code
                </CardTitle>
                <CardDescription>
                  Your Figma design has been converted to code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>HTML</Label>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto max-h-40">
                    {generatedCode.html.substring(0, 500)}...
                  </pre>
                </div>

                <div className="space-y-2">
                  <Label>CSS</Label>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto max-h-40">
                    {generatedCode.css.substring(0, 500)}...
                  </pre>
                </div>

                <div className="space-y-2">
                  <Label>JavaScript</Label>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto max-h-40">
                    {generatedCode.javascript.substring(0, 500)}...
                  </pre>
                </div>

                {generatedCode.components.length > 0 && (
                  <div className="space-y-2">
                    <Label>Components Generated: {generatedCode.components.length}</Label>
                    <div className="flex flex-wrap gap-2">
                      {generatedCode.components.map((comp: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                          {comp.substring(0, 30)}...
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={handleApplyCode} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Apply Code to Project
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Getting Started with Figma Integration</p>
                  <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Open your Figma file and copy the URL</li>
                    <li>Create a personal access token in Figma settings</li>
                    <li>Paste both the URL and token above</li>
                    <li>Choose your preferred framework and styling</li>
                    <li>Click import to generate code from your design</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
