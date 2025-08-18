/**
 * Demo Stub Services
 * Replaces real API calls and external integrations with deterministic stubs
 * Ensures no real outbound calls occur in demo mode
 */

import { 
  DEMO_HOLDINGS, 
  DEMO_LINKED_ACCOUNTS, 
  DEMO_PORTFOLIO_PERFORMANCE,
  DEMO_ASSET_ALLOCATION,
  DEMO_SECTOR_ALLOCATION,
  DEMO_DRIFT_DATA,
  DEMO_ALERTS,
  DEMO_TAX_HARVESTING,
  DEMO_AI_CHAT_HISTORY,
  DEMO_OPTIMIZATION,
  DEMO_PLAID_METADATA,
  DEMO_MARKET_DATA,
  getDemoDataWithVariation,
} from './demo-data';

import { HoldingInput } from '@/types/portfolio';
import { LinkedAccount } from '@/store/userSlice';
import { AuthResponse, UserInfoResponse } from '@/types/auth';

/**
 * Demo Authentication Service Stub
 * Simulates authentication without real backend calls
 */
export const demoAuthService = {
  /**
   * Demo login - always succeeds with demo credentials
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Accept any demo credentials
    if (email.includes('demo') || password === 'demo') {
      return {
        success: true,
        tokens: {
          access: 'demo_access_token_' + Date.now(),
          refresh: 'demo_refresh_token_' + Date.now(),
          access_expires_in: 1800, // 30 minutes
          refresh_expires_in: 604800, // 7 days
        },
        user: {
          id: 999999,
          username: 'demo_user',
          email: 'demo@alphaoptimize.com',
        },
      };
    }
    
    throw new Error('Invalid demo credentials. Use any email containing "demo" or password "demo".');
  },

  /**
   * Demo registration - always succeeds
   */
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      tokens: {
        access: 'demo_access_token_' + Date.now(),
        refresh: 'demo_refresh_token_' + Date.now(),
        access_expires_in: 1800,
        refresh_expires_in: 604800,
      },
      user: {
        id: 999999,
        username: username || 'demo_user',
        email: email || 'demo@alphaoptimize.com',
      },
    };
  },

  /**
   * Demo user info
   */
  async getUserInfo(): Promise<UserInfoResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      userId: '999999',
      username: 'demo_user',
      email: 'demo@alphaoptimize.com',
      profileImage: 'https://ui-avatars.com/api/?name=Demo+User&background=4f46e5&color=fff',
    };
  },

  /**
   * Demo logout - always succeeds
   */
  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // No-op for demo
  },

  /**
   * Demo password reset request
   */
  async requestPasswordReset(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Demo: Password reset email would be sent to:', email);
  },

  /**
   * Demo password reset
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Demo: Password would be reset with token:', token);
  },

  /**
   * Demo token refresh
   */
  async refreshToken(refreshToken: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      access: 'demo_access_token_refreshed_' + Date.now(),
      access_expires_in: 1800,
    };
  },
};

/**
 * Demo Plaid Service Stub
 * Simulates Plaid integration without real API calls
 */
