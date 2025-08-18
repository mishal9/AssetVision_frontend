/**
 * Demo Data Service
 * Provides realistic seeded data for demo mode
 * All data is sanitized and contains no PII
 */

import { LinkedAccount } from '@/store/userSlice';
import { Holding } from '@/store/portfolioSlice';
import { DriftData } from '@/store/portfolioSlice';

/**
 * Demo portfolio holdings with realistic data
 */
export const DEMO_HOLDINGS: Holding[] = [
  {
    symbol: 'AAPL',
    shares: '50',
    purchasePrice: 145.30,
    assetClass: 'stocks',
  },
  {
    symbol: 'MSFT',
    shares: '35',
    purchasePrice: 298.79,
    assetClass: 'stocks',
  },
  {
    symbol: 'GOOGL',
    shares: '15',
    purchasePrice: 2387.25,
    assetClass: 'stocks',
  },
  {
    symbol: 'AMZN',
    shares: '20',
    purchasePrice: 3201.45,
    assetClass: 'stocks',
  },
  {
    symbol: 'TSLA',
    shares: '25',
    purchasePrice: 842.67,
    assetClass: 'stocks',
  },
  {
    symbol: 'NVDA',
    shares: '12',
    purchasePrice: 487.23,
    assetClass: 'stocks',
  },
  {
    symbol: 'META',
    shares: '18',
    purchasePrice: 331.89,
    assetClass: 'stocks',
  },
  {
    symbol: 'NFLX',
    shares: '10',
    purchasePrice: 425.67,
    assetClass: 'stocks',
  },
  {
    symbol: 'VTI',
    shares: '100',
    purchasePrice: 218.45,
    assetClass: 'etf',
  },
  {
    symbol: 'BND',
    shares: '75',
    purchasePrice: 82.34,
    assetClass: 'bonds',
  },
];

/**
 * Demo linked accounts (Plaid data)
 */
export const DEMO_LINKED_ACCOUNTS: LinkedAccount[] = [
  {
    id: 'demo_account_1',
    institutionId: 'ins_demo_schwab',
    institutionName: 'Charles Schwab',
    accountName: 'Individual Taxable Account',
    accountMask: '4567',
    accountType: 'investment',
    connectionId: 'demo_connection_1',
    lastUpdated: new Date().toISOString(),
    status: 'active',
    balance: {
      available: 125000.00,
      current: 125000.00,
    },
  },
  {
    id: 'demo_account_2',
    institutionId: 'ins_demo_fidelity',
    institutionName: 'Fidelity Investments',
    accountName: 'Roth IRA',
    accountMask: '8901',
    accountType: 'ira',
    connectionId: 'demo_connection_2',
    lastUpdated: new Date().toISOString(),
    status: 'active',
    balance: {
      available: 87500.00,
      current: 87500.00,
    },
  },
];

/**
 * Demo portfolio performance data
 */
export const DEMO_PORTFOLIO_PERFORMANCE = {
  totalValue: 212500.00,
  totalReturn: 45230.75,
  totalReturnPercent: 27.08,
  dayChange: 1247.32,
  dayChangePercent: 0.59,
  weekChange: -2341.56,
  weekChangePercent: -1.09,
  monthChange: 8765.43,
  monthChangePercent: 4.31,
  yearChange: 32145.67,
  yearChangePercent: 17.84,
  dividendYield: 1.85,
  sharpeRatio: 1.42,
  maxDrawdown: -12.34,
  volatility: 18.67,
  beta: 1.08,
  alpha: 2.34,
};

/**
 * Demo asset allocation data
 */
export const DEMO_ASSET_ALLOCATION = {
  stocks: 78.5,
  bonds: 15.2,
  cash: 4.8,
  alternatives: 1.5,
};

/**
 * Demo sector allocation data
 */
export const DEMO_SECTOR_ALLOCATION = [
  { name: 'Technology', allocation: 32.4, value: 68850.00, change: 2.3 },
  { name: 'Healthcare', allocation: 15.7, value: 33362.50, change: -0.8 },
  { name: 'Financial Services', allocation: 12.3, value: 26137.50, change: 1.2 },
  { name: 'Consumer Cyclical', allocation: 11.8, value: 25075.00, change: 0.5 },
  { name: 'Communication Services', allocation: 9.2, value: 19550.00, change: -1.4 },
  { name: 'Industrials', allocation: 8.1, value: 17212.50, change: 0.9 },
  { name: 'Energy', allocation: 5.4, value: 11475.00, change: 3.2 },
  { name: 'Utilities', allocation: 3.2, value: 6800.00, change: -0.3 },
  { name: 'Real Estate', allocation: 1.9, value: 4037.50, change: 0.7 },
];

