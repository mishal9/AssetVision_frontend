'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  toggleChat, 
  addMessage, 
  clearMessages, 
  setLoading, 
  setError,
  updateContext,
  ChatMessage
} from '@/store/aiChatSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert } from '@/components/ui/alert';
import { chatApi } from '@/services/api';
import { RootState } from '@/store';

/**
 * Floating AI Chat component
 * Provides a floating chat button that expands into a chat interface
 * Context-aware and integrates with backend-powered AI services
 */
export function AiChat() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [inputValue, setInputValue] = useState('');
  const [isApiConfigured, setIsApiConfigured] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isOpen, messages, loading, context } = useSelector((state: RootState) => state.aiChat);

  // Backend API is always considered configured since API keys are managed server-side
  useEffect(() => {
    setIsApiConfigured(true);
  }, []);
  
  // Update context based on current route
  useEffect(() => {
    if (pathname) {
      const pathSegments = pathname.split('/').filter(Boolean);
      
      // Extract page and section information
      const page = pathSegments[0] || 'dashboard';
      const section = pathSegments.length > 1 ? pathSegments[1] : undefined;
      
      // Update context with current page info
      dispatch(updateContext({ 
        page, 
        section 
      }));
    }
  }, [pathname, dispatch]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      // Use a small timeout to ensure DOM has updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages, isOpen, loading]);

  /**
   * Toggle the chat window open/closed
   */
  const handleToggleChat = () => {
    dispatch(toggleChat());
  };

  /**
   * Handle sending a message
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || loading) return;
    
    // Add user message to chat
    dispatch(addMessage({ 
      role: 'user', 
      content: inputValue.trim() 
    }));
    
    // Clear input field
    setInputValue('');
    
    try {
      // Start loading state
      dispatch(setLoading(true));
      
      // Format messages for API
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add current user message
      formattedMessages.push({
        role: 'user' as const,
        content: inputValue.trim()
      });
      
      // Send to backend API which handles the LLM calls
      const response = await chatApi.sendMessage(formattedMessages, context);
      
      // Add AI response to chat
      dispatch(addMessage({
        role: 'assistant',
        content: response
      }));
      
      dispatch(setError(null));
    } catch (error) {
      console.error('Error sending message to AI backend:', error);
      dispatch(setError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Start a new chat session
   */
  const handleClearChat = () => {
    dispatch(clearMessages());
  };

  /**
   * Format timestamp to readable time
   * @param timestamp - Unix timestamp
   * @returns Formatted time string
   */
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={handleToggleChat}
        className={`fixed bottom-6 left-6 rounded-full shadow-lg p-3 z-50 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
        }`}
        size="icon"
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-20 left-6 w-96 h-[500px] shadow-xl flex flex-col z-40 overflow-hidden max-h-[70vh]">
          {/* Chat header */}
          <div className="p-3 border-b flex justify-between items-center bg-primary text-primary-foreground">
            <div className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              <span className="font-medium">AI Assistant</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearChat}
              className="h-8 hover:bg-primary-foreground/10 text-primary-foreground"
            >
              New Chat
            </Button>
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-grow p-3 h-[calc(100%-104px)] overflow-y-auto">
            <div className="space-y-4 min-h-full">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>How can I help you with your investments today?</p>
                </div>
              ) : (
                messages.map((msg: ChatMessage) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className={`max-w-[85%] px-3 py-2 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 px-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex items-start">
                  <div className="bg-muted px-3 py-2 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <form onSubmit={handleSubmit} className="p-3 border-t flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={loading || !isApiConfigured}
              className="flex-grow"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!inputValue.trim() || loading || !isApiConfigured}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}
    </>
  );
}
