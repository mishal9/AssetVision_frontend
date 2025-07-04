import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Message interface for AI chat
 */
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

/**
 * Context information interface
 */
export interface ContextInfo {
  page: string;
  section?: string;
  portfolioId?: string;
  assetId?: string;
  description?: string;
  availableData?: string[];
}

/**
 * AI chat state interface
 */
export interface AiChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  context: ContextInfo;
}

const initialState: AiChatState = {
  isOpen: false,
  messages: [],
  loading: false,
  error: null,
  context: {
    page: 'dashboard'
  }
};

/**
 * Redux slice for AI chat functionality
 */
export const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    addMessage: (state, action: PayloadAction<Omit<ChatMessage, 'id' | 'timestamp'>>) => {
      state.messages.push({
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now()
      });
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateContext: (state, action: PayloadAction<Partial<ContextInfo>>) => {
      state.context = {
        ...state.context,
        ...action.payload
      };
    }
  }
});

export const { 
  toggleChat, 
  addMessage, 
  clearMessages, 
  setLoading, 
  setError,
  updateContext
} = aiChatSlice.actions;

export default aiChatSlice.reducer;
