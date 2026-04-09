"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Target,
  ListTodo,
  Rocket,
  Download
} from 'lucide-react'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  estimatedTime: number
}

interface Phase {
  id: string
  name: string
  description: string
  tasks: Task[]
  status: 'pending' | 'in_progress' | 'completed'
  estimatedTime: number
}

interface Blueprint {
  title: string
  description: string
  requirements: string[]
  technologies: string[]
  phases: Phase[]
  estimatedTotalTime: number
}

interface PlanModeProps {
  onPlanSelect?: (plan: Blueprint) => void
  className?: string
}

export function PlanMode({ onPlanSelect, className }: PlanModeProps) {
  const [projectDescription, setProjectDescription] = useState('')
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const generatePlan = async () => {
    if (!projectDescription.trim()) {
      toast.error('Please enter a project description')
      return
    }

    setIsGenerating(true)
    setProgress(0)

    try {
      // Simulate AI planning process (in production, this would use actual AI)
      await simulatePlanning()
      
      // Generate blueprint
      const generatedBlueprint = generateBlueprint(projectDescription)
      setBlueprint(generatedBlueprint)
      
      setProgress(100)
      toast.success('Plan generated successfully!')
    } catch (error) {
      console.error('Planning error:', error)
      toast.error('Failed to generate plan')
    } finally {
      setIsGenerating(false)
    }
  }

  const simulatePlanning = async () => {
    const steps = [
      'Analyzing requirements...',
      'Defining project scope...',
      'Selecting technology stack...',
      'Creating phase breakdown...',
      'Estimating timelines...',
      'Generating detailed tasks...'
    ]

    for (let i = 0; i < steps.length; i++) {
      setProgress(Math.round(((i + 1) / steps.length) * 100))
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const generateBlueprint = (description: string): Blueprint => {
    return {
      title: `Project: ${description.substring(0, 50)}...`,
      description,
      requirements: [
        'User authentication and authorization',
        'Responsive design for all devices',
        'Real-time data synchronization',
        'Optimized performance and SEO',
        'Accessibility compliance (WCAG 2.1)',
        'Security best practices'
      ],
      technologies: [
        'React 18',
        'TypeScript',
        'Tailwind CSS',
        'Vite',
        'Firebase (Auth, Firestore, Storage)',
        'React Router'
      ],
      phases: [
        {
          id: 'planning',
          name: 'Planning & Design',
          description: 'Requirements analysis, system design, and architecture planning',
          status: 'pending',
          estimatedTime: 15,
          tasks: [
            {
              id: 'req-analysis',
              title: 'Requirements Analysis',
              description: 'Analyze and document all project requirements',
              status: 'pending',
              estimatedTime: 5
            },
            {
              id: 'system-design',
              title: 'System Design',
              description: 'Create system architecture and data flow diagrams',
              status: 'pending',
              estimatedTime: 5
            },
            {
              id: 'ui-design',
              title: 'UI/UX Design',
              description: 'Design user interface and user experience',
              status: 'pending',
              estimatedTime: 5
            }
          ]
        },
        {
          id: 'development',
          name: 'Core Development',
          description: 'Implementation of main features and functionality',
          status: 'pending',
          estimatedTime: 45,
          tasks: [
            {
              id: 'setup',
              title: 'Project Setup',
              description: 'Initialize project structure and dependencies',
              status: 'pending',
              estimatedTime: 5
            },
            {
              id: 'auth',
              title: 'Authentication System',
              description: 'Implement user authentication and authorization',
              status: 'pending',
              estimatedTime: 10
            },
            {
              id: 'core-features',
              title: 'Core Features',
              description: 'Build main application features',
              status: 'pending',
              estimatedTime: 20
            },
            {
              id: 'ui-components',
              title: 'UI Components',
              description: 'Create reusable UI components',
              status: 'pending',
              estimatedTime: 10
            }
          ]
        },
        {
          id: 'testing',
          name: 'Testing & QA',
          description: 'Comprehensive testing and quality assurance',
          status: 'pending',
          estimatedTime: 20,
          tasks: [
            {
              id: 'unit-tests',
              title: 'Unit Testing',
              description: 'Write and execute unit tests',
              status: 'pending',
              estimatedTime: 8
            },
            {
              id: 'integration-tests',
              title: 'Integration Testing',
              description: 'Test component integrations',
              status: 'pending',
              estimatedTime: 7
            },
            {
              id: 'e2e-tests',
              title: 'End-to-End Testing',
              description: 'Perform end-to-end testing',
              status: 'pending',
              estimatedTime: 5
            }
          ]
        },
        {
          id: 'deployment',
          name: 'Deployment & Launch',
          description: 'Production deployment and launch preparation',
          status: 'pending',
          estimatedTime: 10,
          tasks: [
            {
              id: 'build-opt',
              title: 'Build Optimization',
              description: 'Optimize build for production',
              status: 'pending',
              estimatedTime: 3
            },
            {
              id: 'deploy',
              title: 'Deploy to Production',
              description: 'Deploy application to production environment',
              status: 'pending',
              estimatedTime: 5
            },
            {
              id: 'monitoring',
              title: 'Monitoring Setup',
              description: 'Set up monitoring and error tracking',
              status: 'pending',
              estimatedTime: 2
            }
          ]
        }
      ],
      estimatedTotalTime: 90 // 90 minutes total
    }
  }

  const exportPlan = () => {
    if (!blueprint) return

    const planText = generatePlanText(blueprint)
    const blob = new Blob([planText], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project-plan-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    toast.success('Plan exported successfully!')
  }

  const generatePlanText = (bp: Blueprint): string => {
    let text = `# ${bp.title}\n\n`
    text += `## Description\n${bp.description}\n\n`
    text += `## Requirements\n${bp.requirements.map(r => `- ${r}`).join('\n')}\n\n`
    text += `## Technology Stack\n${bp.technologies.map(t => `- ${t}`).join('\n')}\n\n`
    text += `## Development Phases\n\n`
    text += `**Estimated Total Time: ${bp.estimatedTotalTime} minutes**\n\n`
    
    bp.phases.forEach(phase => {
      text += `### ${phase.name}\n`
      text += `${phase.description}\n`
      text += `**Estimated Time: ${phase.estimatedTime} minutes**\n\n`
      text += `**Tasks:**\n`
      phase.tasks.forEach(task => {
        text += `- [ ] ${task.title} (${task.estimatedTime}m): ${task.description}\n`
      })
      text += '\n'
    })

    return text
  }

  const usePlan = () => {
    if (blueprint && onPlanSelect) {
      onPlanSelect(blueprint)
      toast.success('Plan selected for execution')
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Plan Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <textarea
            placeholder="Describe the project you want to plan (e.g., 'Build a task management app with real-time collaboration, user authentication, and mobile-responsive design')..."
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full h-24 p-3 border rounded-lg resize-none"
          />
          <Button 
            onClick={generatePlan} 
            disabled={!projectDescription.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Rocket className="w-4 h-4 mr-2 animate-pulse" />
                Generating Plan...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Generate Detailed Plan
              </>
            )}
          </Button>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Generating blueprint...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {blueprint && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Blueprint Ready
              </h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={exportPlan}>
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
                {onPlanSelect && (
                  <Button size="sm" onClick={usePlan}>
                    <Rocket className="w-3 h-3 mr-1" />
                    Execute Plan
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Estimated Time: {blueprint.estimatedTotalTime} minutes</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Layers className="w-4 h-4" />
                <span className="font-medium">{blueprint.phases.length} Phases</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <ListTodo className="w-4 h-4" />
                <span className="font-medium">{blueprint.phases.reduce((acc, p) => acc + p.tasks.length, 0)} Tasks</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4" />
                <span className="font-medium">{blueprint.technologies.length} Technologies</span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-medium">Phases</h5>
              {blueprint.phases.map(phase => (
                <div key={phase.id} className="p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{phase.name}</span>
                    <Badge variant="outline" className="text-xs">{phase.estimatedTime}m</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{phase.description}</p>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {phase.tasks.map(task => (
                      <Badge key={task.id} variant="secondary" className="text-xs">
                        {task.estimatedTime}m
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
