import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { marketDataService, MarketData } from '@/services/marketData';

interface MarketDataContextType {
  marketData: MarketData;
  isConnected: boolean;
  subscribeToSymbols: (symbols: string[]) => void;
  unsubscribeFromSymbols: (symbols: string[]) => void;
  getSymbolData: (symbol: string) => MarketData[string] | undefined;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

interface MarketDataProviderProps {
  children: ReactNode;
  initialSymbols?: string[];
}

export const MarketDataProvider: React.FC<MarketDataProviderProps> = ({
  children,
  initialSymbols = [],
}) => {
  const [marketData, setMarketData] = React.useState<MarketData>({});
  const [isConnected, setIsConnected] = React.useState(false);
  const [subscribedSymbols, setSubscribedSymbols] = React.useState<Set<string>>(
    new Set(initialSymbols)
  );

  // Subscribe to market data updates
  useEffect(() => {
    const unsubscribe = marketDataService.onMarketDataUpdate((data) => {
      setMarketData((prev) => ({
        ...prev,
        ...data,
      }));
    });

    // Initial connection status
    setIsConnected(marketDataService['isConnected']);

    // Subscribe to initial symbols
    if (initialSymbols.length > 0) {
      marketDataService.subscribeToSymbols(initialSymbols);
    }

    // Cleanup
    return () => {
      unsubscribe();
      marketDataService.disconnect();
    };
  }, []);

  // Handle symbol subscriptions
  const subscribeToSymbols = (symbols: string[]) => {
    const newSymbols = symbols.filter((symbol) => !subscribedSymbols.has(symbol));
    
    if (newSymbols.length > 0) {
      setSubscribedSymbols((prev) => {
        const newSet = new Set(prev);
        newSymbols.forEach(symbol => newSet.add(symbol));
        return newSet;
      });
      
      marketDataService.subscribeToSymbols(newSymbols);
    }
  };

  const unsubscribeFromSymbols = (symbols: string[]) => {
    setSubscribedSymbols((prev) => {
      const newSet = new Set(prev);
      symbols.forEach(symbol => newSet.delete(symbol));
      return newSet;
    });
    
    marketDataService.unsubscribeFromSymbols(symbols);
  };

  const getSymbolData = (symbol: string) => marketData[symbol];

  const value = useMemo(
    () => ({
      marketData,
      isConnected,
      subscribeToSymbols,
      unsubscribeFromSymbols,
      getSymbolData,
    }),
    [marketData, isConnected, subscribedSymbols]
  );

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
};

export const useMarketData = (): MarketDataContextType => {
  const context = useContext(MarketDataContext);
  if (context === undefined) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};

// Helper hook to get data for specific symbols
export const useSymbolData = (symbols: string[]) => {
  const { marketData, subscribeToSymbols, unsubscribeFromSymbols } = useMarketData();

  useEffect(() => {
    if (symbols.length > 0) {
      subscribeToSymbols(symbols);
      return () => {
        unsubscribeFromSymbols(symbols);
      };
    }
  }, [symbols, subscribeToSymbols, unsubscribeFromSymbols]);

  return symbols.map(symbol => marketData[symbol]);
};
