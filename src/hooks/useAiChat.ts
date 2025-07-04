'use client';

import { useDispatch, useSelector } from 'react-redux';
import { 
  toggleChat, 
  addMessage, 
  clearMessages, 
  updateContext,
  setLoading,
  setError,
  ContextInfo
} from '@/store/aiChatSlice';
import { chatApi } from '@/services/api';
import { RootState } from '@/store';

/**
 * Hook for AI Chat functionality
 * Provides easy access to AI chat functionality from any component
 */
export function useAiChat() {
  const dispatch = useDispatch();
  const { isOpen, messages, loading, context } = useSelector((state: RootState) => state.aiChat);

  /**
   * Open the AI chat window
   */
  const openChat = () => {
    if (!isOpen) {
      dispatch(toggleChat());
    }
  };

  /**
   * Close the AI chat window
   */
  const closeChat = () => {
    if (isOpen) {
      dispatch(toggleChat());
    }
  };

  /**
   * Toggle the AI chat window
   */
  const toggleChatWindow = () => {
    dispatch(toggleChat());
  };

  /**
   * Start a new chat session
   */
  const startNewChat = () => {
    dispatch(clearMessages());
  };

  /**
   * Update the context information for AI chat
   * @param newContext - Partial context information to update
   */
  const setContext = (newContext: Partial<ContextInfo>) => {
    dispatch(updateContext(newContext));
  };

  /**
   * Add a predefined question to the chat and get AI response from backend
   * @param question - Question text to add
   */
  const askQuestion = async (question: string) => {
    // Add user question to chat
    dispatch(addMessage({
      role: 'user',
      content: question
    }));
    
    // Open the chat window if it's closed
    if (!isOpen) {
      dispatch(toggleChat());
    }
    
    try {
      // Set loading state
      dispatch(setLoading(true));
      
      // Format messages for API
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add current user question
      formattedMessages.push({
        role: 'user' as const,
        content: question
      });
      
      // Get response from backend
      const response = await chatApi.sendMessage(formattedMessages, context);
      
      // Add AI response to chat
      dispatch(addMessage({
        role: 'assistant',
        content: response
      }));
      
      dispatch(setError(null));
    } catch (error) {
      console.error('Error getting AI response:', error);
      dispatch(setError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  /**
   * Get AI insights for a portfolio
   * @param portfolioId - ID of the portfolio to analyze
   */
  const getPortfolioInsights = async (portfolioId: string) => {
    try {
      return await chatApi.getPortfolioInsights(portfolioId);
    } catch (error) {
      console.error('Error getting portfolio insights:', error);
      throw error;
    }
  };
  
  /**
   * Get optimization recommendations for a portfolio
   * @param portfolioId - ID of the portfolio to optimize
   */
  const getOptimizationRecommendations = async (portfolioId: string) => {
    try {
      return await chatApi.getOptimizationRecommendations(portfolioId);
    } catch (error) {
      console.error('Error getting optimization recommendations:', error);
      throw error;
    }
  };

  return {
    isOpen,
    messages,
    loading,
    context,
    openChat,
    closeChat,
    toggleChatWindow,
    startNewChat,
    setContext,
    askQuestion,
    getPortfolioInsights,
    getOptimizationRecommendations
  };
}
