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
  generatedAt: number;
}

/**
 * Portfolio optimization state interface
 */
export interface OptimizationState {
  parameters: OptimizationParameters;
  results: OptimizationResults | null;
  isSimulating: boolean;
  selectedScenario: string | null;
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
  isSimulating: false,
  selectedScenario: null,
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
    setSimulating: (state, action: PayloadAction<boolean>) => {
      state.isSimulating = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setResults: (state, action: PayloadAction<OptimizationResults>) => {
      state.results = action.payload;
      state.isSimulating = false;
      state.lastOptimized = Date.now();
      state.error = null;
    },
    selectScenario: (state, action: PayloadAction<string>) => {
      state.selectedScenario = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isSimulating = false;
    },
    clearResults: (state) => {
      state.results = null;
      state.selectedScenario = null;
      state.error = null;
      state.lastOptimized = null;
    },
    resetParameters: (state) => {
      state.parameters = initialState.parameters;
    }
  }
});

export const {
  updateParameters,
  setSimulating,
  setResults,
  selectScenario,
  setError,
  clearResults,
  resetParameters
} = optimizationSlice.actions;

export default optimizationSlice.reducer;
