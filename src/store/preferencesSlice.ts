import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Market region settings interface
 */
export interface MarketRegionSettings {
  marketRegion: string;
  riskFreeRate: string;
  inflationSeries: string;
}

/**
 * Tax settings interface
 */
export interface TaxSettings {
  federalIncomeTax: number;
  capitalGainsTax: number;
  dividendTax: number;
  stateIncomeTax: number;
  affordableCareActTax: number;
}

/**
 * Preferences state interface
 */
export interface PreferencesState {
  marketRegion: MarketRegionSettings;
  tax: TaxSettings;
  loading: boolean;
  error: string | null;
}

const initialState: PreferencesState = {
  marketRegion: {
    marketRegion: 'US',
    riskFreeRate: 'US 3 Month Treasury Bill',
    inflationSeries: 'U.S. Consumer Price Index',
  },
  tax: {
    federalIncomeTax: 22,
    capitalGainsTax: 15,
    dividendTax: 15,
    stateIncomeTax: 0,
    affordableCareActTax: 0,
  },
  loading: false,
  error: null,
};

/**
 * Preferences slice for Redux store
 */
const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    /**
     * Update market region settings
     */
    updateMarketRegionSettings(state, action: PayloadAction<MarketRegionSettings>) {
      state.marketRegion = action.payload;
    },
    
    /**
     * Update tax settings
     */
    updateTaxSettings(state, action: PayloadAction<TaxSettings>) {
      state.tax = action.payload;
    },
    
    /**
     * Set loading state
     */
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    
    /**
     * Set error state
     */
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { 
  updateMarketRegionSettings,
  updateTaxSettings,
  setLoading,
  setError
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
