/**
 * Mock portfolio drift data for development and testing
 * This can be used when the backend is unavailable
 */

import { DriftResponse } from '@/types/portfolio';

export const mockDriftData: DriftResponse = {
  overall: {
    portfolioId: 'mock-portfolio-id',
    portfolioName: 'My Investment Portfolio',
    lastUpdated: new Date().toISOString(),
    totalAbsoluteDrift: 5.8,
    items: [
      {
        name: 'Overall Allocation',
        currentAllocation: 100,
        targetAllocation: 100,
        absoluteDrift: 5.8,
        relativeDrift: 5.8,
      }
    ]
  },
  asset_class: {
    portfolioId: 'mock-portfolio-id',
    portfolioName: 'My Investment Portfolio',
    lastUpdated: new Date().toISOString(),
    totalAbsoluteDrift: 5.8,
    items: [
      {
        name: 'Equity',
        currentAllocation: 65.2,
        targetAllocation: 60,
        absoluteDrift: 5.2,
        relativeDrift: 8.7,
      },
      {
        name: 'Fixed Income',
        currentAllocation: 19.3,
        targetAllocation: 25,
        absoluteDrift: -5.7,
        relativeDrift: -22.8,
      },
      {
        name: 'Cash',
        currentAllocation: 5.6,
        targetAllocation: 5,
        absoluteDrift: 0.6,
        relativeDrift: 12.0,
      },
      {
        name: 'Alternative',
        currentAllocation: 9.9,
        targetAllocation: 10,
        absoluteDrift: -0.1,
        relativeDrift: -1.0,
      }
    ]
  },
  sector: {
    portfolioId: 'mock-portfolio-id',
    portfolioName: 'My Investment Portfolio',
    lastUpdated: new Date().toISOString(),
    totalAbsoluteDrift: 8.4,
    items: [
      {
        name: 'Technology',
        currentAllocation: 32.5,
        targetAllocation: 25,
        absoluteDrift: 7.5,
        relativeDrift: 30.0,
      },
      {
        name: 'Healthcare',
        currentAllocation: 12.8,
        targetAllocation: 15,
        absoluteDrift: -2.2,
        relativeDrift: -14.7,
      },
      {
        name: 'Financial Services',
        currentAllocation: 18.6,
        targetAllocation: 20,
        absoluteDrift: -1.4,
        relativeDrift: -7.0,
      },
      {
        name: 'Consumer Cyclical',
        currentAllocation: 10.2,
        targetAllocation: 10,
        absoluteDrift: 0.2,
        relativeDrift: 2.0,
      },
      {
        name: 'Communication Services',
        currentAllocation: 8.7,
        targetAllocation: 10,
        absoluteDrift: -1.3,
        relativeDrift: -13.0,
      },
      {
        name: 'Utilities',
        currentAllocation: 4.3,
        targetAllocation: 5,
        absoluteDrift: -0.7,
        relativeDrift: -14.0,
      },
      {
        name: 'Other',
        currentAllocation: 12.9,
        targetAllocation: 15,
        absoluteDrift: -2.1,
        relativeDrift: -14.0,
      }
    ]
  }
};
