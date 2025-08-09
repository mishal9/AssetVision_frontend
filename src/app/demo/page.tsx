'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  PieChart, 
  Bell, 
  Bot, 
  DollarSign, 
  BarChart3, 
  Target, 
  Shield, 
  ArrowRight,
  PlayCircle,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Zap,
  Eye,
  Users,
  Building2,
  Calculator,
  LineChart,
  Smartphone,
  Globe,
  Lock,
  Star,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils/formatters';

/**
 * Demo Page Component
 * Showcases all the key features of AlphaOptimize with interactive elements
 */
export default function DemoPage() {
  const router = useRouter();
  const [activeDemo, setActiveDemo] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  
  // Demo data for showcasing features
  const demoPortfolio = {
    totalValue: 67807.70,
    totalCost: 11800.00,
    totalReturn: 56007.70,
    totalReturnPercent: 474.64,
    dayChange: 1247.32,
    dayChangePercent: 1.87,
    dividendYield: 0.17,
    assetAllocation: {
      equity: 100.0,
      bond: 0.0,
      cash: 0.0,
      alternatives: 0.0
    },
    sectorAllocation: [
      { name: 'Technology', value: 28.49, change: 2.3 },
      { name: 'Communication Services', value: 71.51, change: -0.8 }
    ],
    holdings: [
      { symbol: 'AAPL', shares: 15, value: 2850.00, change: 2.1 },
      { symbol: 'GOOGL', shares: 8, value: 1120.00, change: -1.2 },
      { symbol: 'MSFT', shares: 12, value: 4200.00, change: 1.8 }
    ]
  };

  const demoAlerts = [
    {
      type: 'drift',
      title: 'Portfolio Drift Alert',
      description: 'Technology sector is 8.5% above target allocation',
      severity: 'warning',
      active: true
    },
    {
      type: 'performance',
      title: 'Performance Milestone',
      description: 'Portfolio reached 15% annual return target',
      severity: 'success',
      active: true
    },
    {
      type: 'tax',
      title: 'Tax Loss Opportunity',
      description: 'Potential $2,340 tax savings available',
      severity: 'info',
      active: true
    }
  ];

  const demoOptimization = {
    currentSharpe: 1.42,
    optimizedSharpe: 1.68,
    expectedReturn: 12.4,
    optimizedReturn: 14.2,
    riskReduction: 15.3,
    suggestions: [
      { action: 'Rebalance Tech exposure', impact: '+0.8% expected return' },
      { action: 'Increase bond allocation', impact: '-12% portfolio volatility' },
      { action: 'Add international equity', impact: '+0.3% diversification benefit' }
    ]
  };

  const demoTaxSavings = {
    ytdHarvested: 3000,
    potentialSavings: 2340,
    taxRate: 24,
    opportunities: [
      { symbol: 'XYZ', loss: -1200, savings: 288 },
      { symbol: 'ABC', loss: -850, savings: 204 },
      { symbol: 'DEF', loss: -2100, savings: 504 }
    ]
  };

  // Animation effect for demo progression
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStartDemo = async (demoType: string) => {
    setIsLoading(true);
    setActiveDemo(demoType);
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const handleGetStarted = () => {
    router.push('/register');
  };

  const handleTryLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              AI-Powered Portfolio Management
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AlphaOptimize
              </span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0">
              Experience the future of investment management with our comprehensive demo. 
              Discover portfolio optimization, tax strategies, real-time alerts, and AI-powered insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4 sm:px-0">
              <Button 
                size="lg" 
                onClick={() => handleStartDemo('overview')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto"
              >
                <PlayCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Start Interactive Demo
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleGetStarted}
                className="px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto"
              >
                Get Started Free
              </Button>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8 px-4 sm:px-0">
              <Badge variant="secondary" className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm">
                <Shield className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">Bank-level Security</span>
                <span className="xs:hidden">Secure</span>
              </Badge>
              <Badge variant="secondary" className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm">
                <Zap className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">Real-time Updates</span>
                <span className="xs:hidden">Real-time</span>
              </Badge>
              <Badge variant="secondary" className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm">
                <Bot className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">AI Assistant</span>
                <span className="xs:hidden">AI</span>
              </Badge>
              <Badge variant="secondary" className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm">
                <Smartphone className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">Mobile Optimized</span>
                <span className="xs:hidden">Mobile</span>
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Selection */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Explore Our Features
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 px-4 sm:px-0">
              Choose a demo to see AlphaOptimize in action
            </p>
          </div>
          
          <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6 sm:mb-8 h-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <span className="hidden sm:inline">Portfolio Overview</span>
                <span className="sm:hidden">Portfolio</span>
              </TabsTrigger>
              <TabsTrigger value="optimization" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <span className="hidden sm:inline">AI Optimization</span>
                <span className="sm:hidden">AI Optimize</span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <span className="hidden sm:inline">Smart Alerts</span>
                <span className="sm:hidden">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="tax" className="text-xs sm:text-sm py-2 sm:py-2.5">
                <span className="hidden sm:inline">Tax Strategies</span>
                <span className="sm:hidden">Tax</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs sm:text-sm py-2 sm:py-2.5 col-span-2 sm:col-span-1">
                <span className="hidden sm:inline">AI Assistant</span>
                <span className="sm:hidden">AI Assistant</span>
              </TabsTrigger>
            </TabsList>

            {/* Portfolio Overview Demo */}
            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Portfolio Summary */}
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <PieChart className="h-4 w-4 sm:h-5 sm:w-5" />
                      Portfolio Summary
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Live portfolio performance and allocation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(demoPortfolio.totalValue)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Value</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                          +{formatPercent(demoPortfolio.totalReturnPercent)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Return</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                        <span className="text-sm font-medium">Today's Change</span>
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <ArrowUp className="h-4 w-4" />
                          <span className="text-sm">+{formatCurrency(demoPortfolio.dayChange)} ({formatPercent(demoPortfolio.dayChangePercent)})</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                        <span className="text-sm font-medium">Dividend Yield</span>
                        <span className="text-sm">{formatPercent(demoPortfolio.dividendYield)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Asset Allocation */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                      Asset Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Equity</span>
                        <span className="text-sm font-medium">100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Bonds</span>
                        <span className="text-sm font-medium">0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cash</span>
                        <span className="text-sm font-medium">0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sector Allocation */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Sector Allocation</CardTitle>
                  <CardDescription className="text-sm">
                    Distribution across market sectors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {demoPortfolio.sectorAllocation.map((sector, index) => (
                      <div key={sector.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">{sector.name}</div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {formatPercent(sector.value)}
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 ${
                          sector.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {sector.change >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                          <span className="text-xs sm:text-sm">{formatPercent(Math.abs(sector.change))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Optimization Demo */}
            <TabsContent value="optimization" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                    AI-Powered Portfolio Optimization
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Advanced algorithms analyze your portfolio and suggest improvements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {demoOptimization.currentSharpe}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Current Sharpe Ratio</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                        {demoOptimization.optimizedSharpe}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Optimized Sharpe Ratio</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:col-span-2 lg:col-span-1">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                        -{formatPercent(demoOptimization.riskReduction)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Risk Reduction</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-base sm:text-lg mb-3">Optimization Suggestions</h4>
                    {demoOptimization.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm sm:text-base">{suggestion.action}</div>
                          <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">{suggestion.impact}</div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Smart Alerts Demo */}
            <TabsContent value="alerts" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    Smart Portfolio Alerts
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Stay informed with intelligent notifications about your investments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {demoAlerts.map((alert, index) => (
                      <div key={index} className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border ${
                        alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                        alert.severity === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                        'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                      }`}>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`p-2 rounded-full flex-shrink-0 ${
                            alert.severity === 'warning' ? 'bg-yellow-200 dark:bg-yellow-700' :
                            alert.severity === 'success' ? 'bg-green-200 dark:bg-green-700' :
                            'bg-blue-200 dark:bg-blue-700'
                          }`}>
                            {alert.severity === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
                             alert.severity === 'success' ? <CheckCircle className="h-4 w-4" /> :
                             <Bell className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm sm:text-base">{alert.title}</div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{alert.description}</div>
                          </div>
                        </div>
                        <Badge variant={alert.active ? 'default' : 'secondary'} className="self-start sm:self-center">
                          {alert.active ? 'Active' : 'Resolved'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tax Strategies Demo */}
            <TabsContent value="tax" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
                    Tax Loss Harvesting
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Optimize your tax efficiency with intelligent harvesting strategies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(demoTaxSavings.ytdHarvested)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">YTD Harvested</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(demoTaxSavings.potentialSavings)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Potential Savings</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:col-span-2 lg:col-span-1">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {demoTaxSavings.taxRate}%
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tax Rate</div>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-semibold text-base sm:text-lg">Tax Loss Opportunities</h4>
                    {demoTaxSavings.opportunities.map((opportunity, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm sm:text-base">{opportunity.symbol}</div>
                          <div className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                            Loss: {formatCurrency(opportunity.loss)}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="font-medium text-green-600 dark:text-green-400 text-sm sm:text-base">
                            {formatCurrency(opportunity.savings)}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tax Savings</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Assistant Demo */}
            <TabsContent value="ai" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                    AI Portfolio Assistant
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Get instant insights and answers about your investments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full flex-shrink-0">
                        <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                          AlphaOptimize AI
                        </div>
                        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          Hello! I'm your AI portfolio assistant. I can help you analyze your investments, 
                          identify opportunities, and answer questions about your portfolio. What would you like to know?
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="text-sm font-medium mb-2">Try asking me:</div>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        'How is my portfolio performing?',
                        'What are my tax loss harvesting opportunities?',
                        'Should I rebalance my portfolio?',
                        'What\'s my sector allocation?',
                        'How much dividend income am I earning?'
                      ].map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="justify-start text-left h-auto py-2 sm:py-3 px-3 sm:px-4"
                          onClick={() => {
                            // Demo interaction
                            alert(`AI Demo: "${question}"\n\nIn the real app, I would analyze your portfolio data and provide detailed insights about this topic.`);
                          }}
                        >
                          <span className="text-xs sm:text-sm flex-1 min-w-0 text-left">{question}</span>
                          <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why Choose AlphaOptimize?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 px-4 sm:px-0">
              Comprehensive features designed for modern investors
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: <Bot className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: 'AI-Powered Insights',
                description: 'Get personalized investment recommendations and portfolio analysis using advanced AI algorithms.',
                color: 'text-blue-600 dark:text-blue-400'
              },
              {
                icon: <Shield className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: 'Bank-Level Security',
                description: 'Your data is protected with enterprise-grade encryption and security protocols.',
                color: 'text-green-600 dark:text-green-400'
              },
              {
                icon: <LineChart className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: 'Real-Time Analytics',
                description: 'Monitor your portfolio performance with live market data and instant updates.',
                color: 'text-purple-600 dark:text-purple-400'
              },
              {
                icon: <Calculator className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: 'Tax Optimization',
                description: 'Maximize your after-tax returns with intelligent tax loss harvesting strategies.',
                color: 'text-orange-600 dark:text-orange-400'
              },
              {
                icon: <Bell className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: 'Smart Alerts',
                description: 'Stay informed with customizable notifications about market movements and portfolio changes.',
                color: 'text-red-600 dark:text-red-400'
              },
              {
                icon: <Building2 className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: 'Multi-Account Support',
                description: 'Connect multiple brokerage accounts for a unified view of your investments.',
                color: 'text-indigo-600 dark:text-indigo-400'
              }
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className={`${feature.color} mb-3 sm:mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Ready to Transform Your Investment Strategy?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 px-4 sm:px-0">
              Join thousands of investors who trust AlphaOptimize to manage and optimize their portfolios.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto"
              >
                <ArrowRight className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Start Your Free Trial
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleTryLogin}
                className="px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto"
              >
                <Eye className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Sign In to Dashboard
              </Button>
            </div>
            
            <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4 sm:px-0">
              No credit card required • Free 14-day trial • Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 sm:p-8 max-w-sm sm:max-w-md mx-auto w-full">
            <div className="text-center">
              <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin mx-auto mb-3 sm:mb-4 text-blue-600" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Loading Demo...</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Setting up your interactive portfolio experience
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
