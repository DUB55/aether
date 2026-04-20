/**
 * Interactive Chat Manager
 * Enables AI to ask clarifying questions and engage in dialogue with users
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  type?: 'question' | 'answer' | 'information' | 'confirmation';
  questionId?: string;
  options?: string[];
  selectedOption?: string;
}

export interface ChatQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'text' | 'yes-no' | 'rating' | 'design-selection';
  options?: string[];
  required: boolean;
  context?: string;
  category: 'design' | 'functionality' | 'preferences' | 'technical' | 'business';
}

export interface ChatSession {
  id: string;
  projectId: string;
  messages: ChatMessage[];
  pendingQuestion: ChatQuestion | null;
  status: 'active' | 'completed' | 'paused';
  context: ChatContext;
}

export interface ChatContext {
  projectType?: string;
  designPreferences?: DesignPreferences;
  technicalRequirements?: TechnicalRequirements;
  businessGoals?: BusinessGoals;
  selectedDesign?: DesignSelection;
}

export interface DesignPreferences {
  style: 'minimal' | 'modern' | 'classic' | 'bold' | 'playful';
  colorScheme?: string[];
  layout: 'single-column' | 'multi-column' | 'grid' | 'sidebar';
  components: string[];
}

export interface TechnicalRequirements {
  framework?: string;
  backend?: string;
  database?: string;
  authentication?: boolean;
  realtime?: boolean;
  mobileResponsive?: boolean;
  features: string[];
}

export interface BusinessGoals {
  targetAudience?: string;
  monetization?: 'free' | 'paid' | 'freemium' | 'subscription';
  scale: 'small' | 'medium' | 'large' | 'enterprise';
  timeline?: string;
}

export interface DesignSelection {
  templateId: string;
  templateName: string;
  previewUrl: string;
  customizations?: Record<string, any>;
}

export class InteractiveChatManager {
  private sessions: Map<string, ChatSession> = new Map();
  private questionTemplates: Map<string, ChatQuestion[]> = new Map();

  constructor() {
    this.initializeQuestionTemplates();
  }

  /**
   * Initialize question templates
   */
  private initializeQuestionTemplates(): void {
    this.questionTemplates.set('project-startup', [
      {
        id: 'project-type',
        question: 'What type of application would you like to build?',
        type: 'multiple-choice',
        options: [
          'Web Application',
          'Mobile App',
          'E-commerce Store',
          'SaaS Platform',
          'Portfolio/Blog',
          'Dashboard/Admin Panel',
          'Social Media App',
          'Other'
        ],
        required: true,
        category: 'design'
      },
      {
        id: 'design-preference',
        question: 'What design style do you prefer?',
        type: 'design-selection',
        options: [
          'Minimal & Clean',
          'Modern & Bold',
          'Professional & Classic',
          'Playful & Creative',
          'Dark Theme',
          'Light Theme'
        ],
        required: true,
        category: 'design'
      },
      {
        id: 'functionality-scale',
        question: 'What is the scale of functionality you need?',
        type: 'multiple-choice',
        options: [
          'Simple (1-3 core features)',
          'Medium (4-7 features)',
          'Complex (8+ features with integrations)',
          'Enterprise (Advanced features, multi-user, etc.)'
        ],
        required: true,
        category: 'functionality'
      },
      {
        id: 'technical-stack',
        question: 'Do you have a preferred technical stack?',
        type: 'multiple-choice',
        options: [
          'React + Node.js',
          'Vue + Express',
          'Next.js Full-stack',
          'No preference (AI recommends)',
          'Custom stack'
        ],
        required: false,
        category: 'technical'
      },
      {
        id: 'backend-needs',
        question: 'Do you need backend services?',
        type: 'multiple-choice',
        options: [
          'Yes - Full backend with database',
          'Yes - Simple API integration',
          'No - Frontend only',
          'Not sure'
        ],
        required: false,
        category: 'technical'
      },
      {
        id: 'authentication',
        question: 'Do you need user authentication?',
        type: 'yes-no',
        required: false,
        category: 'technical'
      },
      {
        id: 'target-audience',
        question: 'Who is your target audience?',
        type: 'text',
        required: false,
        category: 'business'
      },
      {
        id: 'timeline',
        question: 'What is your timeline for completion?',
        type: 'multiple-choice',
        options: [
          'ASAP (1-2 weeks)',
          'Short-term (1 month)',
          'Medium-term (2-3 months)',
          'Long-term (3+ months)',
          'Flexible'
        ],
        required: false,
        category: 'business'
      }
    ]);

    this.questionTemplates.set('design-refinement', [
      {
        id: 'color-scheme',
        question: 'Which color scheme appeals to you most?',
        type: 'design-selection',
        options: [
          'Blue & White',
          'Black & White',
          'Green & Earth Tones',
          'Purple & Pink',
          'Orange & Yellow',
          'Custom colors'
        ],
        required: true,
        category: 'design'
      },
      {
        id: 'layout-preference',
        question: 'Which layout style do you prefer?',
        type: 'design-selection',
        options: [
          'Single Column (Simple)',
          'Multi-column (Content-rich)',
          'Grid Layout (Dashboard)',
          'Sidebar Navigation',
          'Tabbed Interface'
        ],
        required: true,
        category: 'design'
      },
      {
        id: 'component-style',
        question: 'What component style do you prefer?',
        type: 'multiple-choice',
        options: [
          'Flat & Minimal',
          'Rounded & Friendly',
          'Sharp & Professional',
          'Glassmorphism',
          'Neumorphism'
        ],
        required: false,
        category: 'design'
      }
    ]);
  }

  /**
   * Create a new chat session
   */
  createSession(projectId: string): ChatSession {
    const session: ChatSession = {
      id: `session-${Date.now()}`,
      projectId,
      messages: [],
      pendingQuestion: null,
      status: 'active',
      context: {}
    };

    this.sessions.set(session.id, session);
    console.log(`[InteractiveChat] Created session: ${session.id} for project: ${projectId}`);
    return session;
  }

  /**
   * Start interactive dialogue
   */
  async startDialogue(sessionId: string, template: string = 'project-startup'): Promise<ChatQuestion> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const questions = this.questionTemplates.get(template) || [];
    if (questions.length === 0) {
      throw new Error(`Template ${template} not found`);
    }

    const firstQuestion = questions[0];
    session.pendingQuestion = firstQuestion;
    session.status = 'active';

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: firstQuestion.question,
      timestamp: Date.now(),
      type: 'question',
      questionId: firstQuestion.id,
      options: firstQuestion.options
    };

    session.messages.push(message);
    this.sessions.set(sessionId, session);

    console.log(`[InteractiveChat] Started dialogue with question: ${firstQuestion.question}`);
    return firstQuestion;
  }

  /**
   * Handle user answer to a question
   */
  async handleAnswer(sessionId: string, questionId: string, answer: string): Promise<ChatQuestion | null> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (!session.pendingQuestion || session.pendingQuestion.id !== questionId) {
      throw new Error(`No pending question found or question ID mismatch`);
    }

    // Add user's answer
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: answer,
      timestamp: Date.now(),
      type: 'answer',
      questionId: questionId,
      selectedOption: answer
    };

    session.messages.push(userMessage);

    // Update context based on answer
    this.updateContext(session, questionId, answer);

    // Get next question
    const nextQuestion = this.getNextQuestion(session);
    
    if (nextQuestion) {
      session.pendingQuestion = nextQuestion;
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: nextQuestion.question,
        timestamp: Date.now(),
        type: 'question',
        questionId: nextQuestion.id,
        options: nextQuestion.options
      };

      session.messages.push(assistantMessage);
      this.sessions.set(sessionId, session);

      console.log(`[InteractiveChat] Next question: ${nextQuestion.question}`);
      return nextQuestion;
    } else {
      // Dialogue complete
      session.pendingQuestion = null;
      session.status = 'completed';
      
      const completionMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Great! I have all the information I need. Let me start building your application based on your preferences.',
        timestamp: Date.now(),
        type: 'information'
      };

      session.messages.push(completionMessage);
      this.sessions.set(sessionId, session);

      console.log(`[InteractiveChat] Dialogue completed for session: ${sessionId}`);
      return null;
    }
  }

  /**
   * Update context based on answer
   */
  private updateContext(session: ChatSession, questionId: string, answer: string): void {
    switch (questionId) {
      case 'project-type':
        session.context.projectType = answer;
        break;
      case 'design-preference':
        if (!session.context.designPreferences) {
          session.context.designPreferences = {} as DesignPreferences;
        }
        session.context.designPreferences.style = this.mapStylePreference(answer);
        break;
      case 'color-scheme':
        if (!session.context.designPreferences) {
          session.context.designPreferences = {} as DesignPreferences;
        }
        session.context.designPreferences.colorScheme = this.parseColorScheme(answer);
        break;
      case 'layout-preference':
        if (!session.context.designPreferences) {
          session.context.designPreferences = {} as DesignPreferences;
        }
        session.context.designPreferences.layout = this.mapLayout(answer);
        break;
      case 'technical-stack':
        if (!session.context.technicalRequirements) {
          session.context.technicalRequirements = {} as TechnicalRequirements;
        }
        session.context.technicalRequirements.framework = answer;
        break;
      case 'backend-needs':
        if (!session.context.technicalRequirements) {
          session.context.technicalRequirements = {} as TechnicalRequirements;
        }
        session.context.technicalRequirements.backend = answer;
        break;
      case 'authentication':
        if (!session.context.technicalRequirements) {
          session.context.technicalRequirements = {} as TechnicalRequirements;
        }
        session.context.technicalRequirements.authentication = answer === 'Yes';
        break;
      case 'target-audience':
        if (!session.context.businessGoals) {
          session.context.businessGoals = {} as BusinessGoals;
        }
        session.context.businessGoals.targetAudience = answer;
        break;
      case 'timeline':
        if (!session.context.businessGoals) {
          session.context.businessGoals = {} as BusinessGoals;
        }
        session.context.businessGoals.timeline = answer;
        break;
    }
  }

  /**
   * Map style preference to enum
   */
  private mapStylePreference(answer: string): DesignPreferences['style'] {
    const styleMap: Record<string, DesignPreferences['style']> = {
      'Minimal & Clean': 'minimal',
      'Modern & Bold': 'modern',
      'Professional & Classic': 'classic',
      'Playful & Creative': 'playful'
    };
    return styleMap[answer] || 'modern';
  }

  /**
   * Parse color scheme
   */
  private parseColorScheme(answer: string): string[] {
    const colorMap: Record<string, string[]> = {
      'Blue & White': ['#3B82F6', '#FFFFFF'],
      'Black & White': ['#000000', '#FFFFFF'],
      'Green & Earth Tones': ['#10B981', '#8B5A2B'],
      'Purple & Pink': ['#8B5CF6', '#EC4899'],
      'Orange & Yellow': ['#F97316', '#EAB308']
    };
    return colorMap[answer] || ['#3B82F6', '#FFFFFF'];
  }

  /**
   * Map layout preference
   */
  private mapLayout(answer: string): DesignPreferences['layout'] {
    const layoutMap: Record<string, DesignPreferences['layout']> = {
      'Single Column (Simple)': 'single-column',
      'Multi-column (Content-rich)': 'multi-column',
      'Grid Layout (Dashboard)': 'grid',
      'Sidebar Navigation': 'sidebar'
    };
    return layoutMap[answer] || 'single-column';
  }

  /**
   * Get next question in sequence
   */
  private getNextQuestion(session: ChatSession): ChatQuestion | null {
    const answeredQuestionIds = session.messages
      .filter(m => m.role === 'user' && m.questionId)
      .map(m => m.questionId);

    const allQuestions = this.questionTemplates.get('project-startup') || [];
    const nextQuestion = allQuestions.find(q => !answeredQuestionIds.includes(q.id));

    return nextQuestion || null;
  }

  /**
   * Skip a question
   */
  async skipQuestion(sessionId: string, questionId: string): Promise<ChatQuestion | null> {
    return this.handleAnswer(sessionId, questionId, 'Skipped');
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions
   */
  getSessions(): ChatSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get session context
   */
  getContext(sessionId: string): ChatContext | undefined {
    const session = this.sessions.get(sessionId);
    return session?.context;
  }

  /**
   * End session
   */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'completed';
      session.pendingQuestion = null;
      this.sessions.set(sessionId, session);
      console.log(`[InteractiveChat] Ended session: ${sessionId}`);
    }
  }

  /**
   * Generate design options for selection
   */
  generateDesignOptions(preference: DesignPreferences): DesignSelection[] {
    // In real implementation, this would generate actual design options
    return [
      {
        templateId: 'template-1',
        templateName: 'Modern Minimal',
        previewUrl: '/templates/modern-minimal.png',
        customizations: {
          style: preference.style,
          colorScheme: preference.colorScheme,
          layout: preference.layout
        }
      },
      {
        templateId: 'template-2',
        templateName: 'Classic Professional',
        previewUrl: '/templates/classic-professional.png',
        customizations: {
          style: preference.style,
          colorScheme: preference.colorScheme,
          layout: preference.layout
        }
      },
      {
        templateId: 'template-3',
        templateName: 'Bold Creative',
        previewUrl: '/templates/bold-creative.png',
        customizations: {
          style: preference.style,
          colorScheme: preference.colorScheme,
          layout: preference.layout
        }
      }
    ];
  }
}

// Global interactive chat manager instance
export const interactiveChatManager = new InteractiveChatManager();