export const demoPlaidService = {
  /**
   * Create demo link token
   */
  async createLinkToken(userId?: string, forUpdate: boolean = false, accountId?: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return `demo_link_token_${Date.now()}`;
  },

  /**
   * Exchange public token (simulate successful account linking)
   */
  async exchangePublicToken(publicToken: string, metadata: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      success: true,
      institutionId: DEMO_PLAID_METADATA.institution.id,
      institutionName: DEMO_PLAID_METADATA.institution.name,
      connectionId: `demo_connection_${Date.now()}`,
      accountIds: ['demo_account_1'],
    };
  },

  /**
   * Get investment holdings (return demo data)
   */
  async getInvestmentHoldings(connectionId?: string, institutionId?: string): Promise<HoldingInput[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return DEMO_HOLDINGS.map(holding => ({
      symbol: holding.symbol,
      shares: holding.shares,
      purchasePrice: holding.purchasePrice,
      purchaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assetClass: holding.assetClass,
    }));
  },

  /**
   * Get linked accounts
   */
  async getLinkedAccounts(): Promise<LinkedAccount[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...DEMO_LINKED_ACCOUNTS];
  },

  /**
   * Create portfolio from Plaid data
   */
  async createPortfolioFromPlaid(connectionId?: string, portfolioName?: string, institutionId?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Demo: Portfolio created from Plaid data');
  },

  /**
   * Disconnect account
   */
  async disconnectAccount(accountId: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Demo: Account disconnected:', accountId);
    return { success: true };
  },

  /**
   * Update account connection
   */
  async updateAccountConnection(accountId: string, institutionId?: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      success: true,
      linkToken: `demo_update_token_${Date.now()}`,
      institutionId,
    };
  },

  /**
   * Get linked institutions
   */
  async getLinkedInstitutions(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      {
        id: 'ins_demo_schwab',
        name: 'Charles Schwab',
        accounts: DEMO_LINKED_ACCOUNTS.filter(acc => acc.institutionId === 'ins_demo_schwab'),
        lastUpdated: new Date().toISOString(),
        status: 'active',
        source: 'demo',
      },
      {
        id: 'ins_demo_fidelity',
        name: 'Fidelity Investments',
        accounts: DEMO_LINKED_ACCOUNTS.filter(acc => acc.institutionId === 'ins_demo_fidelity'),
        lastUpdated: new Date().toISOString(),
        status: 'active',
        source: 'demo',
      },
    ];
  },
};

/**
 * Demo Portfolio API Stub
 * Simulates portfolio-related API calls
 */
export const demoPortfolioService = {
  /**
   * Get portfolio performance
   */
  async getPerformance(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return getDemoDataWithVariation(DEMO_PORTFOLIO_PERFORMANCE, 1);
  },

  /**
   * Get asset allocation
   */
  async getAllocation(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return getDemoDataWithVariation(DEMO_ASSET_ALLOCATION, 0.5);
  },

  /**
   * Get sector allocation
   */
  async getSectorAllocation(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return getDemoDataWithVariation(DEMO_SECTOR_ALLOCATION, 1);
  },

  /**
   * Get portfolio drift
   */
  async getDrift(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return getDemoDataWithVariation(DEMO_DRIFT_DATA, 0.5);
  },

  /**
   * Get portfolio summary
   */
  async getSummary(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      ...getDemoDataWithVariation(DEMO_PORTFOLIO_PERFORMANCE, 1),
      holdings: DEMO_HOLDINGS.length,
      accounts: DEMO_LINKED_ACCOUNTS.length,
      lastUpdated: new Date().toISOString(),
    };
  },

  /**
   * Get tax loss harvesting opportunities
   */
  async getTaxLossHarvesting(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 700));
    return getDemoDataWithVariation(DEMO_TAX_HARVESTING, 2);
  },

  /**
   * Get tax efficiency analysis
   */
  async getTaxEfficiency(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      taxDragPercentage: 1.23,
      potentialSavings: 3450.67,
      recommendations: [
        'Move high-yield bonds to tax-advantaged accounts',
        'Consider tax-managed funds for taxable accounts',
        'Implement tax-loss harvesting strategy',
      ],
    };
  },

  /**
   * Get asset classes
   */
  async getAssetClasses(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 'stocks', name: 'Stocks', current_allocation: 78.5, target_allocation: 75.0 },
      { id: 'bonds', name: 'Bonds', current_allocation: 15.2, target_allocation: 20.0 },
      { id: 'cash', name: 'Cash', current_allocation: 4.8, target_allocation: 5.0 },
      { id: 'alternatives', name: 'Alternatives', current_allocation: 1.5, target_allocation: 0.0 },
    ];
  },

  /**
   * Get sectors
   */
  async getSectors(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return DEMO_SECTOR_ALLOCATION.map(sector => ({
      id: sector.name.toLowerCase().replace(/\s+/g, '_'),
      name: sector.name,
      current_allocation: sector.allocation,
      target_allocation: sector.allocation * 0.9, // Slightly different targets
    }));
  },

  /**
   * Save target allocations
   */
  async saveTargetAllocations(allocations: any[]): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('Demo: Target allocations saved:', allocations);
    return allocations;
  },

  /**
   * Save sector target allocations
   */
  async saveSectorTargetAllocations(allocations: any[]): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('Demo: Sector target allocations saved:', allocations);
    return allocations;
  },
};

