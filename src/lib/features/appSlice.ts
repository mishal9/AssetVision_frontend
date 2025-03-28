import { createSlice } from '@reduxjs/toolkit';

interface AppState {
  theme: 'light' | 'dark';
}

const initialState: AppState = {
  theme: 'dark',
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
