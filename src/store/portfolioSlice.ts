import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { plaidApi } from '@/services/plaid-api';
import { PORTFOLIO_ENDPOINTS } from '@/config/api';
import { fetchWithAuth } from '@/services/api-utils';

/**
 * Type for a single holding in the portfolio
 */
export interface Holding {
  symbol: string;
  shares: string;
  purchasePrice: number;
  assetClass: string;
}

/**
 * Interface for drift item
 */
export interface DriftItem {
  name: string;
  currentAllocation: number;
  targetAllocation: number;
  absoluteDrift: number;
  relativeDrift: number;
}

/**
 * Interface for drift data
 */
export interface DriftData {
  portfolioId: string;
  portfolioName: string;
  lastUpdated: string;
  totalAbsoluteDrift: number;
  items: DriftItem[];
}

/**
 * Asset class type definition
 */
export interface AssetClass {
  id: string;
  name: string;
  description?: string;
  target_allocation?: number;
  current_allocation?: number;
}

/**
 * Target allocation input type
 */
export interface TargetAllocationInput {
  asset_id: string;
  target_percentage: number;
}

/**
 * Portfolio state managed by Redux
 */
export interface PortfolioState {
  holdings: Holding[];
  totalBalance: number;
  loading: boolean;
  error: string | null;
  driftData: {
    asset_class?: DriftData;
    sector?: DriftData;
    overall?: DriftData;
  };
  driftLoading: boolean;
  driftError: string | null;
  assetClasses: AssetClass[];
  assetClassesLoading: boolean;
  assetClassesError: string | null;
  targetAllocationsLoading: boolean;
  targetAllocationsError: string | null;
}

const initialState: PortfolioState = {
  holdings: [],
  totalBalance: 0,
  loading: false,
  error: null,
  driftData: {},
  driftLoading: false,
  driftError: null,
  assetClasses: [],
  assetClassesLoading: false,
  assetClassesError: null,
  targetAllocationsLoading: false,
  targetAllocationsError: null,
};

/**
 * Async thunk to fetch holdings and total balance for a linked account
 * @param connectionId The connectionId for the linked account
 */
export const fetchHoldingsAndBalance = createAsyncThunk(
  'portfolio/fetchHoldingsAndBalance',
  async (connectionId: string, { rejectWithValue }) => {
    try {
      const holdings = await plaidApi.getInvestmentHoldings(connectionId);
      // Calculate total balance by summing (shares * purchasePrice) for each holding
      const totalBalance = holdings.reduce((sum, h) => {
        const shares = parseFloat(h.shares);
        return sum + (shares * (h.purchasePrice || 0));
      }, 0);
      return { holdings, totalBalance };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch holdings');
    }
  }
);

/**
 * Async thunk to fetch available asset classes for the portfolio
 * Retrieves asset classes with their current allocations if available
 */
export const fetchAssetClasses = createAsyncThunk(
  'portfolio/fetchAssetClasses',
  async (_, { rejectWithValue }) => {
    try {
      // Use fetchWithAuth to handle authentication consistently
      return await fetchWithAuth(PORTFOLIO_ENDPOINTS.ASSET_CLASSES);
    } catch (error: any) {
      console.error('Asset classes fetch error:', error);
      return rejectWithValue(error.message || 'Failed to fetch asset classes');
    }
  }
);

/**
 * Async thunk to save target allocations for the portfolio
 * @param allocations Array of asset allocations with target percentages
 */
export const saveTargetAllocations = createAsyncThunk(
  'portfolio/saveTargetAllocations',
  async (allocations: TargetAllocationInput[], { rejectWithValue }) => {
    try {
      // Use fetchWithAuth to handle authentication and CSRF consistently
      return await fetchWithAuth(PORTFOLIO_ENDPOINTS.TARGET_ALLOCATIONS, {
        method: 'POST',
        body: JSON.stringify(allocations)
      });
    } catch (error: any) {
      console.error('Target allocation save error:', error);
      return rejectWithValue(error.message || 'Failed to save target allocations');
    }
  }
);

