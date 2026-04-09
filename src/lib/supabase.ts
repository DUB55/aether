// Supabase integration for Aether AI
// Provides authentication, database, and storage functionality using Supabase

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Authentication functions
export const supabaseAuth = {
  signIn: async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  signUp: async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  signInWithGoogle: async () => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) throw error
    return data
  },

  signOut: async () => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  getUser: async () => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!supabase) return () => {}
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Database functions
export const supabaseDb = {
  // Projects
  getProjects: async (userId: string) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data
  },

  getProject: async (projectId: string) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()
    if (error) throw error
    return data
  },

  createProject: async (project: any) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()
    if (error) throw error
    return data
  },

  updateProject: async (projectId: string, updates: any) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  deleteProject: async (projectId: string) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
    if (error) throw error
  },

  // Subscribe to real-time updates
  subscribeToProject: (projectId: string, callback: (payload: any) => void) => {
    if (!supabase) return () => {}
    return supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        callback
      )
      .subscribe()
  },
}

// Storage functions
export const supabaseStorage = {
  uploadFile: async (bucket: string, path: string, file: File) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    if (error) throw error
    return data
  },

  getPublicUrl: (bucket: string, path: string) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  deleteFile: async (bucket: string, path: string) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    if (error) throw error
  },
}

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey)
}
