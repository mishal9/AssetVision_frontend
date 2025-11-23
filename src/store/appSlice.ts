import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';

interface AppState {
  theme: 'light' | 'dark';
}

const initialState: AppState = {
  theme: 'light',
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { toggleTheme } = appSlice.actions;
export default appSlice.reducer;

// Selectors
export const selectTheme = (state: RootState) => state.app.theme;

// Memoized selector to prevent unnecessary re-renders
export const selectAppState = createSelector(
  [selectTheme],
  (theme) => ({ theme })
);