/**
 * Async thunk to fetch portfolio drift data
 * Uses the active user's portfolio (no ID parameter needed)
 */
export const fetchPortfolioDrift = createAsyncThunk(
  'portfolio/fetchDrift',
  async (_, { rejectWithValue }) => {
    try {
      // Use fetchWithAuth to handle authentication consistently
      return await fetchWithAuth(PORTFOLIO_ENDPOINTS.DRIFT);
    } catch (error: any) {
      console.error('Portfolio drift fetch error:', error);
      return rejectWithValue(error.message || 'Failed to fetch portfolio drift');
    }
  }
);

/**
 * Redux slice for portfolio holdings and balance
 */
export const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch holdings cases
      .addCase(fetchHoldingsAndBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHoldingsAndBalance.fulfilled, (state, action: PayloadAction<{ holdings: Holding[]; totalBalance: number }>) => {
        state.holdings = action.payload.holdings;
        state.totalBalance = action.payload.totalBalance;
        state.loading = false;
      })
      .addCase(fetchHoldingsAndBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch drift data cases
      .addCase(fetchPortfolioDrift.pending, (state) => {
        state.driftLoading = true;
        state.driftError = null;
      })
      .addCase(fetchPortfolioDrift.fulfilled, (state, action) => {
        // Process the drift data to ensure all required fields exist
        const processedData: any = { ...action.payload };
        
        // Ensure proper data structure for each category
        ['asset_class', 'sector', 'overall'].forEach(category => {
          if (processedData[category]) {
            // Make sure each item has both current and target allocations
            processedData[category].items = processedData[category].items.map((item: any) => ({
              ...item,
              // Set currentAllocation to 0 if undefined or
              currentAllocation: item.currentAllocation ?? 0,
              // Set targetAllocation to 0 if undefined or null
              targetAllocation: item.targetAllocation ?? 0,
              // Calculate drifts if not provided
              absoluteDrift: item.absoluteDrift ?? (item.currentAllocation - item.targetAllocation) ?? 0,
              relativeDrift: item.relativeDrift ?? (
                item.targetAllocation ? ((item.currentAllocation - item.targetAllocation) / item.targetAllocation * 100) : 0
              )
            }));
          }
        });
        
        console.log('Processed drift data:', processedData);
        state.driftData = processedData;
        state.driftLoading = false;
      })
      .addCase(fetchPortfolioDrift.rejected, (state, action) => {
        state.driftLoading = false;
        state.driftError = action.payload as string;
      })

      // Fetch asset classes cases
      .addCase(fetchAssetClasses.pending, (state) => {
        state.assetClassesLoading = true;
        state.assetClassesError = null;
      })
      .addCase(fetchAssetClasses.fulfilled, (state, action) => {
        state.assetClasses = action.payload as AssetClass[];
        state.assetClassesLoading = false;
      })
      .addCase(fetchAssetClasses.rejected, (state, action) => {
        state.assetClassesLoading = false;
        state.assetClassesError = action.payload ? String(action.payload) : 'Failed to fetch asset classes';
      })
      
      // Save target allocations cases
      .addCase(saveTargetAllocations.pending, (state) => {
        state.targetAllocationsLoading = true;
        state.targetAllocationsError = null;
      })
      .addCase(saveTargetAllocations.fulfilled, (state, action) => {
        state.targetAllocationsLoading = false;
        // Store the updated asset classes from the response
        const assetClasses = action.payload as AssetClass[];
        state.assetClasses = assetClasses;
        // Update portfolioData with target allocations
        if (assetClasses && assetClasses.length > 0) {
          // Create a map of target allocations from the response
          const targetAllocations: {[key: string]: number} = {};
          assetClasses.forEach((assetClass: AssetClass) => {
            if (assetClass.target_allocation !== undefined) {
              targetAllocations[assetClass.id] = assetClass.target_allocation;
            }
          });
        }
      })
      .addCase(saveTargetAllocations.rejected, (state, action) => {
        state.targetAllocationsLoading = false;
        state.targetAllocationsError = action.payload as string;
      });
  },
});

export default portfolioSlice.reducer;
