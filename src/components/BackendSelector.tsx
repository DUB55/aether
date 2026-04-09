"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { isSupabaseConfigured } from '@/lib/supabase'

interface BackendSelectorProps {
  currentBackend: 'firebase' | 'supabase'
  onBackendChange: (backend: 'firebase' | 'supabase') => void
  className?: string
}

export function BackendSelector({ currentBackend, onBackendChange, className }: BackendSelectorProps) {
  const supabaseConfigured = isSupabaseConfigured()

  const handleBackendChange = (backend: 'firebase' | 'supabase') => {
    if (backend === 'supabase' && !supabaseConfigured) {
      toast.error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.')
      return
    }
    onBackendChange(backend)
    toast.success(`Backend switched to ${backend === 'firebase' ? 'Firebase' : 'Supabase'}`)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Backend Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button
            onClick={() => handleBackendChange('firebase')}
            variant={currentBackend === 'firebase' ? 'default' : 'outline'}
            className="w-full justify-start"
          >
            <CheckCircle2 className={`w-4 h-4 mr-2 ${currentBackend === 'firebase' ? '' : 'hidden'}`} />
            Firebase
          </Button>
          <Button
            onClick={() => handleBackendChange('supabase')}
            variant={currentBackend === 'supabase' ? 'default' : 'outline'}
            className="w-full justify-start"
            disabled={!supabaseConfigured}
          >
            <CheckCircle2 className={`w-4 h-4 mr-2 ${currentBackend === 'supabase' ? '' : 'hidden'}`} />
            Supabase
            {!supabaseConfigured && <AlertCircle className="w-4 h-4 ml-auto" />}
          </Button>
        </div>

        {!supabaseConfigured && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">Supabase not configured</p>
                <p>Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables to enable Supabase.</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Backend Services</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li><strong>Firebase:</strong> NoSQL database, real-time sync, authentication</li>
              <li><strong>Supabase:</strong> PostgreSQL, real-time subscriptions, edge functions</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
