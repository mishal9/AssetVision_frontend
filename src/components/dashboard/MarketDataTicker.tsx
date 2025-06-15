import React from 'react';
import { useMarketData } from '@/context/MarketDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MarketDataTickerProps {
  symbols: string[];
  className?: string;
}

export const MarketDataTicker: React.FC<MarketDataTickerProps> = ({
  symbols,
  className = '',
}) => {
  const { marketData, isConnected } = useMarketData();
  
  // Filter out any undefined symbols
  const validSymbols = symbols.filter(symbol => symbol);
  
  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Market Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {validSymbols.map((symbol) => (
              <div key={symbol} className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Market Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {validSymbols.map((symbol) => {
            const data = marketData[symbol];
            const isPositive = data?.change_percent >= 0;
            
            return (
              <div key={symbol} className="flex justify-between items-center">
                <span className="font-medium">{symbol}</span>
                {data ? (
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">
                      ${data.price.toFixed(2)}
                    </span>
                    <span 
                      className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {isPositive ? '↑' : '↓'} {Math.abs(data.change_percent).toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Loading...</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketDataTicker;
