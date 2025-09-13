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

/**
 * Sector information for target allocations
 */
export interface Sector {
  id: string;
  name: string;
  description?: string;
  target_allocation?: number;
  current_allocation?: number;
}

export interface AllocationResponse {
  // Snake case properties (from backend)
  asset_allocation: AssetAllocation[];
  sector_allocation: AssetAllocation[];
  
  // Camel case properties (after conversion)
  assetAllocation?: AssetAllocation[];
  sectorAllocation?: AssetAllocation[];
}

export interface HoldingInput {
  symbol: string;
  quantity?: number;
  shares?: string;
  purchasePrice: number;
  purchaseDate: string;
  assetClass?: string;
}

/**
 * Holding interface for portfolio display
 * Extends HoldingInput with required properties for UI rendering
 */
export interface Holding extends HoldingInput {
  shares: string;
  assetClass: string;
}

// Drift data types
export interface DriftItem {
  name: string;
  currentAllocation: number;
  targetAllocation: number;
  absoluteDrift: number;
  relativeDrift: number;
}

export interface DriftData {
  portfolioId: string;
  portfolioName: string;
  lastUpdated: string;
  totalAbsoluteDrift: number;
  items: DriftItem[];
}

// Backend Drift Response
export interface DriftResponse {
  overall?: DriftData;
  asset_class?: DriftData;
  sector?: DriftData | null;
  // Setup required response fields
  setup_required?: boolean;
  message?: string;
  current_allocations?: {
    asset_class?: Record<string, number>;
    sector?: Record<string, number>;
  };
}
