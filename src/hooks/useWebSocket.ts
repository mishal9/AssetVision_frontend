import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketService } from '@/services/websocket';

// Create a single instance of WebSocketService
const webSocketService = WebSocketService.getInstance();

export interface UseWebSocketOptions<T = unknown> {
  /** The WebSocket server URL (optional if already set in the service) */
  url?: string;
  /** Map of event names to event handlers */
  events?: Record<string, (data: T) => void>;
  onMessage?: (data: unknown) => void;
  /** Whether to automatically connect on mount */
  autoConnect?: boolean;
  /** Callback when connection is established */
  onConnect?: () => void;
  /** Callback when connection is closed */
  onDisconnect?: (event?: CloseEvent) => void;
  /** Callback when an error occurs */
  onError?: (error: Event) => void;
}

/**
 * Custom hook for WebSocket connections
 * @param options - Configuration options for the WebSocket connection
 * @returns Object containing connection state and methods
 */
export function useWebSocket<T = unknown>({
  url,
  events = {},
  onMessage,
  autoConnect = true,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions<T> = {}) {
  const [isConnected, setIsConnected] = useState(webSocketService.isConnected);
  const [lastMessage, setLastMessage] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const eventHandlers = useRef(events);
  const isConnecting = useRef(false);
  
  // Update events ref when events change
  useEffect(() => {
    eventHandlers.current = events;
  }, [events]);
  
  // Handle connection state changes
  useEffect(() => {
    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
      if (connected) {
        onConnect?.();
      } else {
        onDisconnect?.();
      }
    };
    
    const unsubscribe = webSocketService.onConnectionChange(handleConnectionChange);
    return () => unsubscribe();
  }, [onConnect, onDisconnect]);
  
  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (isConnecting.current || isConnected) return;
    
    isConnecting.current = true;
    setError(null);
    
    try {
      if (url) {
        await webSocketService.connect(url);
      } else {
        await webSocketService.connect();
      }
      // Message handling is done through the service's event system
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(new Event('WebSocket connection error'));
      throw error;
    } finally {
      isConnecting.current = false;
    }
  }, [isConnected, onError, url, onMessage]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);
  
  // Send message through WebSocket
  const sendMessage = useCallback(async (event: string, data: Record<string, unknown> = {}) => {
    if (!isConnected && !isConnecting.current) {
      await connect();
    }
    return webSocketService.send(event, data);
  }, [connect, isConnected]);
  
  // Set up event listeners
  useEffect(() => {
    const cleanupFns: Array<() => void> = [];
    
    // Set up event handlers
    Object.entries(eventHandlers.current).forEach(([event, handler]) => {
      const unsubscribe = webSocketService.on(event, (data: unknown) => {
        try {
          // Type assertion from unknown to T
          const typedData = data as T;
          setLastMessage(typedData);
          handler(typedData);
        } catch (err) {
          console.error(`Error in event handler for "${event}":`, err);
        }
      });
      cleanupFns.push(unsubscribe);
    });
    
    // Auto-connect if enabled
    if (autoConnect && !isConnected && !isConnecting.current) {
      connect().catch(console.error);
    }
    
    // Clean up on unmount
    return () => {
      cleanupFns.forEach(cleanup => cleanup());
    };
  }, [autoConnect, connect, isConnected]);
  
  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
  };
}
