import React, { useState, useEffect, useRef } from 'react'
import { 
  AlertTriangle,
  ArrowUp,
  Check, 
  ChevronDown,
  ChevronRight,
  Clock,
  Code2, 
  Copy, 
  Download, 
  Edit3,
  ExternalLink, 
  Eye, 
  FileCode, 
  FileText, 
  File,
  Folder, 
  Github, 
  Globe, 
  History as HistoryIcon, 
  ImagePlus, 
  Layout, 
  LogOut, 
  MessageSquare, 
  MoreHorizontal, 
  MousePointer2,
  Palette,
  Plus, 
  RefreshCw, 
  Rocket, 
  RotateCcw,
  Search, 
  Settings, 
  Settings2, 
  Share2, 
  Shield, 
  Cpu, 
  Terminal as TerminalIcon, 
  Trash2, 
  Undo2,
  Upload,
  User, 
  Users, 
  X,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import MonacoEditor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import { useFirebase } from '@/components/FirebaseProvider'
import { cn } from '@/lib/utils'
import { streamRequest } from '@/lib/ai-service'
import { type Message, type Project } from '@/types'
import { saveProject, getProject } from '@/lib/storage'
import { toast } from 'sonner'
import { AetherLogo } from '../aether-logo'
import { useTheme } from 'next-themes'
import { TypingIndicator } from '../TypingIndicator'
import { SettingsDialog } from './SettingsDialog'
import { Terminal } from './Terminal'
import { TemplateMarketplace } from './TemplateMarketplace'
import { VoiceInput } from './VoiceInput'
import { getWebContainer, mountFiles } from '@/lib/webcontainer'
import { type Terminal as XTerm } from 'xterm'

import { encryptPayload, decryptPayload } from '@/lib/crypto'
import { LoginModal } from '@/components/LoginModal'
import { CONFIG } from '@/config'

interface EditorViewProps {
  projectId: string
  onBack: () => void
  isSharedView?: boolean
  sharedData?: Project | null
}

interface FileStatus {
  name: string
  status: 'writing' | 'saved'
}

export function Editor({ projectId, onBack, isSharedView = false }: EditorViewProps) {
  const { theme } = useTheme()
  const { user, signIn, saveProject: firebaseSaveProject, projects, saveSnapshot, getSnapshots, restoreSnapshot, fetchProjectById, deleteProject } = useFirebase()
  const [lastRemoteUpdate, setLastRemoteUpdate] = useState<number>(0)
  const [project, setProject] = useState<Project | null>(null)
  const [activeFile, setActiveFile] = useState('index.html')
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'history' | 'terminal'>(isSharedView ? 'preview' : 'preview')
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([])
  const [isMdPreview, setIsMdPreview] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'code' | 'preview' | 'history' | 'terminal'>('chat')
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [deletingFile, setDeletingFile] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'src': true })
  const [isTemplateMarketplaceOpen, setIsTemplateMarketplaceOpen] = useState(false)

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }))
  }

  const buildFileTree = (files: Record<string, string>) => {
    const tree: any = {}
    Object.keys(files).forEach(path => {
      const parts = path.split('/')
      let current = tree
      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          current[part] = { isFile: true, path }
        } else {
          if (!current[part]) current[part] = { isFile: false, children: {} }
          current = current[part].children
        }
      })
    })
    return tree
  }

  const renderFileTree = (tree: any, level = 0, parentPath = '') => {
    return Object.entries(tree).sort(([aName, a]: any, [bName, b]: any) => {
      if (a.isFile !== b.isFile) return a.isFile ? 1 : -1
      return aName.localeCompare(bName)
    }).map(([name, node]: any) => {
      const currentPath = parentPath ? `${parentPath}/${name}` : name
      
      if (node.isFile) {
        return (
          <motion.div 
            key={currentPath}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn("file-row relative group", activeFile === currentPath && "active")}
            style={{ paddingLeft: `${(level + 1) * 12}px` }}
            onClick={() => setActiveFile(currentPath)}
          >
            <div className="file-left flex-1 min-w-0">
              {name.endsWith('.html') ? <FileCode className="w-3.5 h-3.5" /> : name.endsWith('.md') ? <FileText className="w-3.5 h-3.5" /> : <File className="w-3.5 h-3.5" />}
              {renamingFile === currentPath ? (
                <input 
                  autoFocus
                  className="file-rename-input"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onBlur={confirmRename}
                  onKeyDown={e => {
                    if (e.key === 'Enter') confirmRename()
                    if (e.key === 'Escape') setRenamingFile(null)
                  }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <div className="file-name truncate" title={name}>{name}</div>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              {currentPath !== 'index.html' && (
                <>
                  {deletingFile === currentPath ? (
                    <div className="flex items-center gap-1">
                      <button className="file-mini text-emerald-500" title="Confirm" onClick={confirmDelete}><Check className="w-3 h-3" /></button>
                      <button className="file-mini text-rose-500" title="Cancel" onClick={() => setDeletingFile(null)}><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <>
                      <button className="file-mini" title="Rename" onClick={() => handleFileRename(currentPath)}><Edit3 className="w-3 h-3" /></button>
                      <button className="file-mini" title="Delete" onClick={() => handleFileDelete(currentPath)}><Trash2 className="w-3 h-3" /></button>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )
      } else {
        const isExpanded = expandedFolders[currentPath]
        return (
          <div key={currentPath}>
            <div 
              className="file-row group"
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={() => toggleFolder(currentPath)}
            >
              <div className="file-left flex-1 min-w-0">
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <Folder className="w-3.5 h-3.5 text-primary/60" />
                {renamingFile === currentPath ? (
                  <input 
                    autoFocus
                    className="file-rename-input"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onBlur={confirmRename}
                    onKeyDown={e => {
                      if (e.key === 'Enter') confirmRename()
                      if (e.key === 'Escape') setRenamingFile(null)
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <div className="file-name truncate font-medium">{name}</div>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                {deletingFile === currentPath ? (
                  <div className="flex items-center gap-1">
                    <button className="file-mini text-emerald-500" title="Confirm" onClick={confirmDelete}><Check className="w-3 h-3" /></button>
                    <button className="file-mini text-rose-500" title="Cancel" onClick={() => setDeletingFile(null)}><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <>
                    <button className="file-mini" title="New File" onClick={() => handleFileCreate(currentPath)}><Plus className="w-3 h-3" /></button>
                    <button className="file-mini" title="Rename" onClick={() => handleFileRename(currentPath)}><Edit3 className="w-3 h-3" /></button>
                    <button className="file-mini" title="Delete" onClick={() => handleFileDelete(currentPath)}><Trash2 className="w-3 h-3" /></button>
                  </>
                )}
              </div>
            </div>
            {isExpanded && (
              <div className="folder-children">
                {isCreatingFile && newFileParent === currentPath && (
                  <div className="file-row" style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}>
                    <div className="file-left flex-1 min-w-0">
                      <File className="w-3.5 h-3.5" />
                      <input 
                        autoFocus
                        className="file-rename-input"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onBlur={confirmFileCreate}
                        onKeyDown={e => {
                          if (e.key === 'Enter') confirmFileCreate()
                          if (e.key === 'Escape') setIsCreatingFile(false)
                        }}
                      />
                    </div>
                  </div>
                )}
                {renderFileTree(node.children, level + 1, currentPath)}
              </div>
            )}
          </div>
        )
      }
    })
  }
  const [projectName, setProjectName] = useState('')
  const [showAgentMode, setShowAgentMode] = useState(false)
  const [composerAnimate, setComposerAnimate] = useState(false)
    const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isCollaborateDialogOpen, setIsCollaborateDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [isGitHubSyncOpen, setIsGitHubSyncOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null)
  const [githubToken, setGithubToken] = useState<string>(localStorage.getItem('github_token') || '')
  const [githubConfig, setGithubConfig] = useState({ repo: '', branch: 'main' })
  const [terminalInstance, setTerminalInstance] = useState<XTerm | null>(null)
  const [webcontainer, setWebcontainer] = useState<any>(null)
  const [isWebContainerLoading, setIsWebContainerLoading] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [aiStatus, setAiStatus] = useState<'ready' | 'generating' | 'error' | 'stopped'>('ready')
  const [webContainerUrl, setWebContainerUrl] = useState<string | null>(null)
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<string>('index.html')
  const [showFileSuggestions, setShowFileSuggestions] = useState(false)
  const [isPlanMode, setIsPlanMode] = useState(false)
  const [isVisualEditMode, setIsVisualEditMode] = useState(false)
  const [isInspectMode, setIsInspectMode] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingContent, setThinkingContent] = useState('')
  const [thinkingStartTime, setThinkingStartTime] = useState<number>(0)
  const [showThinking, setShowThinking] = useState(false)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        const token = event.data.token
        setGithubToken(token)
        localStorage.setItem('github_token', token)
        toast.success('GitHub connected successfully!')
      }
      if (event.data?.type === 'INSPECT_ELEMENT') {
        const { element } = event.data;
        const prompt = `I want to edit the ${element.tagName.toLowerCase()} element with text "${element.innerText}" and classes "${element.className}". What should we change?`;
        setInput(prompt);
        setIsInspectMode(false);
        // Send message to iframe to disable inspect mode
        iframeRef.current?.contentWindow?.postMessage({ type: 'SET_INSPECT_MODE', enabled: false }, '*');
        toast.success('Element selected! Describe your changes.');
      }
    }
    window.addEventListener('message', handleMessage)

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Collaboration Effect
  useEffect(() => {
    if (!projectId || !project?.settings?.isCollaborative) return;

    const unsubscribe = fetchProjectById(projectId, (remoteProject) => {
      // Avoid circular updates
      if (remoteProject.updatedAt && new Date(remoteProject.updatedAt).getTime() > lastRemoteUpdate) {
        setProject(prev => {
          if (!prev) return remoteProject;
          // Only update if files are different to avoid unnecessary re-renders
          if (JSON.stringify(prev.files) !== JSON.stringify(remoteProject.files)) {
            setLastRemoteUpdate(Date.now());
            return { ...prev, files: remoteProject.files };
          }
          return prev;
        });
      }
    });

    return () => unsubscribe();
  }, [projectId, project?.settings?.isCollaborative]);

  // Auto-save Effect
  useEffect(() => {
    if (!project || !user) return;

    const timer = setTimeout(() => {
      // Only save if we are NOT in a collaborative session or if we are the owner
      // In a real app, we'd handle conflict resolution better
      if (Date.now() - lastRemoteUpdate > 2000) {
        saveProject(project);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [project?.files, user]);

  const handleConnectGithub = async () => {
    try {
      const response = await fetch('/api/auth/github/url')
      if (!response.ok) throw new Error('Failed to get auth URL')
      const { url } = await response.json()
      window.open(url, 'github_auth', 'width=600,height=700')
    } catch (error) {
      console.error('Failed to get GitHub auth URL:', error)
      toast.error('Failed to connect to GitHub')
    }
  }
  const [isSyncing, setIsSyncing] = useState(false)
  const [isNotesOpen, setIsNotesOpen] = useState(() => localStorage.getItem(`notes_open_${projectId}`) === 'true')
  const [notesPosition, setNotesPosition] = useState(() => {
    const saved = localStorage.getItem(`notes_pos_${projectId}`)
    return saved ? JSON.parse(saved) : { x: 100, y: 100 }
  })
  const [notes, setNotes] = useState('')

  // Sync notes from project
  useEffect(() => {
    if (project?.notes !== undefined) {
      setNotes(project.notes)
    } else {
      setNotes(localStorage.getItem(`notes_${projectId}`) || '')
    }
  }, [project?.id])

  // Persist notes to Firestore (debounced)
  useEffect(() => {
    if (!project) return
    const timer = setTimeout(async () => {
      if (notes !== project.notes) {
        const updated = { ...project, notes, lastModified: Date.now() }
        setProject(updated)
        await saveProject(updated)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [notes])

  useEffect(() => {
    localStorage.setItem(`notes_open_${projectId}`, String(isNotesOpen))
  }, [isNotesOpen, projectId])

  useEffect(() => {
    localStorage.setItem(`notes_pos_${projectId}`, JSON.stringify(notesPosition))
  }, [notesPosition, projectId])

  useEffect(() => {
    localStorage.setItem(`notes_${projectId}`, notes)
  }, [notes, projectId])

  useEffect(() => {
    if (isSharedView) {
      setActiveTab('preview')
    }
  }, [isSharedView])

  // Initialize WebContainer
  useEffect(() => {
    if (!project || isWebContainerLoading || webcontainer) return

    const initWebContainer = async () => {
      try {
        setIsWebContainerLoading(true)
        addTerminalLog('info', 'Booting WebContainer engine...')
        
        if (!window.crossOriginIsolated && window.self !== window.top) {
          addTerminalLog('error', 'Cross-Origin Isolation is required for WebContainer.')
          addTerminalLog('info', 'Please open the application in a new tab to enable full browser-side Node.js support.')
          toast.error('WebContainer requires a new tab to run Node.js/TSX.', {
            action: {
              label: 'Open in New Tab',
              onClick: () => window.open(window.location.href, '_blank')
            }
          })
          return
        }

        const wc = await getWebContainer()
        setWebcontainer(wc)
        addTerminalLog('success', 'WebContainer engine ready.')
        
        // Initial mount
        const files: any = {}
        Object.entries(project.files).forEach(([path, content]) => {
          const parts = path.split('/')
          let current = files
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i]
            if (i === parts.length - 1) {
              current[part] = { file: { contents: content } }
            } else {
              if (!current[part]) current[part] = { directory: {} }
              current = current[part].directory
            }
          }
        })
        
        await wc.mount(files)
        addTerminalLog('success', 'Project files mounted to WebContainer.')

        // Listen for server-ready
        wc.on('server-ready', (port, url) => {
          addTerminalLog('success', `Server ready at ${url}`);
          setWebContainerUrl(url);
          setActiveTab('preview');
        });
      } catch (error) {
        console.error('WebContainer boot failed:', error)
        addTerminalLog('error', 'WebContainer boot failed. Check COOP/COEP headers.')
      } finally {
        setIsWebContainerLoading(false)
      }
    }

    initWebContainer()
  }, [project?.id])

  const hasStartedDevServer = useRef(false)

  // Sync files to WebContainer on change
  const lastFilesRef = useRef<Record<string, string>>({})
  useEffect(() => {
    if (!webcontainer || !project) return

    const syncFiles = async () => {
      const currentFiles = project.files
      const lastFiles = lastFilesRef.current
      
      // If it's the first sync or many files changed, use mount
      const changedKeys = Object.keys(currentFiles).filter(k => currentFiles[k] !== lastFiles[k])
      const deletedKeys = Object.keys(lastFiles).filter(k => !currentFiles[k])
      
      if (Object.keys(lastFiles).length === 0 || changedKeys.length > 5 || deletedKeys.length > 0) {
        const files: any = {}
        Object.entries(currentFiles).forEach(([path, content]) => {
          const parts = path.split('/')
          let current = files
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i]
            if (i === parts.length - 1) {
              current[part] = { file: { contents: content } }
            } else {
              if (!current[part]) current[part] = { directory: {} }
              current = current[part].directory
            }
          }
        })
        await webcontainer.mount(files)
      } else {
        // Incremental sync for speed
        for (const key of changedKeys) {
          await webcontainer.fs.writeFile(key, currentFiles[key])
        }
      }
      
      lastFilesRef.current = { ...currentFiles }
      
      // If package.json exists and we haven't started the dev server, start it
      const hasVite = project.files['vite.config.js'] || project.files['vite.config.ts']
      const hasPackageJson = project.files['package.json']
      
      if (hasPackageJson && !hasStartedDevServer.current) {
        hasStartedDevServer.current = true
        setIsInstalling(true)
        addTerminalLog('info', 'Package.json detected. Preparing environment...')
        
        const installProcess = await webcontainer.spawn('npm', ['install'])
        installProcess.output.pipeTo(new WritableStream({
          write(data) { addTerminalLog('info', data) }
        }))
        
        const installExitCode = await installProcess.exit
        setIsInstalling(false)
        if (installExitCode === 0) {
          addTerminalLog('success', 'Dependencies installed.')
          addTerminalLog('info', 'Starting dev server...')
          
          // Try npm run dev or npm start
          const devCommand = hasVite ? ['run', 'dev'] : ['start']
          const devProcess = await webcontainer.spawn('npm', devCommand)
          devProcess.output.pipeTo(new WritableStream({
            write(data) { addTerminalLog('info', data) }
          }))
        } else {
          hasStartedDevServer.current = false
          addTerminalLog('error', 'Failed to install dependencies.')
        }
      }
    }

    syncFiles()
  }, [project?.files, webcontainer])

  const handleTerminalReady = (term: XTerm) => {
    setTerminalInstance(term)
    
    if (webcontainer) {
      startShell(term)
    }
  }

  const startShell = async (term: XTerm) => {
    if (!webcontainer) return
    
    const shellProcess = await webcontainer.spawn('jsh', {
      terminal: {
        cols: term.cols,
        rows: term.rows,
      },
    })

    shellProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          term.write(data)
        },
      })
    )

    const input = shellProcess.input.getWriter()
    term.onData((data) => {
      input.write(data)
    })

    return shellProcess
  }

  useEffect(() => {
    if (terminalInstance && webcontainer) {
      startShell(terminalInstance)
    }
  }, [terminalInstance, webcontainer])
  const [publishStatus, setPublishStatus] = useState<'idle' | 'packing' | 'publishing' | 'done' | 'error'>('idle')
  const [publishedUrl, setPublishedUrl] = useState('')
  const [terminalLogs, setTerminalLogs] = useState<{ type: 'info' | 'error' | 'success', msg: string, time: string }[]>([
    { type: 'info', msg: 'Aether OS v1.2.0 initialized.', time: new Date().toLocaleTimeString() },
    { type: 'success', msg: 'AI Orchestrator connected.', time: new Date().toLocaleTimeString() }
  ])
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [snapshotNote, setSnapshotNote] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasAutoSent = useRef(false)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const load = async () => {
      // Check for shared URL parameters
      const searchParams = new URLSearchParams(window.location.search)
      const src = searchParams.get('src')
      const key = window.location.hash.startsWith('#key=') ? window.location.hash.replace('#key=', '') : null

      if (src && key) {
        try {
          addTerminalLog('info', 'Loading shared project from URL...')
          const response = await fetch(src)
          if (!response.ok) throw new Error('Failed to fetch shared project')
          const encryptedData = await response.text()
          const decryptedJson = await decryptPayload(encryptedData, key)
          const sharedProject = JSON.parse(decryptedJson)
          setProject(sharedProject)
          setProjectName(sharedProject.name)
          addTerminalLog('success', 'Shared project loaded and decrypted.')
          return
        } catch (error) {
          console.error('Failed to load shared project:', error)
          addTerminalLog('error', 'Failed to load shared project.')
          toast.error('Failed to load shared project')
        }
      }

      // If it's a shared view (Firebase based), we always fetch by ID to get real-time updates even if not owner
      if (isSharedView) {
        unsubscribe = fetchProjectById(projectId, (p) => {
          setProject(p)
          setProjectName(p.name)
        })
      } else {
        console.log('[Editor] Loading regular project from Firebase projects array')
        console.log('[Editor] Available projects in Firebase:', projects.length)
        console.log('[Editor] Project IDs in Firebase:', projects.map(p => p.id))
        console.log('[Editor] Looking for projectId:', projectId)
        
        const p = projects.find(p => p.id === projectId)
        console.log('[Editor] Found project in Firebase array:', p ? 'YES' : 'NO')
        
        if (p) {
          console.log('[Editor] Setting project from Firebase array:', p.name)
          setProject(p)
          setProjectName(p.name)
          const snaps = await getSnapshots(projectId)
          setSnapshots(snaps)
        } else {
          console.log('[Editor] Project not found in Firebase array, trying direct fetch')
          // Fallback: Try to fetch directly from Firebase
          unsubscribe = fetchProjectById(projectId, (fetchedProject) => {
            console.log('[Editor] Fetched project directly:', fetchedProject)
            if (fetchedProject) {
              setProject(fetchedProject)
              setProjectName(fetchedProject.name)
            } else {
              console.error('[Editor] Could not fetch project directly either')
            }
          })
        }
      }
    }
    load()
    return () => unsubscribe?.()
  }, [projectId, projects, isSharedView])

  const addTerminalLog = (type: 'info' | 'error' | 'success', msg: string) => {
    setTerminalLogs(prev => [...prev, { type, msg, time: new Date().toLocaleTimeString() }])
  }

  useEffect(() => {
    const container = chatEndRef.current?.parentElement
    if (!container) return

    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100
    if (isAtBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [project?.messages, streamingContent, fileStatuses, isGenerating])

  // Auto-send initial prompt
  useEffect(() => {
    if (project && project.messages.length === 1 && project.messages[0].role === 'user' && !isGenerating && !hasAutoSent.current) {
      hasAutoSent.current = true
      handleSend(project.messages[0].content, true)
    }
  }, [project, isGenerating])

  const handleRename = async (newName: string, newSettings?: any) => {
    if (!project) return
    const updated = { 
      ...project, 
      name: newName, 
      settings: newSettings || project.settings,
      lastModified: Date.now() 
    }
    setProject(updated)
    setProjectName(newName)
    await saveProject(updated)
  }

  const extractAndStripFiles = (text: string) => {
    const files: Record<string, string> = {};
    const deletedFiles: string[] = [];
    let projectName: string | null = null;
    
    // 1. Extract COMPLETE files
    const completeRegex = /BEGIN FILE: ([^\n]+)\n([\s\S]*?)END FILE: \1/g;
    let strippedText = text.replace(completeRegex, (match, path, content) => {
      files[path.trim()] = content.trim();
      return ""; // Remove from visible text
    });

    // 2. Extract deletions
    const deleteRegex = /\[DELETE: (.*?)\]/g;
    strippedText = strippedText.replace(deleteRegex, (match, path) => {
      deletedFiles.push(path.trim());
      return "";
    });

    // 3. Extract project name
    const nameRegex = /\[PROJECT_NAME: (.*?)\]/;
    const nameMatch = strippedText.match(nameRegex);
    if (nameMatch) {
      projectName = nameMatch[1].trim();
      strippedText = strippedText.replace(nameMatch[0], "");
    }

    // 4. Strip PARTIAL files (from BEGIN FILE to end of text)
    const partialRegex = /BEGIN FILE: ([^\n]+)\n([\s\S]*)$/g;
    strippedText = strippedText.replace(partialRegex, "");

    return { strippedText, files, deletedFiles, projectName };
  }

  useEffect(() => {
    if (project?.settings) {
      const { highContrast, fontSize } = project.settings;
      
      // Apply High Contrast
      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }

      // Apply Font Size
      if (fontSize) {
        document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
      } else {
        document.documentElement.style.removeProperty('--base-font-size');
      }
    }
  }, [project?.settings]);

  const handleSend = async (overrideInput?: string, isAutoSend = false) => {
    console.log('[Editor] handleSend START - messageContent:', overrideInput || input)
    console.log('[Editor] handleSend - overrideInput:', overrideInput)
    console.log('[Editor] handleSend - isAutoSend:', isAutoSend)
    console.log('[Editor] handleSend - input:', input)
    console.log('[Editor] handleSend - selectedImage:', selectedImage)
    console.log('[Editor] handleSend - project exists:', !!project)
    console.log('[Editor] handleSend - isGenerating:', isGenerating)
    console.log('[Editor] handleSend - user exists:', !!user)
    
    const messageContent = overrideInput || input
    if ((!messageContent.trim() && !selectedImage) || !project || isGenerating) {
      console.log('[Editor] handleSend - Early return due to validation failure')
      return
    }

    if (!user && !isAutoSend) {
      console.log('[Editor] handleSend - User not authenticated, opening login modal')
      setIsLoginModalOpen(true)
      return
    }

    let updatedProject = { ...project }
    
    if (!isAutoSend) {
      const userMessage: Message = { role: 'user', content: messageContent }
      
      // Add image info to message if present
      if (selectedImage) {
        userMessage.content += `\n\n[Attached Image: ${selectedImage.mimeType}]`
      }

      updatedProject = {
        ...project,
        messages: [...project.messages, userMessage],
        updatedAt: new Date().toISOString()
      }
      setProject(updatedProject)
      setInput('')
    }

    // Handle greetings or empty messages
    const lowerInput = messageContent.toLowerCase().trim();
    if (lowerInput === 'hi' || lowerInput === 'hello' || lowerInput === 'hey') {
      const greeting: Message = {
        role: 'assistant',
        content: "Hello! I'm Aether, your AI development partner. I can help you build anything from a simple landing page to a complex web application.\n\n**What would you like to build today?**\n\nHere are some ideas to get started:\n- \"Create a modern SaaS dashboard\"\n- \"Build a dark-themed portfolio\"\n- \"A real-time crypto tracker\"\n- \"A minimalist task manager\""
      };
      
      const finalProject = {
        ...updatedProject,
        messages: [...updatedProject.messages, greeting]
      };
      
      setProject(finalProject);
      setIsGenerating(false);
      setAiStatus('ready');
      return;
    }

    setIsGenerating(true);
    setAiStatus('generating')
    setStreamingContent('')
    setFileStatuses([])
    
    const controller = new AbortController()
    setAbortController(controller)

    try {
      addTerminalLog('info', `Starting generation for prompt: "${messageContent.slice(0, 30)}..."`)

      let fullText = ""
      let lastExtractedFiles: Record<string, string> = {}

      // Bounded history: take last 10 messages before the current prompt
      const HISTORY_LIMIT = 10
      const history = updatedProject.messages.slice(-HISTORY_LIMIT - 1, -1)

      console.log('=== AI REQUEST DEBUG ===');
      console.log('messageContent:', messageContent);
      console.log('input state:', input);
      console.log('overrideInput:', overrideInput);
      console.log('isAutoSend:', isAutoSend);
      console.log('history length:', history.length);
      console.log('history:', history);
      console.log('========================');

      const isFirstMessage = updatedProject.messages.length <= 2;
      const personality = `
        You are Aether, an autonomous AI developer.
        ${isFirstMessage ? "This is the first prompt. Generate a professional project name and include it as [PROJECT_NAME: Your Name]." : ""}
        To create or update a file, wrap it in BEGIN FILE: path and END FILE: path.
        To delete a file, use [DELETE: path].
        
        CRITICAL GUIDELINES:
        1. UI: Use shadcn/ui components by default. Assume they are available in @/components/ui/*. Use Tailwind CSS for all styling.
        2. BACKEND: If the user needs a database or auth, use Supabase. Assume the client is initialized in @/lib/supabase.
        3. MOBILE: If the user asks for a mobile app, use React Native with Expo.
        4. NO CONVERSATION: DO NOT introduce yourself, DO NOT say "Hello", DO NOT say "I can help with that". Start DIRECTLY with the code or the task.
        5. PROJECT STRUCTURE: Follow standard Vite/React project structure for web and Expo structure for mobile.
      `;

      await streamRequest({
        input: messageContent,
        history,
        personality,
        sessionId: `${projectId}-${Date.now()}`, // Unique session ID to avoid caching
        provider: project?.settings?.aiProvider || 'gemini',
        model: project?.settings?.preferredModel,
        image: selectedImage || undefined,
        geminiApiKey: project?.settings?.geminiApiKey,
        openaiApiKey: project?.settings?.openaiApiKey,
        anthropicApiKey: project?.settings?.anthropicApiKey,
        files: project?.files,
        signal: controller.signal,
        onProvider: (provider, model) => {
          setProject(prev => {
            if (!prev) return null;
            return {
              ...prev,
              settings: {
                ...prev.settings,
                lastUsedProvider: provider,
                lastUsedModel: model
              }
            };
          });
        },
        onChunk: (chunk) => {
          fullText += chunk
          const { strippedText, files, deletedFiles, projectName } = extractAndStripFiles(fullText)
          
          // Remove any "Stream finished" or similar markers if they appear
          const cleanedText = strippedText.replace(/Stream finished\.?/gi, "").trim();
          setStreamingContent(cleanedText)
          
          // Update files in real-time
          const newFileNames = Object.keys(files).filter(name => !lastExtractedFiles[name])
          if (newFileNames.length > 0) {
            newFileNames.forEach(name => {
              addTerminalLog('success', `Writing file: ${name}`)
              setFileStatuses(prev => [...prev, { name, status: 'writing' }])
            })
          }
          
          if (Object.keys(files).length > 0 || deletedFiles.length > 0 || projectName) {
            lastExtractedFiles = files
            if (projectName) setProjectName(projectName)
            setProject(prev => {
              if (!prev) return null;
              const updatedFiles = { ...prev.files, ...files };
              deletedFiles.forEach(f => delete updatedFiles[f]);
              return { 
                ...prev, 
                name: projectName || prev.name,
                files: updatedFiles 
              };
            });
          }
        },
        onComplete: async (finalFullText) => {
          const { strippedText, files, deletedFiles, projectName } = extractAndStripFiles(finalFullText)
          const cleanedText = strippedText.replace(/Stream finished\.?/gi, "").trim();
          setFileStatuses(prev => prev.map(s => ({ ...s, status: 'saved' })))
          addTerminalLog('success', 'Generation complete. Files synchronized.')

          const assistantMessage: Message = { role: 'assistant', content: cleanedText }
          
          setProject(prev => {
            if (!prev) return null;
            const updatedFiles = { ...prev.files, ...files };
            deletedFiles.forEach(f => {
              const folderPath = f.endsWith('/') ? f : `${f}/`;
              const isFolder = Object.keys(updatedFiles).some(path => path.startsWith(folderPath));
              
              if (isFolder) {
                Object.keys(updatedFiles).forEach(path => {
                  if (path.startsWith(folderPath)) delete updatedFiles[path];
                });
              } else {
                delete updatedFiles[f];
              }
            });
            
            const finalProject: Project = {
              ...prev,
              messages: [...prev.messages, assistantMessage],
              files: updatedFiles,
              name: projectName || prev.name,
              updatedAt: new Date().toISOString(),
              lastModified: Date.now()
            };
            
            if (projectName) setProjectName(projectName)
            firebaseSaveProject(finalProject);
            saveProject(finalProject);
            return finalProject;
          });

          setStreamingContent('')
          setIsGenerating(false)
          setAiStatus('ready')
          setAbortController(null)
          setSelectedImage(null)
        },
        onError: (err) => {
          console.error(err)
          addTerminalLog('error', `Generation failed: ${err.message || 'Unknown error'}`)
          toast.error('Failed to generate response')
          setIsGenerating(false)
          setAiStatus('error')
          setAbortController(null)
        }
      })
    } catch (error) {
      console.error(error)
      setIsGenerating(false)
      setAiStatus('error')
      setAbortController(null)
    }
  }

  const handleStop = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsGenerating(false)
      setAiStatus('stopped')
      addTerminalLog('info', 'Generation stopped by user.')
    }
  }

  const handleSyncToGithub = async () => {
    if (!githubToken || !githubConfig.repo) {
      toast.error('Please connect GitHub and specify a repository')
      return
    }

    setIsSyncing(true)
    addTerminalLog('info', `Starting GitHub sync to ${githubConfig.repo}...`)
    
    try {
      const [owner, repo] = githubConfig.repo.split('/')
      if (!owner || !repo) throw new Error('Invalid repository format. Use user/repo')

      // 1. Get current branch ref (to get latest commit SHA)
      const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${githubConfig.branch}`, {
        headers: { 'Authorization': `token ${githubToken}` }
      })
      
      let baseTreeSha: string | undefined
      if (refRes.ok) {
        const refData = await refRes.json()
        baseTreeSha = refData.object.sha
      }

      // 2. Create blobs for each file
      const blobs = await Promise.all(Object.entries(project?.files || {}).map(async ([path, content]) => {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
          method: 'POST',
          headers: { 
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content, encoding: 'utf-8' })
        })
        const data = await res.json()
        return { path, sha: data.sha, mode: '100644', type: 'blob' }
      }))

      // 3. Create tree
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        headers: { 
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: blobs
        })
      })
      const treeData = await treeRes.json()

      // 4. Create commit
      const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        headers: { 
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Sync from Aether: ${new Date().toLocaleString()}`,
          tree: treeData.sha,
          parents: baseTreeSha ? [baseTreeSha] : []
        })
      })
      const commitData = await commitRes.json()

      // 5. Update ref
      const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${githubConfig.branch}`, {
        method: refRes.ok ? 'PATCH' : 'POST',
        headers: { 
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sha: commitData.sha,
          force: true,
          ...(refRes.ok ? {} : { ref: `refs/heads/${githubConfig.branch}` })
        })
      })

      if (!updateRefRes.ok) throw new Error('Failed to update repository reference')

      addTerminalLog('success', 'GitHub sync completed successfully.')
      toast.success('Project synced to GitHub!')
      setIsGitHubSyncOpen(false)
    } catch (error: any) {
      console.error('GitHub Sync Error:', error)
      addTerminalLog('error', `Sync failed: ${error.message}`)
      toast.error(`Sync failed: ${error.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSaveSnapshot = async () => {
    if (!project) return
    try {
      await saveSnapshot(projectId, project.files, snapshotNote)
      setSnapshotNote('')
      const snaps = await getSnapshots(projectId)
      setSnapshots(snaps)
      toast.success('Snapshot saved')
      addTerminalLog('success', 'Project snapshot created.')
    } catch (error) {
      toast.error('Failed to save snapshot')
    }
  }

  const handleRestoreSnapshot = async (snapId: string) => {
    if (!project) return
    try {
      const files = await restoreSnapshot(projectId, snapId)
      const updated: Project = { 
        ...project, 
        files, 
        updatedAt: new Date().toISOString(),
        lastModified: Date.now()
      }
      setProject(updated)
      await firebaseSaveProject(updated)
      toast.success('Snapshot restored')
      addTerminalLog('info', `Restored snapshot: ${snapId}`)
    } catch (error) {
      toast.error('Failed to restore snapshot')
    }
  }

  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [newFileParent, setNewFileParent] = useState<string | null>(null)

  const handleFileCreate = async (parentPath?: string) => {
    if (!project) return
    setNewFileParent(parentPath || null)
    setIsCreatingFile(true)
    setNewName('')
  }

  const confirmFileCreate = async () => {
    if (!project || !newName.trim()) {
      setIsCreatingFile(false)
      return
    }
    const clean = newName.trim()
    const fullPath = newFileParent ? `${newFileParent}/${clean}` : clean
    
    if (project.files[fullPath]) {
      toast.error('File already exists')
      return
    }
    const updated: Project = {
      ...project,
      files: { ...project.files, [fullPath]: '' },
      lastModified: Date.now()
    }
    setProject(updated)
    setActiveFile(fullPath)
    await saveProject(updated)
    setIsCreatingFile(false)
    setNewName('')
  }

  const handleFileDelete = async (path: string) => {
    if (!project || path === 'index.html') return
    setDeletingFile(path)
  }

  const confirmDelete = async () => {
    if (!project || !deletingFile) return
    const newFiles = { ...project.files }
    
    // Handle folder deletion
    const isFolder = !project.files[deletingFile]
    if (isFolder) {
      const folderPath = deletingFile.endsWith('/') ? deletingFile : `${deletingFile}/`
      Object.keys(newFiles).forEach(path => {
        if (path.startsWith(folderPath)) delete newFiles[path]
      })
    } else {
      delete newFiles[deletingFile]
    }

    const updated: Project = { ...project, files: newFiles, lastModified: Date.now() }
    setProject(updated)
    
    // If active file was in deleted folder, reset to index.html
    if (activeFile === deletingFile || activeFile.startsWith(deletingFile + '/')) {
      setActiveFile('index.html')
    }
    
    await saveProject(updated)
    toast.success(`Deleted ${deletingFile}`)
    setDeletingFile(null)
  }

  const handleFileRename = async (oldName: string) => {
    if (!project || oldName === 'index.html') return
    setRenamingFile(oldName)
    setNewName(oldName)
  }

  const confirmRename = async () => {
    if (!project || !renamingFile) return
    const name = newName.trim()
    if (!name || name === renamingFile) {
      setRenamingFile(null)
      return
    }

    const newFiles = { ...project.files }
    const isFolder = !project.files[renamingFile]

    if (isFolder) {
      const oldFolderPath = renamingFile.endsWith('/') ? renamingFile : `${renamingFile}/`
      const newFolderPath = name.endsWith('/') ? name : `${name}/`
      
      // Check if new folder name already exists
      const exists = Object.keys(newFiles).some(path => path.startsWith(newFolderPath))
      if (exists) {
        toast.error('Folder already exists')
        return
      }

      Object.keys(newFiles).forEach(path => {
        if (path.startsWith(oldFolderPath)) {
          const content = newFiles[path]
          const newPath = path.replace(oldFolderPath, newFolderPath)
          delete newFiles[path]
          newFiles[newPath] = content
        }
      })
    } else {
      if (newFiles[name]) {
        toast.error('File already exists')
        return
      }
      const content = newFiles[renamingFile]
      delete newFiles[renamingFile]
      newFiles[name] = content
    }

    const updated: Project = { ...project, files: newFiles, lastModified: Date.now() }
    setProject(updated)
    
    if (isFolder) {
      if (activeFile.startsWith(renamingFile + '/')) {
        setActiveFile(activeFile.replace(renamingFile + '/', name + '/'))
      }
    } else {
      if (activeFile === renamingFile) setActiveFile(name)
    }

    await saveProject(updated)
    toast.success(`Renamed to ${name}`)
    setRenamingFile(null)
  }

  const handleCodeChange = (value: string | undefined) => {
    if (!project || value === undefined) return
    const updated: Project = {
      ...project,
      files: { ...project.files, [activeFile]: value },
      lastModified: Date.now()
    }
    setProject(updated)
    saveProject(updated)
  }

  const togglePublic = async () => {
    if (!project) return
    const updated: Project = { ...project, isPublic: !project.isPublic, lastModified: Date.now() }
    setProject(updated)
    await firebaseSaveProject(updated)
    addTerminalLog('info', `Project visibility: ${updated.isPublic ? 'Public' : 'Private'}`)
  }

  const copyShareLink = () => {
    const url = `${window.location.origin}/#/shared/${projectId}`
    navigator.clipboard.writeText(url)
    toast.success('Share link copied to clipboard!')
  }

  const handlePublish = async (mode: 'viewer' | 'editor' = 'viewer') => {
    if (!project) return
    
    try {
      setPublishStatus('packing')
      addTerminalLog('info', `Packing project files for ${mode} mode...`)
      
      const payload = JSON.stringify(project)
      const { encryptedData, keyBase64 } = await encryptPayload(payload)
      
      setPublishStatus('publishing')
      addTerminalLog('info', 'Publishing encrypted payload...')
      
      const response = await fetch('https://aether-vert.vercel.app/api/publish-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          pathHint: `projects/${project.id}.json`,
          encryptedPayload: encryptedData,
          message: `DUB5: publish ${project.id} (${mode})`
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to publish project')
      }
      
      const { rawUrl } = await response.json()
      const baseUrl = window.location.origin + window.location.pathname
      const finalUrl = `${baseUrl}?src=${encodeURIComponent(rawUrl)}${mode === 'viewer' ? '&mode=viewer' : ''}#key=${keyBase64}`
      
      setPublishedUrl(finalUrl)
      setPublishStatus('done')
      addTerminalLog('success', `Project ${mode === 'viewer' ? 'deployed' : 'shared'} successfully!`)
      toast.success(mode === 'viewer' ? 'Project deployed!' : 'Share link generated!')
    } catch (error) {
      console.error('Publish error:', error)
      setPublishStatus('error')
      addTerminalLog('error', 'Failed to publish project.')
      toast.error('Failed to publish project')
    }
  }

  const copyPublishedUrl = () => {
    navigator.clipboard.writeText(publishedUrl)
    toast.success('Share link copied!')
  }

  const generatePreviewUrl = () => {
    if (!project) return ''
    const html = project.files['index.html'] || ''
    // Basic file resolution
    let processedHtml = html
    Object.entries(project.files).forEach(([name, content]) => {
      if (name.endsWith('.css')) {
        processedHtml = processedHtml.replace(new RegExp(`<link[^>]*href=["']${name}["'][^>]*>`, 'g'), `<style>${content}</style>`)
      }
      if (name.endsWith('.js')) {
        processedHtml = processedHtml.replace(new RegExp(`<script[^>]*src=["']${name}["'][^>]*><\/script>`, 'g'), `<script>${content}</script>`)
      }
    })

    // Inject Visual Inspector script
    const inspectorScript = `
      <script>
        (function() {
          let isInspectMode = false;
          window.addEventListener('message', (e) => {
            if (e.data.type === 'SET_INSPECT_MODE') {
              isInspectMode = e.data.enabled;
              document.body.style.cursor = isInspectMode ? 'crosshair' : 'default';
            }
          });

          document.addEventListener('click', (e) => {
            if (isInspectMode) {
              e.preventDefault();
              e.stopPropagation();
              const el = e.target;
              window.parent.postMessage({
                type: 'INSPECT_ELEMENT',
                element: {
                  tagName: el.tagName,
                  innerText: el.innerText.slice(0, 50),
                  className: el.className,
                  id: el.id
                }
              }, '*');
            }
          }, true);

          document.addEventListener('mouseover', (e) => {
            if (isInspectMode) {
              e.target.style.outline = '2px solid #3b82f6';
              e.target.style.outlineOffset = '-2px';
            }
          }, true);

          document.addEventListener('mouseout', (e) => {
            if (isInspectMode) {
              e.target.style.outline = 'none';
            }
          }, true);
        })();
      </script>
    `;

    // Suppress WebSocket errors in preview
    const suppressWsScript = `
      <script>
        (function() {
          const originalError = console.error;
          console.error = (...args) => {
            if (args[0] && typeof args[0] === 'string' && (args[0].includes('WebSocket') || args[0].includes('vite'))) {
              return;
            }
            originalError.apply(console, args);
          };
          window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.message && (event.reason.message.includes('WebSocket') || event.reason.message.includes('vite'))) {
              event.preventDefault();
            }
          });
        })();
      </script>
    `;

    if (processedHtml.includes('</head>')) {
      processedHtml = processedHtml.replace('</head>', `${suppressWsScript}</head>`)
    } else {
      processedHtml = suppressWsScript + processedHtml
    }

    if (processedHtml.includes('</body>')) {
      processedHtml = processedHtml.replace('</body>', `${inspectorScript}</body>`)
    } else {
      processedHtml += inspectorScript
    }

    return processedHtml
  }

  const dlHTML = () => {
    if (!project) return
    const html = project.files['index.html'] || ''
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(project.name || 'project').toLowerCase().replace(/\s+/g, '-')}.html`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const openTab = () => {
    const html = generatePreviewUrl()
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  if (!project) return null

  return (
    <div className={cn(
      "flex flex-col h-screen bg-[var(--bg)] text-[var(--t)] overflow-hidden",
      CONFIG.USE_LIQUID_DESIGN && "liquid-glass"
    )}>
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
        className="app-hdr"
      >
        <div className="brand cursor-pointer" onClick={onBack}>
          <AetherLogo size={24} />
        </div>
        <input 
          className="proj-input" 
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onBlur={(e) => handleRename(e.target.value)}
          placeholder="Untitled project" 
          maxLength={64}
          disabled={isSharedView}
        />
        <div className="app-right">
          {!isSharedView && (
            <div className="flex items-center gap-2 px-2 border-r border-[var(--bdr)] mr-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="icon-btn" title="Project Notes" onClick={() => setIsNotesOpen(!isNotesOpen)}><FileText className="w-3.5 h-3.5" /></motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="icon-btn" title="Download HTML" onClick={dlHTML}><Download className="w-3.5 h-3.5" /></motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="icon-btn" title="Deploy" onClick={() => { setPublishStatus('idle'); setIsDeployDialogOpen(true); }}><Rocket className="w-3.5 h-3.5" /></motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="icon-btn" title="Settings" onClick={() => setIsSettingsDialogOpen(true)}><Settings className="w-3.5 h-3.5" /></motion.button>
            </div>
          )}
          <div className="flex items-center gap-2">
            {!isSharedView && (
              <>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="icon-btn" title="Projects" onClick={onBack}><Folder className="w-3.5 h-3.5" /></motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="icon-btn" title="New project" onClick={() => window.location.hash = ''}><Plus className="w-3.5 h-3.5" /></motion.button>
              </>
            )}
            {isSharedView && (
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="px-4 py-1.5 bg-[var(--t)] text-[var(--bg)] rounded-full text-xs font-semibold hover:opacity-90 transition-opacity" 
                onClick={() => window.location.hash = ''}
              >
                Create Your Own
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      <div className="workspace">
        {!isSharedView && (
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.2, 0, 0, 1] }}
            className={cn(
              "chat",
              activeMobileTab !== 'chat' && "hidden md:flex"
            )}
          >
            <div className="msgs bg-black/20 backdrop-blur-md">
              <AnimatePresence initial={false}>
                {project.messages.length === 0 && !isGenerating && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center min-h-[400px] text-center p-8"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-[var(--bg3)] flex items-center justify-center mb-6 animate-pulse">
                      <AetherLogo className="w-10 h-10 opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-b from-[var(--t)] to-[var(--t2)]">
                      What shall we build?
                    </h3>
                    <p className="text-sm text-[var(--t3)] max-w-[260px] leading-relaxed mb-8">
                      Describe your application in plain English. I'll handle the code, design, and orchestration.
                    </p>
                    <div className="grid gap-2 w-full max-w-[280px]">
                      {[
                        "Create a modern SaaS dashboard",
                        "Build a dark-themed portfolio",
                        "A real-time crypto tracker",
                        "A minimalist task manager"
                      ].map((suggestion) => (
                        <button 
                          key={suggestion}
                          onClick={() => setInput(suggestion)}
                          className="text-left px-4 py-3 rounded-2xl bg-[var(--bg3)] border border-[var(--bdr)] hover:bg-[var(--bg2)] hover:border-[var(--bdr2)] transition-all text-xs text-[var(--t2)] hover:text-[var(--t)]"
                        >
                          "{suggestion}"
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
                {project.messages.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
                    className="msg"
                  >
                    <div className={cn(msg.role === 'user' ? "bubble user-bubble" : "ai-line md")}>
                      {msg.role === 'user' ? msg.content : (
                        <>
                          <div className="ai-intro text-sm text-[var(--t3)] mb-2">
                            Here's what I've built for you:
                          </div>
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </>
                      )}
                    </div>
                    <div className="msg-meta">
                      <span className="msg-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="msg-date">{new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      <button
                        className="msg-copy"
                        title="Copy message"
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content)
                          toast.success('Copied to clipboard')
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                
                {isThinking && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="msg"
                  >
                    <div className="ai-thinking">
                      <div className="flex items-center gap-2 text-primary text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="animate-pulse">Thinking {thinkingStartTime > 0 && `(${Math.floor((Date.now() - thinkingStartTime) / 1000)}s)`}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {(streamingContent || isGenerating) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="msg"
                  >
                    <div className="ai-line md">
                      {streamingContent && (
                        <ReactMarkdown>{streamingContent}</ReactMarkdown>
                      )}
                      {isGenerating && !streamingContent && (
                        <div className="flex justify-center py-3">
                          <TypingIndicator isVisible={true} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {fileStatuses.map((status, i) => (
                  <motion.div 
                    key={`status-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="file-status" 
                    onClick={() => { setActiveTab('code'); setActiveFile(status.name); }}
                  >
                    <div className="file-status-left">
                      <FileCode className="w-3.5 h-3.5" />
                      <div className="file-status-name" title={status.name}>{status.name}</div>
                    </div>
                    <div className="file-status-state">
                      {status.status === 'writing' ? (
                        <div className="flex items-center gap-2 text-primary animate-pulse">
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>Writing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="font-medium">Saved</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div ref={chatEndRef} />
            </div>
            <div className="composer">
              {project.messages.length === 0 && !isGenerating && (
                <div className="px-4 py-3 flex gap-2 overflow-x-auto">
                  {[
                    "Add a contact form",
                    "Create a pricing section",
                    "Add dark mode toggle",
                    "Make it responsive"
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-3 py-1.5 rounded-full bg-[var(--bg3)] border border-[var(--bdr)] text-xs text-[var(--t2)] whitespace-nowrap transition-all hover:bg-[var(--bg2)] hover:text-[var(--t)] hover:border-[var(--bdr2)]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              {selectedImage && (
                <div className="px-4 py-2 flex items-center gap-2">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[var(--bdr)] group">
                    <img src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--t3)] uppercase tracking-widest">Image attached</span>
                </div>
              )}
              <div>
                <textarea 
                  className="composer-input" 
                  value={input}
                  spellCheck={false}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Describe what you want to build or change..." 
                  rows={2}
                />
                <div className="pfoot">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsPlanMode(!isPlanMode)}
                      className={cn(
                        "p-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                        isPlanMode ? "bg-primary text-primary-foreground" : "hover:bg-[var(--bg3)] text-[var(--t3)] hover:text-[var(--t)]"
                      )}
                      title={isPlanMode ? "Switch to Build Mode" : "Switch to Plan Mode"}
                    >
                      {isPlanMode ? "Build" : "Plan"}
                    </button>
                    <button
                      onClick={() => setIsVisualEditMode(!isVisualEditMode)}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        isVisualEditMode ? "bg-primary text-primary-foreground" : "hover:bg-[var(--bg3)] text-[var(--t3)] hover:text-[var(--t)]"
                      )}
                      title="Toggle Visual Edit Mode"
                    >
                      <Palette className="w-4 h-4" />
                    </button>
                    <VoiceInput 
                      onTranscript={(transcript) => setInput(prev => prev + ' ' + transcript)}
                      disabled={isGenerating}
                    />
                    <button 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*,text/*,.pdf,.doc,.docx,.txt,.js,.ts,.tsx,.jsx,.css,.html,.json';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            // Check if it's an image for analysis
                            if (file.type.startsWith('image/')) {
                              const reader = new FileReader();
                              reader.onload = (re) => {
                                const base64 = (re.target?.result as string).split(',')[1];
                                setSelectedImage({ data: base64, mimeType: file.type });
                                toast.success('Image attached for analysis');
                              };
                              reader.readAsDataURL(file);
                            } else if (file.type.startsWith('text/') || 
                                       ['application/pdf', 'application/json', 'application/javascript'].includes(file.type) ||
                                       file.name.match(/\.(ts|tsx|jsx|js|css|html|json|txt|md)$/)) {
                              // Handle text-based files as context (could be implemented to read and append to prompt)
                              toast.info('Text file detected. I can read this as context if you paste its content or ask me to create it.');
                            } else {
                              toast.error(`I cannot analyze ${file.name} directly. Please upload images or text-based files.`);
                            }
                          }
                        };
                        input.click();
                      }}
                      className="p-2 hover:bg-[var(--bg3)] rounded-xl text-[var(--t3)] hover:text-primary transition-all"
                      title="Upload Files"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    className="send-btn" 
                    onClick={isGenerating ? handleStop : () => handleSend()}
                    disabled={!input.trim() && !selectedImage}
                    title={isGenerating ? "Stop" : "Send"}
                  >
                    {isGenerating ? (
                      <div className="w-2.5 h-2.5 bg-[var(--t)] rounded-sm" />
                    ) : (
                      <ArrowUp className="w-3 h-3 stroke-[3px]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}

        <section className={cn(
          "surface",
          activeMobileTab === 'chat' && "hidden md:flex"
        )}>
          <div className="topbar hidden md:flex">
            <div className="tabs">
              {[
                { id: 'preview', icon: Globe, label: 'Preview' },
                { id: 'code', icon: Code2, label: 'Code', hidden: isSharedView },
                { id: 'history', icon: HistoryIcon, label: 'History', hidden: isSharedView },
                { id: 'terminal', icon: TerminalIcon, label: 'Terminal', hidden: isSharedView },
              ].filter(t => !t.hidden).map((t) => (
                <button 
                  key={t.id}
                  className={cn("tab", activeTab === t.id && "active")} 
                  onClick={() => setActiveTab(t.id as any)}
                >
                  <t.icon /> 
                  {t.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              {activeTab === 'preview' && (
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  {[
                    { id: 'desktop', icon: Monitor, label: 'Desktop' },
                    { id: 'tablet', icon: Tablet, label: 'Tablet' },
                    { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                  ].map((device) => (
                    <button
                      key={device.id}
                      onClick={() => {
                        setProject(prev => prev ? { 
                          ...prev, 
                          settings: { ...prev.settings, previewDevice: device.id as any } 
                        } : null)
                      }}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        (project?.settings?.previewDevice || 'desktop') === device.id 
                          ? "bg-white text-black shadow-lg" 
                          : "text-white/40 hover:text-white hover:bg-white/5"
                      )}
                      title={device.label}
                    >
                      <device.icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              )}
              
              <div className="actions">
                {!isSharedView && (
                  <>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn("icon-btn", isInspectMode && "bg-primary text-primary-foreground")} 
                      title="Visual Inspector" 
                      onClick={() => {
                        const newMode = !isInspectMode
                        setIsInspectMode(newMode)
                        iframeRef.current?.contentWindow?.postMessage({ type: 'SET_INSPECT_MODE', enabled: newMode }, '*');
                        if (newMode) toast.info('Visual Inspector enabled. Click elements to edit.')
                      }}
                    >
                      <MousePointer2 className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      className="icon-btn" 
                      title="Refresh preview" 
                      onClick={() => { 
                        if (webContainerUrl) {
                          const current = webContainerUrl;
                          setWebContainerUrl('');
                          setTimeout(() => setWebContainerUrl(current), 10);
                        } else if (iframeRef.current) {
                          iframeRef.current.srcdoc = generatePreviewUrl();
                        }
                      }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="icon-btn" title="Open in new tab" onClick={openTab}><ExternalLink className="w-3.5 h-3.5" /></motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="icon-btn" title="Restore latest snapshot" onClick={() => snapshots[0] && handleRestoreSnapshot(snapshots[0].id)}><Undo2 className="w-3.5 h-3.5" /></motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="icon-btn" title="Template Marketplace" onClick={() => setIsTemplateMarketplaceOpen(true)}><Rocket className="w-3.5 h-3.5" /></motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="icon-btn" title="Collaborate & Share" onClick={() => setIsCollaborateDialogOpen(true)}><Share2 className="w-3.5 h-3.5" /></motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="icon-btn" title="Sync to GitHub" onClick={() => setIsGitHubSyncOpen(true)}>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                    </motion.button>
                  </>
                )}
                {isSharedView && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="icon-btn" title="Open in new tab" onClick={openTab}><ExternalLink className="w-3.5 h-3.5" /></motion.button>
                )}
              </div>
            </div>
          </div>

          <div className="main">
            {(activeTab === 'preview' || (activeMobileTab === 'preview' && activeTab !== 'code' && activeTab !== 'history')) && (
              <div className={cn(
                "pane-preview",
                activeMobileTab !== 'preview' && "hidden md:flex"
              )}>
                <div className={cn(
                  "preview-card liquid-glass transition-all duration-500",
                  (project?.settings?.previewDevice === 'tablet') && "max-w-[768px] mx-auto border-x-[12px] border-t-[12px] border-b-[40px] border-black rounded-[40px] shadow-2xl",
                  (project?.settings?.previewDevice === 'mobile') && "max-w-[375px] mx-auto border-x-[12px] border-t-[12px] border-b-[60px] border-black rounded-[50px] shadow-2xl"
                )}>
                  {project?.settings?.previewDevice === 'mobile' && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 border-white/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                    </div>
                  )}
                  {project?.settings?.previewDevice === 'tablet' && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    </div>
                  )}
                  {!window.crossOriginIsolated && window.self !== window.top && project.files['package.json'] && !webContainerUrl && (
                    <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                      <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">WebContainer Requires Isolation</h3>
                      <p className="text-sm text-white/70 mb-6 max-w-[320px]">
                        This React application requires a cross-origin isolated environment to run Node.js in your browser.
                      </p>
                      <button 
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in New Tab
                      </button>
                    </div>
                  )}
                  {(isWebContainerLoading || isInstalling) && (
                    <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                      <p className="text-white font-medium">
                        {isWebContainerLoading ? 'Booting WebContainer...' : 'Installing dependencies...'}
                      </p>
                      <p className="text-white/50 text-xs">This may take a minute</p>
                    </div>
                  )}
                  {hasStartedDevServer.current && !webContainerUrl && !isInstalling && (
                    <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                      <p className="text-white font-medium">Starting dev server...</p>
                      <p className="text-white/50 text-xs">This may take a minute for React apps</p>
                    </div>
                  )}
                  {(!project.files['index.html'] || project.files['index.html'].trim() === '') && !webContainerUrl && !hasStartedDevServer.current ? (
                    <div className="prev-empty">
                      <div className="prev-empty-inner">
                        <div className="prev-empty-icon">
                          <Rocket className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Aether Workspace</h3>
                        <p className="text-sm text-white/50 max-w-[280px]">
                          Ready to build your next big idea. Describe what you want in the chat to get started.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <iframe 
                      ref={iframeRef}
                      className="pframe" 
                      src={webContainerUrl || undefined}
                      srcDoc={!webContainerUrl ? generatePreviewUrl() : undefined}
                      sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin" 
                      title="Preview"
                      style={{ display: 'block' }}
                    />
                  )}
                </div>
              </div>
            )}

            {(activeTab === 'code' || activeMobileTab === 'code') && !isSharedView && (
              <div className={cn(
                "pane-code on",
                activeMobileTab !== 'code' && "hidden md:flex"
              )}>
                <aside className="files hidden lg:flex">
                  <div className="files-top">
                    <button className="file-btn" onClick={() => handleFileCreate()}><Plus className="w-3.5 h-3.5" /> New file</button>
                  </div>
                  <div className="file-list">
                    <AnimatePresence initial={false}>
                      {isCreatingFile && newFileParent === null && (
                        <div className="file-row" style={{ paddingLeft: '8px' }}>
                          <div className="file-left flex-1 min-w-0">
                            <File className="w-3.5 h-3.5" />
                            <input 
                              autoFocus
                              className="file-rename-input"
                              value={newName}
                              onChange={e => setNewName(e.target.value)}
                              onBlur={confirmFileCreate}
                              onKeyDown={e => {
                                if (e.key === 'Enter') confirmFileCreate()
                                if (e.key === 'Escape') setIsCreatingFile(false)
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {project && renderFileTree(buildFileTree(project.files))}
                    </AnimatePresence>
                  </div>
                </aside>
                <div className="editor liquid-glass">
                  <div className="editor-top">
                    <span>{activeFile}</span>
                    {activeFile.endsWith('.md') && (
                      <button className="md-toggle" style={{ display: 'inline-flex' }} onClick={() => setIsMdPreview(!isMdPreview)}>
                        <Eye className="w-3.5 h-3.5" /> {isMdPreview ? 'Edit' : 'Preview MD'}
                      </button>
                    )}
                  </div>
                  <div className="code-wrap">
                    {isMdPreview && activeFile.endsWith('.md') ? (
                      <div className="md-preview md" style={{ display: 'block' }}>
                        {/* Simple MD preview placeholder */}
                        <pre>{project.files[activeFile]}</pre>
                      </div>
                    ) : (
                      <div className="h-full border border-[var(--ed-border)] rounded-2xl overflow-hidden bg-[var(--bg2)] backdrop-blur-md">
                        <MonacoEditor
                          theme={theme === 'light' ? 'vs-light' : theme === 'black' ? 'pure-black' : 'dark-blue'}
                          beforeMount={(monaco) => {
                            monaco.editor.defineTheme('dark-blue', {
                              base: 'vs-dark',
                              inherit: true,
                              rules: [],
                              colors: {
                                'editor.background': '#0a0f1d',
                              }
                            });
                            monaco.editor.defineTheme('pure-black', {
                              base: 'vs-dark',
                              inherit: true,
                              rules: [],
                              colors: {
                                'editor.background': '#000000',
                              }
                            });
                          }}
                          path={activeFile}
                          language={activeFile.endsWith('.html') ? 'html' : activeFile.endsWith('.css') ? 'css' : 'javascript'}
                          value={project.files[activeFile]}
                          onChange={handleCodeChange}
                          options={{
                            minimap: { enabled: project.settings?.minimap ?? false },
                            fontSize: project.settings?.fontSize ?? 12.5,
                            fontFamily: project.settings?.fontFamily ?? "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace",
                            lineNumbers: project.settings?.lineNumbers === false ? 'off' : 'on',
                            wordWrap: project.settings?.wordWrap ? 'on' : 'off',
                            roundedSelection: false,
                            scrollBeyondLastLine: false,
                            readOnly: false,
                            automaticLayout: true,
                            padding: { top: 16 },
                            renderLineHighlight: 'none',
                            cursorBlinking: 'smooth',
                            smoothScrolling: true,
                            fontLigatures: true,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'history' || activeMobileTab === 'history') && !isSharedView && (
              <div className={cn(
                "pane-panel on flex flex-col h-full",
                activeMobileTab !== 'history' && "hidden md:flex"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="panel-head">Project History</div>
                    <div className="panel-sub">Visual timeline of your project's evolution.</div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg3)] rounded-full border border-[var(--bdr)] text-[10px] font-bold text-[var(--t3)]">
                    <Clock className="w-3 h-3" />
                    {snapshots.length} VERSIONS
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                  <div className="bento-card p-6 space-y-4 border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-sm font-bold">New Snapshot</div>
                    </div>
                    <textarea 
                      rows={3} 
                      className="pinput bg-[var(--bg3)] border border-[var(--bdr)] rounded-2xl min-h-[80px] text-xs" 
                      placeholder="What did you change in this version?"
                      value={snapshotNote}
                      onChange={(e) => setSnapshotNote(e.target.value)}
                    ></textarea>
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 py-2.5 bg-[var(--t)] text-[var(--bg)] rounded-xl text-xs font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg" 
                        onClick={handleSaveSnapshot}
                      >
                        Create Version
                      </button>
                      <button 
                        className="px-4 py-2.5 bg-[var(--bg3)] text-[var(--t3)] rounded-xl text-xs font-bold hover:bg-[var(--bg2)] transition-all" 
                        onClick={() => setSnapshotNote('')}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="relative space-y-4">
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--bdr2)] via-[var(--bdr)] to-transparent" />
                    
                    {snapshots.length > 0 ? snapshots.map((snap, idx) => (
                      <motion.div 
                        key={snap.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative pl-12 group"
                      >
                        <div className="absolute left-[21px] top-4 w-2.5 h-2.5 rounded-full bg-[var(--bdr2)] border-2 border-[var(--bg)] group-hover:bg-primary group-hover:scale-125 transition-all z-10" />
                        
                        <div className="bento-card p-5 group-hover:border-primary/30 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-tighter">v{snap.id.slice(0, 4)}</span>
                              <span className="text-[10px] text-[var(--t3)] font-medium">{new Date(snap.createdAt.seconds * 1000).toLocaleString()}</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 hover:bg-[var(--bg3)] rounded-lg text-[var(--t3)] hover:text-[var(--t)] transition-colors">
                                <Share2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-xs text-[var(--t2)] leading-relaxed mb-4 italic">"{snap.note || 'Manual snapshot'}"</p>
                          
                          <div className="flex gap-2">
                            <button 
                              className="flex-1 py-2 rounded-xl bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border border-white/5"
                              onClick={() => handleRestoreSnapshot(snap.id)}
                            >
                              Restore Version
                            </button>
                            <button className="px-3 py-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-colors border border-white/5">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-12 space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
                          <HistoryIcon className="w-8 h-8 text-white/10" />
                        </div>
                        <p className="text-xs text-white/20 font-bold uppercase tracking-widest">No history found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'terminal' || activeMobileTab === 'terminal') && !isSharedView && (
              <div className={cn(
                "pane-panel on flex flex-col h-full",
                activeMobileTab !== 'terminal' && "hidden md:flex"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="panel-head">Integrated Terminal</div>
                    <div className="panel-sub">Run Node.js, install packages, and execute scripts.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isWebContainerLoading ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold">
                        BOOTING ENGINE...
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                  <Terminal onTerminalReady={handleTerminalReady} />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Asset Manager */}
      <AnimatePresence>
        {isAssetManagerOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[var(--bg-overlay)] backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl liquid-glass rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <Folder className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Asset Manager</h3>
                    <p className="text-xs text-white/30">Manage your project's media and assets</p>
                  </div>
                </div>
                <button onClick={() => setIsAssetManagerOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-3 gap-6">
                  <button className="aspect-square rounded-3xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6 text-white/20 group-hover:text-primary" />
                    </div>
                    <span className="text-xs font-bold text-white/20 group-hover:text-primary uppercase tracking-widest">Upload</span>
                  </button>
                  {/* Mock assets */}
                  {[
                    { name: 'logo.png', type: 'image', url: 'https://picsum.photos/seed/logo/400' },
                    { name: 'hero.jpg', type: 'image', url: 'https://picsum.photos/seed/hero/400' },
                  ].map((asset, i) => (
                    <div key={i} className="aspect-square rounded-3xl bg-white/5 border border-white/10 overflow-hidden relative group">
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/90 via-[var(--bg)]/20 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <p className="text-xs font-bold text-white truncate mb-1">{asset.name}</p>
                        <button className="text-[10px] text-primary font-bold hover:underline text-left">Copy Path</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TemplateMarketplace 
        isOpen={isTemplateMarketplaceOpen}
        onClose={() => setIsTemplateMarketplaceOpen(false)}
        onSelect={(files) => {
          setProject(prev => prev ? { ...prev, files: { ...prev.files, ...files } } : null);
          toast.success('Template applied successfully!');
        }}
      />

      {/* Command Palette */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-4 bg-[var(--bg-overlay)] backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              className="w-full max-w-2xl liquid-glass rounded-[32px] shadow-2xl overflow-hidden border border-white/10"
            >
              <div className="p-5 border-b border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <input
                  autoFocus
                  placeholder="What can I help you build today?"
                  className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder:text-white/20 font-medium"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSend();
                      setIsCommandPaletteOpen(false);
                    }
                  }}
                />
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black text-white/40 tracking-tighter">
                  <span className="opacity-50">⌘</span>
                  <span>ENTER</span>
                </div>
              </div>
              <div className="p-3 max-h-[450px] overflow-y-auto custom-scrollbar">
                <div className="px-4 py-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Quick Actions</div>
                {[
                  { icon: Rocket, label: 'Deploy Project', sub: 'Publish to a secure URL', action: () => setIsDeployDialogOpen(true) },
                  { icon: Github, label: 'Sync to GitHub', sub: 'Push code to repository', action: () => setIsGitHubSyncOpen(true) },
                  { icon: Download, label: 'Export HTML', sub: 'Download as standalone file', action: dlHTML },
                  { icon: HistoryIcon, label: 'View History', sub: 'Restore previous versions', action: () => setActiveTab('history') },
                ].map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => { item.action(); setIsCommandPaletteOpen(false); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group text-left"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <item.icon className="w-6 h-6 text-white/40 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white/80 group-hover:text-white">{item.label}</div>
                      <div className="text-xs text-white/30">{item.sub}</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deploy Dialog */}
      <AnimatePresence>
        {isDeployDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md liquid-glass rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold">Deploy Project</h3>
                <button 
                  onClick={() => {
                    setIsDeployDialogOpen(false)
                    setPublishStatus('idle')
                    setPublishedUrl('')
                  }} 
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                {publishStatus === 'idle' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
                      <Rocket className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h4 className="text-lg font-bold mb-2">Ready to deploy?</h4>
                      <p className="text-sm text-white/50">
                        Your project will be encrypted client-side and published as a standalone, immutable preview link.
                      </p>
                    </div>
                    <button 
                      onClick={() => handlePublish('viewer')}
                      className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Deploy Project
                    </button>
                  </div>
                )}

                {(publishStatus === 'packing' || publishStatus === 'publishing') && (
                  <div className="py-12 text-center space-y-4">
                    <p className="text-lg font-bold capitalize">{publishStatus}...</p>
                    <p className="text-sm text-white/50">
                      {publishStatus === 'packing' ? 'Encrypting project files...' : 'Uploading to secure storage...'}
                    </p>
                  </div>
                )}

                {publishStatus === 'done' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                      <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-emerald-500 mb-1">Deployed!</h4>
                      <p className="text-sm text-white/50">Your project is live and encrypted.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Deployment Link</p>
                      <div className="flex gap-2">
                        <input 
                          readOnly 
                          value={publishedUrl}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none text-white/70"
                        />
                        <button 
                          onClick={copyPublishedUrl}
                          className="p-3 bg-white text-black rounded-xl hover:bg-white/90 transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-white/30 italic">
                        Note: The decryption key is in the URL hash and never touches the server.
                      </p>
                    </div>

                    <button 
                      onClick={() => setIsDeployDialogOpen(false)}
                      className="w-full py-3 bg-white/10 text-white rounded-2xl font-semibold hover:bg-white/20 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}

                {publishStatus === 'error' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-red-500/10 rounded-2xl border border-red-500/20 text-center">
                      <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-red-500 mb-1">Deployment Failed</h4>
                      <p className="text-sm text-white/50">Something went wrong during the process.</p>
                    </div>
                    <button 
                      onClick={() => handlePublish('viewer')}
                      className="w-full py-3 bg-white text-black rounded-2xl font-semibold hover:bg-white/90 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GitHub Sync Dialog */}
      <AnimatePresence>
        {isGitHubSyncOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md liquid-glass rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center">
                    <Github className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">GitHub Sync</h3>
                    <p className="text-xs text-white/30">Professional version control</p>
                  </div>
                </div>
                <button onClick={() => setIsGitHubSyncOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                {!githubToken ? (
                  <div className="text-center space-y-6 py-4">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto">
                      <Github className="w-10 h-10 text-white/20" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white">Connect your account</h4>
                      <p className="text-sm text-white/40">Sync your code directly to a GitHub repository without manual setup.</p>
                    </div>
                    <button
                      onClick={handleConnectGithub}
                      className="w-full h-14 bg-white text-black rounded-2xl font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5"
                    >
                      <Github className="w-5 h-5" />
                      Connect GitHub
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        <span className="text-sm font-medium text-green-500">Connected to GitHub</span>
                      </div>
                      <button 
                        onClick={() => {
                          setGithubToken('')
                          localStorage.removeItem('github_token')
                        }}
                        className="text-xs text-white/30 hover:text-white transition-colors underline underline-offset-4"
                      >
                        Disconnect
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Repository (user/repo)</label>
                        <input 
                          type="text" 
                          className="glass-input"
                          placeholder="username/repository"
                          value={githubConfig.repo}
                          onChange={(e) => setGithubConfig({ ...githubConfig, repo: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Branch</label>
                        <input 
                          type="text" 
                          className="glass-input"
                          placeholder="main"
                          value={githubConfig.branch}
                          onChange={(e) => setGithubConfig({ ...githubConfig, branch: e.target.value })}
                        />
                      </div>
                    </div>

                    <button 
                      disabled={isSyncing || !githubConfig.repo}
                      onClick={handleSyncToGithub}
                      className="w-full h-14 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-white/5"
                    >
                      <RefreshCw className="w-5 h-5" />
                      {isSyncing ? 'Synchronizing...' : 'Sync Now'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Collaborate Dialog */}
      <AnimatePresence>
        {isCollaborateDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md liquid-glass rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold">Collaborate & Share</h3>
                <button onClick={() => setIsCollaborateDialogOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                {publishStatus === 'idle' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Share2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">Editor Share</p>
                          <p className="text-xs text-white/40">Share the full editor experience</p>
                        </div>
                      </div>
                      <p className="text-sm text-white/50">
                        Generate an encrypted link that allows others to view and edit your project code.
                      </p>
                    </div>
                    <button 
                      onClick={() => handlePublish('editor')}
                      className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Generate Share Link
                    </button>
                  </div>
                )}

                {(publishStatus === 'packing' || publishStatus === 'publishing') && (
                  <div className="py-12 text-center space-y-4">
                    <p className="text-lg font-bold capitalize">{publishStatus}...</p>
                  </div>
                )}

                {publishStatus === 'done' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                      <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-emerald-500 mb-1">Link Ready!</h4>
                      <p className="text-sm text-white/50">Your editor share link is generated.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Share Link</p>
                      <div className="flex gap-2">
                        <input 
                          readOnly 
                          value={publishedUrl}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none text-white/70"
                        />
                        <button 
                          onClick={copyPublishedUrl}
                          className="p-3 bg-white text-black rounded-xl hover:bg-white/90 transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => setIsCollaborateDialogOpen(false)}
                      className="w-full py-3 bg-white/10 text-white rounded-2xl font-semibold hover:bg-white/20 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}

                {publishStatus === 'error' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-red-500/10 rounded-2xl border border-red-500/20 text-center">
                      <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-red-500 mb-1">Failed to generate link</h4>
                    </div>
                    <button 
                      onClick={() => handlePublish('editor')}
                      className="w-full py-3 bg-white text-black rounded-2xl font-semibold hover:bg-white/90 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Dialog */}
      <SettingsDialog 
        isOpen={isSettingsDialogOpen}
        onClose={() => setIsSettingsDialogOpen(false)}
        project={project}
        setProject={setProject}
        onRename={handleRename}
        onDelete={async () => {
          await deleteProject(projectId)
          toast.success('Project deleted successfully')
          onBack()
        }}
      />

      {/* Notes Window */}
      <AnimatePresence>
        {isNotesOpen && (
          <motion.div
            drag
            dragMomentum={false}
            initial={notesPosition}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragEnd={(e, info) => setNotesPosition({ x: info.point.x, y: info.point.y })}
            className="fixed z-[200] w-80 liquid-glass rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ height: '400px' }}
          >
            <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5 cursor-move">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-50">Project Notes</span>
              </div>
              <button onClick={() => setIsNotesOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes or tasks here..."
              className="flex-1 bg-transparent p-4 text-sm outline-none resize-none placeholder:text-white/10 text-white"
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Mobile Navigation */}
      {!isSharedView && (
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
          <div className="liquid-glass rounded-full p-1.5 flex items-center justify-between shadow-2xl border-white/10">
            {[
              { id: 'chat', icon: MessageSquare, label: 'Chat' },
              { id: 'code', icon: Code2, label: 'Code' },
              { id: 'preview', icon: Globe, label: 'Preview' },
              { id: 'history', icon: HistoryIcon, label: 'History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveMobileTab(tab.id as any);
                  if (tab.id !== 'chat') {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2 rounded-full transition-all",
                  activeMobileTab === tab.id 
                    ? "bg-[var(--t)] text-[var(--bg)] shadow-lg" 
                    : "text-[var(--t3)] hover:text-[var(--t)]"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <LoginModal 
        open={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={signIn} 
      />
    </div>
  )
}