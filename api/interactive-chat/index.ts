import { interactiveChatManager, ChatQuestion, DesignSelection } from '../../src/lib/interactive-chat/interactive-chat-manager';

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, query } = req;
    const sessionId = query.sessionId;

    switch (method) {
      case 'POST':
        const { action, projectId, template, questionId, answer } = req.body;

        if (action === 'create-session') {
          // Create a new chat session
          const session = interactiveChatManager.createSession(projectId || 'temp');
          return res.status(201).json({ sessionId: session.id, session });
        }

        if (action === 'start-dialogue') {
          // Start interactive dialogue
          if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
          }

          const firstQuestion = await interactiveChatManager.startDialogue(sessionId, template || 'project-startup');
          return res.status(200).json({ question: firstQuestion });
        }

        if (action === 'handle-answer') {
          // Handle user answer to a question
          if (!sessionId || !questionId || !answer) {
            return res.status(400).json({ error: 'Session ID, question ID, and answer required' });
          }

          const nextQuestion = await interactiveChatManager.handleAnswer(sessionId, questionId, answer);
          return res.status(200).json({ nextQuestion });
        }

        if (action === 'skip-question') {
          // Skip a question
          if (!sessionId || !questionId) {
            return res.status(400).json({ error: 'Session ID and question ID required' });
          }

          const nextQuestion = await interactiveChatManager.skipQuestion(sessionId, questionId);
          return res.status(200).json({ nextQuestion });
        }

        if (action === 'generate-design-options') {
          // Generate design options based on chat context
          if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
          }

          const session = interactiveChatManager.getSession(sessionId);
          if (!session) {
            return res.status(404).json({ error: 'Session not found' });
          }

          const designOptions = interactiveChatManager.generateDesignOptions(
            session.context.designPreferences || {
              style: 'modern',
              layout: 'single-column',
              components: []
            }
          );
          return res.status(200).json({ designOptions });
        }

        return res.status(400).json({ error: 'Invalid action' });

      case 'GET':
        if (sessionId) {
          // Get specific session
          const session = interactiveChatManager.getSession(sessionId);
          if (!session) {
            return res.status(404).json({ error: 'Session not found' });
          }
          return res.status(200).json(session);
        } else if (query.action === 'context') {
          // Get session context
          if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
          }
          const context = interactiveChatManager.getContext(sessionId);
          return res.status(200).json({ context });
        } else {
          // Get all sessions
          const sessions = interactiveChatManager.getSessions();
          return res.status(200).json(sessions);
        }

      case 'DELETE':
        // End session
        if (!sessionId) {
          return res.status(400).json({ error: 'Session ID required' });
        }
        
        interactiveChatManager.endSession(sessionId);
        return res.status(200).json({ message: 'Session ended successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[Interactive Chat API] Error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
}
