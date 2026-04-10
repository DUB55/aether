"use client"

import * as React from "react"
import { Moon, Sun, Star } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from '@/components/ui/button'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("black")
    else setTheme("light")
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full w-9 h-9 text-foreground"
        disabled
      >
        <Sun className="h-[1.2rem] w-[1.2rem] text-foreground" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full w-9 h-9 text-foreground"
      onClick={toggleTheme}
    >
      {(!theme || theme === "light") && <Sun className="h-[1.2rem] w-[1.2rem] text-foreground" />}
      {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem] text-foreground" />}
      {theme === "black" && <Star className="h-[1.2rem] w-[1.2rem] text-foreground" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
