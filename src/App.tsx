"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import FallbackIcon from '@/components/FallbackIcon'
import { 
  ChevronDown,
  ArrowUp,
  ArrowLeft,
  Loader2,
  Rocket,
  Heart,
  AlertTriangle,
  Plus,
  Search,
  Settings2,
  Brain,
  Trash2,
  Layout,
  Users,
  Lock,
  Calendar,
  Clock,
  Library,
  Sparkles,
  ZapOff,
  Terminal,
  Share2,
  Globe,
  Cpu,
  Zap,
  MousePointer2,
  Code2,
  Layers,
  Shield,
  MessageSquare,
  MoreHorizontal,
  ImageIcon,
} from "lucide-react"
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Navbar } from '@/components/navbar'
import { ThemeProvider } from '@/components/theme-provider'
import { FirebaseProvider, useFirebase } from '@/components/FirebaseProvider'
import { cn } from '@/lib/utils'
import { storage } from '@/lib/storage'
import { type Project } from '@/types'
import { Toaster, toast } from "sonner"
import { Editor } from '@/components/editor/Editor'
import { Onboarding } from '@/components/Onboarding'
import { TemplateMarketplace } from '@/components/TemplateMarketplace'
import { CommunityGallery } from '@/components/CommunityGallery'
import { ProjectPreview } from '@/components/ProjectPreview'
import { LoginModal } from '@/components/LoginModal'
import PrivacyPolicy from '@/pages/PrivacyPolicy'
import TermsOfService from '@/pages/TermsOfService'
import { CONFIG } from '@/config'
import { type Template, TEMPLATES } from '@/lib/templates'
import { IconSystem } from '@/components/IconSystem'
import { ImageGenerator } from '@/components/ImageGenerator'
import { AgentMode } from '@/components/AgentMode'
import { Pricing } from '@/components/Pricing'
import { Ads } from '@/components/Ads'

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  )
}

