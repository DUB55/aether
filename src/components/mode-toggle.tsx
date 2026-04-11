"use client"

import * as React from "react"
import { Moon, Sun, Star } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from '@/components/ui/button'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [currentTheme, setCurrentTheme] = React.useState("light")

  React.useEffect(() => {
    setMounted(true)
    // AGGRESSIVE FIX: Force theme detection on mount
    const detectedTheme = document.documentElement.classList.contains('dark') 
      ? 'dark' 
      : document.documentElement.classList.contains('black')
      ? 'black'
      : 'light'
    setCurrentTheme(detectedTheme)
    
    // AGGRESSIVE FIX: Listen for theme changes
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.classList.contains('dark') 
        ? 'dark' 
        : document.documentElement.classList.contains('black')
        ? 'black'
        : 'light'
      setCurrentTheme(newTheme)
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (theme) {
      setCurrentTheme(theme)
    }
  }, [theme])

  const toggleTheme = () => {
    const nextTheme = currentTheme === "light" ? "dark" : currentTheme === "dark" ? "black" : "light"
    setTheme(nextTheme)
    setCurrentTheme(nextTheme)
  }

  // AGGRESSIVE FIX: Always render with explicit colors, no hydration mismatch handling
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full w-9 h-9"
      onClick={toggleTheme}
      style={{ 
        // AGGRESSIVE FIX: Force icon colors with inline styles to override any CSS issues
        color: currentTheme === "light" ? "#000000" : currentTheme === "dark" ? "#ffffff" : "#ffffff",
        backgroundColor: "transparent",
        border: "none"
      }}
    >
      {currentTheme === "light" && (
        <Sun 
          className="h-[1.2rem] w-[1.2rem]" 
          style={{ color: "#000000" }}
        />
      )}
      {currentTheme === "dark" && (
        <Moon 
          className="h-[1.2rem] w-[1.2rem]" 
          style={{ color: "#ffffff" }}
        />
      )}
      {currentTheme === "black" && (
        <Star 
          className="h-[1.2rem] w-[1.2rem]" 
          style={{ color: "#ffffff" }}
        />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
