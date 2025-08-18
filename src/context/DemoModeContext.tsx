'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Demo Mode Context
 * Manages demo mode state, session isolation, and automatic cleanup
 */

export interface DemoUser {
  id: number;
  username: string;
  email: string;
  avatar?: string;
}

export interface DemoSession {
  id: string;
  startTime: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  user: DemoUser;
}

export interface DemoModeState {
  isDemo: boolean;
  session: DemoSession | null;
  loading: boolean;
  error: string | null;
}

type DemoModeAction = 
  | { type: 'START_DEMO'; payload: { sessionId: string; user: DemoUser } }
  | { type: 'END_DEMO' }
  | { type: 'UPDATE_ACTIVITY' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'EXTEND_SESSION' };

const initialState: DemoModeState = {
  isDemo: false,
  session: null,
  loading: false,
  error: null,
};

function demoModeReducer(state: DemoModeState, action: DemoModeAction): DemoModeState {
  switch (action.type) {
    case 'START_DEMO': {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (6 * 60 * 60 * 1000)); // 6 hours
      
      return {
        ...state,
        isDemo: true,
        session: {
          id: action.payload.sessionId,
          startTime: now,
          lastActivity: now,
          expiresAt,
          isActive: true,
          user: action.payload.user,
        },
        loading: false,
        error: null,
      };
    }
    
    case 'END_DEMO':
      return {
        ...state,
        isDemo: false,
        session: null,
        loading: false,
        error: null,
      };
    
    case 'UPDATE_ACTIVITY': {
      if (!state.session) return state;
      
      return {
        ...state,
        session: {
          ...state.session,
          lastActivity: new Date(),
        },
      };
    }
    
    case 'EXTEND_SESSION': {
      if (!state.session) return state;
      
      const now = new Date();
      const newExpiresAt = new Date(now.getTime() + (6 * 60 * 60 * 1000)); // Reset to 6 hours
      
      return {
        ...state,
        session: {
          ...state.session,
          lastActivity: now,
          expiresAt: newExpiresAt,
        },
      };
    }
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    default:
      return state;
  }
}

