import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Market region settings interface
 */
export interface MarketRegionSettings {
  marketRegion: string;
  riskFreeRate: string;
  inflationSeries: string;
  default_benchmark: string;
}

/**
 * Tax settings interface
 */
export interface TaxSettings {
  federalIncomeTax: number;
  stateIncomeTax: number;
  pretaxAnnualIncome: number;
  stateOfResidence: string;
  taxFilingStatus: string;
  longTermCapitalGainsTax: number;
  shortTermCapitalGainsTax: number;
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
    default_benchmark: 'S&P 500',
  },
  tax: {
    federalIncomeTax: 22,
    stateIncomeTax: 0,
    pretaxAnnualIncome: 100000,
    stateOfResidence: 'California',
    taxFilingStatus: 'Single',
    longTermCapitalGainsTax: 15,
    shortTermCapitalGainsTax: 22,
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
    updateMarketRegionSettings: (state, action: PayloadAction<MarketRegionSettings>) => {
      state.marketRegion = action.payload;
    },
    
    /**
     * Update tax settings
     */
    updateTaxSettings: (state, action: PayloadAction<TaxSettings>) => {
      state.tax = action.payload;
    },
    
    /**
     * Update all preferences
     */
    updateAllPreferences: (state, action: PayloadAction<{marketRegion: MarketRegionSettings, tax: TaxSettings}>) => {
      state.marketRegion = action.payload.marketRegion;
      state.tax = action.payload.tax;
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
  updateAllPreferences,
  setLoading,
  setError
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
