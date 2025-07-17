'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setResults, setSimulationStatus, setError, selectStrategy, clearSelectedStrategy } from '@/store/optimizationSlice';
import { riskApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { OptimizationParametersCard } from './components/OptimizationParametersCard';
import { OptimizedPortfolioTab } from './components/OptimizedPortfolioTab';
import { EfficientFrontierTab } from './components/EfficientFrontierTab';
import { RawDataTab } from './components/RawDataTab';
import { Target, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function OptimizePortfolioPage() {
  const dispatch = useAppDispatch();
  const { results: simulationResults, isLoading, error, selectedStrategy } = useAppSelector((state) => state.optimization);
  const parameters = useAppSelector((state) => state.optimization.parameters);

  const runOptimization = async () => {
    dispatch(setSimulationStatus(true));
    const payload = {
      symbols: ['NFLX', 'AAPL', 'NVDA'],
      lookback_days: 730,
      risk_free_rate: 0.03,
      objective: 'MinRisk',
    };

    try {
      const response = await riskApi.optimizePortfolio(payload);
      const transformedResults = {
        scenarios: [{
          name: 'Optimized',
          expectedReturn: response.expectedReturn * 100,
          volatility: response.volatility * 100,
          sharpeRatio: response.sharpeRatio,
          allocation: Object.entries(response.weights).map(([name, value]) => ({
            name,
            value: Number(value) * 100,
            color: '', // Color will be assigned in the component
          })),
          maxDrawdown: 0,
          taxEfficiency: 0,
          esgAlignment: 0,
        }],
        efficientFrontier: response.efficientFrontier?.map((point: any) => ({
          risk: point.volatility * 100,
          return: point.return * 100,
          sharpe: point.sharpe,
          allocation: {
            stocks: 0,
            bonds: 0,
            international: 0,
            alternatives: 0,
          },
          taxEfficiency: 0,
          esgScore: 0,
        })) || [],
        projectedData: [],
        taxSavings: 0,
        rebalancingCost: 0,
        generatedAt: Date.now(),
      };
      dispatch(setResults(transformedResults));
    } catch (error) {
      console.error('Error during optimization:', error);
      dispatch(setError('Failed to generate optimization results. Please try again.'));
    } finally {
      dispatch(setSimulationStatus(false));
    }
  };

  useEffect(() => {
    runOptimization();
  }, [parameters]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Portfolio Optimizer
          </h1>
          <p className="text-muted-foreground mt-2">
            Enhance your portfolio allocation with advanced optimization strategies.
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          AI-Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <OptimizationParametersCard />
        </div>
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p>Loading optimization results...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center text-red-500">
                <p>{error}</p>
              </CardContent>
            </Card>
          ) : simulationResults ? (
            <Tabs defaultValue="optimized">
              <TabsList>
                <TabsTrigger value="optimized">Optimized Portfolio</TabsTrigger>
                <TabsTrigger value="frontier">Efficient Frontier</TabsTrigger>
                <TabsTrigger value="raw">Raw Data</TabsTrigger>
              </TabsList>
              <TabsContent value="optimized">
                <OptimizedPortfolioTab results={simulationResults} />
              </TabsContent>
              <TabsContent value="frontier">
                <EfficientFrontierTab results={simulationResults} />
              </TabsContent>
              <TabsContent value="raw">
                <RawDataTab results={simulationResults} />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p>Run optimization to see results.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
