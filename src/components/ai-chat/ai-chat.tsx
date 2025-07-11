'use client';

import React, { useState, useRef, useEffect, useMemo, MouseEvent } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert } from '@/components/ui/alert';
import { chatApi } from '@/services/api';
import { RootState } from '@/store';
import ReactMarkdown from 'react-markdown';

/**
 * Floating AI Chat component
 * Provides a floating chat button that expands into a chat interface
 * Context-aware and integrates with backend-powered AI services
 */
export function AiChat() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedPrompt, setSelectedPrompt] = useState('');
  
  // State for tracking the chat button position
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  /**
   * Determines the starting position for the button
   * Uses local storage to persist position between sessions
   */
  useEffect(() => {
    // Try to load saved position from localStorage
    const savedPosition = localStorage.getItem('aiChatButtonPosition');
    if (savedPosition) {
      try {
        const position = JSON.parse(savedPosition);
        setButtonPosition(position);
      } catch (e) {
        console.error('Failed to parse saved button position', e);
      }
    }
  }, []);
  
  /**
   * Predefined list of prompts that users can select from
   */
  const predefinedPrompts = [
    'Analyze my portfolio performance',
    'Show my asset allocation',
    'Identify tax loss harvesting opportunities',
    'Analyze my dividend income',
    'Explain my sector exposure',
    'Suggest portfolio optimizations',
    'Summarize recent market impacts on my portfolio'
  ];
  const [isApiConfigured, setIsApiConfigured] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isOpen, messages, loading, context } = useSelector((state: RootState) => state.aiChat);
  
  // Access raw portfolio data from Redux state
  const portfolio = useSelector((state: RootState) => state.portfolio);
  
  // Memoize the transformed portfolio data to prevent unnecessary rerenders
  const portfolioData = useMemo(() => {
    const portfolioState = portfolio || {};
    
    // Calculate portfolio summary from holdings
    const totalValue = portfolioState.totalBalance || 0;
    const cashBalance = 0; // Not directly available in the state
    
    // Get sector allocation from drift data if available
    const sectorAllocation = portfolioState.driftData?.sector?.items?.map(item => ({
      name: item.name,
      percentage: item.currentAllocation * 100
    })) || [];
    
    return {
      portfolioSummary: {
        totalValue,
        cashBalance,
        dayChange: 0, // Not directly available
        dayChangePercent: 0, // Not directly available
        totalReturn: 0, // Not directly available
        totalReturnPercent: 0, // Not directly available
        holdings: portfolioState.holdings || []
      },
      performance: {
        data: [],
        timeframe: '1M',
        returnRate: 0, // Not directly available
        benchmarkReturn: 0 // Not directly available
      },
      allocation: {
        assetClasses: [],
        sectors: sectorAllocation,
        geographies: []
      },
      taxLossHarvesting: {
        opportunities: [],
        potentialSavings: 0
      },
      dividends: {
        annualIncome: 0,
        yield: 0,
        nextPayment: null
      }
    };
  }, [portfolio]); // Only recompute when portfolio state changes

  // Backend API is always considered configured since API keys are managed server-side
  useEffect(() => {
    setIsApiConfigured(true);
  }, []);
  
  // Determine if we should show the chat (only on dashboard pages)
  const isDashboardPage = useMemo(() => {
    // If pathname is empty or root, it's the main dashboard
    if (!pathname || pathname === '/') return true;
    
    // Check if path starts with /dashboard
    const pathSegments = pathname.split('/').filter(Boolean);
    return pathSegments[0] === 'dashboard';
  }, [pathname]);

  // Handle route changes to update basic context
  useEffect(() => {
    if (pathname) {
      const pathSegments = pathname.split('/').filter(Boolean);
      
      // Extract page and section information
      const page = pathSegments[0] || 'dashboard';
      const section = pathSegments.length > 1 ? pathSegments[1] : undefined;
      
      // Update basic context with page and section info
      dispatch(updateContext({ 
        page,
        section
      }));
    }
  }, [pathname, dispatch]);
  
  // Memoize portfolio metrics to ensure stable reference
  const portfolioMetrics = useMemo(() => {
    // Only create metrics object if we have data
    if (!portfolioData.portfolioSummary) return null;
    
    return {
      summary: {
        totalValue: portfolioData.portfolioSummary.totalValue,
        cashBalance: portfolioData.portfolioSummary.cashBalance,
        dayChange: portfolioData.portfolioSummary.dayChange,
        dayChangePercent: portfolioData.portfolioSummary.dayChangePercent,
        totalReturn: portfolioData.portfolioSummary.totalReturn,
        totalReturnPercent: portfolioData.portfolioSummary.totalReturnPercent,
        holdings: portfolioData.portfolioSummary.holdings || []
      },
      performance: portfolioData.performance,
      allocation: portfolioData.allocation,
      taxLossHarvesting: portfolioData.taxLossHarvesting,
      dividends: portfolioData.dividends
    };
  }, [portfolioData]);
  
  // Store previous metrics for comparison
  const prevMetricsRef = useRef(context.portfolioMetrics);
  
  // Update portfolio metrics in context when data changes
  useEffect(() => {
    // Only update if we have actual data and the chat is open
    if (!isOpen || !portfolioMetrics) return;
    
    // Only update if the metrics have actually changed using deep comparison
    if (!isEqual(prevMetricsRef.current, portfolioMetrics)) {
      dispatch(updateContext({
        portfolioMetrics
      }));
      prevMetricsRef.current = portfolioMetrics;
    }
  }, [portfolioMetrics, isOpen, dispatch]);

  // Helper function to deep compare objects
  const isEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      const val1 = obj1[key];
      const val2 = obj2[key];
      const areObjects = val1 !== null && typeof val1 === 'object' && val2 !== null && typeof val2 === 'object';
      
      if (areObjects ? !isEqual(val1, val2) : val1 !== val2) {
        return false;
      }
    }
    
    return true;
  };

  // Update page context only when pathname changes
  useEffect(() => {
    if (!isOpen) return;
    
    // Only update if we have no page context or it doesn't match current route
    const currentPage = pathname?.split('/')[1] || 'dashboard';
    if (!context.page || context.page !== currentPage) {
      // Set page context based on route
      dispatch(updateContext({ 
        page: currentPage, 
        section: '' 
      }));
    }
  }, [pathname, isOpen, context.page, dispatch]);

  // Ref for previous context to prevent infinite updates
  const prevContextRef = useRef<Record<string, any>>({});

  // Update page-specific context only when relevant data changes
  useEffect(() => {
    // Don't update if chat is closed
    if (!isOpen || !context.page) return;
    
    let pageSpecificContext: Record<string, any> = {};
    
    // Initialize portfolio metrics object
    const portfolioMetrics: any = {};
    
    switch(context.page) {
      case 'dashboard': {
        // Only proceed if we have the necessary data
        if (!portfolioData) return;
        
        // Add tax loss harvesting opportunities if available
        if (portfolioData.taxLossHarvesting?.opportunities?.length) {
          portfolioMetrics.taxLossHarvesting = {
            totalOpportunities: portfolioData.taxLossHarvesting.opportunities.length,
            potentialSavings: portfolioData.taxLossHarvesting.potentialSavings
          };
        }
        
        // Add dividend forecast if available
        if (portfolioData.dividends) {
          portfolioMetrics.dividends = {
            annualIncome: portfolioData.dividends.annualIncome,
            yield: portfolioData.dividends.yield,
            nextPayment: portfolioData.dividends.nextPayment
          };
        }
        
        // Add summary if available
        if (portfolioData.portfolioSummary) {
          portfolioMetrics.summary = {
            totalValue: portfolioData.portfolioSummary.totalValue,
            cashBalance: portfolioData.portfolioSummary.cashBalance,
            dayChange: portfolioData.portfolioSummary.dayChange,
            dayChangePercent: portfolioData.portfolioSummary.dayChangePercent,
            totalReturn: portfolioData.portfolioSummary.totalReturn,
            totalReturnPercent: portfolioData.portfolioSummary.totalReturnPercent,
            holdings: portfolioData.portfolioSummary.holdings || []
          };
        }
        
        // Add performance if available
        if (portfolioData.performance) {
          portfolioMetrics.performance = {
            timeframe: portfolioData.performance.timeframe,
            returnRate: portfolioData.performance.returnRate,
            benchmarkReturn: portfolioData.performance.benchmarkReturn
          };
        }
        
        // Add allocation if available
        if (portfolioData.allocation) {
          portfolioMetrics.allocation = {
            assetClasses: portfolioData.allocation.assetClasses || [],
            sectors: portfolioData.allocation.sectors || [],
            geographies: portfolioData.allocation.geographies || []
          };
        }
        
        // Check if we actually have portfolio metrics to add
        if (Object.keys(portfolioMetrics).length > 0) {
          pageSpecificContext = {
            description: 'AssetVision Investment Dashboard with portfolio overview, performance metrics, asset allocation, and market data.',
            availableData: ['portfolioSummary', 'performanceMetrics', 'assetAllocation', 'dividendForecast', 'taxHarvesting'],
            portfolioMetrics
          };
        }
        break;
      }
      case 'portfolio':
        // Only update if we have holdings data
        if (portfolioData?.portfolioSummary?.holdings?.length) {
          pageSpecificContext = {
            description: 'Portfolio detail page showing holdings, performance history, and allocation breakdown.',
            availableData: ['holdings', 'performance', 'allocation', 'dividends', 'transactions'],
            // Include specific holdings data if available
            holdings: portfolioData.portfolioSummary.holdings
          };
        }
        break;
      case 'tax-harvesting':
        // Only update if we have tax loss harvesting data
        if (portfolioData?.taxLossHarvesting?.opportunities?.length) {
          pageSpecificContext = {
            description: 'Tax harvesting opportunities page showing potential tax loss harvesting actions.',
            availableData: ['taxLossOpportunities', 'capitalGains', 'taxEfficiency'],
            // Include tax loss harvesting data
            taxLossOpportunities: portfolioData.taxLossHarvesting.opportunities
          };
        }
        break;
      case 'alerts':
        pageSpecificContext = {
          description: 'Alerts management page showing portfolio alerts and notification settings.',
          availableData: ['priceAlerts', 'driftAlerts', 'dividendAlerts', 'taxAlerts']
        };
        break;
      default:
        // For other pages, just set a basic description
        pageSpecificContext = {
          description: `${context.page} page in AssetVision investment management application.`
        };
    }
    
    // Only dispatch if we have specific context to add AND it's different from current context
    if (Object.keys(pageSpecificContext).length > 0 && !isEqual(prevContextRef.current, pageSpecificContext)) {
      prevContextRef.current = pageSpecificContext;
      dispatch(updateContext(pageSpecificContext));
    }
  }, [portfolioData, isOpen, context.page, dispatch]);
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      // Use a small timeout to ensure DOM has updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages, isOpen, loading]);
  
  // Handle draggable AI chat button functionality
  useEffect(() => {
    // Handler for mouse move to update button position during drag
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && buttonRef.current) {
        e.preventDefault();
        
        // Get the button dimensions
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const buttonWidth = buttonRect.width;
        const buttonHeight = buttonRect.height;
        
        // Calculate new position with offset
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        
        // Enforce strict viewport boundaries with padding
        const padding = 10; // 10px padding from viewport edges
        const maxX = window.innerWidth - buttonWidth - padding;
        const maxY = window.innerHeight - buttonHeight - padding;
        
        // Constrain position to viewport boundaries
        const constrainedX = Math.max(padding, Math.min(newX, maxX));
        const constrainedY = Math.max(padding, Math.min(newY, maxY));
        
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          setButtonPosition({ x: constrainedX, y: constrainedY });
        });
      }
    };
    
    // Handler for mouse up to end dragging
    const handleMouseUp = () => {
      setIsDragging(false);
      // Save position to localStorage
      localStorage.setItem('aiChatButtonPosition', JSON.stringify(buttonPosition));
    };
    
    // Only attach event listeners when dragging
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  /**
   * Toggle the chat window open/closed
   */
  const handleToggleChat = () => {
    dispatch(toggleChat());
  };
  
  /**
   * Helper function to format currency values
   */
  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0.00';
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  /**
   * Helper function to format percent values
   */
  const formatPercent = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };
  
  /**
   * Helper function to format change values (both absolute and percent)
   */
  const formatChange = (change: number | undefined | null, changePercent: number | undefined | null): string => {
    const changeStr = change !== undefined && change !== null ? 
      `${change >= 0 ? '+' : '-'}$${Math.abs(change).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
      'N/A';
      
    const percentStr = changePercent !== undefined && changePercent !== null ? 
      `(${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)` : 
      '';
      
    return `${changeStr} ${percentStr}`.trim();
  };
  
  // Reference to the JSON response example the user wants to use
  const hardcodedPortfolioSummary = useMemo(() => ({
    total_value: 67807.7,
    total_cost: 11800.0,
    total_gain: 56007.7,
    total_gain_percentage: 474.6415254237288,
    day_change: 0.0,
    day_change_percentage: 0.0,
    dividend_yield: 0.1700396857584021,
    asset_allocation: {
      equity: 100.0,
      bond: 0.0,
      cash: 0.0,
      alternative: 0.0,
      crypto: 0.0,
      real_estate: 0.0,
      commodity: 0.0,
      unknown: 0.0
    },
    sector_allocation: {
      "Technology": 28.494846455491043,
      "Communication Services": 71.50515354450896
    },
    performance: {
      one_year: 54.45035411492839,
      three_year: 428.75615794105084,
      five_year: 147.5813513295228,
      ytd: 24.481181090642295,
      total_return: 474.6415254237288
    }
  }), []);
  
  // Update the context in Redux when chat is opened
  useEffect(() => {
    if (isOpen) {
      // Only pass the page name in context - portfolio data will be in the system message
      dispatch(updateContext({
        page: 'Dashboard' // We don't need to pass portfolioSummary here anymore
      }));
    }
  }, [isOpen, dispatch]);


  
  /**
   * Format context data for the LLM - directly return the hardcoded portfolio summary
   * @returns A JSON string containing the portfolio summary
   */
  const formatContextForLLM = (): string => {
    // Just return the hardcoded portfolio summary as-is
    return JSON.stringify(hardcodedPortfolioSummary, null, 2);
  };

  /**
   * System message to guide the AI's behavior
   */
  const getSystemMessage = (): string => {
    // Get the portfolio summary as formatted JSON
    const portfolioSummary = formatContextForLLM();
    
    // Create a focused system message for portfolio analysis
    return [
      "You are AssetVision AI, a portfolio assistant. Provide brief insights based on the portfolio summary.",
      "",
      "INSTRUCTIONS:",
      "1. Reference specific portfolio values from the data provided.",
      "2. Format your response using markdown for better readability.",
      "3. Use bold for key numbers and metrics.",
      "4. Organize content with headings and bullet points where appropriate.",
      "5. Keep responses clear and structured for easy scanning.",
      "",
      "PORTFOLIO SUMMARY:",
      portfolioSummary
    ].join('\n');
  };
  
  /**
   * Format messages for the API call
   * @param userMessage - The current user message to send
   * @returns Array of messages formatted for the API
   */
  const formatMessagesForApi = (userMessage: string) => {
    // Get just the user and assistant messages from the history
    // (excluding any previous system messages to avoid duplication)
    const chatHistory = messages.filter(msg => 
      msg.role === 'user' || msg.role === 'assistant'
    ).slice(-4); // Limit to last 4 messages for context window efficiency
    
    // Create the formatted message array with only user and assistant messages
    // The system message will be handled by the backend
    return [
      ...chatHistory,
      {
        role: 'user' as const,
        content: userMessage.trim()
      }
    ];
  };

  /**
   * Handle prompt selection from dropdown
   * @param prompt - The selected predefined prompt
   */
  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPrompt || loading) return;
    
    // Get the selected prompt
    const userPrompt = selectedPrompt;
    
    // Create the enhanced message with system context embedded
    const systemData = getSystemMessage();
    const enhancedUserMessage = `${userPrompt}\n\n[SYSTEM_CONTEXT]\n${systemData}\n[/SYSTEM_CONTEXT]`;
    
    // Add only the original prompt to chat (for display)
    dispatch(addMessage({ 
      role: 'user', 
      content: userPrompt
    }));
    
    // Reset selected prompt
    setSelectedPrompt('');
    
    try {
      // Start loading state
      dispatch(setLoading(true));
      
      // Format messages for API with the enhanced user message
      const formattedMessages = formatMessagesForApi(enhancedUserMessage);
      
      // Send to backend API which handles the LLM calls
      // Pass only minimal context (page name)
      const minimalContext = { page: context.page || 'Dashboard' };
      const response = await chatApi.sendMessage(formattedMessages, minimalContext);
      
      // Format the response to ensure proper markdown rendering
      const formattedResponse = response.trim();
      
      // Add the formatted AI response to chat
      dispatch(addMessage({
        role: 'assistant',
        content: formattedResponse
      }));
      
      dispatch(setError(null));
    } catch (error) {
      console.error('Error sending message to AI backend:', error);
      dispatch(setError('Sorry, I encountered an error. Please try again in a moment.'));
      
      // Add a helpful error message to the chat
      dispatch(addMessage({
        role: 'assistant',
        content: "I'm sorry, I'm having trouble accessing the information right now. Please try again in a moment or refresh the page if the issue persists."
      }));
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
      {/* Only show the floating button on dashboard pages */}
      {isDashboardPage && (
        <Button
          ref={buttonRef}
          onClick={handleToggleChat}
          onMouseDown={(e) => {
            // Start dragging only with left mouse button
            if (e.button === 0) {
              e.preventDefault();
              setIsDragging(true);
              // Store initial mouse position
              dragStartRef.current = { 
                x: e.clientX - buttonPosition.x, 
                y: e.clientY - buttonPosition.y 
              };
            }
          }}
          className={`fixed rounded-full shadow-lg p-3 z-50 cursor-move ${
            isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
          }`}
          style={{
            transform: 'none',
            right: buttonPosition.x === 0 && buttonPosition.y === 0 ? '20px' : (buttonPosition.x ? `${buttonPosition.x}px` : 'auto'),
            bottom: buttonPosition.x === 0 && buttonPosition.y === 0 ? '20px' : 'auto',
            top: buttonPosition.y ? `${buttonPosition.y}px` : 'auto',
            left: buttonPosition.x === 0 && buttonPosition.y === 0 ? 'auto' : (buttonPosition.x ? `${buttonPosition.x}px` : 'auto'),
          }}
          size="icon"
          aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </Button>
      )}

      {/* Chat window - only shown on dashboard pages and when open */}
      {isOpen && isDashboardPage && (
        <Card 
          className="fixed w-96 h-[500px] shadow-xl flex flex-col z-40 overflow-hidden max-h-[70vh]"
          style={{
            // Position chat window relative to button with consistent offset
            bottom: 'auto',
            top: (() => {
              // If button is at default position (0,0)
              if (buttonPosition.x === 0 && buttonPosition.y === 0) {
                return '100px';
              }
              
              // Calculate position above the button
              const windowHeight = 500; // Chat window height
              const offset = 20; // Space between button and window
              const topPosition = buttonPosition.y - windowHeight - offset;
              
              // Ensure window doesn't go above viewport
              return `${Math.max(10, topPosition)}px`;
            })(),
            left: (() => {
              // If button is at default position (0,0)
              if (buttonPosition.x === 0 && buttonPosition.y === 0) {
                return '50%';
              }
              
              // Center the window on the button's x-position
              // Make sure it doesn't go off-screen
              const windowWidth = 384; // 96 * 4 = 384px (w-96)
              const halfWindow = windowWidth / 2;
              const leftPosition = buttonPosition.x - halfWindow;
              
              // Constrain to viewport
              return `${Math.max(10, Math.min(leftPosition, window.innerWidth - windowWidth - 10))}px`;
            })(),
            transform: buttonPosition.x === 0 && buttonPosition.y === 0 ? 'translateX(-50%)' : 'none',
          }}
        >
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
                      {msg.role === 'assistant' ? (
                        <div className="text-sm markdown-content">
                          {/* Using the imported ReactMarkdown component */}
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
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

          {/* Input area with native select for predefined prompts */}
          <form onSubmit={handleSubmit} className="p-3 border-t flex items-center gap-2">
            <div className="flex-grow">
              <select
                value={selectedPrompt}
                onChange={(e) => handlePromptSelect(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || !isApiConfigured}
              >
                <option value="" disabled>
                  Select a prompt...
                </option>
                {predefinedPrompts.map((prompt) => (
                  <option key={prompt} value={prompt}>
                    {prompt}
                  </option>
                ))}
              </select>
            </div>
            <Button 
              type="submit" 
              size="icon" 
              disabled={!selectedPrompt || loading || !isApiConfigured}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}
    </>
  );
}
