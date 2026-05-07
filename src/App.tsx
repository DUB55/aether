"use client"

import React, { useEffect, useState, useRef } from "react"
import { enterpriseSystemsRegistry } from '@/lib/enterprise'
import { motion, AnimatePresence } from "framer-motion"
import FallbackIcon from '@/components/FallbackIcon'
import { 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
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
  Paperclip,
  SlidersHorizontal,
  ArrowUpRight,
  CheckCircle2,
  Box,
  Database,
  Palette,
  Smartphone,
  ShoppingCart,
  Gamepad2,
  Play,
  Cloud,
  Newspaper,
  MessageCircle,
  Sparkle,
  BarChart3,
  X,
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
import { ProjectPreview } from '@/components/ProjectPreview'
import { LoginModal } from '@/components/LoginModal'
import PrivacyPolicy from '@/pages/PrivacyPolicy'
import TermsOfService from '@/pages/TermsOfService'
import CookiePolicy from '@/pages/CookiePolicy'
import License from '@/pages/License'
import Security from '@/pages/Security'
import About from '@/pages/About'
import Careers from '@/pages/Careers'
import Press from '@/pages/Press'
import Partners from '@/pages/Partners'
import Contact from '@/pages/Contact'
import Blog from '@/pages/Blog'
import Support from '@/pages/Support'
import Documentation from '@/pages/Documentation'
import ApiReference from '@/pages/ApiReference'
import Guides from '@/pages/Guides'
import EditorPage from '@/pages/Editor'
import LandingVariation3 from '@/landing-v3/LandingVariation3'
import { EmailAdmin } from '@/components/EmailAdmin'
import { CONFIG } from '@/config'
import { type Template, TEMPLATES } from '@/lib/templates'
import { type Message } from '@/types'
import { IconSystem } from '@/components/IconSystem'
import { ImageGenerator } from '@/components/ImageGenerator'
import { AetherLogo } from './components/aether-logo'
import { Footer } from './components/Footer'
import { useTheme } from 'next-themes'
import { AgentMode } from '@/components/AgentMode'
import { Pricing } from '@/components/Pricing'
import { Ads } from '@/components/Ads'
import { UserManagementDashboard } from '@/components/UserManagementDashboard'
import { TemplateMarketplace } from '@/components/TemplateMarketplace'
import { CommunityGallery } from '@/components/CommunityGallery'
import { Onboarding } from '@/components/Onboarding'
import { Editor } from '@/components/editor/Editor'
import { LandingBackground } from '@/components/LandingBackground'
import { AppUpdater } from '@/components/AppUpdater'
import { ProjectTypeDialog } from '@/components/ProjectTypeDialog'
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator'
import { localStorageService } from '@/lib/local-storage'
import { syncEngine } from '@/lib/sync-engine'

// Feature Showcase Component - Navy/Cyan Design System
function FeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features = [
    {
      id: 'autonomous',
      title: "Autonomous Engine",
      desc: "AI understands project architecture and manages dependencies automatically.",
      icon: Cpu,
    },
    {
      id: 'preview',
      title: "Instant Previews",
      desc: "Real-time changes with WebContainer technology. No local setup required.",
      icon: Zap,
    },
    {
      id: 'inspector',
      title: "Visual Inspector",
      desc: "Click any element to locate and edit its code instantly.",
      icon: MousePointer2,
    },
    {
      id: 'github',
      title: "GitHub Sync",
      desc: "Push generated code to your repository. Your code, your control.",
      icon: Code2,
    },
    {
      id: 'editing',
      title: "Multi-File Editing",
      desc: "AI modifies multiple files simultaneously for consistent updates.",
      icon: Layers,
    },
    {
      id: 'secure',
      title: "Secure by Design",
      desc: "Auto-generated Firebase security rules and authentication patterns.",
      icon: Shield,
    }
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
      {/* Left side - Browser mockup with placeholders */}
      <motion.div 
        className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#0a0f1a] border border-white/[0.08]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        {/* Browser chrome */}
        <div className="h-10 bg-[#0f172a] border-b border-white/[0.06] flex items-center px-4 gap-3">
          {/* Window controls */}
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          {/* Address bar */}
          <div className="flex-1 mx-4">
            <div className="bg-[#02040a] rounded-md px-3 py-1.5 text-xs text-[#64748b] text-center border border-white/[0.06]">
              localhost:3000
            </div>
          </div>
        </div>
        
        {/* Content area with placeholders */}
        <div className="p-6 space-y-4">
          {/* Placeholder label for screenshot */}
          <div className="aspect-video bg-[#02040a] rounded-lg border border-dashed border-white/[0.08] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#5063F0]/10 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-[#6b7ce5]" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Placeholder</p>
              <p className="text-sm text-[#64748b] mt-1">Real application screenshot / video</p>
            </div>
          </div>
          
          {/* Code view placeholder */}
          <div className="bg-[#02040a] rounded-lg border border-white/[0.06] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4 text-[#6b7ce5]" />
              <span className="text-xs font-medium text-[#64748b]">Code View</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-[#1e293b] rounded w-3/4" />
              <div className="h-2 bg-[#1e293b] rounded w-full" />
              <div className="h-2 bg-[#1e293b] rounded w-5/6" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right side - Feature list */}
      <div className="space-y-3">
        {features.map((feature, idx) => {
          const IconComponent = feature.icon;
          const isActive = activeFeature === idx;
          
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * idx }}
              onClick={() => setActiveFeature(idx)}
              className={`
                group relative p-4 rounded-xl cursor-pointer transition-all duration-300
                ${isActive 
                  ? 'bg-[#5063F0]/[0.08] border border-[#5063F0]/20' 
                  : 'bg-transparent border border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? 'bg-[#5063F0]/15' 
                    : 'bg-white/[0.05] group-hover:bg-white/[0.08]'
                  }
                `}>
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-[#6b7ce5]' : 'text-[#64748b]'}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-base transition-colors ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm leading-relaxed mt-1 transition-colors ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                    {feature.desc}
                  </p>
                </div>
                
                <ArrowUpRight className={`
                  w-4 h-4 mt-1 transition-all duration-300
                  ${isActive ? 'text-[#6b7ce5] rotate-0' : 'text-[#475569] -rotate-45 group-hover:text-slate-400'}
                `} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  )
}

function AppContent() {
  const { user, signIn, logout, projects: allProjects, saveProject, deleteProject } = useFirebase()
  const [showEnhanced, setShowEnhanced] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  // Detect URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const showParam = urlParams.get('show');
      
      // Always use enhanced mode (show=false functionality) unless explicitly set to true
      if (showParam === 'true') {
        setShowEnhanced(false);
      } else {
        // Default to enhanced mode for all other cases (no param or show=false)
        setShowEnhanced(true);
      }
    }
  }, []);

  // Detect if running in Tauri (desktop app)
  useEffect(() => {
    const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
    if (isTauri) {
      document.body.classList.add('tauri');
    } else {
      document.body.classList.remove('tauri');
    }
  }, []);

  useEffect(() => {
    // Force scroll to top immediately and also after a delay
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also scroll after a short delay to override browser restore
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);

    // Suppress WebSocket/Vite errors and Firebase network errors that are expected in sandboxed environments
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && (
        args[0].includes('WebSocket') || 
        args[0].includes('vite') ||
        args[0].includes('auth/network-request-failed') ||
        args[0].includes('FirebaseError')
      )) {
        return;
      }
      originalError.apply(console, args);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.message && (
        event.reason.message.includes('WebSocket') || 
        event.reason.message.includes('vite') ||
        event.reason.message.includes('auth/network-request-failed') ||
        event.reason.message.includes('FirebaseError')
      )) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      clearTimeout(timeoutId);
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
  const [showProjectTypeDialog, setShowProjectTypeDialog] = useState(false)
  const [pendingProjectData, setPendingProjectData] = useState<{ prompt: string; messages: any[] } | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const handlePrevCarousel = () => {
    if (carouselIndex > 0 && carouselRef.current) {
      const newIndex = carouselIndex - 1;
      setCarouselIndex(newIndex);
      const scrollAmount = 280 * newIndex; // 280px card width + gap
      carouselRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleNextCarousel = () => {
    const totalItems = 6; // Total number of carousel items
    if (carouselIndex < totalItems - 1 && carouselRef.current) {
      const newIndex = carouselIndex + 1;
      setCarouselIndex(newIndex);
      const scrollAmount = 280 * newIndex; // 280px card width + gap
      carouselRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    console.log('[App] isLoginModalOpen changed:', isLoginModalOpen, 'user:', user ? 'authenticated' : 'null')
  }, [isLoginModalOpen, user])

  useEffect(() => {
    enterpriseSystemsRegistry.initializeAll().catch(error => {
      console.error('[App] Failed to initialize enterprise systems:', error)
    })
  }, [])

  useEffect(() => {
    if (user && localStorage.getItem('aether_pending_prompt')) {
      console.log('[App] User authenticated with pending prompt, executing handleStartProject')
      // Small delay to ensure Firebase is fully ready
      setTimeout(() => {
        handleStartProject()
      }, 500)
    }
  }, [user])

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
      updatedAt: new Date().toISOString(),
      storageMode: 'cloud',
      syncStatus: 'synced'
    }
    await saveProject(newProject)
    window.history.pushState({}, '', `/editor/${newProject.id}`)
    window.dispatchEvent(new Event('routechange'))
  }

  useEffect(() => {
    // Simple pathname-based routing
    const handleRouteChange = () => {
      const searchParams = new URLSearchParams(window.location.search)
      const src = searchParams.get('src')
      const mode = searchParams.get('mode')
      const pathname = window.location.pathname
      
      // Scroll to top when navigating between pages
      window.scrollTo(0, 0)
      
      if (src) {
        setActiveProjectId('shared-url')
        setCurrentRoute(mode === 'viewer' ? 'shared' : 'editor')
        setIsSharedView(mode === 'viewer')
        return
      }

      if (pathname.startsWith('/editor/')) {
        setActiveProjectId(pathname.replace('/editor/', ''))
        setCurrentRoute('editor')
        setIsSharedView(false)
      } else if (pathname.startsWith('/shared/')) {
        setActiveProjectId(pathname.replace('/shared/', ''))
        setCurrentRoute('shared')
        setIsSharedView(true)
      } else if (pathname === '/docs') {
        setCurrentRoute('docs')
        setActiveProjectId(null)
      } else if (pathname === '/community') {
        setCurrentRoute('community')
        setActiveProjectId(null)
      } else if (pathname === '/changelog') {
        setCurrentRoute('changelog')
        setActiveProjectId(null)
      } else if (pathname === '/projects') {
        setCurrentRoute('projects')
        setActiveProjectId(null)
      } else if (pathname === '/templates') {
        setCurrentRoute('templates')
        setActiveProjectId(null)
      } else if (pathname === '/marketplace') {
        setCurrentRoute('marketplace')
        setActiveProjectId(null)
      } else if (pathname === '/pricing') {
        setCurrentRoute('pricing')
        setActiveProjectId(null)
      } else if (pathname === '/ads') {
        setCurrentRoute('ads')
        setActiveProjectId(null)
      } else if (pathname === '/admin') {
        setCurrentRoute('admin')
        setActiveProjectId(null)
      } else if (pathname === '/privacy-policy' || pathname === '/privacy') {
        setCurrentRoute('privacy-policy')
        setActiveProjectId(null)
      } else if (pathname === '/terms-of-service' || pathname === '/terms') {
        setCurrentRoute('terms-of-service')
        setActiveProjectId(null)
      } else if (pathname === '/cookie-policy') {
        setCurrentRoute('cookie-policy')
        setActiveProjectId(null)
      } else if (pathname === '/license') {
        setCurrentRoute('license')
        setActiveProjectId(null)
      } else if (pathname === '/security') {
        setCurrentRoute('security')
        setActiveProjectId(null)
      } else if (pathname === '/about') {
        setCurrentRoute('about')
        setActiveProjectId(null)
      } else if (pathname === '/careers') {
        setCurrentRoute('careers')
        setActiveProjectId(null)
      } else if (pathname === '/press') {
        setCurrentRoute('press')
        setActiveProjectId(null)
      } else if (pathname === '/partners') {
        setCurrentRoute('partners')
        setActiveProjectId(null)
      } else if (pathname === '/contact') {
        setCurrentRoute('contact')
        setActiveProjectId(null)
      } else if (pathname === '/blog') {
        setCurrentRoute('blog')
        setActiveProjectId(null)
      } else if (pathname === '/support') {
        setCurrentRoute('support')
        setActiveProjectId(null)
      } else if (pathname === '/documentation') {
        setCurrentRoute('documentation')
        setActiveProjectId(null)
      } else if (pathname === '/api-reference') {
        setCurrentRoute('api-reference')
        setActiveProjectId(null)
      } else if (pathname === '/guides') {
        setCurrentRoute('guides')
        setActiveProjectId(null)
      } else if (pathname === '/editor-page') {
        setCurrentRoute('editor-page')
        setActiveProjectId(null)
      } else if (pathname === '/admin/email') {
        setCurrentRoute('admin-email')
        setActiveProjectId(null)
      } else if (pathname === '/v3' || pathname === '/new') {
        setCurrentRoute('landing-v3')
        setActiveProjectId(null)
      } else if (currentRoute === 'pricing') {
        setCurrentRoute('pricing')
        setActiveProjectId(null)
      } else if (pathname === '/ads') {
        setCurrentRoute('ads')
        setActiveProjectId(null)
      } else {
        setActiveProjectId(null)
        setCurrentRoute('')
      }
    }

    // Initial check
    handleRouteChange()

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange)
    
    // Listen for custom route change events
    window.addEventListener('routechange', handleRouteChange)

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      window.removeEventListener('routechange', handleRouteChange)
      setActiveDoc(null)
    }
  }, [])

  const handleGradientChange = (theme: typeof gradientTheme) => {
    setGradientTheme(theme)
    localStorage.setItem('aether-gradient-theme', theme)
    document.documentElement.setAttribute('data-gradient-theme', theme)
  }

  const handleStartProject = async (e?: React.FormEvent) => {
    console.log('[LANDING-PAGE] handleStartProject called:', {
      hasEvent: !!e,
      busy: busy,
      inputLength: input.length,
      inputTrimmed: input.trim(),
      timestamp: new Date().toISOString()
    });
    
    e?.preventDefault()
    if (busy) {
      console.log('[LANDING-PAGE] Returning early - busy state:', busy);
      return
    }
    const trimmed = input.trim()
    if (!trimmed) {
      console.log('[LANDING-PAGE] Returning early - empty input');
      return
    }
    
    console.log('[LANDING-PAGE] Starting project creation:', {
      prompt: trimmed,
      user: user ? 'logged in' : 'not logged in',
      userId: user?.uid || 'none'
    });
    
    if (!user) {
      console.log('[App] handleStartProject - User not authenticated, saving prompt and opening login modal')
      // Save the prompt to be used after login
      const pendingPrompt = trimmed
      localStorage.setItem('aether_pending_prompt', pendingPrompt)
      setIsLoginModalOpen(true)
      return
    }

    // If we have a pending prompt from login, use that instead
    const promptToUse = localStorage.getItem('aether_pending_prompt') || trimmed
    if (localStorage.getItem('aether_pending_prompt')) {
      console.log('[App] handleStartProject - Using pending prompt after login:', promptToUse)
      localStorage.removeItem('aether_pending_prompt')
    }

    console.log('[LANDING-PAGE] Creating new project:', {
      prompt: promptToUse,
      timestamp: new Date().toISOString()
    });
    
    // Check if user is asking for images and auto-generate
    const containsImageKeywords = /\b(image|picture|photo|pic|visual|art|graphic|illustration|design|draw|paint|create.*image|generate.*image|make.*image)\b/i.test(promptToUse)
    console.log('[LANDING-PAGE] Image keywords detected:', containsImageKeywords);
    
    let messages: Message[] = [{ role: "user", content: promptToUse }]
    
    if (containsImageKeywords) {
      // Auto-generate an image based on prompt
      try {
        const imagePrompt = promptToUse.length > 100 ? promptToUse.substring(0, 100) : promptToUse
        console.log('[LANDING-PAGE] Generating image for prompt:', {
          fullPrompt: promptToUse,
          truncatedPrompt: imagePrompt,
          wasTruncated: promptToUse.length > 100
        });
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            size: '1024x1024',
            quality: 'standard'
          })
        })
        
        if (response.ok) {
          const imageResult = await response.json()
          if (imageResult.imageUrl) {
            const imageMessage: Message = {
              role: "assistant", 
              content: `I've generated an image based on your request: ${imagePrompt}`,
              image: imageResult.imageUrl
            }
            messages.push(imageMessage)
            toast.success("Image generated automatically!")
          }
        }
      } catch (error) {
        console.error("Auto image generation failed:", error)
        // Continue without image if generation fails
      }
    }

    // Store pending project data and create project directly with cloud-only mode
    setPendingProjectData({ prompt: promptToUse, messages })
    // Immediately create project with cloud mode (no dialog)
    handleProjectTypeSelect('cloud')
    setInput("")
  }

  const handleProjectTypeSelect = async (storageMode: 'cloud' | 'hybrid', localPath?: string) => {
    if (!pendingProjectData || !user) return
    
    const { prompt: promptToUse, messages } = pendingProjectData
    setBusy(true)
    const id = Math.random().toString(36).substring(7)
    console.log('[LANDING-PAGE] Generated project ID:', id);
    
    const newProject: Project = {
      id,
      name: "New Project",
      lastModified: Date.now(),
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isPublic: false,
      ownerId: user.uid,
      files: {
        'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Project</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
            <h1 class="text-4xl font-bold mb-4">Welcome to Aether</h1>
            <p class="text-lg text-gray-600 dark:text-gray-400">Your AI-generated project will appear here</p>
        </div>
    </div>
</body>
</html>`
      },
      messages,
      storageMode,
      syncStatus: storageMode === 'cloud' ? 'synced' : 'pending',
      localPath: storageMode === 'hybrid' ? localPath : undefined,
      settings: {
        autoSync: storageMode === 'hybrid',
        syncInterval: 5, // 5 minutes
        conflictResolution: 'latest'
      }
    }
    
    try {
      console.log('[App] handleProjectTypeSelect - Navigating to editor IMMEDIATELY:', `/editor/${id}`)
      
      // Navigate IMMEDIATELY - before any async operations
      window.history.pushState({}, '', `/editor/${id}`)
      window.dispatchEvent(new Event('routechange'))
      
      // Show immediate feedback
      toast.success(`Creating ${storageMode === 'hybrid' ? 'hybrid' : 'cloud'} project...`)
      
      // Now save project in background (don't await)
      console.log('[App] handleProjectTypeSelect - Saving project in background:', newProject.id)
      saveProject(newProject).then(() => {
        console.log('[App] handleProjectTypeSelect - Project saved successfully')
        if (storageMode === 'hybrid') {
          // Initialize local files for hybrid projects
          initializeLocalProject(newProject, localPath)
        }
      }).catch(saveError => {
        console.warn('[App] handleProjectTypeSelect - Project save failed:', saveError)
        // Silent failure - no toast message
      })
      
    } catch (error) {
      console.error("Project creation error:", error)
      // Still navigate even on error
      console.log('[App] handleProjectTypeSelect - Navigating to editor despite error:', `/editor/${id}`)
      window.history.pushState({}, '', `/editor/${id}`)
      window.dispatchEvent(new Event('routechange'))
      toast.error("Opening editor with limited functionality")
    } finally {
      // Clear pending data and keep busy state for AI generation
      setPendingProjectData(null)
      setTimeout(() => setBusy(false), 1000)
    }
  }

  const initializeLocalProject = async (project: Project, localPath?: string) => {
    if (!localPath || project.storageMode !== 'hybrid') return
    
    try {
      console.log('[App] Initializing local project at:', localPath)
      
      // Initialize hybrid project with local files
      await localStorageService.initializeHybridProject(project, localPath)
      
      // Start auto-sync if enabled
      if (project.settings?.autoSync) {
        await syncEngine.startAutoSync(project, {
          autoResolveConflicts: false,
          conflictResolution: project.settings?.conflictResolution || 'latest',
          bidirectional: true
        })
      }
      
      console.log('[App] Hybrid project initialized successfully')
    } catch (error) {
      console.error('Failed to initialize local project:', error)
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

  if (activeProjectId || currentRoute === 'shared' || currentRoute === 'editor') {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light", "dark", "black"]}>
        <div className="relative min-h-screen bg-background text-foreground flex flex-col">
          <Editor 
            projectId={activeProjectId!} 
            onBack={() => { window.history.pushState({}, '', isSharedView ? '/' : '/projects'); window.dispatchEvent(new Event('routechange')) }} 
            isSharedView={isSharedView}
          />
        </div>
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

  if (currentRoute === 'cookie-policy') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <CookiePolicy />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'license') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <License />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'security') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <Security />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'about') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <About />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'careers') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <Careers />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'press') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <Press />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'partners') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <Partners />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'contact') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <Contact />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'blog') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <Blog />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'support') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <Support />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'documentation') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <Documentation />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'api-reference') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <ApiReference />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'guides') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <Guides />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'editor-page') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <EditorPage />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'admin-email') {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
        <EmailAdmin />
      </ThemeProvider>
    )
  }

  if (currentRoute === 'landing-v3') {
    return (
      <LandingVariation3
        onStartProject={(prompt, attachments, designSystem) => {
          // Handle project start from landing v3
          const trimmed = prompt.trim();
          if (!trimmed) return;

          // Set input and trigger project creation
          setInput(trimmed);

          // Store attachments and design system for later use
          if (attachments && attachments.length > 0) {
            localStorage.setItem('aether_attachments', JSON.stringify(attachments.map(f => f.name)));
          }
          if (designSystem) {
            localStorage.setItem('aether_design_system', designSystem);
          }

          if (!user) {
            localStorage.setItem('aether_pending_prompt', trimmed);
            setIsLoginModalOpen(true);
          } else {
            // Navigate to home and start project
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new Event('routechange'));
          }
        }}
      />
    )
  }

  if (currentRoute === 'admin') {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light", "dark", "black"]}>
        <div className={cn(
          "relative min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col",
          CONFIG.USE_LIQUID_DESIGN && "liquid-glass"
        )}>
          <Navbar />
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-8 flex-1"
          >
            <UserManagementDashboard />
          </motion.main>
          <Footer />
        </div>
      </ThemeProvider>
    )
  }

  if (currentRoute === 'docs' || currentRoute === 'community' || currentRoute === 'changelog' || currentRoute === 'projects' || currentRoute === 'templates' || currentRoute === 'pricing' || currentRoute === 'ads') {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light", "dark", "black"]}>
        <div className={cn(
          "relative min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col",
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
            className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-8 flex-1"
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

              {currentRoute === 'docs' && !activeDoc && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  <div className="text-center space-y-6">
                    <h2 className="text-4xl font-bold text-slate-100">Documentation</h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                      Everything you need to know about building with Aether.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-8 rounded-[40px] bg-[#0a0f1a] border border-white/[0.06] space-y-4 cursor-pointer hover:border-[#5063F0]/30 transition-all"
                      onClick={() => setActiveDoc('Quick Start Guide')}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#5063F0]/10 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-[#6b7ce5]" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-100">Quick Start Guide</h3>
                      <p className="text-slate-400 leading-relaxed">
                        Follow these simple steps to build your first app without writing a single line of code.
                      </p>
                      <div className="flex items-center gap-2 text-[#6b7ce5] font-medium">
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-8 rounded-[40px] bg-[#0a0f1a] border border-white/[0.06] space-y-4"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#5063F0]/10 flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-[#6b7ce5]" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-100">How Aether Works</h3>
                      <p className="text-slate-400 leading-relaxed">
                        Learn about the AI-powered development process and how Aether creates complete applications.
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {currentRoute === 'docs' && activeDoc && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-12 bento-card p-12 shadow-2xl"
                >
                  <button 
                    onClick={() => setActiveDoc(null)}
                    className="flex items-center gap-2 text-sm font-bold text-[#6b7ce5] hover:opacity-80 transition-opacity mb-8 cursor-pointer"
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
                          window.history.pushState({}, '', '/')
                          window.dispatchEvent(new Event('routechange'))
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
                      onClick={() => { window.history.pushState({}, '', `/editor/${p.id}`); window.dispatchEvent(new Event('routechange')) }}
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
                                  window.location.pathname = `/editor/${p.id}`
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
                        onClick={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new Event('routechange')) }}
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
        </div>
        <Footer />
        <Toaster position="bottom-center" richColors />
      </ThemeProvider>
    )
  }  return (
    <ThemeProvider attribute="class" defaultTheme="dark" themes={["light", "dark", "black"]}>
      <div className="relative min-h-screen bg-[#02040a] text-slate-100 overflow-x-hidden flex flex-col selection:bg-cyan-500/30">
        {/* <div 
          suppressHydrationWarning
          className={cn(
            "landing-bg fixed top-0 left-0 right-0 pointer-events-none",
            `gradient-${gradientTheme}`
          )} 
        /> */}
        <LandingBackground />
        <Navbar />
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 flex flex-col items-center pt-32 pb-2 flex-1"
        >
          {/* Hero Section */}
          <div className="max-w-6xl w-full px-6 text-center space-y-10 relative z-10">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5063F0]/10 text-[#6b7ce5] text-xs font-medium border border-[#5063F0]/20 cursor-pointer hover:bg-[#5063F0]/15 transition-all group"
                onClick={() => { window.history.pushState({}, '', '/changelog'); window.dispatchEvent(new Event('routechange')) }}
              >
                <span>Aether v2.0 is now live</span>
                <ChevronDown className="w-3 h-3 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-100 leading-[1.1] max-w-4xl mx-auto"
              >
                Build apps by asking AI.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl font-medium text-slate-400 max-w-xl mx-auto leading-relaxed"
              >
                Describe what you want to build in plain English. Aether creates stunning, production-ready applications instantly.
              </motion.p>
            </div>

            {/* Refined Prompt Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="max-w-3xl mx-auto w-full"
            >
              <form 
                onSubmit={handleStartProject} 
                className="relative group"
              >
                <div className="relative bg-[#0a0f1a] rounded-xl p-4 border border-white/[0.08]">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What would you like to build?"
                    className="w-full min-h-[80px] max-h-[140px] bg-transparent border-none focus:ring-0 text-base font-medium resize-none placeholder:text-slate-500 outline-none text-slate-200 leading-relaxed"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleStartProject()
                      }
                    }}
                  />
                  
                  {/* Input Bar Actions */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all"
                        title="Attach file"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all"
                        title="Settings"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={!input.trim() || busy}
                      className={cn(
                        "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300",
                        input.trim() && !busy 
                          ? "bg-[#5063F0] text-white hover:bg-[#4765EE]" 
                          : "bg-slate-700 text-slate-500 cursor-not-allowed"
                      )}
                    >
                      {busy ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ArrowUp className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>

            {/* Trusted By - Engineering Teams */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-10"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6">Trusted by engineering teams at</p>
              <div className="flex items-center justify-center gap-10 md:gap-14 flex-wrap">
                {/* Stripe */}
                <div className="flex items-center gap-2 text-slate-500 hover:text-slate-400 transition-colors cursor-default">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.781l.408-4.214C17.024 2.186 14.665 1.08 11.99 1.08c-3.896 0-6.598 1.985-6.598 5.31 0 3.305 2.146 4.79 5.92 6.052 2.297.77 3.033 1.467 3.033 2.492 0 .953-.724 1.502-2.025 1.502-1.876 0-5.159-.877-6.938-2.056l-.404 4.256c1.96 1.142 5.558 2.088 8.477 2.088 4.108 0 6.774-1.824 6.774-5.415 0-3.135-2.029-4.576-5.253-5.656z"/>
                  </svg>
                  <span className="text-sm font-semibold tracking-tight">Stripe</span>
                </div>
                {/* Vercel */}
                <div className="flex items-center gap-2 text-slate-500 hover:text-slate-400 transition-colors cursor-default">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L24 22H0L12 1Z"/>
                  </svg>
                  <span className="text-sm font-semibold tracking-tight">Vercel</span>
                </div>
                {/* Resend */}
                <div className="flex items-center gap-2 text-slate-500 hover:text-slate-400 transition-colors cursor-default">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 4h20v16H2V4zm18 14V6H4v12h16z"/>
                    <path d="M6 10h12v2H6v-2zm0 4h8v2H6v-2z"/>
                  </svg>
                  <span className="text-sm font-semibold tracking-tight">Resend</span>
                </div>
              </div>
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
                  onClick={() => { window.history.pushState({}, '', '/projects'); window.dispatchEvent(new Event('routechange')) }}
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
                    onClick={() => { window.history.pushState({}, '', `/editor/${p.id}`); window.dispatchEvent(new Event('routechange')) }}
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
          {/* Bento Grid Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-7xl w-full px-6 mt-32"
          >
            {showEnhanced ? (
              /* Enhanced Mode: Bento Grid Image + Interface Images */
              <div className="space-y-8">
                <div className="text-center space-y-3 mb-14">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-100">Built for modern development</h2>
                  <p className="text-lg text-slate-500 max-w-xl mx-auto">Everything you need to ship faster.</p>
                </div>
                
                {/* Bento Grid Image */}
                <div className="flex justify-center mb-12">
                  <img 
                    src="/bento-hero-image.png" 
                    alt="Aether AI Features" 
                    className="w-full max-w-4xl rounded-2xl shadow-2xl border border-white/[0.06]"
                    loading="lazy"
                  />
                </div>
              </div>
            ) : (
              /* Original Bento Grid */
              <div className="space-y-8">
                <div className="text-center space-y-3 mb-14">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-100">Built for modern development</h2>
                  <p className="text-lg text-slate-500 max-w-xl mx-auto">Everything you need to ship faster.</p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* AI Chat Interface - Large */}
                  <div className="md:col-span-2 p-6 rounded-2xl bg-[#0a0f1a] border border-white/[0.06] hover:border-[#5063F0]/20 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#5063F0]/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[#6b7ce5]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-200">AI-Powered Development</h3>
                        <p className="text-sm text-slate-500">Natural language to production code</p>
                      </div>
                    </div>
                    
                    {/* Chat mockup */}
                    <div className="bg-[#02040a] rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#5063F0]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#6b7ce5]">A</span>
                        </div>
                        <div className="bg-[#0a0f1a] rounded-lg px-3 py-2 text-sm text-slate-400 max-w-[80%]">
                          I'll create a modern landing page with hero section, features grid, and contact form. Using React + Tailwind.
                        </div>
                      </div>
                      <div className="flex items-start gap-3 justify-end">
                        <div className="bg-[#5063F0] rounded-lg px-3 py-2 text-sm text-white max-w-[80%]">
                          Build a SaaS landing page with pricing and testimonials
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs">You</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Preview */}
                  <div className="p-6 rounded-2xl bg-[#0a0f1a] border border-white/[0.06] hover:border-[#5063F0]/20 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <Play className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-200">Live Preview</h3>
                        <p className="text-sm text-slate-500">See changes instantly</p>
                      </div>
                    </div>
                    <div className="bg-[#02040a] rounded-xl p-3 aspect-video flex items-center justify-center">
                      <div className="w-full h-full bg-[#0a0f1a] rounded-lg shadow-lg flex items-center justify-center">
                        <div className="text-center">
                          <Globe className="w-8 h-8 text-[#5063F0] mx-auto mb-2" />
                          <span className="text-xs text-slate-500">Live Preview</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Code Generation */}
                  <div className="p-6 rounded-2xl bg-[#0a0f1a] border border-white/[0.06] hover:border-[#5063F0]/20 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Code2 className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-200">Smart Code</h3>
                        <p className="text-sm text-slate-500">Best practices built-in</p>
                      </div>
                    </div>
                    <div className="bg-[#02040a] rounded-xl p-3 font-mono text-xs text-slate-400">
                      <div className="text-green-400">$ aether generate</div>
                      <div className="text-slate-500 mt-1">{'>'} Building...</div>
                      <div className="text-[#5063F0] mt-1">{'>'} Done! 2.3s</div>
                    </div>
                  </div>

                  {/* One-Click Deploy */}
                  <div className="p-6 rounded-2xl bg-[#0a0f1a] border border-white/[0.06] hover:border-[#5063F0]/20 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Rocket className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-200">One-Click Deploy</h3>
                        <p className="text-sm text-slate-500">Production in seconds</p>
                      </div>
                    </div>
                    <div className="bg-[#02040a] rounded-xl p-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm text-slate-400">Deployed</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        <div>https://your-app.aether.dev</div>
                        <div className="text-[#5063F0] mt-1">✓ SSL Certificate</div>
                      </div>
                    </div>
                  </div>

                  {/* Firebase Integration */}
                  <div className="md:col-span-2 p-6 rounded-2xl bg-[#0a0f1a] border border-white/[0.06] hover:border-[#5063F0]/20 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <Database className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-200">Firebase Integration</h3>
                        <p className="text-sm text-slate-500">Auth, database, storage ready</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[#02040a] rounded-lg p-3 text-center">
                        <Shield className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <span className="text-xs text-slate-400">Authentication</span>
                      </div>
                      <div className="bg-[#02040a] rounded-lg p-3 text-center">
                        <Database className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <span className="text-xs text-slate-400">Firestore</span>
                      </div>
                      <div className="bg-[#02040a] rounded-lg p-3 text-center">
                        <Cloud className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <span className="text-xs text-slate-400">Storage</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Discover Section - Realistic Frames */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full mt-32 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-end justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">Discover what's possible</h2>
                  <p className="text-base text-slate-500">{showEnhanced ? "AI-generated interfaces built with Aether" : "Templates and applications built with Aether"}</p>
                </div>
              </div>
            </div>
            
            {/* Interface Images Carousel for Enhanced Mode */}
            {showEnhanced ? (
              <div className="relative">
                {/* Left Arrow */}
                <button 
                  onClick={handlePrevCarousel}
                  disabled={carouselIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0a0f1a] border border-white/[0.06] flex items-center justify-center hover:border-[#5063F0]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-400" />
                </button>
                
                {/* Right Arrow */}
                <button 
                  onClick={handleNextCarousel}
                  disabled={carouselIndex >= 7} // 8 interface images total (0-7)
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0a0f1a] border border-white/[0.06] flex items-center justify-center hover:border-[#5063F0]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

                <div ref={carouselRef} className="flex gap-5 overflow-x-auto pb-4 px-6 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {[
                    {
                      title: "Mobile App",
                      desc: "Modern mobile app interface with glass morphism effects and cyan accents.",
                      image: "/mobile-app-interface.png",
                      icon: Smartphone
                    },
                    {
                      title: "Video Game Interface",
                      desc: "Futuristic gaming HUD with sci-fi aesthetics and neon cyan elements.",
                      image: "/video-game-interface.png",
                      icon: Gamepad2
                    },
                    {
                      title: "Database Admin",
                      desc: "Professional dashboard with data visualization and glass morphism panels.",
                      image: "/database-admin-interface.png",
                      icon: Database
                    },
                    {
                      title: "Code Editor",
                      desc: "Modern development IDE with syntax highlighting and dark theme.",
                      image: "/code-editor-interface.png",
                      icon: Code2
                    },
                    {
                      title: "Analytics Dashboard",
                      desc: "Business intelligence interface with charts and data visualization.",
                      image: "/analytics-dashboard.png",
                      icon: BarChart3
                    },
                    {
                      title: "Settings",
                      desc: "Configuration panel with controls and modern UI elements.",
                      image: "/settings-interface.png",
                      icon: Settings2
                    },
                    {
                      title: "Social Messaging",
                      desc: "Modern chat interface with glass morphism design.",
                      image: "/social-messaging-interface.png",
                      icon: MessageCircle
                    },
                    {
                      title: "E-commerce",
                      desc: "Online shopping platform with modern retail design.",
                      image: "/ecommerce-interface.png",
                      icon: ShoppingCart
                    }
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex-shrink-0 w-[280px] snap-start group cursor-pointer"
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        {/* Frame container with image */}
                        <div className="relative h-[300px] rounded-xl overflow-hidden mb-3 bg-[#0a0f1a] border border-white/[0.06] group-hover:border-[#5063F0]/20 transition-all">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image doesn't load
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = 'absolute inset-0 flex items-center justify-center bg-[#02040a]';
                                fallback.innerHTML = `
                                  <div class="text-center">
                                    <div class="w-12 h-12 rounded-full bg-[#5063F0]/20 flex items-center justify-center mx-auto mb-3">
                                      <svg class="w-6 h-6 text-[#6b7ce5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                      </svg>
                                    </div>
                                    <div class="text-sm font-medium text-slate-400">${item.title}</div>
                                  </div>
                                `;
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                          
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className="font-semibold text-slate-200 group-hover:text-[#6b7ce5] transition-colors">{item.title}</h3>
                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{item.desc}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Fade edges */}
                <div className="absolute top-0 left-0 bottom-4 w-8 bg-gradient-to-r from-[#02040a] to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 bottom-4 w-8 bg-gradient-to-l from-[#02040a] to-transparent pointer-events-none" />
              </div>
            ) : (
              /* Placeholder carousel for regular mode */
              <div className="relative">
                {/* Left Arrow */}
                <button 
                  onClick={handlePrevCarousel}
                  disabled={carouselIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0a0f1a] border border-white/[0.06] flex items-center justify-center hover:border-[#5063F0]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-400" />
                </button>
                
                {/* Right Arrow */}
                <button 
                  onClick={handleNextCarousel}
                  disabled={carouselIndex >= 5} // 6 items total (0-5)
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0a0f1a] border border-white/[0.06] flex items-center justify-center hover:border-[#5063F0]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

                <div ref={carouselRef} className="flex gap-5 overflow-x-auto pb-4 px-6 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {[
                    {
                      title: "Mobile App",
                      desc: "Responsive PWA with real-time sync, offline storage, and push notifications.",
                      frame: "phone",
                      icon: Smartphone,
                      image: "/templates/images/mobile-app-placeholder.png"
                    },
                    {
                      title: "Game Interface",
                      desc: "Modular scoreboard UI with player stats, leaderboards, and real-time updates.",
                      frame: "browser",
                      icon: Gamepad2,
                      image: "/templates/images/game-interface-placeholder.png"
                    },
                    {
                      title: "Database Admin",
                      desc: "Detailed CRUD panel with search, filters, pagination, and data export.",
                      frame: "browser",
                      icon: Database,
                      image: "/templates/images/database-admin-placeholder.png"
                    },
                    {
                      title: "Dashboard UI",
                      desc: "Analytics dashboard with charts, widgets, and real-time data visualization.",
                      frame: "browser",
                      icon: Layout,
                      image: "/templates/images/dashboard-ui-placeholder.png"
                    },
                    {
                      title: "E-commerce Store",
                      desc: "Product grid with cart management, checkout flow, and inventory tracking.",
                      frame: "browser",
                      icon: ShoppingCart,
                      image: "/templates/images/ecommerce-store-placeholder.png"
                    },
                    {
                      title: "API Dashboard",
                      desc: "REST API documentation with interactive testing and monitoring tools.",
                      frame: "browser",
                      icon: Globe,
                      image: "/templates/images/api-dashboard-placeholder.png"
                    },
                  ].map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex-shrink-0 w-[280px] snap-start group cursor-pointer"
                        onClick={() => { window.history.pushState({}, '', '/templates'); window.dispatchEvent(new Event('routechange')) }}
                      >
                        {/* Frame container with image */}
                        <div className="relative h-[300px] rounded-xl overflow-hidden mb-3 bg-[#0a0f1a] border border-white/[0.06] group-hover:border-[#5063F0]/20 transition-all">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image doesn't load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('fallback-placeholder');
                            }}
                          />
                          
                          {/* Fallback placeholder */}
                          <div className="fallback-placeholder absolute inset-0 flex items-center justify-center bg-[#02040a] hidden">
                            <IconComponent className="w-12 h-12 text-[#6b7ce5]" />
                          </div>
                          
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-[#02040a]/60 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="px-3 py-1.5 rounded-lg bg-[#5063F0] text-white text-xs font-semibold">
                              Preview
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className="font-semibold text-slate-200 group-hover:text-[#6b7ce5] transition-colors">{item.title}</h3>
                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{item.desc}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Fade edges */}
                <div className="absolute top-0 left-0 bottom-4 w-8 bg-gradient-to-r from-[#02040a] to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 bottom-4 w-8 bg-gradient-to-l from-[#02040a] to-transparent pointer-events-none" />
              </div>
            )}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl w-full px-6 mt-32"
          >
            <div className="p-12 md:p-16 rounded-2xl bg-[#0a0f1a] border border-white/[0.06] text-center space-y-6 relative overflow-hidden">
              {/* Subtle blue glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#5063F0]/5 via-transparent to-transparent" />
              
              <div className="relative z-10 space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">Ready to build?</h2>
                <p className="text-base text-slate-500 max-w-md mx-auto">Start creating production-ready applications today. No credit card required.</p>
              </div>
              
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button 
                  className="px-6 py-3 rounded-lg bg-[#1e3a8a] text-white font-semibold cursor-pointer"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Get Started Free
                </button>
                <button 
                  className="px-6 py-3 rounded-lg bg-transparent text-slate-300 font-semibold border border-white/[0.08] cursor-pointer"
                  onClick={() => { window.history.pushState({}, '', '/community'); window.dispatchEvent(new Event('routechange')) }}
                >
                  View Gallery
                </button>
              </div>
            </div>
          </motion.div>

          <Footer />
        </motion.main>

        <LoginModal 
          open={isLoginModalOpen} 
          onClose={() => {
            console.log('[App] LoginModal onClose called - closing modal')
            setIsLoginModalOpen(false)
          }} 
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

        {/* Agent Mode Dialog */}
        <AnimatePresence>
          {showAgentMode && (
            <AgentMode 
              isOpen={showAgentMode}
              onClose={() => setShowAgentMode(false)}
              onProjectComplete={(project) => {
                // Handle agent mode completion
                console.log('Agent project completed:', project)
              }}
            />
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

        {/* Full-size Image Viewer */}
        <AnimatePresence>
          {selectedImageIndex !== null && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/95 backdrop-blur-xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full h-full flex items-center justify-center p-4"
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedImageIndex(null)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Navigation buttons */}
                <button
                  onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                  disabled={selectedImageIndex === 0}
                  className="absolute left-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={() => setSelectedImageIndex(Math.min(7, selectedImageIndex + 1))}
                  disabled={selectedImageIndex === 7}
                  className="absolute right-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Image display */}
                <div className="max-w-6xl max-h-full flex items-center justify-center">
                  <img 
                    src={showEnhanced ? [
                      "/mobile-app-interface.png",
                      "/video-game-interface.png", 
                      "/database-admin-interface.png",
                      "/code-editor-interface.png",
                      "/analytics-dashboard.png",
                      "/settings-interface.png",
                      "/social-messaging-interface.png",
                      "/ecommerce-interface.png"
                    ][selectedImageIndex] : [
                      "/templates/images/mobile-app-placeholder.png",
                      "/templates/images/game-interface-placeholder.png",
                      "/templates/images/database-admin-placeholder.png",
                      "/templates/images/dashboard-ui-placeholder.png",
                      "/templates/images/ecommerce-store-placeholder.png",
                      "/templates/images/api-dashboard-placeholder.png"
                    ][selectedImageIndex]}
                    alt={`Interface ${selectedImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>

                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full text-white text-sm">
                  {selectedImageIndex + 1} / {showEnhanced ? 8 : 6}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Toaster position="bottom-center" richColors />
      <AppUpdater />
      </div>
    </ThemeProvider>
  )
}