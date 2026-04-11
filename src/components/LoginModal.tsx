"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Cpu, Rocket, X, AlertTriangle } from 'lucide-react'
import { AetherLogo } from './aether-logo'
import { useFirebase } from './FirebaseProvider'

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onLogin: () => void
}

export function LoginModal({ open, onClose, onLogin }: LoginModalProps) {
  const { user } = useFirebase()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  console.log('[LoginModal] Render - open:', open, 'user:', user ? 'authenticated' : 'null')

  // Auto-close modal when user is authenticated (Google OAuth users are already verified)
  useEffect(() => {
    console.log('[LoginModal] useEffect triggered - user:', user ? 'authenticated' : 'null', 'open:', open)
    if (user && open) {
      console.log('[LoginModal] User authenticated - closing modal automatically')
      // Google OAuth users are already verified, no need for email verification
      onClose()
    }
  }, [user, open, onClose])

  const handleLogin = async () => {
    setError(null)
    setIsLoading(true)
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setError('Login is taking too long. This might be due to ad blockers or network issues. Please try disabling ad blockers or check your connection.')
      setIsLoading(false)
    }, 15000) // 15 second timeout
    
    try {
      await onLogin()
      clearTimeout(timeout)
    } catch (err: any) {
      clearTimeout(timeout)
      console.error('Login failed:', err)
      
      if (err.message.includes('ERR_BLOCKED_BY_CLIENT') || err.message.includes('blocked')) {
        setError('Authentication blocked by browser extension. Please disable ad blockers or privacy extensions and try again.')
      } else if (err.message.includes('popup-closed-by-user') || err.message.includes('popup-blocked')) {
        setError('Popup was blocked. Please allow popups for this site in your browser settings and try again.')
      } else if (err.message.includes('unauthorized-domain')) {
        setError('This domain is not authorized for authentication. Please check your Firebase configuration.')
      } else {
        setError(err.message || 'Authentication failed. Please try again.')
      }
    } finally {
      clearTimeout(timeout)
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    handleLogin()
  }
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-[var(--bg)] rounded-[32px] border border-[var(--bdr)] shadow-2xl overflow-hidden"
        >
          {/* Background Decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 p-8">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--bg2)] hover:bg-[var(--bg3)] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-[var(--t3)]" />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
                <div className="flex items-center gap-3 justify-center">
                  <AetherLogo size={32} />
                  <DialogTitle className="text-2xl font-bold tracking-tight text-[var(--t)]">Aether</DialogTitle>
                </div>
                
                <DialogDescription className="text-[var(--t3)]">
                  Sign in to save your projects, collaborate with others, and access advanced AI models.
                </DialogDescription>

                <div className="w-full space-y-4 pt-2">
                  {error && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-200">
                        <p className="font-medium mb-1">Authentication Error</p>
                        <p>{error}</p>
                        {error.includes('ad blocker') || error.includes('block') && (
                          <p className="mt-2 text-amber-300/80">Please disable any ad blockers or privacy extensions and try again.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg2)] border border-[var(--bdr)]">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Rocket className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-[var(--t)]">Unlimited Projects</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg2)] border border-[var(--bdr)]">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-[var(--t)]">Advanced AI Models</span>
                    </div>
                  </div>

                  <Button
                    onClick={error ? handleRetry : handleLogin}
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-[var(--t)] text-[var(--bg)] font-bold py-6 hover:scale-[1.02] transition-all shadow-xl shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Connecting...
                      </span>
                    ) : error ? (
                      <span className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                        </svg>
                        Try Again
                      </span>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 fill-current">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>

                  <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 px-4">
                    By continuing, you agree to Aether's Terms of Service and Privacy Policy.
                  </p>

                  {!error && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-center text-slate-500 dark:text-slate-600 px-2">
                        If you see an error, please disable ad blockers and try again.
                      </p>
                      <p className="text-[10px] text-center text-slate-600 dark:text-slate-700 px-2">
                        For testing: Open browser console and run <code className="bg-slate-800 px-1 rounded">localStorage.setItem('aether_debug_mode', 'true')</code>
                      </p>
                    </div>
                  )}
                </div>
              </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
