"use client"

import React, { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  FileText, 
  Search, 
  Settings2,
  Brain,
  Loader2,
  Rocket,
  Shield,
  Zap,
  ChevronDown,
  Globe,
  Code2,
  Sparkles,
  Monitor,
  RotateCcw,
  Share2,
  Github,
  Trash2,
  Book,
  Monitor as MonitorIcon,
  Smartphone,
  Tablet,
  Play,
  Database,
  AlertCircle,
  X,
  PlusCircle,
  CheckCircle2,
  ExternalLink,
  History,
  FileCode,
  Folder,
  ChevronRight,
  GitBranch,
  GitPullRequest,
  Cloud,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { storage, Project } from "@/lib/storage"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { useTheme } from "next-themes"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

interface TreeNode {
  name: string
  path: string
  type: "file" | "directory"
  children?: TreeNode[]
}

export default function EditorPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const router = useRouter()
  const { theme } = useTheme()
  
  const [project, setProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'settings' | 'knowledge' | 'history' | 'components' | 'deploy'>('preview')
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [fileSearch, setFileSearch] = useState("")
  const [previewUrl, setPreviewUrl] = useState("about:blank")
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [lastError, setLastError] = useState<{ type: 'runtime' | 'terminal', message: string, stack?: string, command?: string } | null>(null)
  
  // Integration States
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [isSupabaseTesting, setIsSupabaseTesting] = useState(false)
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const [githubRepo, setGithubRepo] = useState("")
  const [githubToken, setGithubToken] = useState("")
  const [isGithubPushing, setIsGithubPushing] = useState(false)
  const [githubStatus, setGithubStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const [isGeneratingDocs, setIsGeneratingDocs] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [dbTables, setDbTables] = useState([
    { name: "users", columns: [{ name: "id", type: "uuid" }, { name: "email", type: "text" }, { name: "created_at", type: "timestamptz" }] },
    { name: "projects", columns: [{ name: "id", type: "uuid" }, { name: "user_id", type: "uuid (FK)" }] }
  ])

  const addDbTable = () => {
    const name = prompt("Enter table name:")
    if (name) {
      setDbTables([...dbTables, { name, columns: [{ name: "id", type: "uuid" }] }])
      toast.success(`Table '${name}' added to schema.`)
    }
  }
  const [isAIProcessing, setIsAIProcessing] = useState(false)
   const [aiProgress, setAiProgress] = useState({ status: "", files: [] as string[] })
  const [input, setInput] = useState("")
  const [terminalOutput, setTerminalOutput] = useState<{ type: 'info' | 'error' | 'success', message: string, timestamp: string }[]>([
    { type: 'info', message: 'Aether Engine v1.0.0 initialized.', timestamp: new Date().toLocaleTimeString() },
    { type: 'success', message: 'WebContainer booted successfully.', timestamp: new Date().toLocaleTimeString() },
  ])
  const [terminalInput, setTerminalInput] = useState("")
  const terminalEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalOutput])

  // Load project on mount
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return
      const p = await storage.getProject(projectId)
      if (p) {
        setProject(p)
        // Set first file as active if available
        const files = Object.keys(p.files)
        if (files.length > 0 && !activeFile) {
          setActiveFile(files[0])
        }
        // Load settings if they exist
        if (p.settings) {
          setSupabaseUrl(p.settings.supabaseUrl || "")
          setSupabaseKey(p.settings.supabaseKey || "")
          setGithubRepo(p.settings.githubRepo || "")
          setGithubToken(p.settings.githubToken || "")
        }
      } else {
        router.push("/")
      }
    }
    loadProject()
  }, [projectId, router])

  // Save settings when they change
  const saveSettings = async () => {
    if (!project) return
    const updatedProject = {
      ...project,
      settings: {
        supabaseUrl,
        supabaseKey,
        githubRepo,
        githubToken
      }
    }
    setProject(updatedProject)
    await storage.saveProject(updatedProject)
  }

  const handleAIRun = async (predefinedCode?: string) => {
    if (!input.trim() && !predefinedCode || !project) return
    
    setIsAIProcessing(true)
    setAiProgress({ status: "Analyzing request...", files: [] })
    
    const tid = toast.loading("Aether is thinking...")
    
    try {
      // Step 1: Analyze
      await new Promise(r => setTimeout(r, 1500))
      setAiProgress({ status: "Planning changes...", files: [] })
      
      // Step 2: Identify files
      await new Promise(r => setTimeout(r, 1000))
      const modifiedFiles = predefinedCode ? [`src/components/${input.replace(/\s+/g, '') || 'Component'}.tsx`] : ["src/app/page.tsx", "src/components/ui/button.tsx", "src/lib/utils.ts"]
      setAiProgress({ status: "Modifying files...", files: modifiedFiles })
      
      // Step 3: Apply changes (simulate multi-file update)
      for (const file of modifiedFiles) {
        setAiProgress(prev => ({ ...prev, status: `Updating ${file}...` }))
        await new Promise(r => setTimeout(r, 800))
      }
      
      // Step 4: Finalize
      setAiProgress({ status: "Finalizing and rebuilding...", files: modifiedFiles })
      await new Promise(r => setTimeout(r, 1200))
      
      // Save to history with a snapshot of files
      const newHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        description: input || "Added component from library",
        filesModified: modifiedFiles,
        filesSnapshot: { ...project.files } // Store snapshot before changes for restoration
      }
      
      // Simulate code changes for the modified files
      const updatedFiles = { ...project.files }
      modifiedFiles.forEach(file => {
        if (predefinedCode) {
          updatedFiles[file] = predefinedCode
        } else if (!updatedFiles[file]) {
          updatedFiles[file] = `// Generated by Aether AI\n// Purpose: ${input}\n\nexport default function Component() {\n  return <div>New Component for ${file}</div>\n}`
        } else {
          updatedFiles[file] = `// Updated by Aether AI\n// Change: ${input}\n\n${updatedFiles[file]}`
        }
      })
      
      const updatedProject = {
        ...project,
        files: updatedFiles,
        history: [newHistoryItem, ...(project.history || [])],
        lastModified: Date.now()
      }
      
      setProject(updatedProject)
      await storage.saveProject(updatedProject)
      
      toast.success(predefinedCode ? "Component added successfully!" : "Changes applied successfully!", { id: tid })
      setInput("")
      handleRefreshPreview()
    } catch (err) {
      toast.error("AI failed to process request", { id: tid })
    } finally {
      setIsAIProcessing(false)
      setAiProgress({ status: "", files: [] })
    }
  }

  const handleRestoreHistory = async (historyId: string) => {
    if (!project || !confirm("Are you sure you want to restore this version? Current changes may be lost.")) return
    
    const tid = toast.loading("Restoring project state...")
    await new Promise(r => setTimeout(r, 1500))
    
    const historyItem = project.history?.find((item: any) => item.id === historyId)
    if (historyItem && historyItem.filesSnapshot) {
      const updatedProject = {
        ...project,
        files: historyItem.filesSnapshot,
        lastModified: Date.now()
      }
      setProject(updatedProject)
      await storage.saveProject(updatedProject)
      toast.success("Project restored to previous state!", { id: tid })
      handleRefreshPreview()
    } else {
      toast.error("Could not find history record or snapshot", { id: tid })
    }
  }

  const handleRefreshPreview = () => {
    setPreviewLoading(true)
    // In a real app, this would trigger a build or update a webcontainer
    setTimeout(() => {
      setPreviewLoading(false)
      // Simulate preview URL for demo
      if (previewUrl === "about:blank") {
        setPreviewUrl("https://aether-preview-template.vercel.app")
      }
    }, 1500)
  }

  const handleAutoHeal = async (type: 'runtime' | 'terminal', context: string, details: string) => {
    const tid = toast.loading(`AI is analyzing and fixing the ${type} error...`)
    // Simulate AI fixing logic
    await new Promise(r => setTimeout(r, 2500))
    toast.success("Error fixed! Applying changes...", { id: tid })
    setLastError(null)
    handleRefreshPreview()
  }

  const handleTestSupabase = async () => {
    if (!supabaseUrl || !supabaseKey) {
      toast.error("Please enter both Supabase URL and Anon Key")
      return
    }

    setIsSupabaseTesting(true)
    setSupabaseStatus('idle')
    const tid = toast.loading("Testing Supabase connection...")

    try {
      const cleanUrl = supabaseUrl.replace(/\/$/, '')
      const response = await fetch(`${cleanUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })

      if (response.ok || response.status === 404) { 
        toast.success("Supabase connection verified!", { id: tid })
        setSupabaseStatus('success')
        saveSettings()
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (err) {
      toast.error("Connection failed. Check your URL and Key.", { id: tid })
      setSupabaseStatus('error')
    } finally {
      setIsSupabaseTesting(false)
    }
  }

  const handlePushToGithub = async () => {
    if (!githubRepo || !githubToken) {
      toast.error("Please enter both Repository and Token")
      return
    }

    setIsGithubPushing(true)
    setGithubStatus('idle')
    const tid = toast.loading(`Pushing to ${githubRepo}...`)

    try {
      // Simulate GitHub API push
      await new Promise(r => setTimeout(r, 3000))
      toast.success("Successfully pushed to GitHub!", { id: tid })
      setGithubStatus('success')
      saveSettings()
    } catch (err) {
      toast.error("Failed to push. Check your token and repository.", { id: tid })
      setGithubStatus('error')
    } finally {
      setIsGithubPushing(false)
    }
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success("Editor link copied to clipboard!")
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    const tid = toast.loading("Building production assets...")
    
    await new Promise(r => setTimeout(r, 2000))
    toast.loading("Optimizing for performance...", { id: tid })
    await new Promise(r => setTimeout(r, 1500))
    toast.loading("Deploying to global edge network...", { id: tid })
    await new Promise(r => setTimeout(r, 2000))
    
    toast.success("Your app is now live!", { 
      id: tid,
      description: "https://aether-app.vercel.app"
    })
    setIsPublishing(false)
  }

  const handleGenerateDocs = async () => {
    if (!project) return
    setIsGeneratingDocs(true)
    const tid = toast.loading("AI is scanning project files to generate documentation...")
    
    try {
      await new Promise(r => setTimeout(r, 3000))
      
      const fileNames = Object.keys(project.files)
      const projectSummary = `
# Project Documentation: ${project.name}

## Project Overview
This project contains ${fileNames.length} files.

## File Structure
${fileNames.map(f => `- ${f}`).join('\n')}

## Key Components
${fileNames.filter(f => f.endsWith('.tsx') || f.endsWith('.ts')).map(f => `### ${f.split('/').pop()}\nComponent or utility found in ${f}.`).join('\n\n')}

## Generated At
${new Date().toLocaleString()}
      `.trim()
      
      const updatedKnowledge = { 
        ...project.knowledge, 
        "Project Overview": projectSummary,
        "Tech Stack": "Next.js, Tailwind CSS, Lucide Icons, Framer Motion"
      }
      
      const updatedProject = { ...project, knowledge: updatedKnowledge }
      setProject(updatedProject)
      await storage.saveProject(updatedProject)
      
      toast.success("Documentation generated based on project structure!", { id: tid })
    } catch (err) {
      toast.error("Failed to generate documentation")
    } finally {
      setIsGeneratingDocs(false)
    }
  }

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!terminalInput.trim()) return

    const newOutput = [...terminalOutput, { 
      type: 'info' as const, 
      message: `> ${terminalInput}`, 
      timestamp: new Date().toLocaleTimeString() 
    }]

    // Simulate basic command handling
    if (terminalInput === 'clear') {
      setTerminalOutput([])
    } else if (terminalInput === 'ls') {
      newOutput.push({ 
        type: 'success', 
        message: Object.keys(project?.files || {}).join('  '), 
        timestamp: new Date().toLocaleTimeString() 
      })
    } else if (terminalInput.startsWith('npm install')) {
      newOutput.push({ 
        type: 'info', 
        message: 'Installing dependencies...', 
        timestamp: new Date().toLocaleTimeString() 
      })
      setTimeout(() => {
        setTerminalOutput(prev => [...prev, { 
          type: 'success', 
          message: 'Packages installed successfully.', 
          timestamp: new Date().toLocaleTimeString() 
        }])
      }, 2000)
    } else if (terminalInput === 'npm start' || terminalInput === 'npm run dev') {
      newOutput.push({ 
        type: 'info', 
        message: 'Starting development server...', 
        timestamp: new Date().toLocaleTimeString() 
      })
      setTimeout(() => {
        setTerminalOutput(prev => [...prev, { 
          type: 'success', 
          message: 'Server running at http://localhost:3000', 
          timestamp: new Date().toLocaleTimeString() 
        }])
        handleRefreshPreview()
      }, 1500)
    } else if (terminalInput === 'npm run build') {
      newOutput.push({ 
        type: 'info', 
        message: 'Creating an optimized production build...', 
        timestamp: new Date().toLocaleTimeString() 
      })
      setTimeout(() => {
        setTerminalOutput(prev => [...prev, { 
          type: 'success', 
          message: 'Build successful! Ready for deployment.', 
          timestamp: new Date().toLocaleTimeString() 
        }])
      }, 3000)
    } else {
      newOutput.push({ 
        type: 'error', 
        message: `Command not found: ${terminalInput}`, 
        timestamp: new Date().toLocaleTimeString() 
      })
      
      // Simulate terminal error for auto-heal demo
      setLastError({
        type: 'terminal',
        message: `Command failed: ${terminalInput}`,
        command: terminalInput
      })
    }

    setTerminalOutput(newOutput)
    setTerminalInput("")
  }

  const deleteProject = async () => {
    if (confirm("Are you sure you want to delete this project? This cannot be undone.")) {
      await storage.deleteProject(projectId)
      router.push("/")
    }
  }

  const saveKnowledge = async (title: string, content: string) => {
    if (!project) return
    const updatedKnowledge = { ...project.knowledge, [title]: content }
    const updatedProject = { ...project, knowledge: updatedKnowledge }
    setProject(updatedProject)
    await storage.saveProject(updatedProject)
  }

  const deleteKnowledge = async (title: string) => {
    if (!project) return
    const updatedKnowledge = { ...project.knowledge }
    delete updatedKnowledge[title]
    const updatedProject = { ...project, knowledge: updatedKnowledge }
    setProject(updatedProject)
    await storage.saveProject(updatedProject)
  }

  const buildFileTree = (files: Record<string, string>): TreeNode[] => {
    const root: TreeNode[] = []
    Object.keys(files).forEach(path => {
      const parts = path.split('/')
      let current = root
      parts.forEach((part, i) => {
        let node = current.find(n => n.name === part)
        if (!node) {
          node = {
            name: part,
            path: parts.slice(0, i + 1).join('/'),
            type: i === parts.length - 1 ? "file" : "directory",
            children: i === parts.length - 1 ? undefined : []
          }
          current.push(node)
        }
        if (node.children) current = node.children
      })
    })
    return root
  }

  const FileExplorerNode = ({ node }: { node: TreeNode }) => {
    const isFile = node.type === "file"
    const isActive = activeFile === node.path
    
    return (
      <div className="w-full">
        {isFile ? (
          <button
            onClick={() => setActiveFile(node.path)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-all",
              isActive ? "bg-primary/10 text-primary font-bold shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <FileCode className={cn("w-3.5 h-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
            <span className="truncate">{node.name}</span>
          </button>
        ) : (
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
              <Folder className="w-3.5 h-3.5" />
              <span>{node.name}</span>
            </div>
            <div className="ml-2 border-l border-border/50 pl-2">
              {node.children?.map(child => (
                <FileExplorerNode key={child.path} node={child} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden selection:bg-primary/20">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => router.push("/")}
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <div className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-900" />
            </div>
            <span className="font-bold text-lg tracking-tight">Aether</span>
          </div>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border/50 liquid-glass">
            <TabButton 
              active={activeTab === 'preview'} 
              onClick={() => setActiveTab('preview')}
              icon={<Globe className="w-3.5 h-3.5" />}
              label="Preview"
            />
            <TabButton 
              active={activeTab === 'code'} 
              onClick={() => setActiveTab('code')}
              icon={<Code2 className="w-3.5 h-3.5" />}
              label="Code"
            />
            <TabButton 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
              icon={<Settings2 className="w-3.5 h-3.5" />}
              label="Settings"
            />
            <TabButton 
              active={activeTab === 'knowledge'} 
              onClick={() => setActiveTab('knowledge')}
              icon={<Brain className="w-3.5 h-3.5" />}
              label="Knowledge"
            />
            <TabButton 
              active={activeTab === 'history'} 
              onClick={() => setActiveTab('history')}
              icon={<History className="w-3.5 h-3.5" />}
              label="History"
            />
            <TabButton 
              active={activeTab === 'components'} 
              onClick={() => setActiveTab('components')}
              icon={<PlusCircle className="w-3.5 h-3.5" />}
              label="Components"
            />
            <TabButton 
              active={activeTab === 'deploy'} 
              onClick={() => setActiveTab('deploy')}
              icon={<Rocket className="w-3.5 h-3.5" />}
              label="Deploy"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare}
            className="h-9 px-4 rounded-xl text-xs font-bold gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
          <Button 
            size="sm" 
            onClick={handlePublish}
            disabled={isPublishing}
            className="h-9 px-5 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
            Publish
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Chat */}
        <div className="w-80 border-r border-border bg-background/50 backdrop-blur-xl flex flex-col z-40">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm tracking-tight">Aether AI</span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider">
              Online
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {project?.chatHistory?.map((msg, i) => (
              <div key={i} className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' ? "bg-primary text-primary-foreground ml-4" : "bg-muted/50 border border-border/50 mr-4"
              )}>
                {msg.content}
              </div>
            ))}
            {isAIProcessing && (
              <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Thinking...</span>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-muted/10">
            <div className="relative group">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAIRun()
                  }
                }}
                placeholder="Ask Aether to build something..."
                className="w-full bg-background border border-border rounded-[1.5rem] px-4 py-3 pr-12 text-sm outline-none focus:border-primary/50 transition-all resize-none shadow-sm"
                rows={3}
              />
              <Button 
                size="sm" 
                onClick={() => handleAIRun()}
                disabled={isAIProcessing || !input.trim()}
                className="absolute right-2 bottom-2 w-8 h-8 rounded-xl p-0 bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 text-center px-2">
              Shift + Enter for new line. AI can edit multiple files.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex overflow-hidden"
          >
            {activeTab === 'preview' && (
              <div className="flex-1 relative flex flex-col items-center p-0">
                {/* Preview Container */}
                <div className={cn(
                  "z-10 bg-card/40 backdrop-blur-3xl border-x border-b border-border shadow-2xl overflow-hidden flex flex-col relative transition-all duration-500 ease-in-out liquid-glass",
                  previewDevice === 'desktop' ? "w-full h-full" : 
                  previewDevice === 'tablet' ? "w-[768px] h-full max-h-full rounded-b-[2.5rem] border-t" : 
                  "w-[375px] h-full max-h-full rounded-b-[2.5rem] border-t"
                )}>
                  {/* Device Toggle */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/50 backdrop-blur-xl border border-border p-1 rounded-xl z-30 liquid-glass scale-90 origin-top-right">
                    <button 
                      onClick={() => setPreviewDevice('desktop')}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        previewDevice === 'desktop' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setPreviewDevice('tablet')}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        previewDevice === 'tablet' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Tablet className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setPreviewDevice('mobile')}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        previewDevice === 'mobile' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <button 
                      onClick={handleRefreshPreview}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-all"
                      title="Refresh Preview"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    {previewUrl === "about:blank" && !previewLoading ? (
                      <div className="flex flex-col items-center gap-6 p-12">
                        <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center border border-border">
                          <Rocket className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">Ready to build?</h3>
                          <p className="text-muted-foreground max-w-xs mx-auto">Tell Aether what you want to create and watch it come to life here.</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="rounded-xl border-border hover:bg-muted text-xs font-bold px-6"
                          onClick={() => setInput("Build a modern landing page for a SaaS product.")}
                        >
                          Try an example
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-background relative">
                        {previewLoading && (
                          <div className="absolute inset-0 bg-background/40 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-foreground/80 animate-bounce-intense" />
                            <span className="text-xs font-bold tracking-widest text-foreground uppercase">Building your app...</span>
                          </div>
                        )}
                        
                        {isAIProcessing && (
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-40 flex flex-col items-center justify-center p-8 text-center gap-6">
                            <div className="relative">
                              <div className="w-24 h-24 rounded-full border-4 border-primary/20 animate-pulse" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-primary animate-bounce" />
                              </div>
                            </div>
                            <div className="space-y-2 max-w-sm">
                              <h3 className="text-xl font-bold tracking-tight">{aiProgress.status}</h3>
                              <p className="text-sm text-muted-foreground">Aether is performing multi-file refactoring to fulfill your request.</p>
                            </div>
                            {aiProgress.files.length > 0 && (
                              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                                {aiProgress.files.map(file => (
                                  <div key={file} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
                                    <FileCode className="w-3 h-3" />
                                    {file}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <iframe 
                          src={previewUrl} 
                          className="w-full h-full border-none"
                          title="Preview"
                        />
                        {lastError && lastError.type === 'runtime' && (
                          <div className="absolute inset-x-4 bottom-4 bg-background/90 border border-red-500/50 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 z-40 liquid-glass animate-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              </div>
                              <div className="max-w-[200px] sm:max-w-md">
                                <div className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Runtime Error</div>
                                <div className="text-xs font-medium text-foreground line-clamp-1">{lastError.message}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setLastError(null)}
                                className="h-8 text-muted-foreground hover:text-foreground"
                              >
                                Dismiss
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleAutoHeal('runtime', lastError.message, lastError.stack || '')}
                                className="bg-primary text-primary-foreground font-bold h-8 rounded-lg shadow-lg shadow-primary/20"
                              >
                                <Sparkles className="w-3.5 h-3.5 mr-2" />
                                Fix with AI
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
                  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="flex-1 flex bg-background overflow-hidden">
                {/* File Explorer */}
                <div className="w-64 border-r border-border flex flex-col bg-muted/10">
                  <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-muted/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Files</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        const fileName = prompt("Enter file name:")
                        if (fileName && project) {
                          const updatedFiles = { ...project.files, [fileName]: "" }
                          const updatedProject = { ...project, files: updatedFiles, lastModified: Date.now() }
                          setProject(updatedProject)
                          storage.saveProject(updatedProject)
                          setActiveFile(fileName)
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="px-3 py-2 border-b border-border/50">
                    <div className="relative group">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text"
                        placeholder="Search files..."
                        value={fileSearch}
                        onChange={(e) => setFileSearch(e.target.value)}
                        className="w-full bg-background/50 border border-border rounded-lg py-1.5 pl-8 pr-2 text-xs outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    {buildFileTree(
                      Object.fromEntries(
                        Object.entries(project?.files || {}).filter(([path]) => 
                          path.toLowerCase().includes(fileSearch.toLowerCase())
                        )
                      )
                    ).map(node => (
                      <FileExplorerNode key={node.path} node={node} />
                    ))}
                  </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-muted/30">
                    <div className="flex items-center gap-2">
                      {activeFile && (
                        <div className="flex items-center gap-2 text-xs font-medium text-foreground bg-background px-3 py-1.5 rounded-lg border border-border shadow-sm">
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          {activeFile}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 text-xs font-bold gap-2 text-muted-foreground hover:text-foreground"
                        onClick={handleRefreshPreview}
                      >
                        <Play className="w-3.5 h-3.5" /> Run
                      </Button>
                    </div>
                  </div>
                    <div className="flex-1 relative flex flex-col min-h-0">
                      {activeFile && (
                        <MonacoEditor
                          height="100%"
                          language={activeFile.endsWith('.html') ? 'html' : activeFile.endsWith('.css') ? 'css' : activeFile.endsWith('.json') ? 'json' : 'javascript'}
                          theme={theme === 'dark' ? 'vs-dark' : 'light'}
                          value={project?.files?.[activeFile] || ''}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            roundedSelection: false,
                            scrollBeyondLastLine: false,
                            readOnly: false,
                            automaticLayout: true,
                            padding: { top: 20 },
                          }}
                          onChange={(value) => {
                            if (project && activeFile) {
                              const updatedFiles = { ...project.files, [activeFile]: value || '' }
                              const updatedProject = { ...project, files: updatedFiles, lastModified: Date.now() }
                              setProject(updatedProject)
                              storage.saveProject(updatedProject)
                            }
                          }}
                        />
                      )}
                    </div>

                    {/* Terminal Panel */}
                    <div className="h-48 border-t border-border flex flex-col bg-background/50 backdrop-blur-xl">
                      <div className="h-8 border-b border-border px-4 flex items-center justify-between bg-muted/20">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Terminal</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-[10px] font-bold text-muted-foreground hover:text-foreground"
                          onClick={() => setTerminalOutput([])}
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1">
                        {terminalOutput.map((line, i) => (
                          <div key={i} className={cn(
                            "flex gap-3",
                            line.type === 'error' ? "text-red-500" : 
                            line.type === 'success' ? "text-green-500" : "text-muted-foreground"
                          )}>
                            <span className="opacity-30 shrink-0">[{line.timestamp}]</span>
                            <span className="break-all">{line.message}</span>
                          </div>
                        ))}
                        <div ref={terminalEndRef} />
                        
                        {lastError && lastError.type === 'terminal' && (
                          <div className="mt-2 p-3 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                              <span className="text-red-500 font-medium">Terminal error detected</span>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleAutoHeal('terminal', lastError.message, lastError.command || '')}
                              className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold h-7 rounded-lg"
                            >
                              <Sparkles className="w-3 h-3 mr-1.5" /> AI Fix
                            </Button>
                          </div>
                        )}
                      </div>
                      <form onSubmit={handleTerminalSubmit} className="h-9 border-t border-border flex items-center px-3 bg-background">
                        <span className="text-primary font-bold mr-2 text-xs">~</span>
                        <input 
                          type="text"
                          value={terminalInput}
                          onChange={(e) => setTerminalInput(e.target.value)}
                          placeholder="Type a command (e.g., npm install, ls, clear)..."
                          className="flex-1 bg-transparent border-none outline-none text-[11px] font-mono placeholder:text-muted-foreground/50"
                        />
                      </form>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="flex-1 p-8 bg-background overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-12">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Project Settings</h2>
                    <p className="text-muted-foreground text-sm">Configure integrations and project metadata.</p>
                  </div>

                  {/* Supabase Integration */}
                  <div className="space-y-4 p-6 bg-muted/30 backdrop-blur-xl border border-border rounded-[2rem] liquid-glass">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                        <Database className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Supabase Integration</h3>
                        <p className="text-[11px] text-muted-foreground">Connect your own Supabase project for Auth & Database.</p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Project URL</label>
                        <input 
                          type="text" 
                          value={supabaseUrl}
                          onChange={(e) => setSupabaseUrl(e.target.value)}
                          placeholder="https://your-project.supabase.co" 
                          className="w-full bg-background/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Anon Key</label>
                        <input 
                          type="password" 
                          value={supabaseKey}
                          onChange={(e) => setSupabaseKey(e.target.value)}
                          placeholder="your-anon-key" 
                          className="w-full bg-background/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <Button 
                        size="sm" 
                        onClick={handleTestSupabase}
                        disabled={isSupabaseTesting}
                        className={cn(
                          "w-full font-bold h-10 rounded-xl transition-all",
                          supabaseStatus === 'success' ? "bg-green-600 hover:bg-green-700 text-white" :
                          supabaseStatus === 'error' ? "bg-red-600 hover:bg-red-700 text-white" :
                          "bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90"
                        )}
                      >
                        {isSupabaseTesting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {supabaseStatus === 'success' ? "Connected ✓" : 
                         supabaseStatus === 'error' ? "Connection Failed" : "Test Connection"}
                      </Button>
                    </div>
                  </div>

                  {/* GitHub Sync */}
                  <div className="space-y-4 p-6 bg-muted/30 backdrop-blur-xl border border-border rounded-[2rem] liquid-glass">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#24292f]/10 flex items-center justify-center border border-[#24292f]/20">
                        <Github className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">GitHub Source Control</h3>
                        <p className="text-[11px] text-muted-foreground">Manage branches and pull requests.</p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Repository</label>
                          <input 
                            type="text" 
                            value={githubRepo}
                            onChange={(e) => setGithubRepo(e.target.value)}
                            placeholder="username/project-repo" 
                            className="w-full bg-background/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/50 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Token</label>
                          <input 
                            type="password" 
                            value={githubToken}
                            onChange={(e) => setGithubToken(e.target.value)}
                            placeholder="ghp_xxxxxxxxxxxx" 
                            className="w-full bg-background/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/50 transition-colors"
                          />
                        </div>
                      </div>

                      {githubStatus === 'success' && (
                        <div className="grid grid-cols-2 gap-3 py-2 border-y border-border/50 my-2">
                          <div className="p-3 bg-background/50 border border-border rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GitBranch className="w-3 h-3 text-primary" />
                              <span className="text-[10px] font-bold">main</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold">Switch</Button>
                          </div>
                          <div className="p-3 bg-background/50 border border-border rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GitPullRequest className="w-3 h-3 text-blue-500" />
                              <span className="text-[10px] font-bold">0 PRs</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold">Create</Button>
                          </div>
                        </div>
                      )}

                      <Button 
                        size="sm" 
                        onClick={handlePushToGithub}
                        disabled={isGithubPushing}
                        className={cn(
                          "w-full font-bold h-10 rounded-xl flex items-center justify-center gap-2 transition-all",
                          githubStatus === 'success' ? "bg-green-600 hover:bg-green-700 text-white" :
                          githubStatus === 'error' ? "bg-red-600 hover:bg-red-700 text-white" :
                          "bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90"
                        )}
                      >
                        {isGithubPushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                        {githubStatus === 'success' ? "Sync with GitHub ✓" : 
                         githubStatus === 'error' ? "Sync Failed" : "Connect & Push"}
                      </Button>
                    </div>
                  </div>

                  {/* Database Visualizer */}
                  <div className="space-y-4 p-6 bg-muted/30 backdrop-blur-xl border border-border rounded-[2rem] liquid-glass">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <Database className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold">Schema Visualizer</h3>
                          <p className="text-[11px] text-muted-foreground">Manage your Supabase tables and relationships visually.</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs font-bold" onClick={addDbTable}>
                        <Plus className="w-3 h-3 mr-1" /> Add Table
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {dbTables.map(table => (
                        <div key={table.name} className="p-4 bg-background/50 border border-border rounded-xl space-y-3 hover:border-primary/30 transition-colors group relative">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold">{table.name}</span>
                            <span className="text-[9px] text-muted-foreground">{table.columns.length} columns</span>
                          </div>
                          <div className="space-y-1">
                            {table.columns.map(col => (
                              <div key={col.name} className="flex items-center justify-between text-[10px]">
                                <span className="text-muted-foreground">{col.name}</span>
                                <span className="text-primary/60 font-mono">{col.type}</span>
                              </div>
                            ))}
                          </div>
                          <button 
                            onClick={() => setDbTables(dbTables.filter(t => t.name !== table.name))}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Management */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-red-500">Danger Zone</h3>
                    <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-[2rem] flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold">Delete Project</div>
                        <div className="text-[11px] text-muted-foreground">This action cannot be undone. All files and history will be lost.</div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={deleteProject}
                        className="font-bold rounded-xl h-10 px-6"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="flex-1 p-8 bg-background overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-2xl font-bold">Knowledge Base</h2>
                      <p className="text-sm text-muted-foreground">Add documentation or rules to guide the AI's behavior for this project.</p>
                    </div>
                    <Button 
                      onClick={handleGenerateDocs}
                      disabled={isGeneratingDocs}
                      className="bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      {isGeneratingDocs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Generate Documentation
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {Object.entries(project?.knowledge || {}).length === 0 ? (
                      <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-[2rem] opacity-60">
                        <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm">No instructions or rules added yet.</p>
                      </div>
                    ) : (
                      Object.entries(project?.knowledge || {}).map(([title, content]) => (
                        <div key={title} className="p-6 bg-muted/30 backdrop-blur-xl border border-border rounded-[2rem] liquid-glass space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Book className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm font-bold">{title}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteKnowledge(title)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <textarea 
                            className="w-full bg-background/50 border border-border rounded-xl p-4 text-sm outline-none focus:border-primary/50 transition-all font-mono min-h-[150px] resize-none"
                            defaultValue={content}
                            placeholder="Enter instructions, rules, or documentation here..."
                            onBlur={(e) => saveKnowledge(title, e.target.value)}
                          />
                        </div>
                      ))
                    )}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full h-12 rounded-xl border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-sm font-bold gap-2"
                      onClick={() => {
                        const title = prompt("Enter instruction title (e.g., 'Coding Standards'):")
                        if (title) saveKnowledge(title, "")
                      }}
                    >
                      <Plus className="w-4 h-4" /> Add Instruction/Rule
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="flex-1 p-8 bg-background overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold">Project History</h2>
                    <p className="text-sm text-muted-foreground">Revert to previous versions of your project (Time Travel).</p>
                  </div>

                  <div className="space-y-4">
                    {(!project?.history || project.history.length === 0) ? (
                      <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-[2rem] opacity-60">
                        <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm">No history records yet. Start building to see changes here.</p>
                      </div>
                    ) : (
                      project.history.map((item: any) => (
                        <div key={item.id} className="p-6 bg-muted/30 backdrop-blur-xl border border-border rounded-[2rem] liquid-glass flex items-center justify-between group hover:border-primary/50 transition-all">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm font-bold truncate max-w-md">{item.description}</span>
                            </div>
                            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Monitor className="w-3 h-3" />
                                {new Date(item.timestamp).toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FileCode className="w-3 h-3" />
                                {item.filesModified?.length || 0} files modified
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRestoreHistory(item.id)}
                            className="rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Restore version
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'components' && (
              <div className="flex-1 p-8 bg-background overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-8">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold">Component Library</h2>
                    <p className="text-sm text-muted-foreground">Browse and add high-quality shadcn/ui components to your project.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { 
                        name: "Button", 
                        description: "Standard button with variants.", 
                        icon: <Zap />,
                        code: `import { Button } from "@/components/ui/button"\n\nexport default function Example() {\n  return (\n    <div className="p-4 flex gap-4">\n      <Button>Default</Button>\n      <Button variant="outline">Outline</Button>\n      <Button variant="ghost">Ghost</Button>\n    </div>\n  )\n}`
                      },
                      { 
                        name: "Input", 
                        description: "Text input with focus states.", 
                        icon: <Code2 />,
                        code: `import { Input } from "@/components/ui/input"\n\nexport default function Example() {\n  return (\n    <div className="p-4 max-w-sm space-y-4">\n      <Input placeholder="Enter email..." />\n      <Input type="password" placeholder="Password" />\n    </div>\n  )\n}`
                      },
                      { 
                        name: "Card", 
                        description: "Container with shadow and border.", 
                        icon: <PlusCircle />,
                        code: `import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"\n\nexport default function Example() {\n  return (\n    <Card className="w-full max-w-md">\n      <CardHeader>\n        <CardTitle>Project Card</CardTitle>\n      </CardHeader>\n      <CardContent>\n        <p className="text-sm text-muted-foreground">This is a beautiful card generated by Aether.</p>\n      </CardContent>\n    </Card>\n  )\n}`
                      },
                      { 
                        name: "Modal", 
                        description: "Overlay dialog for actions.", 
                        icon: <Shield />,
                        code: `export default function Modal() {\n  return (\n    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">\n      <div className="bg-background p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-border">\n        <h2 className="text-xl font-bold mb-4">Modal Title</h2>\n        <p className="text-muted-foreground mb-6">Are you sure you want to proceed with this action?</p>\n        <div className="flex justify-end gap-3">\n          <button className="px-4 py-2 rounded-lg hover:bg-muted transition-colors">Cancel</button>\n          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold">Confirm</button>\n        </div>\n      </div>\n    </div>\n  )\n}`
                      },
                      { 
                        name: "Auth Form", 
                        description: "Complete Login/Signup flow.", 
                        icon: <Shield />,
                        code: `export default function AuthForm() {\n  return (\n    <div className="max-w-md w-full p-8 bg-muted/30 border border-border rounded-[2rem] space-y-6">\n      <div className="text-center space-y-2">\n        <h1 className="text-3xl font-bold">Welcome back</h1>\n        <p className="text-muted-foreground text-sm">Sign in to your account to continue</p>\n      </div>\n      <div className="space-y-4">\n        <input className="w-full bg-background border border-border rounded-xl px-4 py-3" placeholder="Email" />\n        <input className="w-full bg-background border border-border rounded-xl px-4 py-3" type="password" placeholder="Password" />\n        <button className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl">Sign In</button>\n      </div>\n    </div>\n  )\n}`
                      },
                      { 
                        name: "Navbar", 
                        description: "Responsive navigation header.", 
                        icon: <Globe />,
                        code: `export default function Navbar() {\n  return (\n    <nav className="h-16 border-b border-border px-8 flex items-center justify-between bg-background/50 backdrop-blur-md">\n      <div className="font-bold text-xl">Aether App</div>\n      <div className="flex gap-6 text-sm font-medium">\n        <a href="#" className="hover:text-primary transition-colors">Home</a>\n        <a href="#" className="hover:text-primary transition-colors">Features</a>\n        <a href="#" className="hover:text-primary transition-colors">Pricing</a>\n      </div>\n      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold">Get Started</button>\n    </nav>\n  )\n}`
                      },
                    ].map(comp => (
                      <div key={comp.name} className="p-6 bg-muted/30 backdrop-blur-xl border border-border rounded-[2rem] liquid-glass space-y-4 group hover:border-primary/50 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {React.cloneElement(comp.icon as React.ReactElement, { className: "w-6 h-6 text-primary" })}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold">{comp.name}</h3>
                          <p className="text-xs text-muted-foreground">{comp.description}</p>
                        </div>
                        <Button 
                          className="w-full rounded-xl font-bold h-9 bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90"
                          onClick={() => {
                            setInput(comp.name)
                            setActiveTab('code')
                            handleAIRun(comp.code)
                          }}
                        >
                          Add to Project
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'deploy' && (
              <div className="flex-1 p-8 bg-background overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold">Deployment & Hosting</h2>
                    <p className="text-sm text-muted-foreground">Ship your application to production with one click.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vercel */}
                    <div className="p-8 bg-muted/30 backdrop-blur-xl border border-border rounded-[2rem] liquid-glass space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
                          <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold">Vercel</h3>
                          <p className="text-xs text-muted-foreground">Instant global deployment.</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-background/50 border border-border rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Status</span>
                            <span className="text-green-500 font-bold">Connected</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Last Deploy</span>
                            <span className="font-mono">2 hours ago</span>
                          </div>
                        </div>
                        <Button 
                          className="w-full rounded-xl font-bold bg-slate-900 text-white hover:opacity-90"
                          onClick={handlePublish}
                        >
                          Deploy to Vercel
                        </Button>
                      </div>
                    </div>

                    {/* Netlify */}
                    <div className="p-8 bg-muted/30 backdrop-blur-xl border border-border rounded-[2rem] liquid-glass space-y-6 opacity-60">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center">
                          <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold">Netlify</h3>
                          <p className="text-xs text-muted-foreground">Automated builds and serverless.</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full rounded-xl font-bold border-dashed">
                        Connect Netlify
                      </Button>
                    </div>
                  </div>

                  {/* Environment Variables */}
                  <div className="p-8 bg-muted/30 backdrop-blur-xl border border-border rounded-[2rem] liquid-glass space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">Environment Variables</h3>
                      <Button variant="ghost" size="sm" className="rounded-xl text-xs font-bold gap-2">
                        <Plus className="w-3 h-3" /> Add Variable
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { key: "DATABASE_URL", value: "postgresql://user:pass@host..." },
                        { key: "NEXT_PUBLIC_API_URL", value: "https://api.myapp.com" },
                      ].map(env => (
                        <div key={env.key} className="flex items-center gap-4 p-4 bg-background/50 border border-border rounded-xl">
                          <code className="text-[11px] font-bold text-primary w-1/3">{env.key}</code>
                          <input 
                            type="password" 
                            disabled 
                            value={env.value} 
                            className="bg-transparent text-[11px] text-muted-foreground flex-1"
                          />
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
        active 
          ? "bg-background text-foreground shadow-sm ring-1 ring-border" 
          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
      )}
    >
      {icon}
      {label}
    </button>
  )
}
