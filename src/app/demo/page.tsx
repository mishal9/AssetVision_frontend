'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
      if (step === 2) {
        setTimeout(() => setShowResults(true), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AssetVision Demo
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience drift detection, rebalancing alerts, and tax optimization with our AI-powered portfolio analysis
          </p>
          <Badge variant="secondary" className="text-sm">
            🚀 No signup required • Live drift analysis • Tax optimization
          </Badge>
        </div>

        {/* Progress Steps */}
        <Card className="border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= stepNum - 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > stepNum - 1 ? <CheckCircle className="h-5 w-5" /> : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-20 h-1 mx-2 ${
                      step >= stepNum ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {step === 0 && "Step 1: Analyze your $100k portfolio"}
                {step === 1 && "Step 2: Detect portfolio drift & rebalancing needs"}
                {step === 2 && "Step 3: Calculate tax optimization savings"}
                {step === 3 && "🎉 See your complete analysis!"}
              </p>
            </div>
          </CardContent>
        </Card>

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
                {step >= 2 ? 'Tax-Optimized Portfolio' : 'Optimization Analysis'}
              </CardTitle>
              <CardDescription>
                {step >= 2 ? '$100,000 • Optimized for tax efficiency' : 'AI-powered recommendations'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {step === 1 && (
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

              {step >= 2 && (
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

        {/* Portfolio Drift Analysis */}
        {step >= 1 && (
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Portfolio Drift Analysis
              </CardTitle>
              <CardDescription>
                Your portfolio has drifted from your target allocation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Drift Alerts */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Active Drift Alerts
                </h3>
                <div className="grid gap-3">
                  {driftAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: alert.color }}
                        />
                        <span className="font-medium">{alert.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Target: {alert.target}% • Current: {alert.current}%
                        </div>
                        <div className={`font-semibold ${
                          alert.drift > 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {alert.drift > 0 ? '+' : ''}{alert.drift}% ({alert.driftPercent}% drift)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target vs Current Allocation Chart */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Target vs Current Allocation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Target Allocation */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-center">Target Allocation</h4>
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
                  </div>

                  {/* Current Allocation */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-center">Current Allocation</h4>
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
                  </div>
                </div>
              </div>

              {/* Rebalancing Recommendation */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  💡 Rebalancing Recommendation
                </h4>
                <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <p>• <strong>Sell:</strong> $5,000 from Large Cap Stocks (reduce from 45% to 40%)</p>
                  <p>• <strong>Sell:</strong> $5,000 from Bonds (reduce from 15% to 10%)</p>
                  <p>• <strong>Buy:</strong> $5,000 Small Cap Stocks (increase from 15% to 20%)</p>
                  <p>• <strong>Buy:</strong> $5,000 International (increase from 20% to 25%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tax Savings Results */}
        {step >= 2 && (
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-8 text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-700 dark:text-green-300">
                  Your Tax Savings Potential
                </h2>
                <p className="text-muted-foreground">
                  Based on your $100k portfolio optimization
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Annual Savings</div>
                  <div className="text-3xl font-bold text-green-600">
                    ${annualTaxSavings.toFixed(0)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Tax-Loss Harvesting</div>
                  <div className="text-3xl font-bold text-blue-600">
                    ${(totalTaxLossHarvesting * 0.24).toFixed(0)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">10-Year Projection</div>
                  <div className="text-4xl font-bold text-purple-600">
                    ${Math.round(animatedValue).toLocaleString()}
                  </div>
                </div>
              </div>

              {showResults && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-lg mb-2">🎯 Key Optimizations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Switched to tax-efficient index funds</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Added municipal bonds for tax-free income</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Harvested ${totalTaxLossHarvesting} in tax losses</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Reduced overall tax drag by 65%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <div className="text-center">
          {step < 3 ? (
            <Button 
              onClick={handleNextStep}
              size="lg"
              className="px-8 py-4 text-lg"
            >
              {step === 0 && "Analyze My Portfolio"}
              {step === 1 && "Check Portfolio Drift"}
              {step === 2 && "Calculate Tax Savings"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <div className="space-y-4">
              <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Your Personal Analysis
              </Button>
              <p className="text-sm text-muted-foreground">
                Ready to optimize your real portfolio? Sign up for free detailed analysis.
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <Card className="bg-gray-50 dark:bg-gray-900">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">
              This is a demonstration using hypothetical data. Actual results may vary based on your specific situation, 
              tax bracket, and market conditions. Not investment advice. Consult with a qualified financial advisor.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