function AppContent() {
  const { user, loading, signIn, logout, projects: allProjects, saveProject, deleteProject } = useFirebase()

  useEffect(() => {
    // Suppress WebSocket/Vite errors that are expected in sandboxed environments
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && (args[0].includes('WebSocket') || args[0].includes('vite'))) {
        return;
      }
      originalError.apply(console, args);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.message && (event.reason.message.includes('WebSocket') || event.reason.message.includes('vite'))) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
      console.error = originalError;
    };
  }, []);
  const [gradientTheme, setGradientTheme] = useState<'blue' | 'pink' | 'emerald' | 'sunset' | 'sea' | 'purple' | 'midnight' | 'amber'>('midnight')
  const [executionMode, setExecutionMode] = useState<'plan' | 'fast'>('fast')
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [currentRoute, setCurrentRoute] = useState<string>('')
  const [isSharedView, setIsSharedView] = useState(false)
  const [activeDoc, setActiveDoc] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [showImageGenerator, setShowImageGenerator] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showAgentMode, setShowAgentMode] = useState(false)

  const sortedProjects = [...allProjects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  const recentProjects = sortedProjects.slice(0, 3)

  useEffect(() => {
    // Check for onboarding
    const hasSeenOnboarding = localStorage.getItem('aether_onboarding_complete')
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem('aether_onboarding_complete', 'true')
    setShowOnboarding(false)
  }

  const handleTemplateSelect = async (template: Template) => {
    const newProject: Project = {
      id: `template-${template.id}-${Date.now()}`,
      name: template.name,
      files: template.files,
      lastModified: Date.now(),
      ownerId: user?.uid || 'local',
      messages: [],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    await saveProject(newProject)
    window.location.hash = `#/editor/${newProject.id}`
  }

  useEffect(() => {
    // Simple hash-based routing
    const handleHashChange = () => {
      const searchParams = new URLSearchParams(window.location.search)
      const src = searchParams.get('src')
      const mode = searchParams.get('mode')
      const hash = window.location.hash
      
      if (src) {
        setActiveProjectId('shared-url')
        setCurrentRoute(mode === 'viewer' ? 'shared' : 'editor')
        setIsSharedView(mode === 'viewer')
        return
      }

      if (hash.startsWith('#/editor/')) {
        setActiveProjectId(hash.replace('#/editor/', ''))
        setCurrentRoute('editor')
        setIsSharedView(false)
      } else if (hash.startsWith('#/shared/')) {
        setActiveProjectId(hash.replace('#/shared/', ''))
        setCurrentRoute('shared')
        setIsSharedView(true)
      } else if (hash === '#/docs') {
        setCurrentRoute('docs')
        setActiveProjectId(null)
      } else if (hash === '#/community') {
        setCurrentRoute('community')
        setActiveProjectId(null)
      } else if (hash === '#/changelog') {
        setCurrentRoute('changelog')
        setActiveProjectId(null)
      } else if (hash === '#/projects') {
        setCurrentRoute('projects')
        setActiveProjectId(null)
      } else if (hash === '#/templates') {
        setCurrentRoute('templates')
        setActiveProjectId(null)
      } else if (hash === '#/marketplace') {
        setCurrentRoute('marketplace')
        setActiveProjectId(null)
      } else if (hash === '#/pricing') {
        setCurrentRoute('pricing')
        setActiveProjectId(null)
      } else if (hash === '#/ads') {
        setCurrentRoute('ads')
        setActiveProjectId(null)
      } else if (currentRoute === 'pricing') {
        setCurrentRoute('pricing')
        setActiveProjectId(null)
      } else if (hash === '#/ads') {
        setCurrentRoute('ads')
        setActiveProjectId(null)
      } else if (currentRoute === 'ads') {
        setCurrentRoute('ads')
        setActiveProjectId(null)
      } else if (hash === '#/privacy-policy') {
        setCurrentRoute('ads')
        setActiveProjectId(null)
      } else if (hash === '#/privacy-policy') {
        setCurrentRoute('privacy-policy')
        setActiveProjectId(null)
      } else if (hash === '#/terms-of-service') {
        setCurrentRoute('terms-of-service')
        setActiveProjectId(null)
      } else {
        setActiveProjectId(null)
        setCurrentRoute('')
      }
    }

      window.addEventListener('hashchange', handleHashChange)
      handleHashChange()
      return () => {
        window.removeEventListener('hashchange', handleHashChange)
        setActiveDoc(null)
      }
    }, [])

  const handleGradientChange = (theme: typeof gradientTheme) => {
    setGradientTheme(theme)
    localStorage.setItem('aether-gradient-theme', theme)
    document.documentElement.setAttribute('data-gradient-theme', theme)
  }

  const handleStartProject = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (busy) return
    const trimmed = input.trim()
    if (!trimmed) return
    
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }

    setBusy(true)
    const id = Math.random().toString(36).substring(7)
    const newProject: Project = {
      id,
      name: "New Project",
      lastModified: Date.now(),
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isPublic: false,
      ownerId: user.uid,
      files: {
        'index.html': ''
      },
      messages: [{ role: "user", content: trimmed }]
    }
    
    try {
      await saveProject(newProject)
      toast.success("Project created!")
      window.location.hash = `#/editor/${id}`
      setInput("")
    } catch (error) {
      console.error("Project creation error:", error)
      toast.error("Failed to create project")
    } finally {
      setBusy(false)
    }
  }

  const [isDeleting, setIsDeleting] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id)
      toast.success("Project permanently deleted")
    } catch (error) {
      toast.error("Failed to delete project")
    } finally {
      setIsDeleting(false)
      setProjectToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center gap-6">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3] 
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut" 
              }}
              className="w-2.5 h-2.5 bg-[var(--t)] rounded-full"
            />
          ))}
        </div>
      </div>
    )
  }

  if (activeProjectId || currentRoute === 'shared') {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light", "dark", "black"]}>
        <Editor 
          projectId={activeProjectId!} 
          onBack={() => window.location.hash = isSharedView ? '' : '#/projects'} 
          isSharedView={isSharedView}
        />
        <Toaster position="bottom-center" richColors />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'privacy-policy') {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light", "dark", "black"]}>
        <PrivacyPolicy />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'terms-of-service') {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light", "dark", "black"]}>
        <TermsOfService />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'docs' || currentRoute === 'community' || currentRoute === 'changelog' || currentRoute === 'projects' || currentRoute === 'templates' || currentRoute === 'pricing' || currentRoute === 'ads') {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light", "dark", "black"]}>
        <div className={cn(
          "relative min-h-screen bg-background text-foreground selection:bg-primary/30",
          CONFIG.USE_LIQUID_DESIGN && "liquid-glass"
        )}>
          <AnimatePresence>
            {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
          </AnimatePresence>
          <div 
            suppressHydrationWarning
            className={cn(
              "landing-bg",
              `gradient-${gradientTheme}`
            )} 
          />
          <Navbar />
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20"
          >
            <div className="space-y-12">
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center gap-4">
                  {activeDoc && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full"
                      onClick={() => setActiveDoc(null)}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  )}
                  <h1 className="text-5xl font-bold tracking-tight capitalize">
                    {activeDoc || (currentRoute === 'projects' ? 'All Projects' : currentRoute)}
                  </h1>
                </div>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                  {currentRoute === 'docs' && !activeDoc && "Everything you need to know about building with Aether."}
                  {currentRoute === 'docs' && activeDoc === 'Quick Start Guide' && "Follow these simple steps to build your first app without writing a single line of code."}
                  {currentRoute === 'community' && "Join thousands of developers building the future of software."}
                  {currentRoute === 'changelog' && "The latest updates, features, and improvements to Aether."}
                  {currentRoute === 'projects' && "Manage and access all your generated projects in one place."}
                  {currentRoute === 'templates' && "Jumpstart your next project with professionally crafted starters."}
                  {currentRoute === 'pricing' && "Simple, transparent pricing. Everything is free, forever."}
                </p>
              </div>

              {currentRoute === 'pricing' && (
                <Pricing />
              )}

              {currentRoute === 'ads' && (
                <Ads />
              )}

              {currentRoute === 'docs' && activeDoc && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-12 bento-card p-12 shadow-2xl"
                >
                  <button 
                    onClick={() => setActiveDoc(null)}
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity mb-8"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Docs
                  </button>
                  {activeDoc === 'Quick Start Guide' && (
                    <div className="grid gap-8">
                      {[
                        { 
                          s: '01', 
                          t: 'Tell us what to build', 
                          d: 'Just type what you want in plain English. Example: "A simple task manager with a dark theme."',
                          i: MessageSquare
                        },
                        { 
                          s: '02', 
                          t: 'Aether makes it', 
                          d: 'Our AI builds everything for you in seconds. It creates the files, the design, and the logic automatically.',
                          i: Cpu
                        },
                        { 
                          s: '03', 
                          t: 'Instant Preview & Edits', 
                          d: 'See your app as it grows. Want a different color or a new feature? Just ask the AI and it updates instantly.',
                          i: Zap
                        },
                        { 
                          s: '04', 
                          t: 'Free Deployment & Sharing', 
                          d: 'When you\'re ready, get a public link to share your app with anyone. It\'s fast, free, and secure.',
                          i: Share2
                        }
                      ].map((step, idx) => (
                        <div key={step.s} className="p-8 rounded-[40px] liquid-glass border border-[var(--bdr)] flex gap-8 items-start group hover:border-primary/30 transition-all overflow-hidden">
                          <div className="flex-shrink-0 w-16 h-16 rounded-3xl bg-[var(--bg3)] flex items-center justify-center text-2xl font-black text-[var(--t3)]">
                            {step.s}
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold flex items-center gap-3 text-[var(--t)] group-hover:text-primary transition-colors">
                              <step.i className="w-6 h-6 text-[var(--t3)]" />
                              {step.t}
                            </h3>
                            <p className="text-lg text-[var(--t2)] leading-relaxed">{step.d}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeDoc === 'How Aether works' && (
                    <div className="space-y-12">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-[40px] liquid-glass border border-[var(--bdr)] space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-primary" />
                          </div>
                          <h3 className="text-2xl font-bold">Autonomous Orchestration</h3>
                          <p className="text-[var(--t2)] leading-relaxed">
                            Unlike traditional AI assistants that only give you snippets of code, Aether orchestrates entire projects. It understands the relationship between your frontend, backend, and styling, ensuring everything works together seamlessly.
                          </p>
                        </div>
                        <div className="p-8 rounded-[40px] liquid-glass border border-[var(--bdr)] space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-primary" />
                          </div>
                          <h3 className="text-2xl font-bold">Real-time Compilation</h3>
                          <p className="text-[var(--t2)] leading-relaxed">
                            As you chat, the AI is writing code in the background. Our system compiles this code in real-time, allowing you to see a live preview of your application without having to wait for manual builds.
                          </p>
                        </div>
                      </div>
                      <div className="p-8 rounded-[40px] liquid-glass border border-[var(--bdr)] space-y-6">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                          <Cpu className="w-6 h-6 text-primary" />
                          The Build Process
                        </h3>
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">1</div>
                            <p className="text-[var(--t2)]">The AI analyzes your prompt and plans the necessary file structure.</p>
                          </div>
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">2</div>
                            <p className="text-[var(--t2)]">It generates the code for each file, following best practices for React and Tailwind CSS.</p>
                          </div>
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">3</div>
                            <p className="text-[var(--t2)]">The orchestration engine verifies the build and starts the development server.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDoc === 'Settings' && (
                    <div className="space-y-12">
                      <div className="p-8 rounded-[40px] liquid-glass border border-[var(--bdr)] space-y-6">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                          <Settings2 className="w-6 h-6 text-primary" />
                          Workspace Configuration
                        </h3>
                        <p className="text-[var(--t2)]">
                          Customize your development environment to suit your workflow. You can manage everything from visual themes to advanced AI parameters.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <h4 className="font-bold">Visual Themes</h4>
                            <p className="text-sm text-[var(--t3)]">Switch between Light, Dark, and System modes. You can also customize the primary accent color of your workspace.</p>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-bold">AI Execution Mode</h4>
                            <p className="text-sm text-[var(--t3)]">Choose between "Fast" for quick iterations and "Plan" for complex architectural changes that require more reasoning.</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-8 rounded-[40px] liquid-glass border border-[var(--bdr)] space-y-6">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                          <Shield className="w-6 h-6 text-primary" />
                          API Keys & Security
                        </h3>
                        <p className="text-[var(--t2)]">
                          Your API keys are stored securely in your browser's local storage and are never sent to our servers.
                        </p>
                        <div className="bg-[var(--bg3)] p-6 rounded-2xl border border-[var(--bdr)]">
                          <p className="text-sm font-mono text-[var(--t3)]">
                            Settings &gt; API Keys &gt; [Your Key Name]
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDoc === 'Publishing' && (
                    <div className="space-y-12">
                      <div className="text-center space-y-4">
                        <h3 className="text-3xl font-bold">Go live in one click</h3>
                        <p className="text-[var(--t2)] max-w-xl mx-auto">
                          When you're happy with your app, sharing it with the world is as easy as clicking a button.
                        </p>
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-[32px] liquid-glass border border-[var(--bdr)] space-y-4">
                          <Globe className="w-8 h-8 text-primary" />
                          <h4 className="font-bold">Public URL</h4>
                          <p className="text-sm text-[var(--t3)]">Get a unique, permanent URL for your application that works on any device.</p>
                        </div>
                        <div className="p-6 rounded-[32px] liquid-glass border border-[var(--bdr)] space-y-4">
                          <Share2 className="w-8 h-8 text-primary" />
                          <h4 className="font-bold">Collaborative Links</h4>
                          <p className="text-sm text-[var(--t3)]">Share your project with other developers so they can remix and build upon your work.</p>
                        </div>
                        <div className="p-6 rounded-[32px] liquid-glass border border-[var(--bdr)] space-y-4">
                          <Rocket className="w-8 h-8 text-primary" />
                          <h4 className="font-bold">Instant Updates</h4>
                          <p className="text-sm text-[var(--t3)]">Any changes you make in the editor are instantly reflected on your live site.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDoc === 'Custom Agents' && (
                    <div className="space-y-12">
                      <div className="p-8 rounded-[40px] liquid-glass border border-[var(--bdr)] space-y-6">
                        <h3 className="text-2xl font-bold">Specialized AI Experts</h3>
                        <p className="text-[var(--t2)]">
                          Aether allows you to use specialized AI agents that are experts in specific domains like styling, performance, or database design.
                        </p>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg3)]">
                            <Users className="w-6 h-6 text-primary" />
                            <div>
                              <h4 className="font-bold italic">Tailwind Wizard</h4>
                              <p className="text-sm text-[var(--t3)]">Expert in utility-first CSS and responsive design patterns.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg3)]">
                            <Zap className="w-6 h-6 text-primary" />
                            <div>
                              <h4 className="font-bold italic">Performance Pro</h4>
                              <p className="text-sm text-[var(--t3)]">Optimizes React renders and bundle sizes for lightning-fast apps.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDoc === 'State Management' && (
                    <div className="space-y-12">
                      <div className="p-8 rounded-[40px] liquid-glass border border-[var(--bdr)] space-y-6">
                        <h3 className="text-2xl font-bold">Handling Data in AI Apps</h3>
                        <p className="text-[var(--t2)]">
                          Aether is trained to handle complex state management patterns using modern React hooks and context.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <h4 className="font-bold text-primary">Local State</h4>
                            <p className="text-sm text-[var(--t3)]">The AI uses `useState` and `useReducer` for component-level data that doesn't need to be shared globally.</p>
                          </div>
                          <div className="space-y-3">
                            <h4 className="font-bold text-primary">Global State</h4>
                            <p className="text-sm text-[var(--t3)]">For cross-component data, it implements the React Context API or integrates with libraries like Zustand.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDoc === 'Security & Auth' && (
                    <div className="space-y-12">
                      <div className="p-8 rounded-[40px] liquid-glass border border-[var(--bdr)] space-y-6">
                        <h3 className="text-2xl font-bold">Protecting Your Users</h3>
                        <p className="text-[var(--t2)]">
                          Security is built into the core of Aether. We provide seamless integration with industry-standard authentication providers.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-emerald-500" />
                              <h4 className="font-bold">Firebase Auth</h4>
                            </div>
                            <p className="text-sm text-[var(--t3)]">Easily add Google, Email/Password, or Social logins to your application with just a few prompts.</p>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-blue-500" />
                              <h4 className="font-bold">Firestore Rules</h4>
                            </div>
                            <p className="text-sm text-[var(--t3)]">The AI can automatically generate secure database rules to ensure users can only access their own data.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-8 border-t border-border">
                      <div className="rounded-[40px] liquid-glass border border-[var(--bdr)] p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                        <div className="space-y-2 text-center md:text-left">
                          <h4 className="text-xl font-bold text-[var(--t)]">Ready to start?</h4>
                          <p className="text-[var(--t2)]">Go back to the home page and type your first prompt.</p>
                        </div>
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto rounded-2xl px-8 font-bold"
                        onClick={() => {
                          window.location.hash = ''
                          setActiveDoc(null)
                        }}
                      >
                        Start Building Now
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentRoute === 'templates' && (
                <TemplateMarketplace onSelect={handleTemplateSelect} />
              )}



              {currentRoute === 'community' && (
                <CommunityGallery user={user} />
              )}

              {currentRoute === 'projects' ? (
                !user ? (
                  <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bento-card">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                      <Lock className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Sign in Required</h3>
                      <p className="text-muted-foreground max-w-xs mx-auto">Please sign in to view and manage your projects.</p>
                    </div>
                    <Button onClick={signIn} className="rounded-full px-12 py-6 font-bold text-lg shadow-xl shadow-primary/20">Sign In with Google</Button>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedProjects.length > 0 ? sortedProjects.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5 }}
                      className="group relative bento-card border border-slate-200/50 dark:border-white/5 hover:border-primary/30 transition-all duration-500 cursor-pointer"
                      onClick={() => window.location.hash = `#/editor/${p.id}`}
                    >
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <ProjectPreview project={p} />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-xl truncate pr-4 group-hover:text-primary transition-colors">{p.name}</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-[var(--bg3)]">
                                <MoreHorizontal className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 liquid-glass border border-[var(--bdr)]">
                              <DropdownMenuItem 
                                className="rounded-xl cursor-pointer focus:bg-[var(--bg3)]"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.location.hash = `#/editor/${p.id}`
                                }}
                              >
                                <Code2 className="w-4 h-4 mr-2" />
                                Edit Project
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setProjectToDelete(p.id)
                                  setIsDeleting(true)
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Permanently Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Layout className="w-3.5 h-3.5" /> {Object.keys(p.files).length} {Object.keys(p.files).length === 1 ? 'file' : 'files'}</span>
                          <div className="w-1 h-1 rounded-full bg-border" />
                          <span className="flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5" /> {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-full py-32 text-center bento-card border-2 border-dashed border-border bg-muted/30">
                      <div className="mb-6 flex justify-center">
                        <motion.div 
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center"
                        >
                          <Plus className="w-10 h-10 text-muted-foreground" />
                        </motion.div>
                      </div>
                      <h3 className="text-2xl font-bold mb-3">No projects yet</h3>
                      <p className="text-muted-foreground mb-8 max-w-xs mx-auto">Your creative journey starts here. Build your first autonomous app today.</p>
                      <Button 
                        size="lg"
                        className="rounded-full px-8 font-bold"
                        onClick={() => window.location.hash = ''}
                      >
                        Create New Project
                      </Button>
                    </div>
                  )}
                </div>
              )) : (
                <div className="space-y-16">
                  {currentRoute === 'docs' && !activeDoc && (
                    <div className="grid gap-16">
                      <section className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">Getting Started</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                          {[
                            { t: 'Quick Start Guide', d: 'Learn the basics and build your first app in minutes.', i: Rocket },
                            { t: 'How Aether works', d: 'Learn how our AI builds and updates your code.', i: Brain },
                            { t: 'Settings', d: 'Manage your workspace and API keys.', i: Settings2 },
                            { t: 'Publishing', d: 'How to share your app with the world.', i: Globe }
                          ].map(item => (
                            <div key={item.t} className="p-8 rounded-[32px] liquid-glass border border-[var(--bdr)] hover:border-primary/30 transition-all cursor-pointer group overflow-hidden" onClick={() => setActiveDoc(item.t)}>
                              <div className="w-12 h-12 rounded-2xl bg-[var(--bg3)] flex items-center justify-center mb-6">
                                <item.i className="w-6 h-6 text-[var(--t3)]" />
                              </div>
                              <h3 className="text-xl font-bold mb-3 text-[var(--t)] group-hover:text-primary transition-colors">{item.t}</h3>
                              <p className="text-sm text-[var(--t2)] leading-relaxed">{item.d}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">Advanced Topics</h2>
                        <div className="grid sm:grid-cols-3 gap-6">
                          {[
                            { t: 'Custom Agents', d: 'Build and train your own specialized AI agents for specific coding tasks.', i: Users },
                            { t: 'State Management', d: 'Best practices for handling complex application states with AI-generated code.', i: Zap },
                            { t: 'Security & Auth', d: 'Implementing robust authentication and data protection in your Aether projects.', i: Shield }
                          ].map(item => (
                            <div key={item.t} className="p-6 rounded-[24px] liquid-glass border border-[var(--bdr)] hover:border-primary/30 transition-all cursor-pointer group overflow-hidden" onClick={() => setActiveDoc(item.t)}>
                              <div className="w-10 h-10 rounded-xl bg-[var(--bg3)] flex items-center justify-center mb-4">
                                <item.i className="w-5 h-5 text-[var(--t3)]" />
                              </div>
                              <h4 className="font-bold mb-2 text-[var(--t)] group-hover:text-primary transition-colors">{item.t}</h4>
                              <p className="text-xs text-[var(--t2)] leading-relaxed">{item.d}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  )}
                  {currentRoute === 'changelog' && (
                    <div className="space-y-12 max-w-4xl mx-auto">
                      <div className="space-y-4 text-center mb-16">
                        <h2 className="text-5xl font-black tracking-tight">Changelog</h2>
                        <p className="text-xl text-muted-foreground">The journey of building Aether, one update at a time.</p>
                      </div>
                      {[
                        { 
                          v: '2.1.0', 
                          d: 'April 2026', 
                          t: 'The Design Refinement',
                          c: 'Major overhaul of the landing page for a more minimal and consistent aesthetic. Updated branding to DUB5. Improved community sharing with direct preview URLs. Standardized template marketplace with real-time previews.',
                          features: [
                            'Minimalist landing page redesign',
                            'DUB5 branding integration',
                            'Direct preview sharing in Community Gallery',
                            'Standardized Template Marketplace UI',
                            'Animated pricing plan hover states',
                            'Removed "Open Editor" hover buttons for cleaner project management'
                          ]
                        },
                        { 
                          v: '2.0.0', 
                          d: 'April 2026', 
                          t: 'The Production Update',
                          c: 'Official production launch of Aether. Complete UI overhaul with Liquid Glass design system, real-time project previews, and community gallery integration.',
                          features: [
                            'Liquid Glass design system',
                            'Real-time project previews',
                            'Community Gallery integration',
                            'Advanced AI orchestration engine'
                          ]
                        },
                        { 
                          v: '1.5.0', 
                          d: 'January 2026', 
                          t: 'Engine Optimization',
                          c: 'Enhanced AI orchestration engine with multi-file editing capabilities and improved Tailwind CSS generation.',
                          features: [
                            'Multi-file editing support',
                            'Tailwind CSS generation improvements',
                            'Faster dependency management'
                          ]
                        },
                        { 
                          v: '1.0.0', 
                          d: 'December 2025', 
                          t: 'Public Beta',
                          c: 'Initial public beta release of the Aether autonomous development platform.',
                          features: [
                            'Autonomous code generation',
                            'Integrated WebContainer environment',
                            'Basic project management'
                          ]
                        }
                      ].map(item => (
                        <div key={item.v} className="relative pl-12 border-l-2 border-primary/20 pb-12 last:pb-0">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-[var(--bg)]" />
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <span className="text-3xl font-black text-[var(--t)]">v{item.v}</span>
                              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">{item.d}</span>
                            </div>
                            <h4 className="text-2xl font-bold text-primary">{item.t}</h4>
                            <p className="text-lg text-[var(--t2)] leading-relaxed">{item.c}</p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                              {item.features?.map(f => (
                                <li key={f} className="flex items-center gap-2 text-sm font-medium text-[var(--t3)]">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.main>
          <Toaster position="bottom-center" richColors />
        </div>
      </ThemeProvider>
    )
  }  return (
    <ThemeProvider attribute="class" defaultTheme="system" themes={["light", "dark", "black"]}>
      <div className="relative min-h-screen selection:bg-primary/30 transition-colors duration-500 text-foreground overflow-x-hidden">
        <div 
          suppressHydrationWarning
          className={cn(
            "landing-bg fixed inset-0 pointer-events-none",
            `gradient-${gradientTheme}`
          )} 
        />
        <Navbar />
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 flex flex-col items-center pt-32 pb-24"
        >
          {/* Hero Section */}
          <div className="max-w-6xl w-full px-6 text-center space-y-12">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 dark:bg-white/5 text-primary dark:text-primary/80 text-[13px] font-bold border border-primary/10 dark:border-white/10 cursor-pointer hover:bg-primary/10 dark:hover:bg-white/10 transition-all group"
                onClick={() => window.location.hash = '#/changelog'}
              >
                <span>Aether v2.0 is now live</span>
                <ChevronDown className="w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-6xl md:text-[112px] font-black tracking-tighter text-[var(--t)] leading-[0.88] max-w-5xl mx-auto"
              >
                Build anything <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500 animate-gradient-x">just by asking.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-[18px] md:text-[22px] font-medium text-[var(--t2)]/80 max-w-2xl mx-auto tracking-tight leading-relaxed"
              >
                Aether is an autonomous platform for building production-ready software. Vision to reality, instantly.
              </motion.p>
            </div>

            {/* Prompt Input Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="max-w-4xl mx-auto w-full"
            >
              <form 
                onSubmit={handleStartProject} 
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-orange-500/20 rounded-[40px] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                <div className="relative liquid-glass rounded-[38px] p-2 bg-[var(--bg)]/40 dark:bg-black/20 border-[var(--bdr)] dark:border-white/10 backdrop-blur-3xl shadow-2xl transition-all duration-500 group-focus-within:border-primary/30 group-focus-within:bg-[var(--bg)]/60">
                  <div className="p-4 sm:p-6 space-y-4">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="What would you like to build today?"
                      className="w-full h-32 sm:h-40 bg-transparent border-none focus:ring-0 text-xl sm:text-[26px] font-bold resize-none placeholder:text-[var(--t3)]/30 outline-none text-[var(--t)] leading-tight tracking-tight"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleStartProject()
                        }
                      }}
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--bdr)] dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowImageGenerator(true)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg3)] dark:bg-white/5 text-sm font-medium text-[var(--t)] hover:bg-[var(--bg2)] dark:hover:bg-white/10 transition-all cursor-pointer border border-[var(--bdr)] dark:border-white/5"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Generate Image
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAgentMode(true)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 text-sm font-medium text-blue-600 dark:text-blue-400 hover:from-blue-500/30 hover:to-purple-500/30 dark:hover:from-blue-500/20 dark:hover:to-purple-500/20 transition-all cursor-pointer border border-blue-500/30 dark:border-blue-500/20"
                          disabled={!input.trim() || busy}
                        >
                          <Brain className="w-4 h-4" />
                          Agent Mode
                        </button>
                        
                        <button 
                          type="submit" 
                          disabled={!input.trim() || busy}
                          className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-500 shadow-xl cursor-pointer",
                            input.trim() && !busy 
                              ? "bg-primary text-primary-foreground hover:scale-[1.02] hover:shadow-primary/25" 
                              : "bg-[var(--bg3)] text-[var(--t3)] opacity-50 cursor-not-allowed"
                          )}
                        >
                          {busy ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <ArrowUp className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>

          </div>

          {/* Recent Projects Section */}
          {recentProjects.length > 0 && (
            <div className="max-w-6xl w-full px-6 mt-32 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black tracking-tight text-[var(--t)]">Continue building</h2>
                  <p className="text-sm font-medium text-[var(--t3)]">Pick up where you left off</p>
                </div>
                <button 
                  onClick={() => window.location.hash = '#/projects'}
                  className="px-6 py-2.5 rounded-2xl bg-[var(--bg3)] dark:bg-white/5 text-sm font-bold text-[var(--t)] hover:bg-[var(--bg2)] dark:hover:bg-white/10 transition-all cursor-pointer border border-[var(--bdr)] dark:border-white/5"
                >
                  View All Projects
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentProjects.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    onClick={() => window.location.hash = `#/editor/${p.id}`}
                    className="group relative p-8 liquid-glass rounded-[40px] border border-[var(--bdr)] dark:border-white/5 cursor-pointer overflow-hidden flex flex-col justify-between h-48 hover:border-primary/30 transition-all"
                  >
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-[var(--t)] truncate pr-8">{p.name}</h3>
                        <p className="text-xs font-medium text-[var(--t3)]">Last modified {new Date(p.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-6xl w-full px-6 mt-48 space-y-16"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--t)]">Engineered for speed.</h2>
              <p className="text-xl text-[var(--t2)] max-w-2xl mx-auto">Everything you need to go from idea to production in record time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  title: "Autonomous Engine", 
                  desc: "Our AI understands your entire project architecture and manages dependencies automatically.",
                  icon: <IconSystem type="cpu" />
                },
                { 
                  title: "Instant Previews", 
                  desc: "See your changes in real-time with integrated WebContainer technology. No local setup required.",
                  icon: <IconSystem type="zap" />
                },
                { 
                  title: "Visual Inspector", 
                  desc: "Click any element in your preview to instantly locate and edit its code.",
                  icon: <IconSystem type="mouse-pointer" />
                },
                { 
                  title: "GitHub Sync", 
                  desc: "Seamlessly push your generated code to GitHub. Your code, your repository, your control.",
                  icon: <IconSystem type="code" />
                },
                { 
                  title: "Multi-File Editing", 
                  desc: "The AI can modify multiple files simultaneously, ensuring consistent updates across your entire application.",
                  icon: <IconSystem type="layers" />
                },
                { 
                  title: "Secure by Design", 
                  desc: "Integrated Firebase support with automatically generated security rules and authentication patterns.",
                  icon: <IconSystem type="shield" />
                }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 liquid-glass rounded-[40px] border border-[var(--bdr)] dark:border-white/5 space-y-4 group hover:border-primary/30 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--t)]">{feature.title}</h3>
                  <p className="text-[var(--t2)] leading-relaxed text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl w-full px-6 mt-48"
          >
            <div className="p-16 md:p-24 liquid-glass rounded-[60px] border border-[var(--bdr)] dark:border-white/5 text-center space-y-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
              <div className="relative z-10 space-y-6">
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-[var(--t)] leading-none">Ready to build?</h2>
                <p className="text-xl md:text-2xl text-[var(--t2)] max-w-2xl mx-auto">Join the future of software development today. No credit card required.</p>
              </div>
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button 
                  size="lg" 
                  className="rounded-full px-12 py-8 text-xl font-black shadow-2xl shadow-primary/20 hover:scale-105 transition-transform"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Get Started Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-12 py-8 text-xl font-black border-2"
                  onClick={() => window.location.hash = '#/community'}
                >
                  View Gallery
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <footer className="max-w-6xl w-full px-6 mt-48 py-24 border-t border-[var(--bdr)] dark:border-white/5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <div className="col-span-2 space-y-6">
                <div className="flex items-center gap-2">
                  <Rocket className="w-8 h-8 text-primary" />
                  <span className="text-2xl font-black tracking-tighter">AETHER</span>
                </div>
                <p className="text-[var(--t2)] max-w-xs">An autonomous platform for building production-ready software.</p>
                <div className="flex items-center gap-4">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <span className="text-sm font-bold text-[var(--t3)]">Built with passion by DUB5.</span>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="font-black uppercase tracking-widest text-xs text-[var(--t3)]">Product</h4>
                <ul className="space-y-4 text-sm font-bold text-[var(--t2)]">
                  <li><a href="#/projects" className="hover:text-primary transition-colors">All Projects</a></li>
                  <li><a href="#/templates" className="hover:text-primary transition-colors">Templates</a></li>
                  <li><a href="#/community" className="hover:text-primary transition-colors">Community</a></li>
                  <li><a href="#/pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-black uppercase tracking-widest text-xs text-[var(--t3)]">Resources</h4>
                <ul className="space-y-4 text-sm font-bold text-[var(--t2)]">
                  <li><a href="#/docs" className="hover:text-primary transition-colors">Documentation</a></li>
                  <li><a href="#/changelog" className="hover:text-primary transition-colors">Changelog</a></li>
                  <li><a href="https://github.com/DUB55/aether" target="_blank" className="hover:text-primary transition-colors">GitHub</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-24 pt-12 border-t border-[var(--bdr)] dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-sm font-bold text-[var(--t3)]">© 2026 DUB5. All rights reserved.</p>
              <div className="flex items-center gap-8 text-sm font-bold text-[var(--t3)]">
                <a href="#" className="hover:text-[var(--t)] transition-colors">Twitter</a>
                <a href="#" className="hover:text-[var(--t)] transition-colors">Discord</a>
                <a href="#" className="hover:text-[var(--t)] transition-colors">LinkedIn</a>
              </div>
            </div>
          </footer>
        </motion.main>

        <LoginModal 
          open={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          onLogin={signIn} 
        />

        {/* Image Generator Dialog */}
        <AnimatePresence>
          {showImageGenerator && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="relative">
                  <button
                    onClick={() => setShowImageGenerator(false)}
                    className="absolute -top-4 -right-4 w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all z-10"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <ImageGenerator 
                    onImageSelect={(imageUrl) => {
                      setSelectedImage(imageUrl)
                      setShowImageGenerator(false)
                      toast.success('Image selected! You can now use this in your project.')
                    }}
                    className="w-full"
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Overlay */}
        <AnimatePresence>
          {isDeleting && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md p-10 liquid-glass rounded-[48px] border border-red-500/30 text-center space-y-8"
              >
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">Permanently Delete?</h3>
                  <p className="text-white/40 text-sm">
                    This will permanently delete this project and all its history. This action cannot be undone.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-xl shadow-red-500/20"
                  >
                    Permanently Delete
                  </button>
                  <button 
                    onClick={() => {
                      setIsDeleting(false)
                      setProjectToDelete(null)
                    }}
                    className="w-full py-4 bg-white/5 text-white/60 rounded-2xl font-bold hover:bg-white/10 transition-all"
                  >
                    Keep Project
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <Toaster position="bottom-center" richColors />
      </div>
    </ThemeProvider>
  )
}