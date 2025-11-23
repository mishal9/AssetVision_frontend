import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { plaidApi } from '@/services/plaid-api';
import { PORTFOLIO_ENDPOINTS } from '@/config/api';
import { fetchWithAuth } from '@/services/api-utils';
import { Sector } from '@/types/portfolio';

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
  // Setup required state for drift page
  driftSetupRequired: boolean;
  driftSetupMessage: string | null;
  currentAllocations: {
    asset_class?: Record<string, number>;
    sector?: Record<string, number>;
  };
  assetClasses: AssetClass[];
  assetClassesLoading: boolean;
  assetClassesError: string | null;
  sectors: Sector[];
  sectorsLoading: boolean;
  sectorsError: string | null;
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
  driftSetupRequired: false,
  driftSetupMessage: null,
  currentAllocations: {},
  assetClasses: [],
  assetClassesLoading: false,
  assetClassesError: null,
  sectors: [],
  sectorsLoading: false,
  sectorsError: null,
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
        const shares = parseFloat(h.shares || '0');
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
      // Use the portfolioApi to handle authentication consistently
      const { portfolioApi } = await import('../services/api');
      return await portfolioApi.getAssetClasses();
    } catch (error: any) {
      console.error('Asset classes fetch error:', error);
      const errorMessage = error?.message || 'Failed to fetch asset classes';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async thunk to fetch available sectors for the portfolio
 * Retrieves sectors with their current allocations if available
 */
export const fetchSectors = createAsyncThunk(
  'portfolio/fetchSectors',
  async (_, { rejectWithValue }) => {
    try {
      // Use the portfolioApi to handle authentication consistently
      const { portfolioApi } = await import('../services/api');
      return await portfolioApi.getSectors();
    } catch (error: any) {
      console.error('Sectors fetch error:', error);
      const errorMessage = error?.message || 'Failed to fetch sectors';
      return rejectWithValue(errorMessage);
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
      // Use the portfolioApi to handle authentication and CSRF consistently
      const { portfolioApi } = await import('../services/api');
      return await portfolioApi.saveTargetAllocations(allocations);
    } catch (error: any) {
      console.error('Target allocation save error:', error);
      return rejectWithValue(error.message || 'Failed to save target allocations');
    }
  }
);

/**
 * Async thunk to save sector target allocations for the portfolio
 * @param allocations Array of sector allocations with target percentages
 */
export const saveSectorTargetAllocations = createAsyncThunk(
  'portfolio/saveSectorTargetAllocations',
  async (allocations: TargetAllocationInput[], { rejectWithValue }) => {
    try {
      // Use the portfolioApi to handle authentication and CSRF consistently
      const { portfolioApi } = await import('../services/api');
      return await portfolioApi.saveSectorTargetAllocations(allocations);
    } catch (error: any) {
      console.error('Sector target allocation save error:', error);
      return rejectWithValue(error.message || 'Failed to save sector target allocations');
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
      const response = await fetchWithAuth(PORTFOLIO_ENDPOINTS.DRIFT) as any;
      
      // Check if this is a setup required response
      if (response.setup_required) {
        if (!response.current_allocations) {
          throw new Error('current_allocations is required in setup_required response');
        }
        return {
          setupRequired: true,
          message: response.message,
          currentAllocations: response.current_allocations,
          asset_class: { items: [] },
          sector: { items: [] },
          overall: { items: [] }
        };
      }
      
      return response;
    } catch (error: any) {
      console.error('Portfolio drift fetch error:', error);
      const errorMessage = error?.message || 'Failed to fetch portfolio drift';
      return rejectWithValue(errorMessage);
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
      .addCase(fetchHoldingsAndBalance.fulfilled, (state, action) => {
        // Ensure all required properties are present for the Holding interface
        state.holdings = action.payload.holdings.map(holding => ({
          ...holding,
          shares: holding.shares || '0',
          assetClass: holding.assetClass || 'stocks'
        }));
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
        const payload = action.payload as any;
        
        // Handle setup required response
        if (payload.setupRequired) {
          state.driftSetupRequired = true;
          state.driftSetupMessage = payload.message || null;
          state.currentAllocations = payload.currentAllocations || {};
          state.driftData = {
            asset_class: payload.asset_class,
            sector: payload.sector,
            overall: payload.overall
          };
          state.driftLoading = false;
          return;
        }
        
        // Reset setup required state for normal responses
        state.driftSetupRequired = false;
        state.driftSetupMessage = null;
        state.currentAllocations = {};
        
        // Process the drift data to ensure all required fields exist
        const processedData: any = { ...payload };
        
        // Ensure proper data structure for each category
        ['asset_class', 'sector', 'overall'].forEach(category => {
          if (processedData[category]) {
            // Make sure each item has both current and target allocations
            processedData[category].items = processedData[category].items.map((item: any) => {
              // Extract raw allocation values (could be percentage points or 0-1 fractions)
              const rawCurrent =
                // Prefer camelCase but fall back to snake_case fields from backend
                (item.currentAllocation ?? item.current_allocation ?? 0) as number;
              const rawTarget =
                (item.targetAllocation ?? item.target_allocation ?? 0) as number;

              // Normalize allocations: backend may send fractions (0-1). Convert to percentages if so.
              const normalize = (val: number): number => (val <= 1 ? val * 100 : val);
              const currentPct = normalize(rawCurrent);
              const targetPct = normalize(rawTarget);

              // Calculate absolute drift in percentage points
              const absoluteDrift = (item.absoluteDrift ?? item.absolute_drift) !== undefined
                ? normalize(item.absoluteDrift ?? item.absolute_drift as number)
                : currentPct - targetPct;

              // Calculate relative drift as percent of target
              const relativeDrift = (item.relativeDrift ?? item.relative_drift) !== undefined
                ? (item.relativeDrift ?? item.relative_drift)
                : (
                    targetPct !== 0
                      ? ((currentPct - targetPct) / targetPct) * 100
                      : currentPct !== 0
                        ? 100
                        : 0
                  );

              return {
                ...item,
                currentAllocation: currentPct,
                targetAllocation: targetPct,
                absoluteDrift,
                relativeDrift,
              };
            });
            
            // Calculate totalAbsoluteDrift as sum of absolute values of all absoluteDrift values
            const totalAbsoluteDrift = processedData[category].items.reduce((sum: number, item: any) => {
              return sum + Math.abs(item.absoluteDrift || 0);
            }, 0);
            
            // Set the calculated totalAbsoluteDrift
            processedData[category].totalAbsoluteDrift = totalAbsoluteDrift;
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
        // Ensure action.payload is an array before assigning
        if (Array.isArray(action.payload)) {
          state.assetClasses = action.payload;
        } else {
          console.error('Expected array for assetClasses but got:', action.payload);
          state.assetClasses = [];
        }
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
        // Ensure action.payload is an array before assigning
        if (Array.isArray(action.payload)) {
          const assetClasses = action.payload;
          state.assetClasses = assetClasses;
          // Update portfolioData with target allocations
          if (assetClasses.length > 0) {
          // Create a map of target allocations from the response
          const targetAllocations: {[key: string]: number} = {};
          assetClasses.forEach((assetClass: AssetClass) => {
            if (assetClass.target_allocation !== undefined) {
              targetAllocations[assetClass.id] = assetClass.target_allocation;
            }
          });
        }
      } else {
        console.error('Expected array for assetClasses but got:', action.payload);
        state.assetClasses = [];
      }
      })
      .addCase(saveTargetAllocations.rejected, (state, action) => {
        state.targetAllocationsLoading = false;
        state.targetAllocationsError = action.payload as string;
      })
      
      // Fetch sectors cases
      .addCase(fetchSectors.pending, (state) => {
        state.sectorsLoading = true;
        state.sectorsError = null;
      })
      .addCase(fetchSectors.fulfilled, (state, action) => {
        // Ensure action.payload is an array before assigning
        if (Array.isArray(action.payload)) {
          state.sectors = action.payload;
        } else {
          console.error('Expected array for sectors but got:', action.payload);
          state.sectors = [];
        }
        state.sectorsLoading = false;
      })
      .addCase(fetchSectors.rejected, (state, action) => {
        state.sectorsLoading = false;
        state.sectorsError = action.payload ? String(action.payload) : 'Failed to fetch sectors';
      })
      
      // Save sector target allocations cases
      .addCase(saveSectorTargetAllocations.pending, (state) => {
        state.targetAllocationsLoading = true;
        state.targetAllocationsError = null;
      })
      .addCase(saveSectorTargetAllocations.fulfilled, (state, action) => {
        state.targetAllocationsLoading = false;
        // Store the updated sectors from the response
        // Ensure action.payload is an array before assigning
        if (Array.isArray(action.payload)) {
          const sectors = action.payload;
          state.sectors = sectors;
          // Update portfolioData with target allocations
          if (sectors.length > 0) {
          // Create a map of target allocations from the response
          const targetAllocations: {[key: string]: number} = {};
          sectors.forEach((sector: Sector) => {
            if (sector.target_allocation !== undefined) {
              targetAllocations[sector.id] = sector.target_allocation;
            }
          });
        }
      } else {
        console.error('Expected array for sectors but got:', action.payload);
        state.sectors = [];
      }
      })
      .addCase(saveSectorTargetAllocations.rejected, (state, action) => {
        state.targetAllocationsLoading = false;
        state.targetAllocationsError = action.payload as string;
      });
  },
});

export default portfolioSlice.reducer;
