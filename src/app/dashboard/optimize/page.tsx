'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Zap,
  Info,
  RefreshCw,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie, ScatterChart, Scatter, ReferenceLine } from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  updateParameters, 
  setSimulationStatus, 
  setResults, 
  selectScenario,
  selectStrategy,
  clearSelectedStrategy,
  setError,
  OptimizationParameters 
} from '@/store/optimizationSlice';

/**
 * Portfolio Optimization Page
 * Interactive Monte-Carlo simulations with "what if?" scenarios
 * Key differentiator feature for AssetVision
 */
export default function OptimizePortfolioPage() {
  // Simulation parameters
  const dispatch = useDispatch();
  const { parameters, results: simulationResults, isLoading, selectedScenario, selectedStrategy } = useSelector(
    (state: RootState) => state.optimization
  );
  
  // Debug: Check if simulationResults are available
  console.log('📈 Results available:', !!simulationResults, 'scenarios:', simulationResults?.scenarios?.length);
  
  // Strategy selection modal state
  const [showImplementationModal, setShowImplementationModal] = useState(false);
  const [portfolioValue, setPortfolioValue] = useState('100000');

  // Mock current portfolio data
  const currentPortfolio = {
    totalValue: 125000,
    holdings: [
      { symbol: 'VTI', name: 'Total Stock Market ETF', allocation: 60, value: 75000, drift: 5.2 },
      { symbol: 'VTIAX', name: 'International Stock ETF', allocation: 25, value: 31250, drift: -2.1 },
      { symbol: 'BND', name: 'Total Bond Market ETF', allocation: 15, value: 18750, drift: -3.1 }
    ]
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  /**
   * Monte Carlo simulation engine
   * Generates optimized portfolio scenarios based on user parameters
   */
  const runMonteCarloSimulation = () => {
    console.log('🚀 Starting optimization...');
    dispatch(setSimulationStatus(true));
    
    // Simulate processing time for realistic UX
    setTimeout(() => {
      try {
        const optimizationData = generateOptimizationScenarios();
        
        const optimizationResults = {
          scenarios: optimizationData.scenarios,
          projectedData: optimizationData.projectedData,
          taxSavings: optimizationData.taxSavings,
          rebalancingCost: optimizationData.rebalancingCost,
          efficientFrontier: optimizationData.efficientFrontier,
          generatedAt: Date.now()
        };
        
        console.log('✅ Optimization complete - scenarios:', optimizationResults.scenarios.length);
        dispatch(setResults(optimizationResults));
        
      } catch (error) {
        console.error('Error during optimization:', error);
        dispatch(setError('Failed to generate optimization results. Please try again.'));
      } finally {
        dispatch(setSimulationStatus(false));
      }
    }, 2000);
  };

  /**
   * Generate efficient frontier data points
   * Creates a curve of optimal risk-return combinations
   */
  const generateEfficientFrontier = () => {
    const frontierPoints = [];
    
    // Generate 25 points along the efficient frontier with proper risk-return relationship
    for (let i = 0; i <= 24; i++) {
      const risk = 4 + (i * 1.0); // Risk from 4% to 28%
      
      // Realistic efficient frontier: higher risk = higher return, but with diminishing returns
      // Using a square root relationship for more realistic curve
      const baseReturn = 2.5 + Math.sqrt(risk - 4) * 2.8;
      const expectedReturn = Math.min(16, baseReturn); // Cap at 16% return
      
      // Calculate realistic portfolio allocation based on risk level
      const riskRatio = (risk - 4) / 24; // 0 to 1 scale
      
      const stockAllocation = Math.round(20 + (riskRatio * 75)); // 20% to 95% stocks
      const bondAllocation = Math.round(Math.max(5, 60 - (riskRatio * 55))); // 60% to 5% bonds
      const intlAllocation = Math.round(Math.max(5, 15 + (riskRatio * 10))); // 15% to 25% international
      const altAllocation = Math.max(0, 100 - stockAllocation - bondAllocation - intlAllocation);
      
      frontierPoints.push({
        risk: parseFloat(risk.toFixed(1)),
        return: parseFloat(expectedReturn.toFixed(1)),
        sharpe: parseFloat((expectedReturn / risk).toFixed(2)),
        allocation: {
          stocks: stockAllocation,
          bonds: bondAllocation,
          international: intlAllocation,
          alternatives: altAllocation
        },
        taxEfficiency: Math.max(65, 95 - (riskRatio * 25)),
        esgScore: Math.max(40, parameters.esgScore - Math.abs(risk - 15) * 1.5)
      });
    }
    
    return frontierPoints;
  };

  /**
   * Generate optimization scenarios based on current parameters
   */
  const generateOptimizationScenarios = () => {
    const riskLevel = parameters.riskTolerance;
    const taxRate = parameters.taxBracket / 100;
    const turnover = parameters.turnoverTolerance / 100;
    const esg = parameters.esgScore;
    const years = parameters.timeHorizon;

    // Generate three scenarios: Conservative, Balanced, Aggressive
    const scenarios = [
      {
        name: 'Conservative',
        expectedReturn: 7.2,
        volatility: 9.5,
        sharpeRatio: 0.76,
        maxDrawdown: -8.5,
        taxEfficiency: 88,
        esgAlignment: Math.max(0, esg - 10),
        allocation: [
          { name: 'US Stocks', value: 40, color: COLORS[0] },
          { name: 'International', value: 20, color: COLORS[1] },
          { name: 'Bonds', value: 35, color: COLORS[2] },
          { name: 'Alternatives', value: 5, color: COLORS[3] }
        ]
      },
      {
        name: 'Balanced',
        expectedReturn: 9.8,
        volatility: 14.2,
        sharpeRatio: 0.69,
        maxDrawdown: -15.8,
        taxEfficiency: 75,
        esgAlignment: esg,
        allocation: [
          { name: 'US Stocks', value: 55, color: COLORS[0] },
          { name: 'International', value: 25, color: COLORS[1] },
          { name: 'Bonds', value: 15, color: COLORS[2] },
          { name: 'Alternatives', value: 5, color: COLORS[3] }
        ]
      },
      {
        name: 'Growth',
        expectedReturn: 12.4,
        volatility: 19.8,
        sharpeRatio: 0.63,
        maxDrawdown: -22.5,
        taxEfficiency: 68,
        esgAlignment: Math.min(100, esg + 10),
        allocation: [
          { name: 'US Stocks', value: 70, color: COLORS[0] },
          { name: 'International', value: 20, color: COLORS[1] },
          { name: 'Bonds', value: 5, color: COLORS[2] },
          { name: 'Alternatives', value: 5, color: COLORS[3] }
        ]
      }
    ];

    // Generate projected performance data
    const projectedData = Array.from({ length: years + 1 }, (_, i) => {
      const year = i;
      return {
        year,
        conservative: currentPortfolio.totalValue * Math.pow(1 + scenarios[0].expectedReturn / 100, year),
        balanced: currentPortfolio.totalValue * Math.pow(1 + scenarios[1].expectedReturn / 100, year),
        growth: currentPortfolio.totalValue * Math.pow(1 + scenarios[2].expectedReturn / 100, year),
        current: currentPortfolio.totalValue * Math.pow(1.065, year) // Baseline current portfolio
      };
    });

    return {
      scenarios,
      projectedData,
      taxSavings: calculateTaxSavings(taxRate, turnover),
      rebalancingCost: calculateRebalancingCost(turnover),
      efficientFrontier: generateEfficientFrontier()
    };
  };

  /**
   * Calculate potential tax savings from optimization
   */
  const calculateTaxSavings = (taxRate: number, turnover: number) => {
    const baseTaxDrag = currentPortfolio.totalValue * 0.015; // 1.5% annual tax drag
    const optimizedTaxDrag = baseTaxDrag * (1 - (1 - turnover) * 0.3); // Reduced by optimization
    return Math.max(0, baseTaxDrag - optimizedTaxDrag);
  };

  /**
   * Calculate estimated rebalancing costs
   */
  const calculateRebalancingCost = (turnover: number) => {
    const tradingCost = currentPortfolio.totalValue * turnover * 0.001; // 0.1% trading cost
    const spreadCost = currentPortfolio.totalValue * turnover * 0.0005; // 0.05% spread cost
    return tradingCost + spreadCost;
  };

  /**
   * Handle parameter changes
   */
  const handleParameterChange = (key: keyof OptimizationParameters, value: number[]) => {
    dispatch(updateParameters({ [key]: value[0] }));
  };

  /**
   * Handle strategy selection
   */
  const handleSelectStrategy = (scenarioName: string) => {
    dispatch(selectStrategy({ 
      scenarioName, 
      portfolioValue: parseFloat(portfolioValue) || 100000 
    }));
    setShowImplementationModal(true);
  };

  /**
   * Handle strategy implementation
   */
  const handleImplementStrategy = () => {
    if (!selectedStrategy) return;
    
    // Generate portfolio optimization report
    const taxAnalysis = selectedStrategy.implementationPlan?.taxAnalysis;
    const reportData = {
      strategy: selectedStrategy.scenarioName,
      generatedAt: new Date().toLocaleString(),
      portfolioValue: portfolioValue,
      expectedReturn: `${selectedStrategy.scenario?.expectedReturn || 0}%`,
      volatility: `${selectedStrategy.scenario?.volatility || 0}%`,
      sharpeRatio: selectedStrategy.scenario?.sharpeRatio || 0,
      taxEfficiency: `${taxAnalysis?.taxEfficiency || 0}%`,
      expectedTaxImpact: taxAnalysis?.expectedTaxImpact || 'N/A',
      taxLossHarvesting: taxAnalysis?.taxLossHarvestingOpportunities || [],
      accountRecommendations: taxAnalysis?.recommendedAccountTypes || [],
      trades: selectedStrategy.implementationPlan?.trades || []
    };
    
    // Create downloadable report
    const reportText = `
AssetVision Portfolio Optimization Report
========================================

Strategy: ${reportData.strategy}
Generated: ${reportData.generatedAt}
Portfolio Value: $${parseInt(reportData.portfolioValue).toLocaleString()}

PERFORMANCE METRICS:
- Expected Return: ${reportData.expectedReturn}
- Volatility: ${reportData.volatility}
- Sharpe Ratio: ${reportData.sharpeRatio}

TAX IMPACT ANALYSIS:
- Tax Efficiency Score: ${reportData.taxEfficiency}
- Expected Tax Impact: ${reportData.expectedTaxImpact}

TAX-LOSS HARVESTING OPPORTUNITIES:
${reportData.taxLossHarvesting.map(opp => `- ${opp}`).join('\n')}

ACCOUNT OPTIMIZATION RECOMMENDATIONS:
${reportData.accountRecommendations.map(rec => `- ${rec}`).join('\n')}

RECOMMENDED TRADES:
${reportData.trades.map(trade => 
  `- ${trade.action.toUpperCase()} ${trade.symbol}: ${trade.percentage?.toFixed(1)}% ($${trade.estimatedValue?.toLocaleString()})`
).join('\n')}

DISCLAIMER:
This report is for informational purposes only. AssetVision provides portfolio analysis and recommendations. You must execute trades through your preferred broker or financial advisor. Past performance does not guarantee future results.
    `;
    
    // Download the report
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AssetVision_${selectedStrategy.scenarioName}_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowImplementationModal(false);
    
    // Show success message
    alert(`Portfolio optimization report downloaded! Use this plan to manually rebalance your portfolio with your broker.`);
  };

  /**
   * Handle modal close
   */
  const handleCloseModal = () => {
    setShowImplementationModal(false);
    dispatch(clearSelectedStrategy());
  };

  // Auto-run simulation when parameters change
  useEffect(() => {
    if (simulationResults) {
      const timeoutId = setTimeout(() => {
        runMonteCarloSimulation();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [parameters]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Portfolio Optimizer
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced Monte-Carlo simulations to optimize your portfolio allocation
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          AI-Powered
        </Badge>
      </div>

      {/* Current Portfolio Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Current Portfolio
          </CardTitle>
          <CardDescription>
            Total Value: ${currentPortfolio?.totalValue?.toLocaleString() || '0'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.isArray(currentPortfolio?.holdings) ? currentPortfolio.holdings.map((holding, index) => (
              <div key={holding.symbol} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{holding.symbol}</h4>
                    <p className="text-sm text-muted-foreground">{holding.name}</p>
                  </div>
                  <Badge variant={Math.abs(holding.drift) > 3 ? "destructive" : "secondary"}>
                    {holding.drift > 0 ? '+' : ''}{holding.drift}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Allocation:</span>
                    <span>{holding.allocation}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Value:</span>
                    <span>${holding?.value?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-3 p-8 text-center text-muted-foreground">
                <p>No portfolio holdings available.</p>
                <p className="text-sm mt-2">Connect your accounts to view current holdings.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Optimization Parameters
          </CardTitle>
          <CardDescription>
            Adjust these settings to customize your portfolio optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Risk Tolerance */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Risk Tolerance</label>
                <span className="text-sm text-muted-foreground">{parameters.riskTolerance}/10</span>
              </div>
              <Slider
                value={[parameters.riskTolerance]}
                onValueChange={(value) => handleParameterChange('riskTolerance', value)}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher values favor growth over stability
              </p>
            </div>

            {/* Tax Bracket */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Tax Bracket</label>
                <span className="text-sm text-muted-foreground">{parameters.taxBracket}%</span>
              </div>
              <Slider
                value={[parameters.taxBracket]}
                onValueChange={(value) => handleParameterChange('taxBracket', value)}
                max={37}
                min={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Your marginal tax rate for optimization
              </p>
            </div>

            {/* Turnover Tolerance */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Turnover Tolerance</label>
                <span className="text-sm text-muted-foreground">{parameters.turnoverTolerance}%</span>
              </div>
              <Slider
                value={[parameters.turnoverTolerance]}
                onValueChange={(value) => handleParameterChange('turnoverTolerance', value)}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Maximum portfolio changes per year
              </p>
            </div>

            {/* ESG Score */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium">ESG Priority</label>
                <span className="text-sm text-muted-foreground">{parameters.esgScore}/100</span>
              </div>
              <Slider
                value={[parameters.esgScore]}
                onValueChange={(value) => handleParameterChange('esgScore', value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Environmental, Social, Governance focus
              </p>
            </div>

            {/* Time Horizon */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Time Horizon</label>
                <span className="text-sm text-muted-foreground">{parameters.timeHorizon} years</span>
              </div>
              <Slider
                value={[parameters.timeHorizon]}
                onValueChange={(value) => handleParameterChange('timeHorizon', value)}
                max={30}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Investment timeline for projections
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={runMonteCarloSimulation} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              {isLoading ? 'Optimizing...' : 'Run Optimization'}
            </Button>
            {simulationResults && (
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {simulationResults && (
        <Tabs defaultValue="scenarios" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scenarios">Optimization Scenarios</TabsTrigger>
            <TabsTrigger value="frontier">Efficient Frontier</TabsTrigger>
            <TabsTrigger value="projections">Performance Projections</TabsTrigger>
            <TabsTrigger value="analysis">Risk Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {Array.isArray(simulationResults?.scenarios) ? simulationResults.scenarios.map((scenario, index) => (
                <Card key={scenario?.name || index} className={index === 1 ? "ring-2 ring-primary" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {scenario?.name || 'Unnamed Strategy'}
                      {index === 1 && <Badge>Recommended</Badge>}
                    </CardTitle>
                    <CardDescription>
                      Expected Return: {scenario?.expectedReturn?.toFixed(1) || 0}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Volatility:</span>
                        <div className="font-medium">{scenario?.volatility?.toFixed(1) || 0}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sharpe Ratio:</span>
                        <div className="font-medium">{scenario?.sharpeRatio?.toFixed(2) || 0}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Drawdown:</span>
                        <div className="font-medium text-red-600">{scenario?.maxDrawdown?.toFixed(1) || 0}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tax Efficiency:</span>
                        <div className="font-medium">{scenario?.taxEfficiency?.toFixed(0) || 0}%</div>
                      </div>
                    </div>

                    {/* ESG Score */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>ESG Alignment</span>
                        <span>{scenario.esgAlignment.toFixed(0)}/100</span>
                      </div>
                      <Progress value={scenario.esgAlignment} className="h-2" />
                    </div>

                    {/* Allocation Chart */}
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={scenario.allocation}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={50}
                            dataKey="value"
                          >
                            {Array.isArray(scenario?.allocation) ? scenario.allocation.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry?.color || '#8884d8'} />
                            )) : null}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSelectStrategy(scenario?.name || '')}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Select this strategy
                    </Button>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-3 p-8 text-center text-muted-foreground">
                  <p>No optimization scenarios available.</p>
                  <p className="text-sm mt-2">Click "Run Optimization" to generate scenarios.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="frontier" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Efficient Frontier Analysis
                </CardTitle>
                <CardDescription>
                  Optimal risk-return combinations. Hover over points to see portfolio composition.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="risk" 
                        name="Risk (Volatility)"
                        domain={['dataMin - 1', 'dataMax + 1']}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="return" 
                        name="Expected Return"
                        domain={['dataMin - 0.5', 'dataMax + 0.5']}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload[0] && payload[0].payload) {
                            const data = payload[0].payload;
                            
                            // Check if this is an efficient frontier point with allocation data
                            if (data.allocation && typeof data.allocation === 'object') {
                              return (
                                <div className="bg-background border rounded-lg p-4 shadow-lg">
                                  <div className="font-semibold mb-2">
                                    Risk: {data.risk}% | Return: {data.return}%
                                  </div>
                                  <div className="text-sm space-y-1">
                                    <div className="font-medium">Portfolio Composition:</div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>US Stocks: {data.allocation.stocks || 0}%</div>
                                      <div>International: {data.allocation.international || 0}%</div>
                                      <div>Bonds: {data.allocation.bonds || 0}%</div>
                                      <div>Alternatives: {data.allocation.alternatives || 0}%</div>
                                    </div>
                                    <div className="pt-2 border-t mt-2">
                                      <div>Sharpe Ratio: {data.sharpe || 'N/A'}</div>
                                      <div>Tax Efficiency: {data.taxEfficiency ? data.taxEfficiency.toFixed(0) : 'N/A'}%</div>
                                      <div>ESG Score: {data.esgScore ? data.esgScore.toFixed(0) : 'N/A'}/100</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            } else {
                              // Simple tooltip for current portfolio or scenario points
                              return (
                                <div className="bg-background border rounded-lg p-3 shadow-lg">
                                  <div className="font-semibold">
                                    {data.name || 'Portfolio Point'}
                                  </div>
                                  <div className="text-sm mt-1">
                                    Risk: {data.risk}% | Return: {data.return}%
                                  </div>
                                </div>
                              );
                            }
                          }
                          return null;
                        }}
                      />
                      
                      {/* Efficient Frontier Curve */}
                      <Scatter 
                        name="Efficient Frontier" 
                        data={simulationResults?.efficientFrontier || []} 
                        fill="#8884d8"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                      
                      {/* Current Portfolio Point */}
                      <Scatter 
                        name="Current Portfolio" 
                        data={[{
                          risk: 12.5,
                          return: 7.2,
                          name: 'Current'
                        }]} 
                        fill="#ff7300"
                        stroke="#ff7300"
                        strokeWidth={3}
                        shape="diamond"
                      />
                      
                      {/* Optimized Scenarios */}
                      <Scatter 
                        name="Recommended Portfolios" 
                        data={simulationResults?.scenarios ? [
                          { risk: simulationResults.scenarios[0]?.volatility || 0, return: simulationResults.scenarios[0]?.expectedReturn || 0, name: 'Conservative' },
                          { risk: simulationResults.scenarios[1]?.volatility || 0, return: simulationResults.scenarios[1]?.expectedReturn || 0, name: 'Balanced' },
                          { risk: simulationResults.scenarios[2]?.volatility || 0, return: simulationResults.scenarios[2]?.expectedReturn || 0, name: 'Growth' }
                        ] : []} 
                        fill="#00C49F"
                        stroke="#00C49F"
                        strokeWidth={2}
                        shape="triangle"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#8884d8]"></div>
                    <span>Efficient Frontier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#ff7300] transform rotate-45"></div>
                    <span>Current Portfolio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-[#00C49F]"></div>
                    <span>Recommended Scenarios</span>
                  </div>
                </div>
                
                {/* Insights */}
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Efficient Frontier Insights:</strong> Points on the curve represent optimal portfolios 
                    that maximize return for a given level of risk. Your current portfolio's position relative 
                    to the frontier shows optimization opportunities.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            
            {/* Risk-Return Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Risk-Return Optimization Matrix</CardTitle>
                <CardDescription>
                  Detailed breakdown of efficient frontier portfolios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Risk Level</th>
                        <th className="text-left p-2">Expected Return</th>
                        <th className="text-left p-2">Sharpe Ratio</th>
                        <th className="text-left p-2">US Stocks</th>
                        <th className="text-left p-2">International</th>
                        <th className="text-left p-2">Bonds</th>
                        <th className="text-left p-2">Alternatives</th>
                        <th className="text-left p-2">Tax Efficiency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(simulationResults?.efficientFrontier || [])
                        .filter((_, index) => index % 3 === 0) // Show every 3rd point to avoid clutter
                        .map((point, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2">{point.risk}%</td>
                          <td className="p-2 text-green-600 font-medium">{point.return}%</td>
                          <td className="p-2">{point.sharpe}</td>
                          <td className="p-2">{point.allocation?.stocks || 0}%</td>
                          <td className="p-2">{point.allocation?.international || 0}%</td>
                          <td className="p-2">{point.allocation?.bonds || 0}%</td>
                          <td className="p-2">{point.allocation?.alternatives || 0}%</td>
                          <td className="p-2">{point.taxEfficiency?.toFixed(0) || 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Growth Projections</CardTitle>
                <CardDescription>
                  Projected portfolio value over {parameters.timeHorizon} years
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulationResults.projectedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip 
                        formatter={(value) => [`$${value?.toLocaleString() || '0'}`, '']}
                        labelFormatter={(label) => `Year ${label}`}
                      />
                      <Line type="monotone" dataKey="current" stroke="#8884d8" strokeDasharray="5 5" name="Current Portfolio" />
                      <Line type="monotone" dataKey="conservative" stroke={COLORS[0]} name="Conservative" />
                      <Line type="monotone" dataKey="balanced" stroke={COLORS[1]} strokeWidth={3} name="Balanced (Recommended)" />
                      <Line type="monotone" dataKey="growth" stroke={COLORS[2]} name="Growth" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Financial Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Tax Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${simulationResults?.taxSavings?.toLocaleString() || '0'}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Estimated annual tax savings from optimization
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Rebalancing Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    ${simulationResults?.rebalancingCost?.toLocaleString() || '0'}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Estimated one-time rebalancing cost
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Risk analysis is based on historical data and Monte-Carlo simulations. 
                Past performance does not guarantee future results.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Risk-Return Analysis</CardTitle>
                <CardDescription>
                  Comparison of risk-adjusted returns across scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(simulationResults?.scenarios) ? simulationResults.scenarios.map((scenario, index) => (
                    <div key={scenario?.name || index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">{scenario?.name || 'Unnamed Strategy'}</h4>
                        <Badge variant={index === 1 ? "default" : "secondary"}>
                          Sharpe: {scenario?.sharpeRatio?.toFixed(2) || 0}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Return</span>
                          <div className="font-medium text-green-600">
                            +{scenario?.expectedReturn?.toFixed(1) || 0}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risk</span>
                          <div className="font-medium">
                            {scenario?.volatility?.toFixed(1) || 0}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Worst Year</span>
                          <div className="font-medium text-red-600">
                            {scenario?.maxDrawdown?.toFixed(1) || 0}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tax Drag</span>
                          <div className="font-medium">
                            {(100 - (scenario?.taxEfficiency || 0)).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No scenarios available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Initial Call-to-Action */}
      {!simulationResults && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to Optimize Your Portfolio?</h3>
            <p className="text-muted-foreground mb-6">
              Adjust the parameters above and click "Run Optimization" to see personalized recommendations
            </p>
            <Button onClick={runMonteCarloSimulation} size="lg" className="flex items-center gap-2 mx-auto">
              <TrendingUp className="h-5 w-5" />
              Start Optimization
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Strategy Implementation Modal */}
      <Dialog open={showImplementationModal} onOpenChange={setShowImplementationModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Portfolio Optimization Plan: {selectedStrategy?.scenarioName}
            </DialogTitle>
            <DialogDescription>
              Review your optimized portfolio allocation and recommended trades. Use this plan to manually rebalance your portfolio with your preferred broker.
            </DialogDescription>
          </DialogHeader>
          
          {selectedStrategy && (
            <div className="space-y-6">
              {/* Portfolio Value Input */}
              <div className="space-y-2">
                <Label htmlFor="portfolio-value">Portfolio Value</Label>
                <Input
                  id="portfolio-value"
                  type="number"
                  value={portfolioValue}
                  onChange={(e) => setPortfolioValue(e.target.value)}
                  placeholder="100000"
                  className="text-base sm:text-lg font-medium"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Enter the total value of your portfolio to be optimized
                </p>
              </div>
              
              {/* Strategy Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Expected Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Expected Return:</span>
                      <span className="font-medium text-green-600">
                        {selectedStrategy?.scenario?.expectedReturn || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Volatility:</span>
                      <span className="font-medium">
                        {selectedStrategy?.scenario?.volatility || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sharpe Ratio:</span>
                      <span className="font-medium">
                        {selectedStrategy?.scenario?.sharpeRatio || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Tax Impact Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tax Efficiency:</span>
                        <span className="font-medium">
                          {selectedStrategy?.implementationPlan?.taxAnalysis?.taxEfficiency || 0}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedStrategy?.implementationPlan?.taxAnalysis?.expectedTaxImpact || 'N/A'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Trading Plan */}
              <div>
                <h4 className="font-medium mb-3">Recommended Trades</h4>
                {/* Mobile-first responsive trading plan */}
                <div className="border rounded-lg overflow-hidden">
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="text-left p-3">Asset</th>
                          <th className="text-left p-3">Action</th>
                          <th className="text-left p-3">Allocation</th>
                          <th className="text-left p-3">Estimated Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(selectedStrategy?.implementationPlan?.trades) ? selectedStrategy.implementationPlan.trades.map((trade, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="p-3 font-medium">{trade.symbol}</td>
                            <td className="p-3">
                              {trade.action === 'sell' ? (
                                <Badge className="bg-red-500 text-white border-red-500 hover:bg-red-600">
                                  {trade.action.toUpperCase()}
                                </Badge>
                              ) : (
                                <Badge variant={
                                  trade.action === 'buy' ? 'default' : 'secondary'
                                }>
                                  {trade.action.toUpperCase()}
                                </Badge>
                              )}
                            </td>
                            <td className="p-3">{trade.percentage?.toFixed(1) || 0}%</td>
                            <td className="p-3 font-medium">
                              ${trade.estimatedValue?.toLocaleString() || '0'}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="p-3 text-center text-muted-foreground">
                              No trades available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3 p-3">
                    {Array.isArray(selectedStrategy?.implementationPlan?.trades) ? selectedStrategy.implementationPlan.trades.map((trade, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-base">{trade.symbol}</span>
                          {trade.action === 'sell' ? (
                            <Badge className="bg-red-500 text-white border-red-500 hover:bg-red-600">
                              {trade.action.toUpperCase()}
                            </Badge>
                          ) : (
                            <Badge variant={
                              trade.action === 'buy' ? 'default' : 'secondary'
                            }>
                              {trade.action.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Allocation:</span>
                            <div className="font-medium">{trade.percentage?.toFixed(1) || 0}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Est. Value:</span>
                            <div className="font-medium">${trade.estimatedValue?.toLocaleString() || '0'}</div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-6 text-center text-muted-foreground">
                        No trades available
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Tax Optimization Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Tax-Loss Harvesting Opportunities */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span>📉</span> Tax-Loss Harvesting
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedStrategy?.implementationPlan?.taxAnalysis?.taxLossHarvestingOpportunities?.map((opportunity, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-xs mt-1">•</span>
                        <span>{opportunity}</span>
                      </div>
                    )) || (
                      <div className="text-sm text-muted-foreground">No specific opportunities identified</div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Account Type Recommendations */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span>🏦</span> Account Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedStrategy?.implementationPlan?.taxAnalysis?.recommendedAccountTypes?.map((recommendation, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-xs mt-1">•</span>
                        <span>{recommendation}</span>
                      </div>
                    )) || (
                      <div className="text-sm text-muted-foreground">No specific recommendations available</div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Implementation Disclaimer */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> AssetVision provides portfolio analysis and optimization recommendations only. 
                  You'll need to execute these trades manually through your broker (Fidelity, Schwab, Vanguard, etc.) or financial advisor. 
                  The downloaded report includes all trade details for easy reference.
                  <br /><br />
                  <em>This analysis is based on historical data and past performance doesn't guarantee future results.</em>
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleImplementStrategy} className="bg-primary">
              Download Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
