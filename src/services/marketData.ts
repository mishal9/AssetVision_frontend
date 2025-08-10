export type MarketData = {
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

  private constructor() {
    // WebSockets removed: no initialization needed
  }

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  subscribeToSymbols(_symbols: string[]) {
    // No-op without WebSockets
  }

  unsubscribeFromSymbols(_symbols: string[]) {
    // No-op without WebSockets
  }

  onMarketDataUpdate(callback: MarketDataCallback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    this.callbacks = [];
  }
}

export const marketDataService = MarketDataService.getInstance();

// React hook for using market data
import { useEffect, useState } from 'react';

export const useMarketData = (symbols: string[] = []) => {
  const [marketData, setMarketData] = useState<MarketData>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = marketDataService.onMarketDataUpdate((data) => {
      setMarketData(prev => ({
        ...prev,
        ...data,
      }));
    });

    if (symbols.length > 0) {
      marketDataService.subscribeToSymbols(symbols);
    }

    // Without WebSockets, the connection is always false
    setIsConnected(false);

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
