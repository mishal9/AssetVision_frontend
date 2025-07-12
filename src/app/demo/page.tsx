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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Calculator,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Settings,
  Download,
  Eye,
  EyeOff,
  Info,
  Target,
  TrendingDown,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

/**
 * AssetVision Demo - Dual-Lane User Journey
 * Standard Mode: Streamlined experience for casual investors
 * Power Mode: Advanced features for data-hungry professionals
 */
export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showPortfolioAnalysis, setShowPortfolioAnalysis] = useState(false);
  const [isPowerMode, setIsPowerMode] = useState(false);
  const [taxBracket, setTaxBracket] = useState([24]);
  const [turnoverRate, setTurnoverRate] = useState([15]);
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([]);
  const [animatedSavings, setAnimatedSavings] = useState(0);

  // Asset class color palette - consistent throughout
  const ASSET_COLORS = {
    stocks: '#3B82F6',      // Blue
    bonds: '#10B981',       // Green
    international: '#F59E0B', // Amber
    alternatives: '#8B5CF6', // Purple
    cash: '#6B7280',        // Gray
    taxEfficient: '#059669', // Emerald
    municipal: '#0891B2',   // Cyan
    reit: '#DC2626'         // Red
  };

  // Demo portfolio data with 8pt grid alignment
  const currentPortfolio = [
    { name: 'Large Cap Stocks', value: 45000, percentage: 45, color: ASSET_COLORS.stocks, taxDrag: 2.1 },
    { name: 'Small Cap Stocks', value: 15000, percentage: 15, color: ASSET_COLORS.stocks, taxDrag: 2.8 },
    { name: 'International', value: 20000, percentage: 20, color: ASSET_COLORS.international, taxDrag: 1.9 },
    { name: 'Bonds', value: 15000, percentage: 15, color: ASSET_COLORS.bonds, taxDrag: 3.2 },
    { name: 'Cash', value: 5000, percentage: 5, color: ASSET_COLORS.cash, taxDrag: 4.1 }
  ];

  const optimizedPortfolio = [
    { name: 'Tax-Efficient Index', value: 50000, percentage: 50, color: ASSET_COLORS.taxEfficient, taxDrag: 0.8 },
    { name: 'International ETF', value: 25000, percentage: 25, color: ASSET_COLORS.international, taxDrag: 1.1 },
    { name: 'Municipal Bonds', value: 20000, percentage: 20, color: ASSET_COLORS.municipal, taxDrag: 0.0 },
    { name: 'REIT', value: 5000, percentage: 5, color: ASSET_COLORS.reit, taxDrag: 1.5 }
  ];

  // Calculate tax savings with dynamic tax bracket
  const currentTaxDrag = currentPortfolio.reduce((sum, asset) => 
    sum + (asset.value * asset.taxDrag / 100), 0
  );
  const optimizedTaxDrag = optimizedPortfolio.reduce((sum, asset) => 
    sum + (asset.value * asset.taxDrag / 100), 0
  );
  const annualTaxSavings = (currentTaxDrag - optimizedTaxDrag) * (taxBracket[0] / 24);
  const taxLossHarvestingValue = 1825 * (taxBracket[0] / 100);
  const totalAnnualSavings = Math.round(annualTaxSavings + taxLossHarvestingValue);

  // Drift alerts with severity levels
  const driftAlerts = [
    { 
      name: 'Large Cap Overweight', 
      severity: 'high', 
      dollarImpact: 2400, 
      drift: 5, 
      color: ASSET_COLORS.stocks,
      description: 'Portfolio is 5% overweight in large cap stocks'
    },
    { 
      name: 'Small Cap Underweight', 
      severity: 'medium', 
      dollarImpact: 1200, 
      drift: -5, 
      color: ASSET_COLORS.stocks,
      description: 'Portfolio is 5% underweight in small cap stocks'
    },
    { 
      name: 'International Underweight', 
      severity: 'medium', 
      dollarImpact: 800, 
      drift: -5, 
      color: ASSET_COLORS.international,
      description: 'Portfolio is 5% underweight in international stocks'
    },
    { 
      name: 'Bonds Overweight', 
      severity: 'low', 
      dollarImpact: 400, 
      drift: 5, 
      color: ASSET_COLORS.bonds,
      description: 'Portfolio is 5% overweight in bonds'
    }
  ];

  // Smart strategies with dollar impact
  const smartStrategies = [
    {
      name: 'Tax-Loss Harvesting',
      description: 'Realize losses on underperforming positions to offset capital gains',
      dollarImpact: Math.round(taxLossHarvestingValue),
      severity: 'high',
      category: 'Tax Optimization',
      selected: true
    },
    {
      name: 'Asset Location Optimization',
      description: 'Place tax-inefficient investments in tax-advantaged accounts',
      dollarImpact: Math.round(annualTaxSavings * 0.4),
      severity: 'high',
      category: 'Tax Optimization',
      selected: true
    },
    {
      name: 'Tax-Efficient Fund Selection',
      description: 'Switch to low-turnover index funds and tax-managed funds',
      dollarImpact: Math.round(annualTaxSavings * 0.35),
      severity: 'medium',
      category: 'Fund Selection',
      selected: true
    },
    {
      name: 'Municipal Bond Allocation',
      description: 'Add tax-free municipal bonds appropriate for your tax bracket',
      dollarImpact: Math.round(annualTaxSavings * 0.25),
      severity: 'medium',
      category: 'Fixed Income',
      selected: false
    }
  ];

  // Animation for savings counter
  useEffect(() => {
    if (step >= 3) {
      const timer = setInterval(() => {
        setAnimatedSavings(prev => {
          if (prev < totalAnnualSavings) {
            return Math.min(prev + Math.ceil(totalAnnualSavings / 50), totalAnnualSavings);
          }
          return totalAnnualSavings;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [step, totalAnnualSavings]);

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
      if (step === 0) setShowPortfolioAnalysis(true);
      if (step === 3) setTimeout(() => setShowResults(true), 1000);
    }
  };

  const toggleAccordion = (id: string) => {
    setExpandedAccordions(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sticky CTA Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 dark:bg-gray-900/95 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium">
                Potential Annual Savings: 
                <span className="text-2xl font-bold text-green-600 ml-2">
                  ${animatedSavings.toLocaleString()}
                </span>
              </div>
              {step >= 3 && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Analysis Complete
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              {step < 4 ? (
                <Button 
                  onClick={handleNextStep}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                >
                  {step === 0 && 'Start Analysis'}
                  {step === 1 && 'Detect Drift'}
                  {step === 2 && 'Calculate Savings'}
                  {step === 3 && 'View Results'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                >
                  Apply Trades
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 p-4 pb-24">
        
        {/* Header with Mode Toggle */}
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
            
            {/* Headline KPI */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-green-600 mb-2">
                Save ${totalAnnualSavings.toLocaleString()} per year
              </div>
              <div className="text-lg text-muted-foreground">
                AI-powered tax optimization for your $100K portfolio
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center justify-center gap-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="power-mode" className="text-sm font-medium">
                  Standard Mode
                </Label>
              </div>
              <Switch
                id="power-mode"
                checked={isPowerMode}
                onCheckedChange={setIsPowerMode}
              />
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="power-mode" className="text-sm font-medium">
                  Power Mode
                </Label>
              </div>
              {isPowerMode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4 text-xs"
                  onClick={() => toggleAccordion('assumptions')}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Assumptions
                </Button>
              )}
            </div>

            {/* Assumptions Panel (Power Mode) */}
            {isPowerMode && expandedAccordions.includes('assumptions') && (
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg">Editable Assumptions</CardTitle>
                  <CardDescription>Adjust these values to see real-time impact on your savings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tax Bracket: {taxBracket[0]}%</Label>
                      <Slider
                        value={taxBracket}
                        onValueChange={setTaxBracket}
                        max={37}
                        min={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>10%</span>
                        <span>37%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Portfolio Turnover: {turnoverRate[0]}%</Label>
                      <Slider
                        value={turnoverRate}
                        onValueChange={setTurnoverRate}
                        max={100}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg font-semibold">Portfolio Analysis Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step >= stepNum - 1 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110' 
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}>
                    {step > stepNum - 1 ? <CheckCircle className="h-6 w-6" /> : stepNum}
                  </div>
                  {stepNum < 4 && (
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
                {step === 0 && "Ready to Analyze"}
                {step === 1 && "Portfolio Snapshot"}
                {step === 2 && "Drift Detection"}
                {step === 3 && "Tax Optimization"}
                {step === 4 && "Complete Analysis"}
              </p>
              <p className="text-sm text-muted-foreground">
                {step === 0 && "Click 'Start Analysis' to begin your portfolio review"}
                {step === 1 && "Examining your $100K portfolio allocation and performance"}
                {step === 2 && "Identifying portfolio drift and rebalancing opportunities"}
                {step === 3 && "Computing tax optimization and savings potential"}
                {step === 4 && "🎉 Your comprehensive portfolio analysis is ready!"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Snapshot - Side-by-Side Cards */}
        {step >= 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Current Portfolio */}
            <Card className="transition-all duration-500 hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    <CardTitle>Current Portfolio</CardTitle>
                  </div>
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    ${Math.round(currentTaxDrag).toLocaleString()} tax drag
                  </Badge>
                </div>
                <CardDescription>$100,000 • Typical allocation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Portfolio Donut Chart */}
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
                <div className="space-y-3">
                  {currentPortfolio.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: asset.color }} />
                        <div>
                          <div className="font-medium text-sm">{asset.name}</div>
                          <div className="text-xs text-muted-foreground">{asset.percentage}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${asset.value.toLocaleString()}</div>
                        <div className="text-red-500 text-xs">
                          {asset.taxDrag}% drag
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Details Accordion (Standard Mode) */}
                {!isPowerMode && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => toggleAccordion('current-details')}
                  >
                    {expandedAccordions.includes('current-details') ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show Details
                      </>
                    )}
                  </Button>
                )}

                {/* Expanded Details */}
                {(isPowerMode || expandedAccordions.includes('current-details')) && (
                  <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        Tax Drag Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Annual tax cost breakdown by asset class:
                      </div>
                      {currentPortfolio.map((asset, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{asset.name}:</span>
                          <span className="font-medium text-red-600">
                            ${(asset.value * asset.taxDrag / 100).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between font-semibold text-red-600">
                        <span>Total Annual Tax Drag:</span>
                        <span>${Math.round(currentTaxDrag).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

              </CardContent>
            </Card>

            {/* Optimized Portfolio */}
            <Card className="transition-all duration-500 hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    <CardTitle>Optimized Portfolio</CardTitle>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    ${Math.round(optimizedTaxDrag).toLocaleString()} tax drag
                  </Badge>
                </div>
                <CardDescription>$100,000 • Tax-optimized allocation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
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
                <div className="space-y-3">
                  {optimizedPortfolio.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: asset.color }} />
                        <div>
                          <div className="font-medium text-sm">{asset.name}</div>
                          <div className="text-xs text-muted-foreground">{asset.percentage}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${asset.value.toLocaleString()}</div>
                        <div className="text-green-500 text-xs">
                          {asset.taxDrag}% drag
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Efficiency Gain Badge */}
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
                  <CardContent className="text-center p-4">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {Math.round(((currentTaxDrag - optimizedTaxDrag) / currentTaxDrag) * 100)}%
                    </div>
                    <div className="text-sm font-medium text-green-700">
                      Efficiency Gain
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      vs. current annual tax cost
                    </div>
                  </CardContent>
                </Card>

              </CardContent>
            </Card>
          </div>
        )}

        {/* Drift Alerts */}
        {step >= 2 && (
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <CardTitle>Drift Alerts</CardTitle>
                </div>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  {driftAlerts.length} active alerts
                </Badge>
              </div>
              <CardDescription className="text-base">
                Portfolio has drifted from target allocation • Recommended action: Rebalance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Drift Alert Cards */}
              <div className="grid gap-4">
                {driftAlerts
                  .sort((a, b) => b.dollarImpact - a.dollarImpact)
                  .map((alert, index) => (
                    <Card key={index} className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: alert.color }}
                            />
                            <div>
                              <p className="font-semibold">{alert.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {alert.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              ${alert.dollarImpact.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Impact
                            </div>
                          </div>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Rebalancing Recommendations */}
              {!isPowerMode && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toggleAccordion('rebalancing')}
                >
                  {expandedAccordions.includes('rebalancing') ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Rebalancing Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show Rebalancing Details
                    </>
                  )}
                </Button>
              )}

              {(isPowerMode || expandedAccordions.includes('rebalancing')) && (
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      Recommended Trades
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-red-200 bg-red-50/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-red-800 flex items-center gap-2">
                            <TrendingDown className="h-4 w-4" />
                            Sell Positions
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Large Cap Stocks</span>
                            <span className="font-medium">-$5,000</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Bonds</span>
                            <span className="font-medium">-$5,000</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-green-200 bg-green-50/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-green-800 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Buy Positions
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Small Cap Stocks</span>
                            <span className="font-medium">+$5,000</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>International</span>
                            <span className="font-medium">+$5,000</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              )}

            </CardContent>
          </Card>
        )}

        {/* Tax Optimization */}
        {step >= 3 && (
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-green-600" />
                  <CardTitle>Tax Optimization</CardTitle>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200 text-lg px-4 py-2">
                  ${totalAnnualSavings.toLocaleString()} Annual Savings
                </Badge>
              </div>
              <CardDescription className="text-base">
                AI-powered analysis identifies significant tax reduction opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
                  <CardContent className="text-center p-6">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${Math.round(annualTaxSavings).toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-green-700">
                      Tax Drag Reduction
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Annual portfolio optimization
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
                  <CardContent className="text-center p-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ${Math.round(taxLossHarvestingValue).toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-blue-700">
                      Tax-Loss Harvesting
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Immediate opportunity
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
                  <CardContent className="text-center p-6">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {Math.round(((currentTaxDrag - optimizedTaxDrag) / currentTaxDrag) * 100)}%
                    </div>
                    <div className="text-sm font-medium text-purple-700">
                      Efficiency Gain
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Portfolio improvement
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tax Calculation Details */}
              {!isPowerMode && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toggleAccordion('tax-math')}
                >
                  {expandedAccordions.includes('tax-math') ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Tax Calculation
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show Tax Calculation
                    </>
                  )}
                </Button>
              )}

              {(isPowerMode || expandedAccordions.includes('tax-math')) && (
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      How We Calculate Your ${totalAnnualSavings.toLocaleString()} Tax Savings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Tax Drag Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-red-200 bg-red-50/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-red-800">Current Tax Drag</CardTitle>
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
                            <span>Total:</span>
                            <span>${Math.round(currentTaxDrag).toLocaleString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-green-200 bg-green-50/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-green-800">Optimized Tax Drag</CardTitle>
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
                            <span>Total:</span>
                            <span>${Math.round(optimizedTaxDrag).toLocaleString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Final Calculation */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 p-6 rounded-lg">
                      <div className="text-center space-y-3">
                        <div className="text-lg font-semibold">Total Annual Tax Savings</div>
                        <div className="text-sm text-muted-foreground">
                          Tax Drag Reduction + Tax-Loss Harvesting
                        </div>
                        <div className="text-xl font-bold">
                          ${Math.round(annualTaxSavings).toLocaleString()} + ${Math.round(taxLossHarvestingValue).toLocaleString()} = 
                          <span className="text-green-600 ml-2">${totalAnnualSavings.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            </CardContent>
          </Card>
        )}

        {/* Smart Strategies */}
        {step >= 4 && (
          <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                  <CardTitle>Smart Strategies</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {isPowerMode && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export CSV
                    </Button>
                  )}
                  <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                    {smartStrategies.filter(s => s.selected).length} selected
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-base">
                AI-recommended strategies sorted by dollar impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Strategy Cards */}
              <div className="grid gap-4">
                {smartStrategies
                  .sort((a, b) => b.dollarImpact - a.dollarImpact)
                  .map((strategy, index) => (
                    <Card key={index} className={`border-l-4 hover:shadow-md transition-all ${
                      strategy.selected ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-l-gray-300'
                    }`}>
                      <CardContent className="flex items-start gap-4 p-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={strategy.selected}
                            className="w-4 h-4 rounded border-gray-300"
                            readOnly
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{strategy.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {strategy.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {strategy.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-green-600">
                            ${strategy.dollarImpact.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Annual savings
                          </div>
                          <Badge className={getSeverityColor(strategy.severity)}>
                            {strategy.severity} impact
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Power Mode Features */}
              {isPowerMode && (
                <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5 text-purple-600" />
                      Advanced Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" size="sm">
                        <Calculator className="h-4 w-4 mr-2" />
                        Simulate Partial
                      </Button>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Back-test 3 Years
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Schedule Recurring
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </CardContent>
          </Card>
        )}

        {/* Compliance & Trust */}
        <Alert className="bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <Shield className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-300">
            Important Disclaimers
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed space-y-2">
            <p>
              <strong>Projected/Hypothetical:</strong> All dollar projections and savings estimates are hypothetical and based on historical data. 
              Actual results may vary significantly based on market conditions, tax law changes, and individual circumstances.
            </p>
            <p>
              <strong>Suitability Notice:</strong> The recommended trades and strategies shown are for demonstration purposes only. 
              Please consult with a qualified financial advisor before making any investment decisions.
            </p>
            <p>
              <strong>Tax Advice:</strong> This analysis does not constitute tax advice. Consult with a tax professional regarding your specific situation.
            </p>
          </AlertDescription>
        </Alert>

      </div>
    </div>
  );
}
