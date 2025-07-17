type EventHandler = (data: unknown) => void;

interface WebSocketMessage {
  type: string;
  data?: unknown;
  [key: string]: unknown;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private url: string;
  private accessToken: string | null = null;
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
    // Try to get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('auth_token');
    }
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Connect to the WebSocket server with an optional access token
   * @param url Optional WebSocket URL (defaults to the one set in constructor)
   * @param accessToken Optional access token for authentication
   */
  async connect(url?: string, accessToken?: string): Promise<void> {
    // Disable WebSockets by default. Set NEXT_PUBLIC_DISABLE_WS="false" to enable.
    if (process.env.NEXT_PUBLIC_DISABLE_WS !== 'false') {
      console.warn('[WebSocketService] WebSockets are currently disabled (set NEXT_PUBLIC_DISABLE_WS="false" to enable).');
      this.notifyConnectionChange(false);
      return Promise.resolve();
    }
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    
    // Update access token if provided
    if (accessToken) {
      this.accessToken = accessToken;
    } else if (typeof window !== 'undefined' && !this.accessToken) {
      // Try to get token from localStorage if not set
      this.accessToken = localStorage.getItem('auth_token');
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
    this.url = connectUrl; // Store the base URL
    
    // Create WebSocket with Authorization header if token is available
    const wsUrl = new URL(connectUrl);
    const headers: Record<string, string> = {};
    
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    
    // Convert headers to the format expected by the WebSocket constructor
    const wsProtocols = headers['Sec-WebSocket-Protocol'] ? [headers['Sec-WebSocket-Protocol']] : undefined;
    
    // Create WebSocket with custom headers using a proxy if needed
    // Note: This is a simplified example - in a real app, you might need to use a proxy
    // or a library that supports custom headers with WebSockets
    if (this.accessToken) {
      // Add token to the URL as a fallback if headers aren't supported
      const separator = connectUrl.includes('?') ? '&' : '?';
      wsUrl.search = `${wsUrl.search ? wsUrl.search + '&' : '?'}token=${encodeURIComponent(this.accessToken)}`;
    }

    return new Promise((resolve, reject) => {
      try {
        // Note: The WebSocket API doesn't support custom headers in the browser
        // This is a limitation of the WebSocket API. In a real app, you might need to:
        // 1. Use a library that supports custom headers with WebSockets
        // 2. Use a proxy server that adds the Authorization header
        // 3. Use a different authentication method (like cookies or URL parameters)
        this.socket = new WebSocket(wsUrl.toString());

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
  async send(event: string, data: Record<string, unknown> = {}): Promise<boolean> {
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
  emit(event: string, data: Record<string, unknown> = {}) {
    return this.send(event, data);
  }
  
  // Get connection status
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Set the access token for authentication
   * @param token The JWT access token
   */
  setAccessToken(token: string | null) {
    this.accessToken = token;
    // If we're already connected, we need to reconnect with the new token
    if (this.socket) {
      this.connect();
    }
  }
}

export const socketService = WebSocketService.getInstance();
