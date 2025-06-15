type EventHandler = (data: any) => void;

interface WebSocketMessage {
  type: string;
  data?: any;
  [key: string]: any;
}

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
  private messageQueue: WebSocketMessage[] = [];
  private connectionPromise: Promise<void> | null = null;
  private resolveConnection: (() => void) | null = null;
  private rejectConnection: ((error: Error) => void) | null = null;

  private constructor() {
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001/ws/market-data/';
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  async connect(url?: string): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    
    this.connectionPromise = new Promise((resolve, reject) => {
      this.resolveConnection = resolve;
      this.rejectConnection = reject;
    });
    
    try {
      await this._connect(url);
      return this.connectionPromise;
    } catch (error) {
      this.rejectConnection?.(error instanceof Error ? error : new Error(String(error)));
      this.connectionPromise = null;
      this.rejectConnection = null;
      this.resolveConnection = null;
      throw error;
    }
  }
  
  private async _connect(url?: string): Promise<void> {
    if (this.socket) {
      this.disconnect();
    }

    const connectUrl = url || this.url;
    this.url = connectUrl;

    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(connectUrl);

        const onOpen = () => {
          console.log('Connected to WebSocket server at', connectUrl);
          this.reconnectAttempts = 0;
          this.notifyConnectionChange(true);
          resolve();
        };

        const onError = (error: Event) => {
          console.error('WebSocket error:', error);
          this.notifyConnectionChange(false);
          if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
            reject(new Error('WebSocket connection failed'));
          }
        };

        const onClose = (event: CloseEvent) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.notifyConnectionChange(false);
          this.attemptReconnect();
          if (event.code >= 4000) {
            reject(new Error(`WebSocket error: ${event.reason || 'Connection closed with error'}`));
          }
        };

        this.socket.onopen = onOpen;
        this.socket.onerror = onError;
        this.socket.onclose = onClose;

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const handlers = this.eventHandlers.get(message.type) || [];
            handlers.forEach(handler => handler(message.data));
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reject(error);
        this.attemptReconnect();
      }
    });
  }

  private notifyConnectionChange(connected: boolean) {
    if (connected) {
      this.flushMessageQueue();
      this.resolveConnection?.();
      this.connectionPromise = null;
      this.rejectConnection = null;
      this.resolveConnection = null;
    }
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

  private flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()!;
      this.sendInternal(message);
    }
  }
  
  private sendInternal(message: WebSocketMessage): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    try {
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  // Send a message to the server
  async send(event: string, data: any = {}): Promise<boolean> {
    const message = { type: event, data };
    
    if (this.socket?.readyState === WebSocket.OPEN) {
      return this.sendInternal(message);
    } else if (this.socket?.readyState === WebSocket.CONNECTING) {
      // Queue the message if we're still connecting
      this.messageQueue.push(message);
      return true;
    } else {
      // If not connected, try to reconnect and queue the message
      this.messageQueue.push(message);
      if (!this.connectionPromise) {
        try {
          await this.connect();
          return true;
        } catch (error) {
          console.error('Failed to reconnect:', error);
          return false;
        }
      }
      return true;
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
