// Voice-to-code service
// Converts speech to text for hands-free prompting

export interface VoiceRecognitionResult {
  transcript: string
  isFinal: boolean
  confidence: number
}

export const voiceToCodeService = {
  // Check if browser supports speech recognition
  isSupported: (): boolean => {
    return typeof window !== 'undefined' && 
           ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  },

  // Start voice recognition
  startRecognition: (
    onResult: (result: VoiceRecognitionResult) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): (() => void) => {
    if (!voiceToCodeService.isSupported()) {
      onError?.('Speech recognition not supported in this browser')
      return () => {}
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const voiceResult: VoiceRecognitionResult = {
          transcript: result[0].transcript,
          isFinal: result.isFinal,
          confidence: result[0].confidence
        }
        onResult(voiceResult)
      }
    }

    recognition.onerror = (event: any) => {
      const errorMessages: Record<string, string> = {
        'no-speech': 'No speech detected',
        'audio-capture': 'No microphone found',
        'not-allowed': 'Microphone permission denied',
        'network': 'Network error'
      }
      const errorMessage = errorMessages[event.error] || 'Speech recognition error'
      onError?.(errorMessage)
    }

    recognition.onend = () => {
      onEnd?.()
    }

    recognition.start()

    // Return cleanup function
    return () => {
      recognition.stop()
    }
  },

  // Get available languages
  getAvailableLanguages: (): Array<{ code: string; name: string }> => {
    return [
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'es-ES', name: 'Spanish' },
      { code: 'fr-FR', name: 'French' },
      { code: 'de-DE', name: 'German' },
      { code: 'it-IT', name: 'Italian' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)' },
      { code: 'ja-JP', name: 'Japanese' },
      { code: 'ko-KR', name: 'Korean' },
      { code: 'zh-CN', name: 'Chinese (Simplified)' }
    ]
  },

  // Process transcript for code-related commands
  processTranscript: (transcript: string): {
    cleanedText: string
    detectedCommands: string[]
  } => {
    const commands = [
      'create', 'delete', 'modify', 'add', 'remove', 'update',
      'component', 'page', 'function', 'variable', 'style',
      'deploy', 'test', 'build', 'run'
    ]

    const detectedCommands = commands.filter(cmd => 
      transcript.toLowerCase().includes(cmd)
    )

    // Clean up common speech artifacts
    let cleanedText = transcript
      .replace(/\b(um|uh|like|you know)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    return {
      cleanedText,
      detectedCommands
    }
  }
}
