"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { voiceToCodeService } from '@/lib/voice-to-code'

interface VoiceInputProps {
  onTranscript: (transcript: string) => void
  disabled?: boolean
  className?: string
}

export function VoiceInput({ onTranscript, disabled, className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    setIsSupported(voiceToCodeService.isSupported())
  }, [])

  const startListening = () => {
    if (!isSupported) {
      toast.error('Voice recognition is not supported in this browser')
      return
    }

    if (isListening) {
      stopListening()
      return
    }

    setIsListening(true)
    setInterimTranscript('')

    cleanupRef.current = voiceToCodeService.startRecognition(
      (result) => {
        const { cleanedText, detectedCommands } = voiceToCodeService.processTranscript(result.transcript)
        
        if (result.isFinal) {
          onTranscript(cleanedText)
          setInterimTranscript('')
          if (detectedCommands.length > 0) {
            toast.success(`Detected commands: ${detectedCommands.join(', ')}`)
          }
        } else {
          setInterimTranscript(cleanedText)
        }
      },
      (error) => {
        toast.error(error)
        stopListening()
      },
      () => {
        stopListening()
      }
    )
  }

  const stopListening = () => {
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }
    setIsListening(false)
    setInterimTranscript('')
  }

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])

  if (!isSupported) {
    return null
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant={isListening ? "default" : "outline"}
        size="icon"
        onClick={startListening}
        disabled={disabled}
        className={isListening ? "animate-pulse" : ""}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      
      {interimTranscript && (
        <div className="mt-2 p-2 bg-muted rounded text-sm text-muted-foreground">
          "{interimTranscript}..."
        </div>
      )}
    </div>
  )
}
