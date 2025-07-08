'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Calculator,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

/**
 * Interactive Portfolio Demo - No Login Required
 * Shows $100k portfolio with 3-click tax savings visualization
 */
export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showPortfolioAnalysis, setShowPortfolioAnalysis] = useState(false);

  // Demo portfolio data - realistic $100k allocation
  const currentPortfolio = [
    { name: 'Large Cap Stocks', value: 45000, percentage: 45, color: '#0088FE', taxDrag: 2.1 },
    { name: 'Small Cap Stocks', value: 15000, percentage: 15, color: '#00C49F', taxDrag: 2.8 },
    { name: 'International', value: 20000, percentage: 20, color: '#FFBB28', taxDrag: 1.9 },
    { name: 'Bonds', value: 15000, percentage: 15, color: '#FF8042', taxDrag: 3.2 },
    { name: 'Cash', value: 5000, percentage: 5, color: '#8884D8', taxDrag: 4.1 }
  ];

  // Optimized portfolio after tax-loss harvesting
  const optimizedPortfolio = [
    { name: 'Tax-Efficient Index', value: 50000, percentage: 50, color: '#0088FE', taxDrag: 0.8 },
    { name: 'International ETF', value: 25000, percentage: 25, color: '#00C49F', taxDrag: 1.1 },
    { name: 'Municipal Bonds', value: 20000, percentage: 20, color: '#FFBB28', taxDrag: 0.0 },
    { name: 'REIT', value: 5000, percentage: 5, color: '#FF8042', taxDrag: 1.5 }
  ];

  // Tax savings calculation
  const currentTaxDrag = currentPortfolio.reduce((sum, asset) => 
    sum + (asset.value * asset.taxDrag / 100), 0
  );
  const optimizedTaxDrag = optimizedPortfolio.reduce((sum, asset) => 
    sum + (asset.value * asset.taxDrag / 100), 0
  );
  const annualTaxSavings = currentTaxDrag - optimizedTaxDrag;
  const tenYearSavings = annualTaxSavings * 10 * 1.05; // With compounding

  // Target allocation vs current allocation for drift analysis
  const targetAllocation = [
    { name: 'Large Cap Stocks', target: 40, current: 45, value: 45000, color: '#0088FE' },
    { name: 'Small Cap Stocks', target: 20, current: 15, value: 15000, color: '#00C49F' },
    { name: 'International', target: 25, current: 20, value: 20000, color: '#FFBB28' },
    { name: 'Bonds', target: 10, current: 15, value: 15000, color: '#FF8042' },
    { name: 'Cash', target: 5, current: 5, value: 5000, color: '#8884D8' }
  ];

  // Calculate drift alerts
  const driftAlerts = targetAllocation
    .map(asset => ({
      ...asset,
      drift: asset.current - asset.target,
      driftPercent: ((asset.current - asset.target) / asset.target * 100).toFixed(1)
    }))
    .filter(asset => Math.abs(asset.drift) >= 3); // Alert if drift >= 3%

  // Tax-loss harvesting opportunities
  const taxLossOpportunities = [
    { symbol: 'AAPL', shares: 50, costBasis: 180, currentPrice: 165, loss: -750 },
    { symbol: 'TSLA', shares: 25, costBasis: 220, currentPrice: 195, loss: -625 },
    { symbol: 'NVDA', shares: 15, costBasis: 450, currentPrice: 420, loss: -450 },
  ];
  const totalTaxLossHarvesting = Math.abs(taxLossOpportunities.reduce((sum, stock) => sum + stock.loss, 0));

  // Tax savings data structure
  const taxSavings = {
    totalSavings: Math.round(annualTaxSavings + (totalTaxLossHarvesting * 0.24)),
    harvestingOpportunity: totalTaxLossHarvesting,
    efficiencyGain: Math.round(((currentTaxDrag - optimizedTaxDrag) / currentTaxDrag) * 100),
    strategies: [
      {
        name: 'Tax-Efficient Fund Selection',
        description: 'Switch to low-turnover index funds and tax-managed funds to reduce annual tax drag on your investments.',
        savings: Math.round(annualTaxSavings * 0.4)
      },
      {
        name: 'Tax-Loss Harvesting',
        description: 'Realize losses on underperforming positions to offset capital gains and reduce your tax liability.',
        savings: Math.round(totalTaxLossHarvesting * 0.24)
      },
      {
        name: 'Asset Location Optimization',
        description: 'Place tax-inefficient investments in tax-advantaged accounts and tax-efficient ones in taxable accounts.',
        savings: Math.round(annualTaxSavings * 0.35)
      },
      {
        name: 'Municipal Bond Allocation',
        description: 'Add tax-free municipal bonds appropriate for your tax bracket to reduce taxable income.',
        savings: Math.round(annualTaxSavings * 0.25)
      }
    ]
  };

  // Animation effect for dollar amounts
  useEffect(() => {
    if (step >= 2) {
      const timer = setInterval(() => {
        setAnimatedValue(prev => {
          if (prev < tenYearSavings) {
            return Math.min(prev + tenYearSavings / 50, tenYearSavings);
          }
          return tenYearSavings;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [step, tenYearSavings]);

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
      if (step === 0) {
        setShowPortfolioAnalysis(true);
      }
      if (step === 2) {
        setTimeout(() => setShowResults(true), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50">
          <CardContent className="text-center space-y-6 py-12">
            <div className="flex items-center justify-center gap-3">
              <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600">
                <AvatarFallback className="bg-transparent text-white font-bold text-lg">
                  <Sparkles className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AssetVision Demo
              </h1>
            </div>
            <div className="space-y-3">
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Experience intelligent drift detection, automated rebalancing alerts, and advanced tax optimization with our AI-powered portfolio analysis platform
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge variant="secondary" className="text-sm font-medium">
                  <Sparkles className="h-3 w-3 mr-1" />
                  No signup required
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Live drift analysis
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Calculator className="h-3 w-3 mr-1" />
                  Tax optimization
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg font-semibold">Portfolio Analysis Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step >= stepNum - 1 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110' 
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}>
                    {step > stepNum - 1 ? <CheckCircle className="h-6 w-6" /> : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className="flex-1 mx-4">
                      <Progress 
                        value={step >= stepNum ? 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Separator />
            <div className="text-center space-y-2">
              <p className="font-medium text-lg">
                {step === 0 && "Analyze Portfolio"}
                {step === 1 && "Detect Drift & Alerts"}
                {step === 2 && "Calculate Tax Savings"}
                {step === 3 && "Complete Analysis"}
              </p>
              <p className="text-sm text-muted-foreground">
                {step === 0 && "Examining your $100k portfolio allocation and performance"}
                {step === 1 && "Identifying portfolio drift and rebalancing opportunities"}
                {step === 2 && "Computing tax optimization and savings potential"}
                {step === 3 && "🎉 Your comprehensive portfolio analysis is ready!"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Analysis Grid */}
        {showPortfolioAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Current Portfolio */}
          <Card className={`transition-all duration-500 ${step >= 0 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Your Current Portfolio
              </CardTitle>
              <CardDescription>$100,000 • Typical allocation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Portfolio Pie Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={currentPortfolio}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {currentPortfolio.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Portfolio Breakdown */}
              <div className="space-y-2">
                {currentPortfolio.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                      <span>{asset.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${asset.value.toLocaleString()}</div>
                      <div className="text-red-500 text-xs">Tax drag: {asset.taxDrag}%</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Tax Impact */}
              <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Annual Tax Drag</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  ${currentTaxDrag.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Reducing your returns by {(currentTaxDrag / 100000 * 100).toFixed(1)}%
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Right Column - Optimization Results */}
          <Card className={`transition-all duration-500 ${step >= 1 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {step >= 3 ? 'Tax-Optimized Portfolio' : 'Optimization Analysis'}
              </CardTitle>
              <CardDescription>
                {step >= 3 ? '$100,000 • Optimized for tax efficiency' : 'AI-powered recommendations'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {(step === 1 || step === 2) && (
                <div className="space-y-4">
                  <h3 className="font-medium">Tax-Loss Harvesting Opportunities</h3>
                  {taxLossOpportunities.map((stock, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div>
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {stock.shares} shares • ${stock.costBasis} → ${stock.currentPrice}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${Math.abs(stock.loss)}</div>
                        <div className="text-xs text-muted-foreground">tax loss</div>
                      </div>
                    </div>
                  ))}
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <div className="font-medium text-blue-700 dark:text-blue-300">
                      Total Harvestable Losses: ${totalTaxLossHarvesting}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Potential tax savings: ${(totalTaxLossHarvesting * 0.24).toFixed(0)} (24% bracket)
                    </div>
                  </div>
                </div>
              )}



              {step >= 3 && (
                <>
                  {/* Optimized Portfolio Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={optimizedPortfolio}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                        >
                          {optimizedPortfolio.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Optimized Breakdown */}
                  <div className="space-y-2">
                    {optimizedPortfolio.map((asset, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                          <span>{asset.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${asset.value.toLocaleString()}</div>
                          <div className="text-green-500 text-xs">Tax drag: {asset.taxDrag}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

            </CardContent>
          </Card>
        </div>
        )}

        {/* Portfolio Drift Analysis */}
        {step >= 2 && (
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                Portfolio Drift Analysis
              </CardTitle>
              <CardDescription className="text-base">
                Your portfolio has drifted from your target allocation - immediate action recommended
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Drift Alerts */}
              <Alert className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-orange-800 dark:text-orange-300">
                  {driftAlerts.length} Active Drift Alert{driftAlerts.length !== 1 ? 's' : ''} Detected
                </AlertTitle>
                <AlertDescription className="text-orange-700 dark:text-orange-400 mt-2">
                  Your portfolio allocation has deviated significantly from your target. Consider rebalancing to optimize performance.
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="alerts" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="alerts" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Drift Alerts
                  </TabsTrigger>
                  <TabsTrigger value="comparison" className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Allocation Comparison
                  </TabsTrigger>
                  <TabsTrigger value="recommendations" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Recommendations
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="alerts" className="space-y-4 mt-6">
                  <div className="grid gap-4">
                    {driftAlerts.map((alert, index) => (
                      <Card key={index} className="border-l-4 border-l-orange-500">
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: alert.color }}
                            />
                            <div>
                              <p className="font-semibold">{alert.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ${alert.value.toLocaleString()} allocated
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              Target: {alert.target}% • Current: {alert.current}%
                            </div>
                            <Badge variant={alert.drift > 0 ? "destructive" : "secondary"} className="mt-1">
                              {alert.drift > 0 ? '+' : ''}{alert.drift}% drift
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-center text-lg">Target Allocation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={targetAllocation.map(item => ({ ...item, value: item.target }))}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                dataKey="value"
                              >
                                {targetAllocation.map((entry, index) => (
                                  <Cell key={`target-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `${value}%`} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-center text-lg">Current Allocation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={targetAllocation.map(item => ({ ...item, value: item.current }))}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                dataKey="value"
                              >
                                {targetAllocation.map((entry, index) => (
                                  <Cell key={`current-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `${value}%`} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4 mt-6">
                  <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300">
                      Smart Rebalancing Strategy
                    </AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400 mt-2">
                      Our AI recommends the following trades to restore your target allocation:
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-3">
                    <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 rotate-180" />
                          Sell Positions
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Large Cap Stocks</span>
                            <span className="font-medium">-$5,000 (45% → 40%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bonds</span>
                            <span className="font-medium">-$5,000 (15% → 10%)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Buy Positions
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Small Cap Stocks</span>
                            <span className="font-medium">+$5,000 (15% → 20%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>International</span>
                            <span className="font-medium">+$5,000 (20% → 25%)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Tax Optimization Results */}
        {step >= 3 && (
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-green-600" />
                Tax Optimization Analysis
              </CardTitle>
              <CardDescription className="text-base">
                AI-powered tax optimization identifies significant savings opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <Alert className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                <Calculator className="h-4 w-4" />
                <AlertTitle className="text-green-800 dark:text-green-300">
                  ${taxSavings.totalSavings.toLocaleString()} in Tax Savings Identified
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400 mt-2">
                  Our analysis found multiple optimization opportunities that could save you significant money on taxes.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
                  <CardContent className="text-center p-6">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${taxSavings.totalSavings.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">
                      Total Tax Savings
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Annual potential
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
                  <CardContent className="text-center p-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ${taxSavings.harvestingOpportunity.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Tax Loss Harvesting
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Immediate opportunity
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
                  <CardContent className="text-center p-6">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {taxSavings.efficiencyGain}%
                    </div>
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Efficiency Gain
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Portfolio improvement
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Separator />
              
              {/* Tax Savings Breakdown */}
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                    <Calculator className="h-5 w-5" />
                    How We Calculate Your $2,118 Tax Savings
                  </CardTitle>
                  <CardDescription>
                    Here's the simple math behind your potential annual tax savings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Current vs Optimized Tax Drag */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">1</span>
                      Reduce Annual Tax Drag: ${Math.round(annualTaxSavings).toLocaleString()}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      "Tax drag" is how much you lose to taxes each year. We can reduce yours significantly:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-red-200 bg-red-50/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-red-800">Current Portfolio (Tax Drag)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {currentPortfolio.map((asset, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span>{asset.name}:</span>
                              <span>${(asset.value * asset.taxDrag / 100).toLocaleString()}</span>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex justify-between font-semibold text-sm text-red-700">
                            <span>Total Annual Tax Cost:</span>
                            <span>${Math.round(currentTaxDrag).toLocaleString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-green-200 bg-green-50/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-green-800">Optimized Portfolio (Tax Drag)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {optimizedPortfolio.map((asset, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span>{asset.name}:</span>
                              <span>${(asset.value * asset.taxDrag / 100).toLocaleString()}</span>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex justify-between font-semibold text-sm text-green-700">
                            <span>Total Annual Tax Cost:</span>
                            <span>${Math.round(optimizedTaxDrag).toLocaleString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Annual Tax Drag Savings:</span>
                        <span className="font-bold text-blue-600">
                          ${Math.round(currentTaxDrag).toLocaleString()} - ${Math.round(optimizedTaxDrag).toLocaleString()} = ${Math.round(annualTaxSavings).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Tax Loss Harvesting */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">2</span>
                      Tax-Loss Harvesting: ${Math.round(totalTaxLossHarvesting * 0.24).toLocaleString()}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sell losing investments to offset gains and reduce your tax bill:
                    </p>
                    
                    <Card className="border-orange-200 bg-orange-50/50">
                      <CardContent className="p-4 space-y-3">
                        {taxLossOpportunities.map((stock, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="font-medium">{stock.symbol}</span>
                              <span className="text-muted-foreground ml-2">
                                ({stock.shares} shares)
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-red-600 font-medium">
                                ${Math.abs(stock.loss).toLocaleString()} loss
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Tax benefit: ${Math.round(Math.abs(stock.loss) * 0.24).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total Tax Benefit (24% rate):</span>
                          <span className="text-green-600">
                            ${Math.round(totalTaxLossHarvesting * 0.24).toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Separator />
                  
                  {/* Final Calculation */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 p-6 rounded-lg">
                    <h4 className="font-bold text-lg mb-4 text-center">Total Annual Tax Savings</h4>
                    <div className="space-y-2 text-center">
                      <div className="text-sm text-muted-foreground">
                        Tax Drag Reduction + Tax-Loss Harvesting
                      </div>
                      <div className="text-2xl font-bold">
                        ${Math.round(annualTaxSavings).toLocaleString()} + ${Math.round(totalTaxLossHarvesting * 0.24).toLocaleString()} = 
                        <span className="text-green-600">${taxSavings.totalSavings.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        This is money that stays in your pocket instead of going to taxes
                      </div>
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-lg">Smart Optimization Strategies</h3>
                </div>
                <div className="grid gap-4">
                  {taxSavings.strategies.map((strategy, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                      <CardContent className="flex items-start gap-4 p-4">
                        <Avatar className="h-10 w-10 bg-green-100 dark:bg-green-900/30">
                          <AvatarFallback className="bg-transparent text-green-600 font-bold">
                            {index + 1}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{strategy.name}</h4>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              ${strategy.savings.toLocaleString()} saved
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {strategy.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="text-center py-8">
            {step < 3 ? (
              <div className="space-y-4">
                <Button 
                  onClick={handleNextStep}
                  size="lg"
                  className="px-12 py-6 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {step === 0 && (
                    <>
                      <PieChart className="mr-3 h-6 w-6" />
                      Analyze My Portfolio
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <AlertTriangle className="mr-3 h-6 w-6" />
                      Detect Portfolio Drift
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <Calculator className="mr-3 h-6 w-6" />
                      Calculate Tax Savings
                    </>
                  )}
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  {step === 0 && "Discover your portfolio's current allocation and performance"}
                  {step === 1 && "Identify drift alerts and rebalancing opportunities"}
                  {step === 2 && "Uncover tax optimization and savings potential"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    🎉 Analysis Complete!
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Your portfolio analysis revealed significant optimization opportunities. Ready to apply these insights to your real investments?
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get Your Personal Analysis
                  </Button>
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Learn More About AssetVision
                  </Button>
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Free 30-day trial</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert className="bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-300">
            Demo Disclaimer
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">
            This demonstration uses hypothetical data for illustration purposes. Actual results may vary based on your specific financial situation, 
            tax bracket, investment timeline, and market conditions. This is not personalized investment advice. 
            Please consult with a qualified financial advisor before making investment decisions.
          </AlertDescription>
        </Alert>

      </div>
    </div>
  );
}
