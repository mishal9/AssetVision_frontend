import { useEffect, useRef, useState, useCallback } from 'react';
import { socketService } from '@/services/websocket';

/**
 * Custom hook for WebSocket connections
 * @param url - The WebSocket server URL
 * @param events - Map of event names to event handlers
 * @param autoConnect - Whether to automatically connect on mount
 */
export function useWebSocket<T = any>(
  url: string,
  events: Record<string, (data: T) => void> = {},
  autoConnect = true
) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const eventsRef = useRef(events);
  
  // Update events ref when events change
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    socketService.connect(url);
    setIsConnected(true);
  }, [url]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
  }, []);
  
  // Send message through WebSocket
  const sendMessage = useCallback((event: string, data: any) => {
    socketService.emit(event, data);
  }, []);
  
  // Set up connection and event listeners
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    // Set up message handler for each event
    const eventNames = Object.keys(eventsRef.current);
    eventNames.forEach(eventName => {
      socketService.on(eventName, (data: T) => {
        setLastMessage(data);
        if (eventsRef.current[eventName]) {
          eventsRef.current[eventName](data);
        }
      });
    });
    
    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect, url]);
  
  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  };
}
