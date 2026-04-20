import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { interactiveChatManager, ChatQuestion, DesignSelection } from '@/lib/enterprise'
import { MessageSquare, CheckCircle, ArrowRight, Palette, Cpu, Users, Target, Clock, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface InteractiveChatModeProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
  onChatComplete?: (context: any) => void
}

export function InteractiveChatMode({ open, onOpenChange, projectId, onChatComplete }: InteractiveChatModeProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<ChatQuestion | null>(null)
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [designOptions, setDesignOptions] = useState<DesignSelection[]>([])
  const [showDesignSelection, setShowDesignSelection] = useState(false)

  useEffect(() => {
    if (open && projectId) {
      startChat()
    }
  }, [open, projectId])

  const startChat = async () => {
    try {
      const session = interactiveChatManager.createSession(projectId || 'temp')
      setSessionId(session.id)
      
      const firstQuestion = await interactiveChatManager.startDialogue(session.id, 'project-startup')
      setCurrentQuestion(firstQuestion)
      setChatHistory([{ role: 'assistant', content: firstQuestion.question, type: 'question' }])
    } catch (error) {
      toast.error('Failed to start interactive chat')
      console.error(error)
    }
  }

  const handleAnswer = async (answer: string) => {
    if (!sessionId || !currentQuestion) return

    setIsProcessing(true)
    setSelectedAnswer(answer)

    try {
      const nextQuestion = await interactiveChatManager.handleAnswer(
        sessionId,
        currentQuestion.id,
        answer
      )

      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: answer, type: 'answer' },
        nextQuestion ? { role: 'assistant', content: nextQuestion.question, type: 'question' } : { role: 'assistant', content: 'Chat complete!', type: 'information' }
      ])

      if (nextQuestion) {
        setCurrentQuestion(nextQuestion)
      } else {
        // Chat complete, show design options if applicable
        const session = interactiveChatManager.getSession(sessionId)
        if (session?.context.designPreferences) {
          const options = interactiveChatManager.generateDesignOptions(session.context.designPreferences)
          setDesignOptions(options)
          setShowDesignSelection(true)
        } else {
          handleComplete()
        }
      }
    } catch (error) {
      toast.error('Failed to process answer')
      console.error(error)
    } finally {
      setIsProcessing(false)
      setSelectedAnswer('')
    }
  }

  const handleSkip = async () => {
    if (!sessionId || !currentQuestion) return
    await handleAnswer('Skipped')
  }

  const handleDesignSelect = (design: DesignSelection) => {
    if (sessionId) {
      const session = interactiveChatManager.getSession(sessionId)
      if (session) {
        session.context.selectedDesign = design
        handleComplete()
      }
    }
  }

  const handleComplete = () => {
    if (sessionId) {
      const context = interactiveChatManager.getContext(sessionId)
      if (context && onChatComplete) {
        onChatComplete(context)
      }
    }
    toast.success('Interactive chat complete!')
    onOpenChange(false)
  }

  const getQuestionIcon = (category: ChatQuestion['category']) => {
    const icons = {
      design: Palette,
      functionality: Cpu,
      technical: Cpu,
      business: Target,
      preferences: Sparkles
    }
    return icons[category] || MessageSquare
  }

  const getCategoryColor = (category: ChatQuestion['category']) => {
    const colors = {
      design: 'bg-purple-500',
      functionality: 'bg-blue-500',
      technical: 'bg-green-500',
      business: 'bg-orange-500',
      preferences: 'bg-pink-500'
    }
    return colors[category] || 'bg-gray-500'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Interactive Project Setup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showDesignSelection ? (
            <>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.type === 'question' && currentQuestion && (
                        <div className="flex items-center gap-2 mb-2">
                          {React.createElement(getQuestionIcon(currentQuestion.category), {
                            className: 'w-4 h-4'
                          })}
                          <Badge className={getCategoryColor(currentQuestion.category)}>
                            {currentQuestion.category}
                          </Badge>
                        </div>
                      )}
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {currentQuestion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Response</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                      <div className="grid grid-cols-1 gap-2">
                        {currentQuestion.options.map((option) => (
                          <Button
                            key={option}
                            variant={selectedAnswer === option ? 'default' : 'outline'}
                            onClick={() => handleAnswer(option)}
                            disabled={isProcessing}
                            className="justify-start text-left"
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    )}

                    {currentQuestion.type === 'yes-no' && (
                      <div className="flex gap-2">
                        <Button
                          variant={selectedAnswer === 'Yes' ? 'default' : 'outline'}
                          onClick={() => handleAnswer('Yes')}
                          disabled={isProcessing}
                        >
                          Yes
                        </Button>
                        <Button
                          variant={selectedAnswer === 'No' ? 'default' : 'outline'}
                          onClick={() => handleAnswer('No')}
                          disabled={isProcessing}
                        >
                          No
                        </Button>
                      </div>
                    )}

                    {currentQuestion.type === 'text' && (
                      <div className="space-y-2">
                        <textarea
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="Type your answer..."
                          value={selectedAnswer}
                          onChange={(e) => setSelectedAnswer(e.target.value)}
                          disabled={isProcessing}
                        />
                        <Button
                          onClick={() => handleAnswer(selectedAnswer)}
                          disabled={isProcessing || !selectedAnswer.trim()}
                          className="w-full"
                        >
                          {isProcessing ? 'Processing...' : 'Submit Answer'}
                        </Button>
                      </div>
                    )}

                    {!currentQuestion.required && (
                      <Button
                        variant="ghost"
                        onClick={handleSkip}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        Skip this question
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Select Your Design
                  </CardTitle>
                  <CardDescription>
                    Choose a design template based on your preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {designOptions.map((design) => (
                      <Card
                        key={design.templateId}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handleDesignSelect(design)}
                      >
                        <CardHeader>
                          <CardTitle className="text-base">{design.templateName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded mb-2 flex items-center justify-center">
                            <span className="text-sm text-gray-500">Design Preview</span>
                          </div>
                          <Button variant="outline" className="w-full" size="sm">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Select This Design
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Interactive Chat Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    I'll ask you a few questions to understand your project requirements better.
                    This helps me generate more accurate and personalized code for your application.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
