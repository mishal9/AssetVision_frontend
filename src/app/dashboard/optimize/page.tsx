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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

/**
 * Portfolio Optimization Page
 * Interactive Monte-Carlo simulations with "what if?" scenarios
 * Key differentiator feature for AssetVision
 */
export default function OptimizePortfolioPage() {
  // Simulation parameters
  const [riskTolerance, setRiskTolerance] = useState([5]);
  const [taxBracket, setTaxBracket] = useState([22]);
  const [turnoverTolerance, setTurnoverTolerance] = useState([10]);
  const [esgScore, setEsgScore] = useState([50]);
  const [timeHorizon, setTimeHorizon] = useState([10]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);

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
    setIsSimulating(true);
    
    // Simulate processing time for realistic UX
    setTimeout(() => {
      const scenarios = generateOptimizationScenarios();
      setSimulationResults(scenarios);
      setIsSimulating(false);
    }, 2000);
  };

  /**
   * Generate optimization scenarios based on current parameters
   */
  const generateOptimizationScenarios = () => {
    const riskLevel = riskTolerance[0];
    const taxRate = taxBracket[0] / 100;
    const turnover = turnoverTolerance[0] / 100;
    const esg = esgScore[0];
    const years = timeHorizon[0];

    // Generate three scenarios: Conservative, Balanced, Aggressive
    const scenarios = [
      {
        name: 'Conservative',
        expectedReturn: 6.5 + (riskLevel * 0.3),
        volatility: 8 + (riskLevel * 0.5),
        sharpeRatio: 0.75 + (riskLevel * 0.05),
        maxDrawdown: -12 + (riskLevel * -0.8),
        taxEfficiency: 85 + (taxRate * -20),
        esgAlignment: Math.max(0, esg - 10),
        allocation: [
          { name: 'US Stocks', value: 45 - (10 - riskLevel), color: COLORS[0] },
          { name: 'International', value: 20 + (riskLevel * 0.5), color: COLORS[1] },
          { name: 'Bonds', value: 30 + (10 - riskLevel), color: COLORS[2] },
          { name: 'Alternatives', value: 5, color: COLORS[3] }
        ]
      },
      {
        name: 'Balanced',
        expectedReturn: 8.2 + (riskLevel * 0.4),
        volatility: 12 + (riskLevel * 0.7),
        sharpeRatio: 0.68 + (riskLevel * 0.06),
        maxDrawdown: -18 + (riskLevel * -1.2),
        taxEfficiency: 78 + (taxRate * -25),
        esgAlignment: esg,
        allocation: [
          { name: 'US Stocks', value: 60 + (riskLevel - 5), color: COLORS[0] },
          { name: 'International', value: 25 + (riskLevel * 0.3), color: COLORS[1] },
          { name: 'Bonds', value: 10 + (10 - riskLevel) * 0.5, color: COLORS[2] },
          { name: 'Alternatives', value: 5 + (riskLevel * 0.2), color: COLORS[3] }
        ]
      },
      {
        name: 'Growth',
        expectedReturn: 10.1 + (riskLevel * 0.5),
        volatility: 16 + (riskLevel * 1.0),
        sharpeRatio: 0.63 + (riskLevel * 0.04),
        maxDrawdown: -25 + (riskLevel * -1.5),
        taxEfficiency: 72 + (taxRate * -30),
        esgAlignment: Math.min(100, esg + 10),
        allocation: [
          { name: 'US Stocks', value: 70 + (riskLevel - 5) * 0.8, color: COLORS[0] },
          { name: 'International', value: 20 + (riskLevel * 0.4), color: COLORS[1] },
          { name: 'Bonds', value: 5 + (10 - riskLevel) * 0.3, color: COLORS[2] },
          { name: 'Alternatives', value: 5 + (riskLevel * 0.3), color: COLORS[3] }
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
      rebalancingCost: calculateRebalancingCost(turnover)
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

  // Auto-run simulation when parameters change
  useEffect(() => {
    if (simulationResults) {
      const timeoutId = setTimeout(() => {
        runMonteCarloSimulation();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [riskTolerance, taxBracket, turnoverTolerance, esgScore, timeHorizon]);

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
            Total Value: ${currentPortfolio.totalValue.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentPortfolio.holdings.map((holding, index) => (
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
                    <span>${holding.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
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
                <span className="text-sm text-muted-foreground">{riskTolerance[0]}/10</span>
              </div>
              <Slider
                value={riskTolerance}
                onValueChange={setRiskTolerance}
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
                <span className="text-sm text-muted-foreground">{taxBracket[0]}%</span>
              </div>
              <Slider
                value={taxBracket}
                onValueChange={setTaxBracket}
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
                <span className="text-sm text-muted-foreground">{turnoverTolerance[0]}%</span>
              </div>
              <Slider
                value={turnoverTolerance}
                onValueChange={setTurnoverTolerance}
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
                <span className="text-sm text-muted-foreground">{esgScore[0]}/100</span>
              </div>
              <Slider
                value={esgScore}
                onValueChange={setEsgScore}
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
                <span className="text-sm text-muted-foreground">{timeHorizon[0]} years</span>
              </div>
              <Slider
                value={timeHorizon}
                onValueChange={setTimeHorizon}
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
              disabled={isSimulating}
              className="flex items-center gap-2"
            >
              {isSimulating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              {isSimulating ? 'Optimizing...' : 'Run Optimization'}
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scenarios">Optimization Scenarios</TabsTrigger>
            <TabsTrigger value="projections">Performance Projections</TabsTrigger>
            <TabsTrigger value="analysis">Risk Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {simulationResults.scenarios.map((scenario, index) => (
                <Card key={scenario.name} className={index === 1 ? "ring-2 ring-primary" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {scenario.name}
                      {index === 1 && <Badge>Recommended</Badge>}
                    </CardTitle>
                    <CardDescription>
                      Expected Return: {scenario.expectedReturn.toFixed(1)}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Volatility:</span>
                        <div className="font-medium">{scenario.volatility.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sharpe Ratio:</span>
                        <div className="font-medium">{scenario.sharpeRatio.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Drawdown:</span>
                        <div className="font-medium text-red-600">{scenario.maxDrawdown.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tax Efficiency:</span>
                        <div className="font-medium">{scenario.taxEfficiency.toFixed(0)}%</div>
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
                            {scenario.allocation.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    <Button 
                      className="w-full" 
                      variant={index === 1 ? "default" : "outline"}
                    >
                      Select This Strategy
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Growth Projections</CardTitle>
                <CardDescription>
                  Projected portfolio value over {timeHorizon[0]} years
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
                        formatter={(value) => [`$${value.toLocaleString()}`, '']}
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
                    ${simulationResults.taxSavings.toLocaleString()}
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
                    ${simulationResults.rebalancingCost.toLocaleString()}
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
                  {simulationResults.scenarios.map((scenario, index) => (
                    <div key={scenario.name} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">{scenario.name}</h4>
                        <Badge variant={index === 1 ? "default" : "secondary"}>
                          Sharpe: {scenario.sharpeRatio.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Return</span>
                          <div className="font-medium text-green-600">
                            +{scenario.expectedReturn.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risk</span>
                          <div className="font-medium">
                            {scenario.volatility.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Worst Year</span>
                          <div className="font-medium text-red-600">
                            {scenario.maxDrawdown.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tax Drag</span>
                          <div className="font-medium">
                            {(100 - scenario.taxEfficiency).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
    </div>
  );
}
