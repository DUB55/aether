"use client"

import Link from "next/link"
import { ModeToggle } from "./mode-toggle"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { AetherLogo } from "./aether-logo"
import { motion } from "framer-motion"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

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
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 transition-all duration-500",
        "w-full border-b",
        scrolled 
          ? "bg-transparent backdrop-blur-3xl border-white/10 dark:border-white/5 shadow-sm" 
          : "bg-transparent border-transparent backdrop-blur-none"
      )}
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1 rounded-lg group-hover:scale-110 transition-transform duration-300">
             <AetherLogo size={24} showText={false} className="text-foreground" />
          </div>
          <span className="font-bold tracking-tight text-lg text-foreground">
            Aether
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-1">
          <NavItem label="Docs" href="/docs" />
          <NavItem label="Community" href="/community" />
          <NavItem label="Changelog" href="/changelog" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link 
          href="https://github.com" 
          target="_blank" 
          className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </Link>
        <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block" />
        <ModeToggle />
        <Link href="/login">
          <Button variant="ghost" className="rounded-full font-medium hover:bg-black/5 dark:hover:bg-white/10">Log in</Button>
        </Link>
        <Link href="/signup">
          <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium px-6 shadow-lg shadow-black/10 dark:shadow-white/5 transition-all hover:scale-105">
            Get started
          </Button>
        </Link>
      </div>
    </motion.nav>
  )
}

function NavItem({ label, href = "#" }: { label: string; href?: string }) {
  return (
    <Link 
      href={href}
      className="px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-200"
    >
      {label}
    </Link>
  )
}
