import { socketService } from './websocket';
import { getApiUrl } from '@/lib/utils';

type MarketData = {
  [symbol: string]: {
    symbol: string;
    price: number;
    change: number;
    change_percent: number;
    volume: number;
    high: number;
    low: number;
    open: number;
    previous_close: number;
    last_updated: string;
  };
};

type MarketDataCallback = (data: MarketData) => void;

export class MarketDataService {
  private static instance: MarketDataService;
  private callbacks: MarketDataCallback[] = [];
  private isConnected = false;
  private wsBaseUrl: string;
  private unsubscribeCallbacks: Array<() => void> = [];

  private constructor() {
    this.wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001/ws/market-data/';
    this.initialize();
  }

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  private initialize() {
    // Set up connection status listener
    const unsubscribe = socketService.onConnectionChange((connected) => {
      this.isConnected = connected;
      if (connected) {
        console.log('MarketDataService: WebSocket connected');
      } else {
        console.log('MarketDataService: WebSocket disconnected');
      }
    });
    this.unsubscribeCallbacks.push(unsubscribe);
    
    // Connect to WebSocket server
    socketService.connect(this.wsBaseUrl);
    
    // Set up message handlers
    this.unsubscribeCallbacks.push(
      socketService.on('connect', this.handleConnect.bind(this)),
      socketService.on('disconnect', this.handleDisconnect.bind(this)),
      socketService.on('MARKET_UPDATE', this.handleMarketUpdate.bind(this)),
      socketService.on('INITIAL_DATA', this.handleInitialData.bind(this))
    );
  }

  private handleConnect() {
    this.isConnected = true;
    console.log('MarketDataService: Connected to WebSocket server');
  }

  private handleDisconnect() {
    this.isConnected = false;
    console.log('MarketDataService: Disconnected from WebSocket server');
  }

  private handleMarketUpdate(data: { data: MarketData }) {
    this.notifyCallbacks(data.data);
  }

  private handleInitialData(data: { data: MarketData }) {
    this.notifyCallbacks(data.data);
  }

  private notifyCallbacks(data: MarketData) {
    this.callbacks.forEach(callback => callback(data));
  }

  subscribeToSymbols(symbols: string[]) {
    if (symbols.length > 0) {
      socketService.emit('subscribe', { symbols });
    }
  }

  unsubscribeFromSymbols(symbols: string[]) {
    if (symbols.length > 0) {
      socketService.emit('unsubscribe', { symbols });
    }
  }

  onMarketDataUpdate(callback: MarketDataCallback) {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  // Clean up when the service is no longer needed
  disconnect() {
    // Clean up all event listeners
    this.unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    this.unsubscribeCallbacks = [];
    
    // Clear callbacks
    this.callbacks = [];
    
    // Disconnect WebSocket
    socketService.disconnect();
  }
}

export const marketDataService = MarketDataService.getInstance();

// React hook for using market data
import { useEffect, useState } from 'react';

export const useMarketData = (symbols: string[] = []) => {
  const [marketData, setMarketData] = useState<MarketData>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Set up market data subscription
    const unsubscribe = marketDataService.onMarketDataUpdate((data) => {
      setMarketData(prev => ({
        ...prev,
        ...data
      }));
    });

    // Subscribe to symbols
    if (symbols.length > 0) {
      marketDataService.subscribeToSymbols(symbols);
    }

    // Initial connection status
    setIsConnected(marketDataService['isConnected']);

    // Cleanup
    return () => {
      unsubscribe();
      if (symbols.length > 0) {
        marketDataService.unsubscribeFromSymbols(symbols);
      }
    };
  }, [symbols]);

  return {
    marketData,
    isConnected,
    getSymbolData: (symbol: string) => marketData[symbol],
  };
};
