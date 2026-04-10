"use client"

import { ModeToggle } from './mode-toggle'
import { Button } from './ui/button'
import React, { useEffect, useState } from "react"
import { cn } from '@/lib/utils'
import { AetherLogo } from './aether-logo'
import { motion } from "framer-motion"
import { useFirebase } from './FirebaseProvider'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from './ui/dropdown-menu'
import { LogOut, User, LayoutGrid, Menu, X } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signIn, logout } = useFirebase()
  const [pfpErrorCount, setPfpErrorCount] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 transition-all duration-500",
        "w-full border-b",
        scrolled 
          ? "bg-[var(--bg)]/30 dark:bg-white/5 backdrop-blur-xl border-[var(--bdr)] dark:border-white/10 shadow-sm" 
          : "bg-transparent border-transparent backdrop-blur-none"
      )}
    >
      <div className="flex items-center gap-8">
        <a href="/" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/'); window.dispatchEvent(new Event('routechange')) }} className="flex items-center gap-3 group cursor-pointer">
          <AetherLogo size={28} showText={false} className="text-foreground group-hover:scale-110 transition-transform duration-300" />
          <span className="font-bold tracking-tight text-lg text-[var(--t)] hidden sm:block">
            Aether
          </span>
        </a>
        
        <div className="hidden md:flex items-center gap-1">
          <NavItem label="All Projects" href="/projects" />
          <NavItem label="Community" href="/community" />
          <NavItem label="Templates" href="/templates" />
          <NavItem label="Pricing" href="/pricing" />
          <NavItem label="Docs" href="/docs" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          className="md:hidden p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <a 
          href="https://github.com/DUB55/aether" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block" />
        <ModeToggle />
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--bg3)] transition-colors outline-none cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-[var(--bdr)]">
                  {user.photoURL ? (
                    <img 
                      src={`/api/proxy/image?url=${encodeURIComponent(user.photoURL)}`} 
                      alt={user.displayName || 'User'} 
                      className="w-full h-full object-cover" 
                      onError={() => {
                        if (pfpErrorCount < 3) {
                          setTimeout(() => setPfpErrorCount(prev => prev + 1), 1000);
                        }
                      }}
                    />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-xl liquid-glass border-border">
              <div className="px-3 py-2.5 mb-1">
                <div className="text-sm font-bold truncate text-[var(--t)]">{user.displayName || 'Developer'}</div>
                <div className="text-xs text-[var(--t3)] truncate">{user.email}</div>
              </div>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                className="rounded-xl cursor-pointer gap-3 py-2.5"
                onClick={() => { window.history.pushState({}, '', '/projects'); window.dispatchEvent(new Event('routechange')) }}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>My Projects</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="rounded-xl cursor-pointer gap-3 py-2.5 text-destructive focus:text-destructive"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button 
              variant="ghost" 
              className="rounded-full font-medium hover:bg-[var(--bg3)] cursor-pointer text-[var(--t)]"
              onClick={signIn}
            >
              Log in
            </Button>
            <Button 
              className="rounded-full bg-[var(--t)] text-[var(--bg)] hover:opacity-90 font-medium px-4 sm:px-6 shadow-lg transition-all hover:scale-105 cursor-pointer text-xs sm:text-sm"
              onClick={signIn}
            >
              Get started
            </Button>
          </>
        )}
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 p-4 bg-[var(--bg)]/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border-b border-border z-40 shadow-2xl"
          >
            <div className="flex flex-col gap-2">
              <MobileNavItem label="All Projects" href="/projects" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem label="Community" href="/community" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem label="Templates" href="/templates" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem label="Pricing" href="/pricing" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem label="Docs" href="/docs" onClick={() => setIsMobileMenuOpen(false)} />
              {!user && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl font-bold py-6 border-border"
                    onClick={() => { signIn(); setIsMobileMenuOpen(false); }}
                  >
                    Log in
                  </Button>
                  <Button 
                    className="w-full rounded-xl bg-primary text-primary-foreground font-bold py-6 shadow-lg shadow-primary/20"
                    onClick={() => { signIn(); setIsMobileMenuOpen(false); }}
                  >
                    Get started
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

function NavItem({ label, href = "#", target }: { label: string; href?: string; target?: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (target === "_blank") {
      window.open(href, '_blank', 'noopener,noreferrer')
    } else {
      window.history.pushState({}, '', href)
      window.dispatchEvent(new Event('routechange'))
    }
  }

  return (
    <a 
      href={href}
      onClick={handleClick}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--t2)] hover:text-[var(--t)] hover:bg-[var(--bg3)] transition-all duration-200 cursor-pointer"
    >
      {label}
    </a>
  )
}

function MobileNavItem({ label, href = "#", onClick }: { label: string; href?: string; onClick: () => void }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.history.pushState({}, '', href)
    window.dispatchEvent(new Event('routechange'))
    onClick()
  }

  return (
    <a 
      href={href}
      onClick={handleClick}
      className="px-4 py-3 rounded-xl text-sm font-medium text-[var(--t2)] hover:text-[var(--t)] hover:bg-[var(--bg3)] transition-all duration-200 cursor-pointer"
    >
      {label}
    </a>
  )
}
