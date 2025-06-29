import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { plaidApi } from '@/services/plaid-api';
import { API_BASE_URL } from '@/config/api';

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
}

const initialState: PortfolioState = {
  holdings: [],
  totalBalance: 0,
  loading: false,
  error: null,
  driftData: {},
  driftLoading: false,
  driftError: null,
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
 * Async thunk to fetch portfolio drift data
 * @param portfolioId The ID of the portfolio to fetch drift data for
 */
export const fetchPortfolioDrift = createAsyncThunk(
  'portfolio/fetchDrift',
  async (portfolioId: string, { rejectWithValue }) => {
    try {
      // Use the complete URL with the API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/portfolios/${portfolioId}/drift`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add credentials to ensure cookies are sent
        credentials: 'include'
      });
      
      if (!response.ok) {
        // For 404s and other errors, we'll handle them in the component layer
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Network or parsing error fetching drift data:', error);
      return rejectWithValue(error.message || 'Failed to fetch drift data');
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
        state.driftData = action.payload;
        state.driftLoading = false;
      })
      .addCase(fetchPortfolioDrift.rejected, (state, action) => {
        state.driftLoading = false;
        state.driftError = action.payload as string;
      });
  },
});

export default portfolioSlice.reducer;
