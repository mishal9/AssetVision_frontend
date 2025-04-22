import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { plaidApi } from '@/services/plaid-api';

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
 * Portfolio state managed by Redux
 */
export interface PortfolioState {
  holdings: Holding[];
  totalBalance: number;
  loading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  holdings: [],
  totalBalance: 0,
  loading: false,
  error: null,
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
 * Redux slice for portfolio holdings and balance
 */
export const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export default portfolioSlice.reducer;
