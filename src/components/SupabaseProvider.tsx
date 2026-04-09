"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, supabaseAuth, isSupabaseConfigured } from '@/lib/supabase'

interface SupabaseContextType {
  user: SupabaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  isConfigured: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    let mounted = true

    // Check initial session
    const checkSession = async () => {
      try {
        const result = await supabaseAuth.getUser()
        if (mounted) {
          setUser((result as any).data.user)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error checking session:', error)
        if (mounted) setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const authStateChange = supabaseAuth.onAuthStateChange((event, session) => {
      console.log('Supabase auth state changed:', event, session?.user?.email)
      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    }) as any

    return () => {
      mounted = false
      if (authStateChange?.data?.subscription) {
        authStateChange.data.subscription.unsubscribe()
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    await supabaseAuth.signIn(email, password)
  }

  const signUp = async (email: string, password: string) => {
    await supabaseAuth.signUp(email, password)
  }

  const signInWithGoogle = async () => {
    await supabaseAuth.signInWithGoogle()
  }

  const signOut = async () => {
    await supabaseAuth.signOut()
    setUser(null)
  }

  return (
    <SupabaseContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        isConfigured: isSupabaseConfigured(),
      }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
