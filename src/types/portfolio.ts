/**
 * Portfolio Type Definitions
 * Contains type definitions for portfolio data
 */

// API Response Types (snake_case as returned from backend)
export interface PortfolioSummaryResponse {
  total_value: number;
  total_cost: number;
  total_gain: number;
  total_gain_percentage: number;
  day_change: number;
  day_change_percentage: number;
  dividend_yield: number;
  cash_balance?: number;
  asset_allocation: {
    equity: number;
    bond: number;
    cash: number;
    alternative: number;
    crypto: number;
    real_estate: number;
    commodity: number;
    unknown: number;
  };
  sector_allocation: Record<string, number>;
  performance: {
    one_year: number;
    three_year: number;
    five_year: number;
    ytd: number;
    total_return: number;
  };
}

// Frontend Types (camelCase for React components)
export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
  dividendYield: number;
  cashBalance?: number;
  assetAllocation: {
    equity: number;
    bond: number;
    cash: number;
    alternative: number;
    crypto: number;
    realEstate: number;
    commodity: number;
    unknown: number;
  };
  sectorAllocation: Record<string, number>;
  performance: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
    ytd: number;
    totalReturn: number;
  };
}

export interface PerformanceData {
  date: string;
  value: number;
}

export interface AssetAllocation {
  category: string;
  percentage: number;
  value: number;
  color?: string;
}

export interface AllocationResponse {
  asset_allocation: AssetAllocation[];
  sector_allocation: AssetAllocation[];
}

export interface HoldingInput {
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
}
