"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VoiceToCodeProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function VoiceToCode({ onTranscript, disabled = false }: VoiceToCodeProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if Web Speech API is supported
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      setIsSupported(true)
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript)
          onTranscript(finalTranscript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [onTranscript])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setTranscript('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`rounded-full transition-all ${isListening ? 'bg-primary/20 text-primary' : 'text-[var(--t3)]'}`}
      onClick={toggleListening}
      disabled={disabled}
      title="Voice to Code"
    >
      {isListening ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </Button>
  )
}
