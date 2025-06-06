/**
 * Tax Loss Harvesting Types
 */

// Main opportunity structure representing a position with tax loss harvesting potential
export interface TaxLossOpportunity {
  symbol: string;
  securityName: string;
  quantity: number;
  marketValue: number;
  costBasis: number;
  unrealizedGainLoss: number;
  unrealizedGLPercent: number;
  potentialTaxSavings: number;
  holdingPeriodDays: number;
  isLongTerm: boolean;
  recommendedAction: string;
  optimalSellDate: string | null;
  optimalReinvestmentDate: string | null;
  washSaleRisk: boolean;
  averageDailyVolume: number;
  lotCount: number;
  similarSecurities: SimilarSecurity[];
  riskFactors: string[];
  accountType: string;
  accountName: string;
}

// Structure for replacement security suggestions
export interface SimilarSecurity {
  symbol: string;
  name: string;
  similarity: number;
}

// Summary of already realized losses for tax purposes
export interface RealizedLossSummary {
  ytdRealizedLosses: number;
  appliedAgainstOrdinaryIncome: number;
  remainingOrdinaryDeduction: number;
  appliedAgainstCapitalGains: number;
  carryover: number;
}

// Metadata about the analysis
export interface TaxAnalysisMetadata {
  generatedDate: string;
  taxYear: number;
  daysLeftInTaxYear: number;
  userTaxRate: number;
  userLongTermRate: number;
}

// Complete response structure from the API
export interface TaxLossResponse {
  opportunities: TaxLossOpportunity[];
  realizedLossSummary: RealizedLossSummary;
  metadata: TaxAnalysisMetadata;
}
