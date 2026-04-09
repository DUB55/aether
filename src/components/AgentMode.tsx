"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Code2, 
  Rocket, 
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Square,
  FileText,
  Settings,
  Layers,
  Globe,
  Shield,
  Database,
  Palette,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'
import { toast } from 'sonner'

interface AgentTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  progress: number
  duration?: number
  output?: string
}

interface AgentPhase {
  id: string
  name: string
  description: string
  tasks: AgentTask[]
  status: 'pending' | 'in_progress' | 'completed'
  estimatedTime: number
}

interface AgentProject {
  id: string
  name: string
  description: string
  requirements: string[]
  technologies: string[]
  phases: AgentPhase[]
  currentPhase: number
  overallProgress: number
  status: 'planning' | 'building' | 'testing' | 'deploying' | 'completed' | 'failed'
  startTime?: number
  estimatedCompletion?: number
  logs: string[]
}

interface AgentModeProps {
  isOpen: boolean
  onClose: () => void
  onProjectComplete?: (project: AgentProject) => void
}

export function AgentMode({ isOpen, onClose, onProjectComplete }: AgentModeProps) {
  const [project, setProject] = useState<AgentProject | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [logs])

  const generateProjectPlan = async (description: string) => {
    const phases: AgentPhase[] = [
      {
        id: 'planning',
        name: 'Planning & Architecture',
        description: 'Analyzing requirements and designing system architecture',
        status: 'pending',
        estimatedTime: 15,
        tasks: [
          {
            id: 'analyze-requirements',
            title: 'Analyze Requirements',
            description: 'Parse and understand project requirements',
            status: 'pending',
            progress: 0
          },
          {
            id: 'design-architecture',
            title: 'Design Architecture',
            description: 'Create system architecture and data flow',
            status: 'pending',
            progress: 0
          },
          {
            id: 'choose-tech-stack',
            title: 'Select Technology Stack',
            description: 'Choose optimal technologies for the project',
            status: 'pending',
            progress: 0
          }
        ]
      },
      {
        id: 'setup',
        name: 'Project Setup',
        description: 'Initializing project structure and dependencies',
        status: 'pending',
        estimatedTime: 10,
        tasks: [
          {
            id: 'create-structure',
            title: 'Create Project Structure',
            description: 'Set up folder structure and files',
            status: 'pending',
            progress: 0
          },
          {
            id: 'install-deps',
            title: 'Install Dependencies',
            description: 'Install required packages and libraries',
            status: 'pending',
            progress: 0
          },
          {
            id: 'configure-build',
            title: 'Configure Build System',
            description: 'Set up build tools and configuration',
            status: 'pending',
            progress: 0
          }
        ]
      },
      {
        id: 'development',
        name: 'Core Development',
        description: 'Building main application features',
        status: 'pending',
        estimatedTime: 45,
        tasks: [
          {
            id: 'implement-core',
            title: 'Implement Core Logic',
            description: 'Build main application logic',
            status: 'pending',
            progress: 0
          },
          {
            id: 'create-ui',
            title: 'Create User Interface',
            description: 'Design and implement UI components',
            status: 'pending',
            progress: 0
          },
          {
            id: 'implement-features',
            title: 'Implement Features',
            description: 'Build specific project features',
            status: 'pending',
            progress: 0
          },
          {
            id: 'add-styling',
            title: 'Add Styling & Design',
            description: 'Apply styling and responsive design',
            status: 'pending',
            progress: 0
          }
        ]
      },
      {
        id: 'testing',
        name: 'Testing & Quality Assurance',
        description: 'Comprehensive testing and bug fixes',
        status: 'pending',
        estimatedTime: 20,
        tasks: [
          {
            id: 'unit-tests',
            title: 'Unit Testing',
            description: 'Write and run unit tests',
            status: 'pending',
            progress: 0
          },
          {
            id: 'integration-tests',
            title: 'Integration Testing',
            description: 'Test component interactions',
            status: 'pending',
            progress: 0
          },
          {
            id: 'bug-fixes',
            title: 'Bug Fixes & Optimization',
            description: 'Fix identified issues and optimize',
            status: 'pending',
            progress: 0
          }
        ]
      },
      {
        id: 'deployment',
        name: 'Deployment & Documentation',
        description: 'Prepare for production deployment',
        status: 'pending',
        estimatedTime: 10,
        tasks: [
          {
            id: 'optimize-build',
            title: 'Optimize Build',
            description: 'Optimize for production',
            status: 'pending',
            progress: 0
          },
          {
            id: 'create-docs',
            title: 'Create Documentation',
            description: 'Generate project documentation',
            status: 'pending',
            progress: 0
          },
          {
            id: 'deploy-preview',
            title: 'Deploy Preview',
            description: 'Deploy to preview environment',
            status: 'pending',
            progress: 0
          }
        ]
      }
    ]

    const newProject: AgentProject = {
      id: Math.random().toString(36).substring(7),
      name: `Agent Project ${new Date().toLocaleTimeString()}`,
      description,
      requirements: extractRequirements(description),
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
      phases,
      currentPhase: 0,
      overallProgress: 0,
      status: 'planning',
      startTime: Date.now(),
      estimatedCompletion: Date.now() + (100 * 60 * 1000), // 100 minutes estimated
      logs: ['Project initialized', 'Starting planning phase...']
    }

    setProject(newProject)
    setLogs(newProject.logs)
  }

  const extractRequirements = (description: string): string[] => {
    // Simple requirement extraction - in production this would use AI
    const requirements: string[] = []
    if (description.toLowerCase().includes('responsive')) requirements.push('Responsive Design')
    if (description.toLowerCase().includes('database')) requirements.push('Database Integration')
    if (description.toLowerCase().includes('auth')) requirements.push('Authentication')
    if (description.toLowerCase().includes('api')) requirements.push('API Integration')
    if (description.toLowerCase().includes('real-time')) requirements.push('Real-time Features')
    if (requirements.length === 0) requirements.push('Web Application')
    return requirements
  }

  const runAgent = async () => {
    if (!project) return
    
    setIsRunning(true)
    setProject(prev => prev ? { ...prev, status: 'building' } : null)
    
    for (let phaseIndex = 0; phaseIndex < project.phases.length; phaseIndex++) {
      const phase = project.phases[phaseIndex]
      
      setProject(prev => prev ? {
        ...prev,
        currentPhase: phaseIndex,
        status: phaseIndex === 0 ? 'planning' : phaseIndex === project.phases.length - 1 ? 'deploying' : 'building'
      } : null)
      
      addLog(`Starting ${phase.name} phase...`)
      
      // Update phase status
      setProject(prev => prev ? {
        ...prev,
        phases: prev.phases.map((p, idx) => 
          idx === phaseIndex ? { ...p, status: 'in_progress' } : p
        )
      } : null)
      
      // Simulate phase execution
      await executePhase(phase, phaseIndex)
      
      // Mark phase as completed
      setProject(prev => prev ? {
        ...prev,
        phases: prev.phases.map((p, idx) => 
          idx === phaseIndex ? { ...p, status: 'completed' } : p
        )
      } : null)
      
      addLog(`${phase.name} phase completed!`)
    }
    
    // Mark project as completed
    setProject(prev => prev ? { ...prev, status: 'completed', overallProgress: 100 } : null)
    setIsRunning(false)
    addLog('🎉 Project completed successfully!')
    toast.success('Agent project completed successfully!')
    
    if (onProjectComplete && project) {
      onProjectComplete(project)
    }
  }

  const executePhase = async (phase: AgentPhase, phaseIndex: number) => {
    for (let taskIndex = 0; taskIndex < phase.tasks.length; taskIndex++) {
      const task = phase.tasks[taskIndex]
      
      // Update task status to in_progress
      setProject(prev => prev ? {
        ...prev,
        phases: prev.phases.map((p, pIdx) => 
          pIdx === phaseIndex ? {
            ...p,
            tasks: p.tasks.map((t, tIdx) => 
              tIdx === taskIndex ? { ...t, status: 'in_progress' } : t
            )
          } : p
        )
      } : null)
      
      addLog(`Executing: ${task.title}`)
      setCurrentStep(task.title)
      
      // Simulate task execution with progress updates
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        
        setProject(prev => prev ? {
          ...prev,
          phases: prev.phases.map((p, pIdx) => 
            pIdx === phaseIndex ? {
              ...p,
              tasks: p.tasks.map((t, tIdx) => 
                tIdx === taskIndex ? { ...t, progress } : t
              )
            } : p
          ),
          overallProgress: calculateOverallProgress(phaseIndex, taskIndex, progress)
        } : null)
      }
      
      // Mark task as completed
      setProject(prev => prev ? {
        ...prev,
        phases: prev.phases.map((p, pIdx) => 
          pIdx === phaseIndex ? {
            ...p,
            tasks: p.tasks.map((t, tIdx) => 
              tIdx === taskIndex ? { ...t, status: 'completed', progress: 100 } : t
            )
          } : p
        )
      } : null)
      
      addLog(`✅ ${task.title} completed`)
    }
  }

  const calculateOverallProgress = (currentPhase: number, currentTask: number, taskProgress: number): number => {
    if (!project) return 0
    
    let totalProgress = 0
    let totalTasks = 0
    
    for (let pIdx = 0; pIdx < project.phases.length; pIdx++) {
      const phase = project.phases[pIdx]
      for (let tIdx = 0; tIdx < phase.tasks.length; tIdx++) {
        totalTasks++
        
        if (pIdx < currentPhase) {
          totalProgress += 100
        } else if (pIdx === currentPhase) {
          if (tIdx < currentTask) {
            totalProgress += 100
          } else if (tIdx === currentTask) {
            totalProgress += taskProgress
          }
        }
      }
    }
    
    return Math.round(totalProgress / totalTasks)
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const pauseAgent = () => {
    setIsRunning(false)
    addLog('Agent paused')
  }

  const resumeAgent = () => {
    setIsRunning(true)
    addLog('Agent resumed')
  }

  const stopAgent = () => {
    setIsRunning(false)
    setProject(prev => prev ? { ...prev, status: 'failed' } : null)
    addLog('Agent stopped')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-background rounded-2xl border shadow-2xl"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Agent Mode</h2>
              {project && (
                <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ×
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            {!project ? (
              <div className="p-8 space-y-6">
                <div className="text-center space-y-4">
                  <Rocket className="w-16 h-16 mx-auto text-primary" />
                  <h3 className="text-2xl font-bold">Start Agent Development</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Describe the production-ready application you want to build. 
                    The agent will plan, develop, test, and deploy it automatically.
                  </p>
                </div>
                
                <div className="max-w-2xl mx-auto space-y-4">
                  <textarea
                    placeholder="Describe the application you want to build (e.g., 'A task management app with real-time collaboration, user authentication, and mobile-responsive design')..."
                    className="w-full h-32 p-4 border rounded-lg resize-none"
                    id="agent-description"
                  />
                  <Button 
                    onClick={() => {
                      const description = (document.getElementById('agent-description') as HTMLTextAreaElement)?.value
                      if (description) {
                        generateProjectPlan(description)
                      }
                    }}
                    className="w-full"
                    size="lg"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Agent Development
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="w-5 h-5" />
                        60-120 Minutes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Complete development cycle from planning to deployment
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Layers className="w-5 h-5" />
                        5 Phases
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Planning, Setup, Development, Testing, Deployment
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="w-5 h-5" />
                        Production Ready
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Fully tested, documented, and deployable applications
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex h-full">
                {/* Main Content */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  {/* Project Overview */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">{project.name}</h3>
                    <p className="text-muted-foreground">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {project.requirements.map((req, idx) => (
                        <Badge key={idx} variant="outline">{req}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">{project.overallProgress}%</span>
                    </div>
                    <Progress value={project.overallProgress} className="h-2" />
                  </div>

                  {/* Current Step */}
                  {currentStep && (
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Current: {currentStep}</span>
                      </div>
                    </div>
                  )}

                  {/* Phases */}
                  <div className="space-y-4">
                    {project.phases.map((phase, idx) => (
                      <Card key={phase.id} className={`transition-all ${
                        idx === project.currentPhase ? 'border-primary' : ''
                      }`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              {phase.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                              {phase.status === 'pending' && <AlertCircle className="w-4 h-4 text-muted-foreground" />}
                              {phase.name}
                            </CardTitle>
                            <Badge variant="outline">{phase.estimatedTime}m</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">{phase.description}</p>
                          <div className="space-y-2">
                            {phase.tasks.map(task => (
                              <div key={task.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="w-2 h-2 rounded-full bg-muted" />
                                  <span className="text-sm">{task.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                  <span className="text-xs text-muted-foreground w-8">{task.progress}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Logs Panel */}
                <div className="w-80 border-l p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Agent Logs</h4>
                    <div className="flex gap-2">
                      {isRunning ? (
                        <Button size="sm" variant="outline" onClick={pauseAgent}>
                          <PauseCircle className="w-3 h-3" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={resumeAgent}>
                          <PlayCircle className="w-3 h-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={stopAgent}>
                        <Square className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="h-96 overflow-y-auto bg-muted/30 rounded-lg p-3 font-mono text-xs space-y-1">
                    {logs.map((log, idx) => (
                      <div key={idx} className="text-muted-foreground">
                        {log}
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {project && (
            <div className="flex items-center justify-between p-4 border-t bg-muted/30">
              <div className="text-sm text-muted-foreground">
                Estimated completion: {new Date(project.estimatedCompletion || 0).toLocaleTimeString()}
              </div>
              <div className="flex gap-2">
                {!isRunning && project.status !== 'completed' && (
                  <Button onClick={runAgent}>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                )}
                {project.status === 'completed' && (
                  <Button onClick={onClose}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    View Project
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