/**
 * Demo drift data
 */
export const DEMO_DRIFT_DATA: { [key: string]: DriftData } = {
  asset_class: {
    portfolioId: 'demo_portfolio',
    portfolioName: 'Demo Portfolio',
    lastUpdated: new Date().toISOString(),
    totalAbsoluteDrift: 8.7,
    items: [
      {
        name: 'Stocks',
        currentAllocation: 78.5,
        targetAllocation: 75.0,
        absoluteDrift: 3.5,
        relativeDrift: 4.67,
      },
      {
        name: 'Bonds',
        currentAllocation: 15.2,
        targetAllocation: 20.0,
        absoluteDrift: -4.8,
        relativeDrift: -24.0,
      },
      {
        name: 'Cash',
        currentAllocation: 4.8,
        targetAllocation: 5.0,
        absoluteDrift: -0.2,
        relativeDrift: -4.0,
      },
      {
        name: 'Alternatives',
        currentAllocation: 1.5,
        targetAllocation: 0.0,
        absoluteDrift: 1.5,
        relativeDrift: 0,
      },
    ],
  },
  sector: {
    portfolioId: 'demo_portfolio',
    portfolioName: 'Demo Portfolio',
    lastUpdated: new Date().toISOString(),
    totalAbsoluteDrift: 12.3,
    items: [
      {
        name: 'Technology',
        currentAllocation: 32.4,
        targetAllocation: 25.0,
        absoluteDrift: 7.4,
        relativeDrift: 29.6,
      },
      {
        name: 'Healthcare',
        currentAllocation: 15.7,
        targetAllocation: 18.0,
        absoluteDrift: -2.3,
        relativeDrift: -12.78,
      },
      {
        name: 'Financial Services',
        currentAllocation: 12.3,
        targetAllocation: 15.0,
        absoluteDrift: -2.7,
        relativeDrift: -18.0,
      },
    ],
  },
};

/**
 * Demo alerts data
 */