/**
 * Demo Alerts API Stub
 */
export const demoAlertsService = {
  /**
   * Get all alerts
   */
  async getAlerts(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...DEMO_ALERTS];
  },

  /**
   * Create alert
   */
  async createAlert(alertData: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newAlert = {
      id: `demo_alert_${Date.now()}`,
      ...alertData,
      createdAt: new Date().toISOString(),
      active: true,
    };
    console.log('Demo: Alert created:', newAlert);
    return newAlert;
  },

  /**
   * Update alert
   */
  async updateAlert(alertId: string, updateData: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const updatedAlert = {
      id: alertId,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    console.log('Demo: Alert updated:', updatedAlert);
    return updatedAlert;
  },

  /**
   * Delete alert
   */
  async deleteAlert(alertId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    console.log('Demo: Alert deleted:', alertId);
  },
};

/**
 * Demo Risk Optimization API Stub
 */
export const demoRiskService = {
  /**
   * Get optimization suggestions
   */
  async optimize(parameters: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay for complex operation
    return getDemoDataWithVariation(DEMO_OPTIMIZATION, 1);
  },
};

/**
 * Demo AI Chat API Stub
 */
export const demoAiChatService = {
  /**
   * Get chat history
   */
  async getChatHistory(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...DEMO_AI_CHAT_HISTORY];
  },

  /**
   * Send message to AI
   */
  async sendMessage(message: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing time
    
    // Generate contextual responses based on message content
    let response = 'I understand your question about the portfolio. Let me analyze the data and provide insights.';
    
    if (message.toLowerCase().includes('performance')) {
      response = `Based on your portfolio data, you're performing well with a total return of $45,230.75 (27.08%). Your portfolio has outperformed the market this year, driven primarily by your technology holdings. The Sharpe ratio of 1.42 indicates good risk-adjusted returns.`;
    } else if (message.toLowerCase().includes('tax')) {
      response = `I've identified several tax optimization opportunities in your portfolio. You have potential tax savings of $2,340 through loss harvesting, primarily from positions in NFLX and META. Additionally, consider moving high-yield investments to tax-advantaged accounts.`;
    } else if (message.toLowerCase().includes('rebalance')) {
      response = `Your portfolio shows some drift from target allocations. Technology is currently 7.4% above target at 32.4%. I recommend reducing tech exposure by 5% and increasing bond allocation to 20% to improve diversification and reduce volatility by approximately 2.1%.`;
    } else if (message.toLowerCase().includes('risk')) {
      response = `Your portfolio has a beta of 1.08, indicating slightly higher volatility than the market. Current volatility is 18.67% with a maximum drawdown of -12.34%. Consider increasing bond allocation or adding defensive sectors to reduce risk while maintaining returns.`;
    }
    
    return {
      id: `demo_ai_msg_${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Clear chat history
   */
  async clearHistory(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Demo: AI chat history cleared');
  },
};

/**
 * Demo Market Data Service
 * Simulates real-time market data updates
 */
export const demoMarketDataService = {
  /**
   * Get current market data
   */
  async getMarketData(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return getDemoDataWithVariation(DEMO_MARKET_DATA, 0.3);
  },

  /**
   * Subscribe to market data updates (returns a mock subscription)
   */
  subscribeToUpdates(callback: (data: any) => void): () => void {
    const interval = setInterval(() => {
      const updatedData = getDemoDataWithVariation(DEMO_MARKET_DATA, 0.5);
      callback(updatedData);
    }, 5000); // Update every 5 seconds

    // Return unsubscribe function
    return () => clearInterval(interval);
  },
};

/**
 * Check if we're in demo mode
 */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('demo_mode') === 'true';
}

/**
 * Demo service factory - returns appropriate service based on demo mode
 */
export function getDemoService<T>(realService: T, demoService: T): T {
  return isDemoMode() ? demoService : realService;
}
