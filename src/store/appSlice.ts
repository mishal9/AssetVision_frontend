import { createSlice } from '@reduxjs/toolkit';

interface AppState {
  theme: 'light';
}

const initialState: AppState = {
  theme: 'light',
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {},
});

export const {} = appSlice.actions;
export default appSlice.reducer;