export const DEMO_ALERTS = [
  {
    id: 'demo_alert_1',
    type: 'drift',
    title: 'Portfolio Drift Alert',
    description: 'Technology sector is 7.4% above target allocation',
    severity: 'warning' as const,
    active: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    triggeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'demo_alert_2',
    type: 'performance',
    title: 'Performance Milestone',
    description: 'Portfolio reached 25% annual return target',
    severity: 'success' as const,
    active: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    triggeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: 'demo_alert_3',
    type: 'tax',
    title: 'Tax Loss Opportunity',
    description: 'Potential $2,340 tax savings available through loss harvesting',
    severity: 'info' as const,
    active: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    triggeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'demo_alert_4',
    type: 'rebalance',
    title: 'Rebalancing Suggestion',
    description: 'Consider rebalancing to optimize risk-adjusted returns',
    severity: 'info' as const,
    active: false,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    triggeredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
];

/**
 * Demo tax loss harvesting opportunities
 */
export const DEMO_TAX_HARVESTING = {
  ytdHarvested: 8500.00,
  potentialSavings: 2340.00,
  taxRate: 24,
  opportunities: [
    {
      symbol: 'NFLX',
      currentValue: 3987.50,
      purchaseValue: 4256.70,
      loss: -269.20,
      taxSavings: 64.61,
      washSaleRisk: false,
    },
    {
      symbol: 'META',
      currentValue: 5689.20,
      purchaseValue: 5974.02,
      loss: -284.82,
      taxSavings: 68.36,
      washSaleRisk: false,
    },
    {
      symbol: 'TSLA',
      currentValue: 19845.75,
      purchaseValue: 21066.75,
      loss: -1221.00,
      taxSavings: 293.04,
      washSaleRisk: true,
    },
  ],
};

/**
 * Demo AI chat conversation history
 */
export const DEMO_AI_CHAT_HISTORY = [
  {
    id: 'demo_msg_1',
    role: 'assistant' as const,
    content: 'Hello! I\'m your AI portfolio assistant. I can help you analyze your investments, identify opportunities, and answer questions about your portfolio. What would you like to know?',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    id: 'demo_msg_2',
    role: 'user' as const,
    content: 'How is my portfolio performing this month?',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
  },
  {
    id: 'demo_msg_3',
    role: 'assistant' as const,
    content: 'Your portfolio has performed well this month with a gain of $8,765.43 (4.31%). This outperforms the S&P 500 which gained 3.2% over the same period. Your strong performance was driven primarily by your technology holdings, particularly AAPL and MSFT, which have seen significant gains.',
    timestamp: new Date(Date.now() - 24 * 60 * 1000).toISOString(), // 24 minutes ago
  },
];

/**
 * Demo optimization suggestions
 */
export const DEMO_OPTIMIZATION = {
  currentSharpe: 1.42,
  optimizedSharpe: 1.68,
  expectedReturn: 12.4,
  optimizedReturn: 14.2,
  riskReduction: 15.3,
  suggestions: [
    {
      action: 'Reduce Technology allocation by 5%',
      impact: '+0.8% expected return, -2.1% volatility',
      confidence: 'High',
    },
    {
      action: 'Increase Bond allocation to 20%',
      impact: '-1.2% volatility, improved diversification',
      confidence: 'High',
    },
    {
      action: 'Add International Equity exposure',
      impact: '+0.3% diversification benefit',
      confidence: 'Medium',
    },
  ],
};

/**
 * Demo Plaid account metadata for stubbing
 */
export const DEMO_PLAID_METADATA = {
  institution: {
    id: 'ins_demo_schwab',
    name: 'Charles Schwab',
  },
  accounts: [
    {
      id: 'demo_account_1',
      name: 'Individual Taxable Account',
      mask: '4567',
      type: 'investment',
      subtype: 'investment',
      balances: {
        available: 125000.00,
        current: 125000.00,
      },
    },
  ],
};

/**
 * Demo market data for real-time updates
 */
export const DEMO_MARKET_DATA = {
  indices: {
    'SPY': { price: 432.15, change: 2.34, changePercent: 0.54 },
    'QQQ': { price: 378.92, change: -1.45, changePercent: -0.38 },
    'IWM': { price: 198.76, change: 0.89, changePercent: 0.45 },
  },
  stocks: {
    'AAPL': { price: 178.25, change: 2.15, changePercent: 1.22 },
    'MSFT': { price: 334.67, change: -1.23, changePercent: -0.37 },
    'GOOGL': { price: 2456.78, change: 15.23, changePercent: 0.62 },
    'AMZN': { price: 3398.45, change: 23.67, changePercent: 0.70 },
    'TSLA': { price: 789.23, change: -12.45, changePercent: -1.55 },
    'NVDA': { price: 523.89, change: 8.92, changePercent: 1.73 },
    'META': { price: 356.12, change: -4.56, changePercent: -1.26 },
    'NFLX': { price: 398.75, change: -7.89, changePercent: -1.94 },
  },
};

/**
 * Utility function to get demo data with some randomization
 * Adds slight variations to make the demo feel more realistic
 */
export function getDemoDataWithVariation<T>(baseData: T, variationPercent: number = 2): T {
  if (typeof baseData === 'number') {
    const variation = baseData * (variationPercent / 100);
    const randomVariation = (Math.random() - 0.5) * 2 * variation;
    return (baseData + randomVariation) as T;
  }
  
  if (Array.isArray(baseData)) {
    return baseData.map(item => getDemoDataWithVariation(item, variationPercent)) as T;
  }
  
  if (typeof baseData === 'object' && baseData !== null) {
    const result = {} as T;
    for (const [key, value] of Object.entries(baseData)) {
      (result as any)[key] = getDemoDataWithVariation(value, variationPercent);
    }
    return result;
  }
  
  return baseData;
}

/**
 * Simulate real-time market data updates
 */
export function getSimulatedMarketUpdate() {
  const now = new Date();
  const marketHours = now.getHours() >= 9 && now.getHours() < 16; // Simplified market hours
  
  if (!marketHours) {
    return DEMO_MARKET_DATA;
  }
  
  // Generate small random changes during market hours
  return getDemoDataWithVariation(DEMO_MARKET_DATA, 0.5);
}
