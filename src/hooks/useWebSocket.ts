import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketService } from '@/services/websocket';

// Create a single instance of WebSocketService
const webSocketService = WebSocketService.getInstance();

/**
 * Custom hook for WebSocket connections
 * @param url - The WebSocket server URL (optional if already set in the service)
 * @param events - Map of event names to event handlers
 * @param autoConnect - Whether to automatically connect on mount
 */
export function useWebSocket<T = any>(
  url?: string,
  events: Record<string, (data: T) => void> = {},
  autoConnect = true
) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const eventHandlers = useRef<Record<string, (data: T) => void>>(events);
  
  // Update events ref when events change
  useEffect(() => {
    eventHandlers.current = events;
  }, [events]);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    if (url) {
      webSocketService.connect(url);
    } else {
      webSocketService.connect();
    }
    setIsConnected(webSocketService.isConnected);
  }, [url]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setIsConnected(false);
  }, []);
  
  // Send message through WebSocket
  const sendMessage = useCallback((event: string, data: any = {}) => {
    return webSocketService.send(event, data);
  }, []);
  
  // Set up connection and event listeners
  useEffect(() => {
    // Set up event handlers
    const cleanupFns: Array<() => void> = [];
    
    Object.entries(eventHandlers.current).forEach(([event, handler]) => {
      const unsubscribe = webSocketService.on(event, (data: T) => {
        setLastMessage(data);
        handler(data);
      });
      cleanupFns.push(unsubscribe);
    });
    
    // Auto-connect if enabled
    if (autoConnect && !webSocketService.isConnected) {
      connect();
    }
    
    // Clean up on unmount
    return () => {
      cleanupFns.forEach(cleanup => cleanup());
      // Only disconnect if this was the only component using the WebSocket
      // In a real app, you might want to track connections more carefully
      if (Object.keys(eventHandlers.current).length > 0) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect]);
  
  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
  };
}
