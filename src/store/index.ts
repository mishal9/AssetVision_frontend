import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import appReducer from './appSlice';
import userReducer from './userSlice';
import portfolioReducer from './portfolioSlice';
import preferencesReducer from './preferencesSlice';
import optimizationReducer from './optimizationSlice';

/**
 * Creates a store with the correct configuration
 * This is needed to ensure we don't create multiple stores during SSR
 */
const createStore = () => {
  return configureStore({
    reducer: {
      app: appReducer,
      user: userReducer,
      portfolio: portfolioReducer,
      preferences: preferencesReducer,
      optimization: optimizationReducer,
    },
  });
};

// Create the store once for the client side
// This ensures we don't create multiple stores during SSR
export const store = createStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use in components
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
