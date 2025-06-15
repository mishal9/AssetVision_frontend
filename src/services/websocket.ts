type EventHandler = (data: any) => void;

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private url: string;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connectionListeners: Array<(connected: boolean) => void> = [];

  private constructor() {
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001/ws/market-data/';
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(url?: string) {
    if (this.socket) {
      this.disconnect();
    }

    const connectUrl = url || this.url;
    this.url = connectUrl;

    try {
      this.socket = new WebSocket(connectUrl);

      this.socket.onopen = () => {
        console.log('Connected to WebSocket server at', connectUrl);
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        this.notifyConnectionChange(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const handlers = this.eventHandlers.get(message.type) || [];
          handlers.forEach(handler => handler(message.data));
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        this.notifyConnectionChange(false);
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyConnectionChange(false);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private notifyConnectionChange(connected: boolean) {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  onConnectionChange(listener: (connected: boolean) => void) {
    this.connectionListeners.push(listener);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect(this.url);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    // Clear all event handlers
    this.eventHandlers.clear();
    this.connectionListeners = [];
  }

  // Add event listener
  on(event: string, handler: EventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
    
    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  // Remove event listener
  off(event: string, handler: EventHandler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Send a message to the server
  send(event: string, data: any = {}) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        const message = JSON.stringify({ type: event, data });
        this.socket.send(message);
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('WebSocket is not connected');
      return false;
    }
  }
  
  // Alias for send for backward compatibility
  emit(event: string, data: any = {}) {
    return this.send(event, data);
  }
  
  // Get connection status
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const socketService = WebSocketService.getInstance();
