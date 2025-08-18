/**
 * Service Factory
 * Dynamically switches between real and demo services based on demo mode
 * Ensures seamless integration without changing business logic
 */

import { 
  isDemoMode, 
  demoAuthService, 
  demoPlaidService, 
  demoPortfolioService, 
  demoAlertsService, 
  demoRiskService, 
  demoAiChatService, 
  demoMarketDataService 
} from './demo-stubs';

// Import real services
import { authService } from './auth';
import { plaidApi } from './plaid-api';

/**
 * Authentication Service Factory
 * Returns demo auth service in demo mode, real service otherwise
 */
export const getAuthService = () => {
  if (isDemoMode()) {
    return demoAuthService;
  }
  return authService;
};

/**
 * Plaid Service Factory
 * Returns demo Plaid service in demo mode, real service otherwise
 */
export const getPlaidService = () => {
  if (isDemoMode()) {
    return demoPlaidService;
  }
  return plaidApi;
};

/**
 * Portfolio Service Factory
 * Returns demo portfolio service in demo mode, real service otherwise
 */
export const getPortfolioService = () => {
  if (isDemoMode()) {
    return demoPortfolioService;
  }
  
  // Return real portfolio service
  // Note: This would import the real portfolio API service
  return {
    getPerformance: async () => {
      const { portfolioApi } = await import('./api');
      return portfolioApi.getPerformance();
    },
    getAllocation: async () => {
      const { portfolioApi } = await import('./api');
      return portfolioApi.getAllocation();
    },
    getSectorAllocation: async () => {
      const { portfolioApi } = await import('./api');
      return portfolioApi.getSectorAllocation();
    },
    getDrift: async () => {
      const { portfolioApi } = await import('./api');
      return portfolioApi.getDrift();
    },
    getSummary: async () => {
      const { portfolioApi } = await import('./api');
      return portfolioApi.getSummary();
    },
    getTaxLossHarvesting: async () => {
      const { portfolioApi } = await import('./api');
      return portfolioApi.getTaxLossHarvesting();
    },
    getTaxEfficiency: async () => {
      const { portfolioApi } = await import('./api');
      return portfolioApi.getTaxEfficiency();
    },
    getAssetClasses: async () => {
      const { portfolioApi } = await import('./api');
      return portfolioApi.getAssetClasses();
    },
    getSectors: async () => {
      const { portfolioApi } = await import('./api');
      return portfolioApi.getSectors();
    },
    saveTargetAllocations: async (allocations: any[]) => {
      const { portfolioApi } = await import('./api');
      return portfolioApi.saveTargetAllocations(allocations);
    },
    saveSectorTargetAllocations: async (allocations: any[]) => {
      const { portfolioApi } = await import('./api');
      return portfolioApi.saveSectorTargetAllocations(allocations);
    },
  };
};

/**
 * Alerts Service Factory
 * Returns demo alerts service in demo mode, real service otherwise
 */
export const getAlertsService = () => {
  if (isDemoMode()) {
    return demoAlertsService;
  }
  
  // Return real alerts service
  return {
    getAlerts: async () => {
      const { alertsApi } = await import('./alerts-api');
      return alertsApi.getAlerts();
    },
    createAlert: async (alertData: any) => {
      const { alertsApi } = await import('./alerts-api');
      return alertsApi.createAlert(alertData);
    },
    updateAlert: async (alertId: string, updateData: any) => {
      const { alertsApi } = await import('./alerts-api');
      return alertsApi.updateAlert(alertId, updateData);
    },
    deleteAlert: async (alertId: string) => {
      const { alertsApi } = await import('./alerts-api');
      return alertsApi.deleteAlert(alertId);
    },
  };
};

/**
 * Risk/Optimization Service Factory
 * Returns demo risk service in demo mode, real service otherwise
 */
export const getRiskService = () => {
  if (isDemoMode()) {
    return demoRiskService;
  }
  
  // Return real risk service
  return {
    optimize: async (parameters: any) => {
      const { riskApi } = await import('./api');
      return riskApi.optimize(parameters);
    },
  };
};

/**
 * AI Chat Service Factory
 * Returns demo AI service in demo mode, real service otherwise
 */
export const getAiChatService = () => {
  if (isDemoMode()) {
    return demoAiChatService;
  }
  
  // Return real AI service
  return {
    getChatHistory: async () => {
      // Real AI chat service would be implemented here
      return [];
    },
    sendMessage: async (message: string) => {
      // Real AI chat service would be implemented here
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'AI service not implemented in production yet.',
        timestamp: new Date().toISOString(),
      };
    },
    clearHistory: async () => {
      // Real AI chat service would be implemented here
    },
  };
};

/**
 * Market Data Service Factory
 * Returns demo market data service in demo mode, real service otherwise
 */
export const getMarketDataService = () => {
  if (isDemoMode()) {
    return demoMarketDataService;
  }
  
  // Return real market data service
  return {
    getMarketData: async () => {
      const { marketDataService } = await import('./marketData');
      return marketDataService.getMarketData();
    },
    subscribeToUpdates: (callback: (data: any) => void) => {
      const { marketDataService } = await import('./marketData');
      return marketDataService.subscribeToUpdates(callback);
    },
  };
};

/**
 * Generic service factory function
 * Can be used to wrap any service with demo mode detection
 */
export function createServiceFactory<T>(realService: T, demoService: T): () => T {
  return () => {
    return isDemoMode() ? demoService : realService;
  };
}

/**
 * Utility function to check if we should use demo services
 */
export function shouldUseDemoServices(): boolean {
  return isDemoMode();
}

/**
 * Utility function to get demo mode status for components
 */
export function getDemoModeStatus() {
  return {
    isDemo: isDemoMode(),
    sessionId: typeof window !== 'undefined' ? sessionStorage.getItem('demo_session') : null,
    timestamp: new Date().toISOString(),
  };
}