interface DemoModeContextType {
  state: DemoModeState;
  startDemo: () => Promise<void>;
  endDemo: () => void;
  updateActivity: () => void;
  extendSession: () => void;
  isSessionExpired: () => boolean;
  getTimeRemaining: () => number;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

/**
 * Demo Mode Provider Component
 * Provides demo mode functionality with automatic session management
 */
export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoModeReducer, initialState);
  const router = useRouter();

  // Generate a unique session ID
  const generateSessionId = (): string => {
    return `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Create demo user data
  const createDemoUser = (): DemoUser => {
    return {
      id: 999999,
      username: 'demo_user',
      email: 'demo@alphaoptimize.com',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=4f46e5&color=fff',
    };
  };

  // Start demo session
  const startDemo = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Generate session and user
      const sessionId = generateSessionId();
      const user = createDemoUser();
      
      // Store demo session in sessionStorage (isolated from real auth)
      const sessionData = {
        id: sessionId,
        startTime: new Date().toISOString(),
        user,
      };
      
      sessionStorage.setItem('demo_session', JSON.stringify(sessionData));
      sessionStorage.setItem('demo_mode', 'true');
      
      // Start demo session
      dispatch({ 
        type: 'START_DEMO', 
        payload: { sessionId, user } 
      });
      
      console.log('Demo session started:', sessionId);
    } catch (error) {
      console.error('Failed to start demo:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to start demo' 
      });
    }
  };

  // End demo session
  const endDemo = (): void => {
    console.log('Ending demo session...');
    
    // Clean up session storage completely
    sessionStorage.removeItem('demo_session');
    sessionStorage.removeItem('demo_mode');
    sessionStorage.removeItem('demo_portfolio_data');
    sessionStorage.removeItem('demo_plaid_data');
    sessionStorage.removeItem('demo_alerts_data');
    
    // Clear any demo-specific data
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('demo_')) {
        console.log('Removing demo key:', key);
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear all localStorage as well (in case anything was stored there)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('demo_')) {
        console.log('Removing demo localStorage key:', key);
        localStorage.removeItem(key);
      }
    });
    
    dispatch({ type: 'END_DEMO' });
    
    console.log('Demo session ended, redirecting to homepage...');
    
    // Force a complete page reload to clear all state
    // Add a special parameter to indicate we're exiting demo mode
    if (typeof window !== 'undefined') {
      window.location.replace('/?exit_demo=true');
    }
  };

  // Update activity timestamp
  const updateActivity = (): void => {
    if (state.session) {
      dispatch({ type: 'UPDATE_ACTIVITY' });
      
      // Update session storage
      const sessionData = JSON.parse(sessionStorage.getItem('demo_session') || '{}');
      sessionData.lastActivity = new Date().toISOString();
      sessionStorage.setItem('demo_session', JSON.stringify(sessionData));
    }
  };

  // Extend session
  const extendSession = (): void => {
    if (state.session) {
      dispatch({ type: 'EXTEND_SESSION' });
      console.log('Demo session extended');
    }
  };

  // Check if session is expired
  const isSessionExpired = (): boolean => {
    if (!state.session) return true;
    
    const now = new Date();
    const lastActivity = state.session.lastActivity;
    const expiresAt = state.session.expiresAt;
    
    // Check for idle timeout (30 minutes)
    const idleTimeout = 30 * 60 * 1000; // 30 minutes
    const isIdle = now.getTime() - lastActivity.getTime() > idleTimeout;
    
    // Check for hard expiry (6 hours)
    const isExpired = now > expiresAt;
    
    return isIdle || isExpired;
  };

  // Get time remaining in session
  const getTimeRemaining = (): number => {
    if (!state.session) return 0;
    
    const now = new Date();
    const expiresAt = state.session.expiresAt;
    const remaining = expiresAt.getTime() - now.getTime();
    
    return Math.max(0, remaining);
  };

  // Initialize demo mode from session storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedSession = sessionStorage.getItem('demo_session');
    const isDemoMode = sessionStorage.getItem('demo_mode') === 'true';
    
    if (isDemoMode && storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        dispatch({ 
          type: 'START_DEMO', 
          payload: { 
            sessionId: sessionData.id, 
            user: sessionData.user 
          } 
        });
      } catch (error) {
        console.error('Failed to restore demo session:', error);
        // Clean up corrupted session
        sessionStorage.removeItem('demo_session');
        sessionStorage.removeItem('demo_mode');
      }
    } else if (isDemoMode && !storedSession) {
      // Demo mode is set but no session data - create one
      const sessionData = {
        id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: new Date().toISOString(),
        user: {
          id: 999999,
          username: 'demo_user',
          email: 'demo@alphaoptimize.com',
          avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=4f46e5&color=fff',
        }
      };
      
      sessionStorage.setItem('demo_session', JSON.stringify(sessionData));
      
      dispatch({ 
        type: 'START_DEMO', 
        payload: { 
          sessionId: sessionData.id, 
          user: sessionData.user 
        } 
      });
    }
  }, []);

  // Auto-cleanup expired sessions
  useEffect(() => {
    if (!state.session) return;

    const checkExpiry = () => {
      if (isSessionExpired()) {
        console.log('Demo session expired, cleaning up');
        endDemo();
      }
    };

    // Check every minute
    const interval = setInterval(checkExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [state.session]);

  // Activity tracking - update activity on user interaction
  useEffect(() => {
    if (!state.session) return;

    const handleActivity = () => {
      updateActivity();
    };

    // Track various user activities
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [state.session]);

  const contextValue: DemoModeContextType = {
    state,
    startDemo,
    endDemo,
    updateActivity,
    extendSession,
    isSessionExpired,
    getTimeRemaining,
  };

  return (
    <DemoModeContext.Provider value={contextValue}>
      {children}
    </DemoModeContext.Provider>
  );
}

/**
 * Hook to use demo mode context
 */
export function useDemoMode(): DemoModeContextType {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}

/**
 * Hook to check if currently in demo mode
 */
export function useIsDemo(): boolean {
  const { state } = useDemoMode();
  return state.isDemo && state.session !== null;
}
