import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import appReducer from './appSlice';
import userReducer from './userSlice';
import portfolioReducer from './portfolioSlice';
import preferencesReducer from './preferencesSlice';
import aiChatReducer from './aiChatSlice';
import optimizationReducer from './optimizationSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    user: userReducer,
    portfolio: portfolioReducer,
    preferences: preferencesReducer,
    aiChat: aiChatReducer,
    optimization: optimizationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Optional: Export a hook that can be reused to resolve types
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
