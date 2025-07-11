'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { AiChat } from './ai-chat';
import { RootState } from '@/store';

/**
 * AI Chat Provider Component
 * Provides the AI Chat functionality throughout the application
 * Only renders the AI Chat when isVisible is true in the Redux store
 */
export function AiChatProvider() {
  const { isVisible } = useSelector((state: RootState) => state.aiChat);
  
  // Only render the AI Chat component if isVisible is true
  if (!isVisible) return null;
  
  return (
    <>
      <AiChat />
    </>
  );
}
