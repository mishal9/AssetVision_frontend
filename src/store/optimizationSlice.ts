import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Optimization scenario interface
 */
export interface OptimizationScenario {
  name: string;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  taxEfficiency: number;
  esgAlignment: number;
  allocation: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

/**
 * Optimization parameters interface
 */
export interface OptimizationParameters {
  riskTolerance: number;
  taxBracket: number;
  turnoverTolerance: number;
  esgScore: number;
  timeHorizon: number;
}

/**
 * Efficient frontier point interface
 */
export interface EfficientFrontierPoint {
  risk: number;
  return: number;
  sharpe: number;
  allocation: {
    stocks: number;
    bonds: number;
    international: number;
    alternatives: number;
  };
  taxEfficiency: number;
  esgScore: number;
}

/**
 * Optimization results interface
 */
export interface OptimizationResults {
  scenarios: OptimizationScenario[];
  projectedData: Array<{
    year: number;
    conservative: number;
    balanced: number;
    growth: number;
    current: number;
  }>;
  taxSavings: number;
  rebalancingCost: number;
  efficientFrontier: EfficientFrontierPoint[];
  generatedAt: number;
}

/**
 * Trade interface
 */
interface Trade {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  percentage: number;
  estimatedValue: number;
}

/**
 * Implementation plan interface
 */
interface ImplementationPlan {
  trades: Trade[];
  taxAnalysis: {
    taxEfficiency: number;
    expectedTaxImpact: string;
    taxLossHarvestingOpportunities: string[];
    recommendedAccountTypes: string[];
  };
}

/**
 * Selected strategy interface
 */
export interface SelectedStrategy {
  scenarioName: string;
  scenario: OptimizationScenario;
  selectedAt: number;
  implementationPlan: ImplementationPlan;
}

/**
 * Portfolio optimization state interface
 */
export interface OptimizationState {
  parameters: OptimizationParameters;
  results: OptimizationResults | null;
  selectedScenario: string | null;
  selectedStrategy: SelectedStrategy | null;
  isLoading: boolean;
  error: string | null;
  lastOptimized: number | null;
}

const initialState: OptimizationState = {
  parameters: {
    riskTolerance: 5,
    taxBracket: 22,
    turnoverTolerance: 10,
    esgScore: 50,
    timeHorizon: 10
  },
  results: null,
  selectedScenario: null,
  selectedStrategy: null,
  isLoading: false,
  error: null,
  lastOptimized: null
};

/**
 * Redux slice for portfolio optimization functionality
 */
export const optimizationSlice = createSlice({
  name: 'optimization',
  initialState,
  reducers: {
    updateParameters: (state, action: PayloadAction<Partial<OptimizationParameters>>) => {
      state.parameters = {
        ...state.parameters,
        ...action.payload
      };
    },
    setSimulationStatus: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setResults: (state, action: PayloadAction<OptimizationResults>) => {
      state.results = action.payload;
      state.isLoading = false;
      state.lastOptimized = Date.now();
      state.error = null;
    },
    selectScenario: (state, action: PayloadAction<string>) => {
      state.selectedScenario = action.payload;
    },
    selectStrategy: (state, action: PayloadAction<{ scenarioName: string; portfolioValue?: number }>) => {
      const { scenarioName, portfolioValue = 100000 } = action.payload;
      const scenario = state.results?.scenarios.find(s => s.name === scenarioName);
      
      if (scenario) {
        // Current portfolio holdings (mock data - in real app would come from state)
        const currentHoldings = {
          'VTI': { allocation: 60, value: (portfolioValue * 60) / 100 },
          'VTIAX': { allocation: 25, value: (portfolioValue * 25) / 100 }, 
          'BND': { allocation: 15, value: (portfolioValue * 15) / 100 },
          'VNQ': { allocation: 0, value: 0 }
        };
        
        // Generate rebalancing trades based on current vs target allocation
        const trades: Trade[] = [];
        const targetAllocations = [
          { symbol: 'VTI', target: scenario.allocation[0].value },
          { symbol: 'VTIAX', target: scenario.allocation[1].value },
          { symbol: 'BND', target: scenario.allocation[2].value },
          { symbol: 'VNQ', target: scenario.allocation[3]?.value || 0 }
        ];
        
        targetAllocations.forEach(({ symbol, target }) => {
          const current = currentHoldings[symbol as keyof typeof currentHoldings]?.allocation || 0;
          const difference = target - current;
          const currentValue = currentHoldings[symbol as keyof typeof currentHoldings]?.value || 0;
          const targetValue = (portfolioValue * target) / 100;
          const tradeDollarAmount = targetValue - currentValue;
          
          // Only show trades where there's a meaningful difference
          if (Math.abs(difference) > 0.5) {
            trades.push({
              symbol,
              action: difference > 0 ? 'buy' : 'sell',
              percentage: Math.abs(difference), // Show percentage change needed
              estimatedValue: Math.abs(tradeDollarAmount) // Show dollar amount to trade
            });
          }
        });

        state.selectedStrategy = {
          scenarioName,
          scenario,
          selectedAt: Date.now(),
          implementationPlan: {
            trades,
            taxAnalysis: {
              taxEfficiency: scenario.taxEfficiency,
              expectedTaxImpact: trades.some(t => t.action === 'sell') ? 
                scenario.taxEfficiency > 80 ? 'Low tax impact - mostly long-term gains' : 
                scenario.taxEfficiency > 60 ? 'Moderate tax impact from rebalancing' : 
                'Higher tax impact - consider tax-loss harvesting' :
                'No immediate tax impact - buying assets only',
              taxLossHarvestingOpportunities: trades.some(t => t.action === 'sell') ? [
                'Consider harvesting losses on underperforming positions before selling winners',
                'Review holding periods to qualify for long-term capital gains rates',
                'Offset gains with any available tax losses from other positions'
              ] : [
                'No tax-loss harvesting applicable for new investments',
                'Monitor performance for future harvesting opportunities'
              ],
              recommendedAccountTypes: [
                scenario.allocation.find(a => a.name.includes('Bonds'))?.value > 20 ? 'Place bond investments in 401(k)/IRA to defer taxes on interest income' : '',
                'Rebalance within tax-advantaged accounts first to avoid taxable events',
                trades.some(t => t.action === 'sell') ? 'Consider executing trades in IRA/401(k) to avoid capital gains taxes' : '',
                scenario.allocation.find(a => a.name.includes('International'))?.value > 15 ? 'International funds generate foreign tax credits - suitable for taxable accounts' : '',
                'Use tax-advantaged space for highest-turnover rebalancing activity'
              ].filter(Boolean)
            }
          }
        };
        state.selectedScenario = scenarioName;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearSelectedStrategy: (state) => {
      state.selectedStrategy = null;
      state.selectedScenario = null;
    },
    resetOptimization: (state) => {
      state.results = null;
      state.selectedScenario = null;
      state.selectedStrategy = null;
      state.isLoading = false;
      state.error = null;
    },
    resetParameters: (state) => {
      state.parameters = initialState.parameters;
    }
  }
});

export const {
  updateParameters,
  setSimulationStatus,
  setResults,
  selectScenario,
  selectStrategy,
  clearSelectedStrategy,
  setError,
  resetOptimization,
  resetParameters
} = optimizationSlice.actions;

export default optimizationSlice.reducer;
