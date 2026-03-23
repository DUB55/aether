/**
 * React hook for CollaborationEngine
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  CollaborationEngine, 
  Collaborator, 
  CursorPosition, 
  SelectionRange,
  TextOperation,
  CollaborationMessage
} from '../lib/collaboration/engine';

export function useCollaboration() {
  const [engine] = useState(() => CollaborationEngine.getInstance());
  const [isInSession, setIsInSession] = useState(false);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [currentUser, setCurrentUser] = useState<Collaborator | null>(null);
  const [connectionCount, setConnectionCount] = useState(0);

  // Update state when session changes
  useEffect(() => {
    const updateState = () => {
      setIsInSession(engine.isInSession());
      setSessionUrl(engine.getSessionUrl());
      setCollaborators(engine.getCollaborators());
      setCurrentUser(engine.getCurrentUser());
      setConnectionCount(engine.getConnectionCount());
    };

    updateState();

    // Subscribe to messages
    const unsubscribe = engine.onMessage((message: CollaborationMessage) => {
      updateState();
    });

    return unsubscribe;
  }, [engine]);

  /**
   * Create new collaboration session
   */
  const createSession = useCallback(async (): Promise<string> => {
    const sessionId = await engine.createSession();
    setIsInSession(true);
    setSessionUrl(engine.getSessionUrl());
    setCurrentUser(engine.getCurrentUser());
    return sessionId;
  }, [engine]);

  /**
   * Join existing session
   */
  const joinSession = useCallback(async (sessionId: string): Promise<void> => {
    await engine.joinSession(sessionId);
    setIsInSession(true);
    setSessionUrl(engine.getSessionUrl());
    setCurrentUser(engine.getCurrentUser());
  }, [engine]);

  /**
   * Leave current session
   */
  const leaveSession = useCallback(() => {
    engine.leaveSession();
    setIsInSession(false);
    setSessionUrl(null);
    setCollaborators([]);
    setConnectionCount(0);
  }, [engine]);

  /**
   * Send file change
   */
  const sendFileChange = useCallback((path: string, operation: TextOperation) => {
    engine.sendFileChange(path, operation);
  }, [engine]);

  /**
   * Send cursor update
   */
  const sendCursorUpdate = useCallback((position: CursorPosition) => {
    engine.sendCursorUpdate(position);
  }, [engine]);

  /**
   * Send selection update
   */
  const sendSelectionUpdate = useCallback((selection: SelectionRange) => {
    engine.sendSelectionUpdate(selection);
  }, [engine]);

  /**
   * Subscribe to messages
   */
  const onMessage = useCallback((callback: (message: CollaborationMessage) => void) => {
    return engine.onMessage(callback);
  }, [engine]);

  return {
    isInSession,
    sessionUrl,
    collaborators,
    currentUser,
    connectionCount,
    createSession,
    joinSession,
    leaveSession,
    sendFileChange,
    sendCursorUpdate,
    sendSelectionUpdate,
    onMessage
  };
}
