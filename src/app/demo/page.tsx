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
  ChevronUp,
  ArrowUpDown,
  Clock,
  Building,
  Banknote,
  RefreshCw
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

/**
 * AlphaOptimize Demo - Minimalistic Design
 * Elegant color palette with clean, sophisticated aesthetics
 */
export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showPortfolioAnalysis, setShowPortfolioAnalysis] = useState(false);
  const [showTradeExecution, setShowTradeExecution] = useState(false);
  const [isPowerMode, setIsPowerMode] = useState(false);
  const [taxBracket, setTaxBracket] = useState([24]);
  const [turnoverRate, setTurnoverRate] = useState([15]);
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([]);
  const [animatedSavings, setAnimatedSavings] = useState(0);

  // Elegant, minimalistic color palette
  const ASSET_COLORS = {
    stocks: '#334155',        // Slate 700
    bonds: '#475569',         // Slate 600
    international: '#64748B', // Slate 500
    alternatives: '#94A3B8',  // Slate 400
    cash: '#CBD5E1',          // Slate 300
    taxEfficient: '#059669',  // Emerald 600
    municipal: '#0D9488',     // Teal 600
    reit: '#7C3AED'          // Violet 600
  };

  // Demo portfolio data
  const currentPortfolio = [
    { name: 'Large Cap Stocks', value: 45000, percentage: 45, color: ASSET_COLORS.stocks, taxDrag: 2.1 },
    { name: 'Small Cap Stocks', value: 15000, percentage: 15, color: ASSET_COLORS.stocks, taxDrag: 2.8 },
    { name: 'International Stocks', value: 20000, percentage: 20, color: ASSET_COLORS.international, taxDrag: 1.9 },
    { name: 'Bonds', value: 15000, percentage: 15, color: ASSET_COLORS.bonds, taxDrag: 3.2 },
    { name: 'Cash & Money Market', value: 5000, percentage: 5, color: ASSET_COLORS.cash, taxDrag: 4.1 }
  ];

  const optimizedPortfolio = [
    { name: 'Large Cap Stocks', value: 40000, percentage: 40, color: ASSET_COLORS.stocks, taxDrag: 2.1 },
    { name: 'Small Cap Stocks', value: 20000, percentage: 20, color: ASSET_COLORS.stocks, taxDrag: 2.8 },
    { name: 'International Stocks', value: 25000, percentage: 25, color: ASSET_COLORS.international, taxDrag: 1.9 },
    { name: 'Bonds', value: 10000, percentage: 10, color: ASSET_COLORS.bonds, taxDrag: 3.2 },
    { name: 'Cash & Money Market', value: 5000, percentage: 5, color: ASSET_COLORS.cash, taxDrag: 4.1 }
  ];

  // Trade execution plan - focused on rebalancing and asset location
  const tradeExecutionPlan = [
    {
      order: 1,
      type: 'Rebalance',
      action: 'SELL',
      asset: 'Large Cap Stocks',
      amount: 5000,
      account: 'Taxable Brokerage',
      reason: 'Reduce overweight position from 45% to target 40%',
      taxImpact: 'Harvest $1,200 in losses',
      timing: 'Immediate',
      priority: 'high'
    },
    {
      order: 2,
      type: 'Rebalance',
      action: 'BUY',
      asset: 'Small Cap Stocks',
      amount: 5000,
      account: 'Taxable Brokerage',
      reason: 'Increase underweight position from 15% to target 20%',
      taxImpact: 'No tax impact (purchase)',
      timing: 'After step 1',
      priority: 'high'
    },
    {
      order: 3,
      type: 'Rebalance',
      action: 'SELL',
      asset: 'Bonds',
      amount: 5000,
      account: 'Taxable Brokerage',
      reason: 'Reduce overweight position from 15% to target 10%',
      taxImpact: 'Minimal gains on bond holdings',
      timing: 'Immediate',
      priority: 'medium'
    },
    {
      order: 4,
      type: 'Rebalance',
      action: 'BUY',
      asset: 'International Stocks',
      amount: 5000,
      account: 'Taxable Brokerage',
      reason: 'Increase underweight position from 20% to target 25%',
      taxImpact: 'No tax impact (purchase)',
      timing: 'After step 3',
      priority: 'medium'
    },
    {
      order: 5,
      type: 'Asset Location',
      action: 'MOVE',
      asset: 'High-Dividend Stocks (portion of Large Cap)',
      amount: 8000,
      account: 'Taxable → 401(k)',
      reason: 'Move dividend-heavy holdings to tax-deferred account',
      taxImpact: 'Eliminates $320/year in dividend taxes',
      timing: 'Next 401(k) contribution',
      priority: 'high'
    },
    {
      order: 6,
      type: 'Asset Location',
      action: 'MOVE',
      asset: 'Bond Holdings',
      amount: 6000,
      account: 'Taxable → Traditional IRA',
      reason: 'Move tax-inefficient bonds to tax-deferred account',
      taxImpact: 'Eliminates $192/year in interest taxes',
      timing: 'Next rollover opportunity',
      priority: 'medium'
    }
  ];

  // Enhanced drift alerts with more detail
  const driftAlerts = [
    { 
      name: 'Large Cap Overweight', 
      severity: 'high', 
      dollarImpact: 2400, 
      drift: 5, 
      color: ASSET_COLORS.stocks,
      description: 'Portfolio is 5% overweight in large cap stocks',
      currentAllocation: 45,
      targetAllocation: 40,
      dollarsOverweight: 5000,
      actionRequired: 'Sell $5,000 of large cap holdings',
      riskLevel: 'High concentration risk',
      timeframe: 'Rebalance within 30 days'
    },
    { 
      name: 'Small Cap Underweight', 
      severity: 'medium', 
      dollarImpact: 1200, 
      drift: -5, 
      color: ASSET_COLORS.stocks,
      description: 'Portfolio is 5% underweight in small cap stocks',
      currentAllocation: 15,
      targetAllocation: 20,
      dollarsOverweight: -5000,
      actionRequired: 'Buy $5,000 of small cap holdings',
      riskLevel: 'Missing growth potential',
      timeframe: 'Rebalance within 60 days'
    },
    { 
      name: 'International Underweight', 
      severity: 'medium', 
      dollarImpact: 800, 
      drift: -5, 
      color: ASSET_COLORS.international,
      description: 'Portfolio is 5% underweight in international stocks',
      currentAllocation: 20,
      targetAllocation: 25,
      dollarsOverweight: -5000,
      actionRequired: 'Buy $5,000 of international holdings',
      riskLevel: 'Reduced diversification',
      timeframe: 'Rebalance within 90 days'
    },
    {
      name: 'Bond Overweight',
      severity: 'low',
      dollarImpact: 400,
      drift: 5,
      color: ASSET_COLORS.bonds,
      description: 'Portfolio is 5% overweight in bonds',
      currentAllocation: 15,
      targetAllocation: 10,
      dollarsOverweight: 5000,
      actionRequired: 'Sell $5,000 of bond holdings',
      riskLevel: 'Lower expected returns',
      timeframe: 'Rebalance within 120 days'
    }
  ];

  // Calculate tax savings
  const currentTaxDrag = currentPortfolio.reduce((sum, asset) => 
    sum + (asset.value * asset.taxDrag / 100), 0
  );
  const optimizedTaxDrag = optimizedPortfolio.reduce((sum, asset) => 
    sum + (asset.value * asset.taxDrag / 100), 0
  );
  const annualTaxSavings = (currentTaxDrag - optimizedTaxDrag) * (taxBracket[0] / 24);
  const taxLossHarvestingValue = 1825 * (taxBracket[0] / 100);
  const totalAnnualSavings = Math.round(annualTaxSavings + taxLossHarvestingValue);

  // Smart strategies
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

  const handleApplyChanges = () => {
    setShowTradeExecution(true);
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
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'low': return 'bg-slate-100 text-slate-800 border-slate-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'SELL': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'BUY': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'MOVE': return <ArrowUpDown className="h-4 w-4 text-blue-600" />;
      default: return <RefreshCw className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Minimalistic Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 dark:bg-gray-900/95 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Projected Annual Savings
              </div>
              <div className="text-3xl font-light text-gray-900 dark:text-gray-100">
                ${animatedSavings.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {step < 4 ? (
                <Button 
                  onClick={handleNextStep}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  {step === 0 && 'Begin Analysis'}
                  {step === 1 && 'Analyze Drift'}
                  {step === 2 && 'Optimize Taxes'}
                  {step === 3 && 'View Results'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleApplyChanges}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Apply Changes
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-12 p-6 pb-32">
        
        {/* Minimalistic Header */}
        <div className="text-center space-y-8 py-16">
          <div className="space-y-4">
            <h1 className="text-6xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
              AlphaOptimize
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light">
              Intelligent portfolio optimization
            </p>
          </div>
          
          {/* Clean KPI Display */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-2">
              ${totalAnnualSavings.toLocaleString()}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Annual tax savings potential
            </div>
          </div>

          {/* Elegant Mode Toggle */}
          <div className="flex items-center justify-center gap-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Standard
            </Label>
            <Switch
              checked={isPowerMode}
              onCheckedChange={setIsPowerMode}
              className="data-[state=checked]:bg-gray-900"
            />
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Professional
            </Label>
          </div>

          {/* Assumptions Panel (Professional Mode) */}
          {isPowerMode && (
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Assumptions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tax Bracket: {taxBracket[0]}%
                    </Label>
                    <Slider
                      value={taxBracket}
                      onValueChange={setTaxBracket}
                      max={37}
                      min={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Portfolio Turnover: {turnoverRate[0]}%
                    </Label>
                    <Slider
                      value={turnoverRate}
                      onValueChange={setTurnoverRate}
                      max={100}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Trade Execution Plan Modal */}
        {showTradeExecution && (
          <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <Card className="bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Trade Execution Plan
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                        {tradeExecutionPlan.length} trades
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTradeExecution(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Optimized sequence for implementing portfolio changes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Execution Summary */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-light text-blue-600 mb-1">
                          {tradeExecutionPlan.filter(t => t.priority === 'high').length}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          High Priority
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-light text-blue-600 mb-1">
                          ${tradeExecutionPlan.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          Total Value
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-light text-blue-600 mb-1">
                          7-14
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          Days to Complete
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trade List */}
                  <div className="space-y-4">
                    {tradeExecutionPlan.map((trade, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          
                          {/* Order Number */}
                          <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {trade.order}
                          </div>

                          {/* Trade Details */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getActionIcon(trade.action)}
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {trade.action} {trade.asset}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {trade.type} • ${trade.amount.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <Badge className={`${getPriorityColor(trade.priority)} text-xs`}>
                                {trade.priority} priority
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-gray-500 dark:text-gray-400">Account:</div>
                                <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {trade.account}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500 dark:text-gray-400">Timing:</div>
                                <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {trade.timing}
                                </div>
                              </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Reason:
                              </div>
                              <div className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                                {trade.reason}
                              </div>
                              <div className="text-sm font-medium text-emerald-600">
                                Tax Impact: {trade.taxImpact}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Asset Location Summary */}
                  <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-700">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <ArrowUpDown className="h-5 w-5 text-purple-600" />
                        Asset Location Strategy
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Optimizing tax efficiency by moving assets to appropriate account types
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Taxable Account
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <div>• Tax-efficient index funds</div>
                            <div>• Growth stocks (low dividends)</div>
                            <div>• Municipal bonds</div>
                            <div>• International stocks</div>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            401(k) / Traditional IRA
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <div>• High-dividend stocks</div>
                            <div>• Corporate bonds</div>
                            <div>• REITs</div>
                            <div>• Commodities</div>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Roth IRA
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <div>• High-growth small caps</div>
                            <div>• Emerging markets</div>
                            <div>• Alternative investments</div>
                            <div>• Highest expected return assets</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4">
                        <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                          Annual Tax Savings from Asset Location
                        </div>
                        <div className="text-2xl font-light text-emerald-600">
                          $512
                        </div>
                        <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                          By moving tax-inefficient assets to tax-advantaged accounts
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Execution Timeline */}
                  <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Implementation Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="text-sm">
                            <span className="font-medium">Days 1-2:</span> Execute tax-loss harvesting and high-priority rebalancing
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <div className="text-sm">
                            <span className="font-medium">Days 3-7:</span> Implement asset location moves and fund substitutions
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div className="text-sm">
                            <span className="font-medium">Days 8-14:</span> Complete remaining rebalancing and monitor settlement
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <Button
                      variant="outline"
                      onClick={() => setShowTradeExecution(false)}
                      className="px-6"
                    >
                      Review Later
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                    >
                      Execute Trades
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Clean Progress Indicator */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              {[0, 1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step >= stepNum 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > stepNum ? <CheckCircle className="h-5 w-5" /> : stepNum + 1}
                  </div>
                  {stepNum < 4 && (
                    <div className="flex-1 mx-4">
                      <div className={`h-0.5 transition-all duration-300 ${
                        step > stepNum ? 'bg-gray-900' : 'bg-gray-200'
                      }`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {step === 0 && "Ready to Begin"}
                {step === 1 && "Portfolio Analysis"}
                {step === 2 && "Drift Detection"}
                {step === 3 && "Tax Optimization"}
                {step === 4 && "Analysis Complete"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step === 0 && "Click 'Begin Analysis' to start your portfolio review"}
                {step === 1 && "Examining your portfolio allocation and performance"}
                {step === 2 && "Identifying drift and rebalancing opportunities"}
                {step === 3 && "Computing tax optimization strategies"}
                {step === 4 && "Your portfolio analysis is complete"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Comparison - Clean Side-by-Side */}
        {step >= 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Current Portfolio */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Current Portfolio
                  </CardTitle>
                  <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
                    Suboptimal weights
                  </Badge>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  $100,000 total value • Same assets, unoptimized allocation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Clean Chart */}
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
                        strokeWidth={0}
                      >
                        {currentPortfolio.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Clean Asset List */}
                <div className="space-y-3">
                  {currentPortfolio.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{asset.name}</div>
                          <div className="text-sm text-gray-500">{asset.percentage}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          ${asset.value.toLocaleString()}
                        </div>
                        <div className="text-sm text-red-600">
                          Risk/Return: Suboptimal
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </CardContent>
            </Card>

            {/* Optimized Portfolio */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Optimized Portfolio
                  </CardTitle>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                    Optimal weights
                  </Badge>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  $100,000 total value • Same assets, optimized allocation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Optimized Chart */}
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
                        strokeWidth={0}
                      >
                        {optimizedPortfolio.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Optimized Asset List */}
                <div className="space-y-3">
                  {optimizedPortfolio.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{asset.name}</div>
                          <div className="text-sm text-gray-500">{asset.percentage}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          ${asset.value.toLocaleString()}
                        </div>
                        <div className="text-sm text-emerald-600">
                          Risk/Return: Optimal
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Improvement Metric */}
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-light text-emerald-600 mb-1">
                    +1.2%
                  </div>
                  <div className="text-sm text-emerald-700 dark:text-emerald-400">
                    Expected annual return improvement
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Drift Alerts */}
        {step >= 2 && (
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Portfolio Drift Analysis
                </CardTitle>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
                  {driftAlerts.length} alerts
                </Badge>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Detailed drift detection and rebalancing recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Drift Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-light text-red-600 mb-1">
                    {driftAlerts.filter(a => a.severity === 'high').length}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-400">
                    High Priority
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-light text-amber-600 mb-1">
                    ${driftAlerts.reduce((sum, alert) => sum + alert.dollarImpact, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-400">
                    Total Impact
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-light text-blue-600 mb-1">
                    {Math.abs(driftAlerts.reduce((sum, alert) => sum + Math.abs(alert.dollarsOverweight), 0) / 1000)}K
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-400">
                    Rebalance Amount
                  </div>
                </div>
              </div>

              {/* Detailed Drift Cards */}
              <div className="space-y-4">
                {driftAlerts
                  .sort((a, b) => b.dollarImpact - a.dollarImpact)
                  .map((alert, index) => (
                    <Card key={index} className={`${getSeverityColor(alert.severity)} border`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: alert.color }} />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {alert.name}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {alert.description}
                              </div>
                            </div>
                          </div>
                          <Badge className={`${getSeverityColor(alert.severity)} text-xs`}>
                            {alert.severity}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Current vs Target</div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {alert.currentAllocation}% → {alert.targetAllocation}%
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Dollar Impact</div>
                            <div className="font-medium text-red-600">
                              ${alert.dollarImpact.toLocaleString()}/year
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Risk Level</div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {alert.riskLevel}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Timeframe</div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {alert.timeframe}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Recommended Action</div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {alert.actionRequired}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Drift Analysis Explanation */}
              <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-700">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    How We Detect Portfolio Drift
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    The mathematical analysis behind rebalancing recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Target vs Current Allocation */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                      Target vs Current Allocation Analysis
                    </div>
                    <div className="ml-8 space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        We compare your current allocation against your target allocation to identify drift:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="text-xs font-mono text-gray-500 mb-2">Current Allocation:</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Large Cap:</span>
                              <span className="font-medium">45%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Small Cap:</span>
                              <span className="font-medium">15%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">International:</span>
                              <span className="font-medium">20%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Bonds:</span>
                              <span className="font-medium">15%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Cash:</span>
                              <span className="font-medium">5%</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="text-xs font-mono text-gray-500 mb-2">Target Allocation:</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Large Cap:</span>
                              <span className="font-medium text-emerald-600">40%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Small Cap:</span>
                              <span className="font-medium text-emerald-600">20%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">International:</span>
                              <span className="font-medium text-emerald-600">25%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Bonds:</span>
                              <span className="font-medium text-emerald-600">10%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Cash:</span>
                              <span className="font-medium text-emerald-600">5%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drift Calculation */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                      Drift Impact Calculation
                    </div>
                    <div className="ml-8 space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        We calculate the dollar impact of each drift using expected returns and risk metrics:
                      </p>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-mono text-gray-500 mb-2">Drift Impact Analysis:</div>
                        <div className="space-y-3">
                          <div className="border-b border-gray-200 dark:border-gray-600 pb-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Large Cap Overweight:</span>
                              <span className="font-medium">45% - 40% = +5%</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                              <span>Opportunity Cost: 5% × $100K × 4.8% expected return difference</span>
                              <span className="font-medium text-red-600">-$2,400/year</span>
                            </div>
                          </div>
                          <div className="border-b border-gray-200 dark:border-gray-600 pb-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Small Cap Underweight:</span>
                              <span className="font-medium">15% - 20% = -5%</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                              <span>Missed Opportunity: 5% × $100K × 2.4% expected return difference</span>
                              <span className="font-medium text-red-600">-$1,200/year</span>
                            </div>
                          </div>
                          <div className="border-b border-gray-200 dark:border-gray-600 pb-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-700 dark:text-gray-300">International Underweight:</span>
                              <span className="font-medium">20% - 25% = -5%</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                              <span>Diversification Cost: 5% × $100K × 1.6% expected return difference</span>
                              <span className="font-medium text-red-600">-$800/year</span>
                            </div>
                          </div>
                          <div className="pt-2">
                            <div className="flex justify-between items-center font-semibold text-red-600">
                              <span>Total Annual Drift Cost:</span>
                              <span>$4,400</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rebalancing Solution */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                      Optimal Rebalancing Strategy
                    </div>
                    <div className="ml-8 space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        We calculate the most tax-efficient way to rebalance your portfolio:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                          <div className="text-xs font-mono text-red-700 dark:text-red-300 mb-2">Sell (Overweight):</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Large Cap Stocks:</span>
                              <span className="font-medium text-red-600">-$5,000</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Bonds:</span>
                              <span className="font-medium text-red-600">-$5,000</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Tax Impact: Minimal (using tax-loss harvesting)
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                          <div className="text-xs font-mono text-green-700 dark:text-green-300 mb-2">Buy (Underweight):</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Small Cap Stocks:</span>
                              <span className="font-medium text-green-600">+$5,000</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">International:</span>
                              <span className="font-medium text-green-600">+$5,000</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Expected Return Boost: +$4,400/year
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Complexity Callout */}
                  <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-700">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                          <Calculator className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-purple-800 dark:text-purple-200 mb-1">
                            Complex Analysis Made Simple
                          </div>
                          <div className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                            This drift analysis considers 47 different factors including expected returns, correlation matrices, 
                            tax implications, transaction costs, and market conditions. Most investors would need specialized 
                            software and significant time to perform this analysis manually.
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </CardContent>
              </Card>

            </CardContent>
          </Card>
        )}

        {/* Clean Tax Optimization */}
        {step >= 3 && (
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Tax Optimization
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Strategies to reduce your tax burden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Clean Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-3xl font-light text-gray-900 dark:text-gray-100 mb-2">
                    ${Math.round(annualTaxSavings).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Portfolio optimization
                  </div>
                </div>
                
                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-3xl font-light text-gray-900 dark:text-gray-100 mb-2">
                    ${Math.round(taxLossHarvestingValue).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tax-loss harvesting
                  </div>
                </div>
                
                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-3xl font-light text-gray-900 dark:text-gray-100 mb-2">
                    {Math.round(((currentTaxDrag - optimizedTaxDrag) / currentTaxDrag) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Efficiency gain
                  </div>
                </div>
              </div>

              {/* Mathematical Explanation */}
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-700">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    Portfolio Weight Optimization Explained
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    How we calculate optimal allocation weights for maximum risk-adjusted returns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Step 1: Risk-Return Analysis */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                      Risk-Return Profile Analysis
                    </div>
                    <div className="ml-8 space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        We analyze the expected return and risk for each asset class in your portfolio:
                      </p>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-mono text-gray-500 mb-2">Asset Class Risk-Return Metrics:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Large Cap Stocks:</span>
                              <span className="font-medium">10.2% return, 16.1% risk</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Small Cap Stocks:</span>
                              <span className="font-medium">12.1% return, 20.9% risk</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">International Stocks:</span>
                              <span className="font-medium">8.7% return, 17.8% risk</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Bonds:</span>
                              <span className="font-medium">4.2% return, 6.1% risk</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Cash:</span>
                              <span className="font-medium">2.1% return, 1.0% risk</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Risk measured as standard deviation
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Correlation Analysis */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                      Asset Correlation Analysis
                    </div>
                    <div className="ml-8 space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        We calculate how different assets move together to optimize diversification:
                      </p>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-mono text-gray-500 mb-2">Correlation Matrix (selected pairs):</div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">Large Cap ↔ Small Cap:</span>
                            <span className="font-medium">0.82 (high correlation)</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">US Stocks ↔ International:</span>
                            <span className="font-medium">0.71 (moderate correlation)</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">Stocks ↔ Bonds:</span>
                            <span className="font-medium">0.15 (low correlation)</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Lower correlation = better diversification benefit
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Optimization Calculation */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                      Modern Portfolio Theory Optimization
                    </div>
                    <div className="ml-8 space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        We use mathematical optimization to find the allocation that maximizes your Sharpe ratio:
                      </p>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-sm space-y-3">
                          <div className="border-b border-gray-200 dark:border-gray-600 pb-2">
                            <div className="font-medium mb-1">Current Portfolio Performance:</div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300">Expected Return:</span>
                              <span className="font-medium">8.9%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300">Portfolio Risk:</span>
                              <span className="font-medium">14.2%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300">Sharpe Ratio:</span>
                              <span className="font-medium text-red-600">0.47</span>
                            </div>
                          </div>
                          <div className="pt-2">
                            <div className="font-medium mb-1">Optimized Portfolio Performance:</div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300">Expected Return:</span>
                              <span className="font-medium">10.1%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300">Portfolio Risk:</span>
                              <span className="font-medium">14.2%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300">Sharpe Ratio:</span>
                              <span className="font-medium text-emerald-600">0.54</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Weight Changes */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">4</div>
                      Optimal Weight Allocation
                    </div>
                    <div className="ml-8 space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        The optimization algorithm determines these weight changes:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                          <div className="text-xs font-mono text-red-700 dark:text-red-300 mb-2">Reduce Weights:</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Large Cap:</span>
                              <span className="font-medium text-red-600">45% → 40% (-5%)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Bonds:</span>
                              <span className="font-medium text-red-600">15% → 10% (-5%)</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Overweight positions reducing efficiency
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                          <div className="text-xs font-mono text-green-700 dark:text-green-300 mb-2">Increase Weights:</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Small Cap:</span>
                              <span className="font-medium text-green-600">15% → 20% (+5%)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">International:</span>
                              <span className="font-medium text-green-600">20% → 25% (+5%)</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Underweight positions with better risk-adjusted returns
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Final Result */}
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-xl p-6">
                    <div className="text-center space-y-4">
                      <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Optimization Result
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Same assets, better allocation
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-light text-emerald-600">
                            +1.2%
                          </div>
                          <div className="text-xs text-gray-500">
                            Annual return improvement
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-light text-blue-600">
                            +15%
                          </div>
                          <div className="text-xs text-gray-500">
                            Sharpe ratio improvement
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* No Stock Picking Callout */}
                  <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-700">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                          <Shield className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-purple-800 dark:text-purple-200 mb-1">
                            We Don't Pick Stocks for You
                          </div>
                          <div className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                            AlphaOptimize focuses on portfolio allocation optimization, not individual security selection. 
                            We work with your existing holdings to find the mathematically optimal weights that maximize 
                            your risk-adjusted returns while minimizing taxes.
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </CardContent>
              </Card>

            </CardContent>
          </Card>
        )}

        {/* Portfolio Tracking Section */}
        {step >= 4 && (
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Continuous Portfolio Tracking
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Monitor your portfolio performance with real-time analytics and visualizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Key Metrics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-light text-blue-600 mb-1">
                    10.1%
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-400">
                    Current Return
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-light text-green-600 mb-1">
                    0.54
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-400">
                    Sharpe Ratio
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-light text-purple-600 mb-1">
                    14.2%
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-400">
                    Portfolio Risk
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-light text-amber-600 mb-1">
                    2.1%
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-400">
                    Drift Alert
                  </div>
                </div>
              </div>

              {/* Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Portfolio Performance Chart */}
                <Card className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100">
                      Portfolio Performance
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      12-month performance vs benchmark
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { month: 'Jan', portfolio: 100, benchmark: 100 },
                          { month: 'Feb', portfolio: 102, benchmark: 101 },
                          { month: 'Mar', portfolio: 105, benchmark: 103 },
                          { month: 'Apr', portfolio: 103, benchmark: 102 },
                          { month: 'May', portfolio: 108, benchmark: 105 },
                          { month: 'Jun', portfolio: 110, benchmark: 107 },
                          { month: 'Jul', portfolio: 112, benchmark: 108 },
                          { month: 'Aug', portfolio: 109, benchmark: 106 },
                          { month: 'Sep', portfolio: 114, benchmark: 109 },
                          { month: 'Oct', portfolio: 116, benchmark: 111 },
                          { month: 'Nov', portfolio: 118, benchmark: 112 },
                          { month: 'Dec', portfolio: 121, benchmark: 114 }
                        ]}>
                          <XAxis dataKey="month" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="portfolio" 
                            stroke="#059669" 
                            strokeWidth={2}
                            dot={false}
                            name="Your Portfolio"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="benchmark" 
                            stroke="#6B7280" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Benchmark"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-emerald-600"></div>
                        <span className="text-gray-600 dark:text-gray-400">Your Portfolio: +21%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-gray-400 border-dashed"></div>
                        <span className="text-gray-600 dark:text-gray-400">Benchmark: +14%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Asset Allocation Drift Chart */}
                <Card className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100">
                      Allocation Drift Tracking
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Current vs target allocation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { asset: 'Large Cap', current: 45, target: 40, drift: 5 },
                          { asset: 'Small Cap', current: 15, target: 20, drift: -5 },
                          { asset: 'Intl', current: 20, target: 25, drift: -5 },
                          { asset: 'Bonds', current: 15, target: 10, drift: 5 },
                          { asset: 'Cash', current: 5, target: 5, drift: 0 }
                        ]}>
                          <XAxis dataKey="asset" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="current" fill="#64748B" name="Current %" />
                          <Bar dataKey="target" fill="#059669" name="Target %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-slate-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Current Allocation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Target Allocation</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Risk Metrics */}
              <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-950/20 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Risk Analytics
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Advanced risk metrics and portfolio analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Value at Risk (VaR)
                      </div>
                      <div className="text-2xl font-light text-gray-900 dark:text-gray-100">
                        -$12,400
                      </div>
                      <div className="text-xs text-gray-500">
                        95% confidence, 1-month horizon
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Beta vs S&P 500
                      </div>
                      <div className="text-2xl font-light text-gray-900 dark:text-gray-100">
                        0.89
                      </div>
                      <div className="text-xs text-gray-500">
                        Lower volatility than market
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Maximum Drawdown
                      </div>
                      <div className="text-2xl font-light text-gray-900 dark:text-gray-100">
                        -8.2%
                      </div>
                      <div className="text-xs text-gray-500">
                        Largest peak-to-trough decline
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Real-time Monitoring */}
                <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-700">
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-emerald-600" />
                      Real-time Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Portfolio Value</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">$121,340</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Daily Change</span>
                        <span className="font-medium text-emerald-600">+$2,150 (+1.8%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">2 minutes ago</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-emerald-200 dark:border-emerald-700">
                      <div className="text-xs text-emerald-700 dark:text-emerald-400">
                        ✓ Automatically synced with your brokerage accounts
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Smart Alerts */}
                <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-700">
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Smart Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Drift Alert
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Large cap allocation 5% above target
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Tax Opportunity
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            $3,200 in harvestable losses available
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Rebalance Due
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Quarterly rebalancing recommended
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Comprehensive Reporting */}
              <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-gray-600" />
                    Comprehensive Reporting
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Detailed analytics and insights for informed decision-making
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Performance Attribution
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div>• Asset allocation impact</div>
                        <div>• Security selection effect</div>
                        <div>• Timing contributions</div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Risk Decomposition
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div>• Factor exposure analysis</div>
                        <div>• Correlation breakdowns</div>
                        <div>• Stress test scenarios</div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Tax Efficiency
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div>• After-tax returns</div>
                        <div>• Tax-loss harvesting</div>
                        <div>• Asset location analysis</div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Benchmarking
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div>• Index comparisons</div>
                        <div>• Peer group analysis</div>
                        <div>• Risk-adjusted metrics</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Always-On Portfolio Intelligence
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                          AlphaOptimize continuously monitors your portfolio 24/7, providing real-time insights, 
                          automated drift detection, and proactive optimization recommendations. Never miss an 
                          opportunity to improve your portfolio's performance.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </CardContent>
          </Card>
        )}

        {/* Clean Strategies */}
        {step >= 4 && (
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Recommended Strategies
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Prioritized by potential impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {smartStrategies
                .sort((a, b) => b.dollarImpact - a.dollarImpact)
                .map((strategy, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {strategy.name}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {strategy.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {strategy.description}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-light text-gray-900 dark:text-gray-100">
                        ${strategy.dollarImpact.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Annual savings
                      </div>
                    </div>
                  </div>
                ))}

            </CardContent>
          </Card>
        )}

        {/* Clean Disclaimer */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong>Important:</strong> All projections are hypothetical and based on historical data. 
            Actual results may vary. Please consult with a qualified financial advisor.
          </div>
        </div>

      </div>
    </div>
  );
}
