"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Search, 
  Settings2,
  Brain,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Rocket,
  Shield,
  Zap,
  ChevronDown,
  Upload,
  Globe,
  Code2,
  Cpu,
  ClipboardList,
  Trash2,
  Layout,
  Users,
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Lock,
  Calendar,
  Clock,
  AlertTriangle,
  Library,
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
import { CONFIG } from '@/config'
import { type Template, TEMPLATES } from '@/lib/templates'
import { AetherLogo } from './components/aether-logo'

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true)
  
  useEffect(() => {
    // Prevent blank page by showing loading for minimum time
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center gap-6">
        <AetherLogo size={64} isLoading={true} />
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
              className="w-2.5 h-2.5 bg-white rounded-full"
            />
          ))}
        </div>
        <p className="text-white/60 text-sm animate-pulse">Initializing Aether...</p>
      </div>
    )
  }
  
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  )
}

function AppContent() {
  const { user, isAuthReady, signIn, logout, projects: allProjects, saveProject, deleteProject } = useFirebase()
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

  const recentProjects = allProjects.slice(0, 3)

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
      name: trimmed.slice(0, 30) || "Untitled Project",
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

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center gap-6">
        <AetherLogo size={64} isLoading={true} />
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
              className="w-2.5 h-2.5 bg-white rounded-full"
            />
          ))}
        </div>
        <p className="text-white/60 text-sm animate-pulse">Loading Aether...</p>
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

  if (currentRoute === 'docs' || currentRoute === 'community' || currentRoute === 'changelog' || currentRoute === 'projects' || currentRoute === 'templates' || currentRoute === 'pricing') {
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { 
                      name: 'Starter', 
                      price: '0', 
                      description: 'Perfect for exploring Aether and building your first apps.',
                      features: ['Unlimited Projects', 'Access to Basic Models', 'Instant Preview', 'Community Support', 'Free Deployment'],
                      highlight: false
                    },
                    { 
                      name: 'Pro', 
                      price: '0', 
                      description: 'Advanced features for power users who want more control.',
                      features: ['Everything in Starter', 'Advanced AI Models', 'Priority Support', 'Custom Domains', 'Advanced Analytics'],
                      highlight: true
                    },
                    { 
                      name: 'Enterprise', 
                      price: '0', 
                      description: 'Maximum power and security for large-scale applications.',
                      features: ['Everything in Pro', 'Dedicated AI Resources', '24/7 Support', 'SLA Guarantees', 'Custom Integrations'],
                      highlight: false
                    }
                  ].map((plan, idx) => (
                    <motion.div 
                      key={plan.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn(
                        "relative p-8 bento-card transition-all group cursor-pointer",
                        plan.highlight ? "border-primary/40 ring-1 ring-primary/20 shadow-2xl shadow-primary/5 scale-105 z-10" : "hover:border-primary/20"
                      )}
                    >
                      <div className="relative z-10 space-y-8">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">{plan.name}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">{plan.description}</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black">€{plan.price}</span>
                          <span className="text-muted-foreground font-medium">/month</span>
                        </div>
                        <div className="space-y-4">
                          {plan.features.map(feature => (
                            <div key={feature} className="flex items-center gap-3 text-sm">
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <Plus className="w-3 h-3 text-primary" />
                              </div>
                              <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          className={cn(
                            "w-full rounded-2xl font-bold py-4 sm:py-6 transition-all duration-300 cursor-pointer",
                            plan.highlight ? "bg-primary text-primary-foreground hover:scale-[1.02]" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          )}
                          onClick={() => window.location.hash = ''}
                        >
                          Get Started Free
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
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
                  {allProjects.length > 0 ? allProjects.map((p) => (
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
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" className="rounded-full font-bold">Open Editor</Button>
                        </div>
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
                  {currentRoute === 'templates' && (
                    <div className="space-y-8">
                      <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-black tracking-tight">Project Templates</h2>
                        <p className="text-muted-foreground">Start your next big idea with a pre-configured foundation.</p>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {TEMPLATES.map((template) => (
                          <div 
                            key={template.id} 
                            className="p-8 rounded-[40px] liquid-glass border border-[var(--bdr)] group hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between h-full"
                            onClick={async () => {
                              if (!user) {
                                setIsLoginModalOpen(true);
                                return;
                              }
                              const id = Math.random().toString(36).substring(2, 15);
                              const newProject: Project = {
                                id,
                                name: template.name,
                                description: template.description,
                                files: template.files,
                                messages: [{ role: 'user', content: `Starting with ${template.name} template.` }],
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                ownerId: user.uid,
                                isPublic: false,
                                lastModified: Date.now(),
                                settings: {}
                              };
                              await saveProject(newProject);
                              setActiveProjectId(id);
                              window.location.hash = '';
                            }}
                          >
                            <div className="space-y-6">
                              <div className="w-16 h-16 rounded-3xl bg-[var(--bg3)] flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                                {template.icon}
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-black text-primary uppercase tracking-widest">{template.category}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--t)] group-hover:text-primary transition-colors">{template.name}</h3>
                                <p className="text-sm text-[var(--t2)] leading-relaxed">{template.description}</p>
                              </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                              <span className="text-[10px] font-black text-[var(--t3)] uppercase tracking-widest">{Object.keys(template.files).length} FILES</span>
                              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                <Plus className="w-5 h-5" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentRoute === 'changelog' && (
                    <div className="space-y-8">
                      {[
                        { v: '2.0.0', d: 'April 2026', c: 'Official production launch of Aether. Complete UI overhaul with Liquid Glass design system, real-time project previews, and community gallery integration.', t: 'The Production Update' },
                        { v: '1.5.0', d: 'January 2026', c: 'Enhanced AI orchestration engine with multi-file editing capabilities and improved Tailwind CSS generation.', t: 'Engine Optimization' },
                        { v: '1.0.0', d: 'December 2025', c: 'Initial public beta release of the Aether autonomous development platform.', t: 'Public Beta' }
                      ].map(item => (
                        <div key={item.v} className="p-8 rounded-[40px] liquid-glass border border-[var(--bdr)] group hover:border-primary/30 transition-all overflow-hidden flex gap-8">
                          <div className="flex-shrink-0 w-16 h-16 rounded-3xl bg-[var(--bg3)] flex items-center justify-center text-xl font-black text-[var(--t3)]">
                            v{item.v.split('.')[0]}
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-4">
                              <span className="text-2xl font-bold text-[var(--t)]">v{item.v}</span>
                              <span className="px-3 py-1 rounded-full bg-[var(--bg3)] text-xs font-bold text-[var(--t3)]">{item.d}</span>
                            </div>
                            <h4 className="text-xl font-bold text-primary">{item.t}</h4>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">{item.c}</p>
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
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" themes={["light", "dark", "black"]}>
      <div className="relative min-h-screen bg-black text-white selection:bg-primary/30 transition-colors duration-500">
        {/* Blue Gradient Arc at Top */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-500/20 via-blue-500/5 to-transparent pointer-events-none z-0" />
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-500/30 to-transparent opacity-30 blur-3xl pointer-events-none z-0" />
        <Navbar />
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 pt-24 pb-12"
        >
          <div className="max-w-4xl w-full text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg3)] dark:bg-white/5 text-[var(--t2)] dark:text-slate-400 text-[13px] font-semibold border border-[var(--bdr)] dark:border-white/5 cursor-pointer hover:bg-[var(--bg2)] dark:hover:bg-white/10 transition-colors"
              onClick={() => window.location.hash = '#/docs'}
            >
              Aether is now in public preview →
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-[84px] font-bold tracking-tighter text-[var(--t)] leading-[1.05] mb-6"
            >
              Build the future <br />
              <span className="text-[var(--t2)]">with Aether</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[18px] md:text-[22px] font-normal text-[var(--t2)] max-w-2xl mx-auto tracking-normal leading-relaxed mb-4"
            >
              The first autonomous platform that transforms your vision into production-ready software. Fast, free, and infinite.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-3xl mx-auto mt-10"
            >
              <form onSubmit={handleStartProject} className="relative flex flex-col liquid-glass rounded-[32px] p-4 sm:p-6 shadow-2xl bg-[var(--bg)]/50 dark:bg-white/[0.04] border-[var(--bdr)] dark:border-white/[0.08] backdrop-blur-3xl group transition-all duration-500 hover:bg-[var(--bg)]/70 hover:dark:bg-white/[0.06] hover:dark:border-white/[0.12]">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe the application you want to build..."
                  className="w-full h-28 sm:h-36 bg-transparent border-none focus:ring-0 text-lg sm:text-[20px] font-medium resize-none placeholder:text-[var(--t3)]/50 outline-none text-[var(--t)] leading-relaxed"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleStartProject()
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button 
                        type="button" 
                        disabled={busy}
                        className="text-[var(--t3)] dark:text-white/40 p-2 rounded-full cursor-pointer hover:bg-[var(--bg3)] dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2 bg-[var(--bg)] dark:bg-[#1a1a1a]/90 border-[var(--bdr)] dark:border-white/10 rounded-2xl shadow-xl backdrop-blur-3xl liquid-glass" align="start">
                        <div className="flex flex-col gap-1">
                          <button className="flex items-center gap-3 w-full p-2.5 rounded-xl text-left group cursor-pointer hover:bg-[var(--bg3)] dark:hover:bg-white/5 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Upload className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-[var(--t)] dark:text-white">Upload Files</div>
                              <div className="text-[11px] text-[var(--t3)] dark:text-slate-400">Add context to your project</div>
                            </div>
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center gap-8">
                    {/* Gradient Picker (Hidden by default, set display: flex to show) */}
                    <div className="hidden items-center gap-8">
                      <div className="flex bg-slate-100/80 dark:bg-white/5 p-1 rounded-xl border border-slate-200/50 dark:border-white/5 backdrop-blur-sm gap-0.5">
                      {(['blue', 'pink', 'emerald', 'sunset', 'sea', 'purple', 'midnight', 'amber'] as const).map((theme) => (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => handleGradientChange(theme)}
                          className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                            gradientTheme === theme 
                              ? "bg-white dark:bg-white/10 shadow-sm ring-1 ring-slate-200 dark:ring-white/20" 
                              : "opacity-40 hover:opacity-100"
                          )}
                        >
                          <div className={cn("w-3.5 h-3.5 rounded-full bg-gradient-to-br", 
                            theme === 'blue' ? 'from-blue-400 to-purple-500' :
                            theme === 'pink' ? 'from-pink-400 to-orange-400' :
                            theme === 'emerald' ? 'from-emerald-400 to-teal-500' :
                            theme === 'sunset' ? 'from-orange-500 to-rose-500' :
                            theme === 'sea' ? 'from-cyan-400 to-blue-600' :
                            theme === 'purple' ? 'from-violet-500 to-fuchsia-500' :
                            theme === 'midnight' ? 'from-slate-700 to-slate-900' :
                            'from-amber-400 to-yellow-600'
                          )} />
                        </button>
                      ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        type="submit" 
                        className={cn(
                          "bg-[var(--bg3)] text-[var(--t3)] rounded-full w-11 h-11 flex items-center justify-center hover:bg-[var(--t)] hover:text-[var(--bg)] transition-all cursor-pointer",
                          (input.trim() || busy) && "bg-[var(--t)] text-[var(--bg)]"
                        )}
                        disabled={!input.trim() || busy}
                      >
                        {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

                  {recentProjects.length > 0 && (
                    <div className="mt-12 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-[var(--t)]">Recent projects</h3>
                        {allProjects.length > 3 && (
                          <button 
                            onClick={() => window.location.hash = '#/projects'}
                            className="text-sm font-bold text-[var(--t)] hover:text-primary cursor-pointer transition-colors"
                          >
                            View All
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recentProjects.map((p) => (
                          <motion.button
                            key={p.id}
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.location.hash = `#/editor/${p.id}`}
                            className="flex flex-col items-start p-6 bento-card text-left group border border-slate-200/50 dark:border-white/5 hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
                          >
                            <div className="text-lg font-bold truncate w-full mb-1 group-hover:text-primary transition-colors">{p.name}</div>
                            <div className="text-xs text-slate-500">{new Date(p.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

              {/* Features Section */}
              <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div 
                  className="flex flex-col space-y-4 p-6 rounded-[32px] liquid-glass border border-slate-200/50 dark:border-white/5 overflow-hidden text-left"
                >
                      <div className="w-12 h-12 rounded-2xl bg-slate-500/10 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--t)] transition-colors">Instant Deployment</h3>
                  <p className="text-sm text-[var(--t2)] leading-relaxed">
                    Watch your ideas come to life in seconds. Deploy very fast and completely free.
                  </p>
                </div>
                <div 
                  className="flex flex-col space-y-4 p-6 rounded-[32px] liquid-glass border border-slate-200/50 dark:border-white/5 overflow-hidden text-left"
                >
                      <div className="w-12 h-12 rounded-2xl bg-slate-500/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--t)] transition-colors">Real-time Previews</h3>
                  <p className="text-sm text-[var(--t2)] leading-relaxed">
                    Instantly see previews of your app as Aether builds everything for you. Just chat and watch it happen.
                  </p>
                </div>
                <div 
                  className="flex flex-col space-y-4 p-6 rounded-[32px] liquid-glass border border-slate-200/50 dark:border-white/5 overflow-hidden text-left"
                >
                      <div className="w-12 h-12 rounded-2xl bg-slate-500/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--t)] transition-colors">Advanced Models</h3>
                  <p className="text-sm text-[var(--t2)] leading-relaxed">
                    Access the world's most powerful AI models to build complex logic and designs effortlessly.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.main>

        <Toaster position="bottom-center" richColors />
        <LoginModal 
          open={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          onLogin={signIn} 
        />

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
      </div>
    </ThemeProvider>
  )
}
