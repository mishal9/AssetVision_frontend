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
 * Showcases all the key features of Asset Vision with interactive elements
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
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              AI-Powered Portfolio Management
            </div>
            
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Asset Vision
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Experience the future of investment management with our comprehensive demo. 
              Discover portfolio optimization, tax strategies, real-time alerts, and AI-powered insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={() => handleStartDemo('overview')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Interactive Demo
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleGetStarted}
                className="px-8 py-3 text-lg"
              >
                Get Started Free
              </Button>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <Badge variant="secondary" className="px-3 py-1">
                <Shield className="h-3 w-3 mr-1" />
                Bank-level Security
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Zap className="h-3 w-3 mr-1" />
                Real-time Updates
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Bot className="h-3 w-3 mr-1" />
                AI Assistant
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Smartphone className="h-3 w-3 mr-1" />
                Mobile Optimized
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Selection */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Our Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Choose a demo to see Asset Vision in action
            </p>
          </div>
          
          <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
              <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
              <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
              <TabsTrigger value="alerts">Smart Alerts</TabsTrigger>
              <TabsTrigger value="tax">Tax Strategies</TabsTrigger>
              <TabsTrigger value="ai">AI Assistant</TabsTrigger>
            </TabsList>

            {/* Portfolio Overview Demo */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Portfolio Summary */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Portfolio Summary
                    </CardTitle>
                    <CardDescription>
                      Live portfolio performance and allocation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(demoPortfolio.totalValue)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          +{formatPercent(demoPortfolio.totalReturnPercent)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Return</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Today's Change</span>
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <ArrowUp className="h-4 w-4" />
                          +{formatCurrency(demoPortfolio.dayChange)} ({formatPercent(demoPortfolio.dayChangePercent)})
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Dividend Yield</span>
                        <span className="text-sm">{formatPercent(demoPortfolio.dividendYield)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Asset Allocation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Asset Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
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
                <CardHeader>
                  <CardTitle>Sector Allocation</CardTitle>
                  <CardDescription>
                    Distribution across market sectors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {demoPortfolio.sectorAllocation.map((sector, index) => (
                      <div key={sector.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium">{sector.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatPercent(sector.value)}
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 ${
                          sector.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {sector.change >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                          {formatPercent(Math.abs(sector.change))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Optimization Demo */}
            <TabsContent value="optimization" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    AI-Powered Portfolio Optimization
                  </CardTitle>
                  <CardDescription>
                    Advanced algorithms analyze your portfolio and suggest improvements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {demoOptimization.currentSharpe}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Current Sharpe Ratio</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {demoOptimization.optimizedSharpe}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Optimized Sharpe Ratio</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        -{formatPercent(demoOptimization.riskReduction)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Risk Reduction</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg mb-3">Optimization Suggestions</h4>
                    {demoOptimization.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium">{suggestion.action}</div>
                          <div className="text-sm text-green-600 dark:text-green-400">{suggestion.impact}</div>
                        </div>
                        <Button variant="outline" size="sm">
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Smart Alerts Demo */}
            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Smart Portfolio Alerts
                  </CardTitle>
                  <CardDescription>
                    Stay informed with intelligent notifications about your investments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demoAlerts.map((alert, index) => (
                      <div key={index} className={`flex items-center gap-4 p-4 rounded-lg border ${
                        alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                        alert.severity === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                        'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                      }`}>
                        <div className={`p-2 rounded-full ${
                          alert.severity === 'warning' ? 'bg-yellow-200 dark:bg-yellow-700' :
                          alert.severity === 'success' ? 'bg-green-200 dark:bg-green-700' :
                          'bg-blue-200 dark:bg-blue-700'
                        }`}>
                          {alert.severity === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
                           alert.severity === 'success' ? <CheckCircle className="h-4 w-4" /> :
                           <Bell className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{alert.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{alert.description}</div>
                        </div>
                        <Badge variant={alert.active ? 'default' : 'secondary'}>
                          {alert.active ? 'Active' : 'Resolved'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tax Strategies Demo */}
            <TabsContent value="tax" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Tax Loss Harvesting
                  </CardTitle>
                  <CardDescription>
                    Optimize your tax efficiency with intelligent harvesting strategies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(demoTaxSavings.ytdHarvested)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">YTD Harvested</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(demoTaxSavings.potentialSavings)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {demoTaxSavings.taxRate}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tax Rate</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Tax Loss Opportunities</h4>
                    {demoTaxSavings.opportunities.map((opportunity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium">{opportunity.symbol}</div>
                          <div className="text-sm text-red-600 dark:text-red-400">
                            Loss: {formatCurrency(opportunity.loss)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(opportunity.savings)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Tax Savings</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Assistant Demo */}
            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Portfolio Assistant
                  </CardTitle>
                  <CardDescription>
                    Get instant insights and answers about your investments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                        <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                          AssetVision AI
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          Hello! I'm your AI portfolio assistant. I can help you analyze your investments, 
                          identify opportunities, and answer questions about your portfolio. What would you like to know?
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
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
                          className="justify-start text-left h-auto py-2 px-3"
                          onClick={() => {
                            // Demo interaction
                            alert(`AI Demo: "${question}"\n\nIn the real app, I would analyze your portfolio data and provide detailed insights about this topic.`);
                          }}
                        >
                          <span className="text-sm">{question}</span>
                          <ChevronRight className="h-4 w-4 ml-auto" />
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
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Asset Vision?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Comprehensive features designed for modern investors
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Bot className="h-8 w-8" />,
                title: 'AI-Powered Insights',
                description: 'Get personalized investment recommendations and portfolio analysis using advanced AI algorithms.',
                color: 'text-blue-600 dark:text-blue-400'
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: 'Bank-Level Security',
                description: 'Your data is protected with enterprise-grade encryption and security protocols.',
                color: 'text-green-600 dark:text-green-400'
              },
              {
                icon: <LineChart className="h-8 w-8" />,
                title: 'Real-Time Analytics',
                description: 'Monitor your portfolio performance with live market data and instant updates.',
                color: 'text-purple-600 dark:text-purple-400'
              },
              {
                icon: <Calculator className="h-8 w-8" />,
                title: 'Tax Optimization',
                description: 'Maximize your after-tax returns with intelligent tax loss harvesting strategies.',
                color: 'text-orange-600 dark:text-orange-400'
              },
              {
                icon: <Bell className="h-8 w-8" />,
                title: 'Smart Alerts',
                description: 'Stay informed with customizable notifications about market movements and portfolio changes.',
                color: 'text-red-600 dark:text-red-400'
              },
              {
                icon: <Building2 className="h-8 w-8" />,
                title: 'Multi-Account Support',
                description: 'Connect multiple brokerage accounts for a unified view of your investments.',
                color: 'text-indigo-600 dark:text-indigo-400'
              }
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`${feature.color} mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Transform Your Investment Strategy?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of investors who trust Asset Vision to manage and optimize their portfolios.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
              >
                <ArrowRight className="mr-2 h-5 w-5" />
                Start Your Free Trial
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleTryLogin}
                className="px-8 py-3 text-lg"
              >
                <Eye className="mr-2 h-5 w-5" />
                Sign In to Dashboard
              </Button>
            </div>
            
            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              No credit card required • Free 14-day trial • Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 max-w-md mx-4">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Loading Demo...</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Setting up your interactive portfolio experience
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
