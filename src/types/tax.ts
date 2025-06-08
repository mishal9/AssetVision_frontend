/**
 * Tax Types
 * Includes Tax Loss Harvesting and Tax Efficiency Analysis types
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

/**
 * Tax Efficiency Analysis Types
 */

// Represents a single holding's tax efficiency analysis
export interface TaxEfficientHolding {
  holdingId: number;
  symbol: string;
  quantity: number;
  marketValue: number;
  accountType: string;
  isTaxAdvantaged: boolean;
  isOptimalPlacement: boolean;
  placementScore: number;
  insights: string[];
  taxProfile: AssetTaxProfile;
}

// Asset tax profile information
export interface AssetTaxProfile {
  symbol: string;
  dividendYield: number;
  taxEfficiencyScore: number;
  assetClass: string | null;
  incomeType: string | null;
  classification: 'tax_efficient' | 'tax_neutral' | 'tax_inefficient';
}

// Portfolio tax efficiency recommendation
export interface TaxEfficiencyRecommendation {
  title: string;
  description: string;
  action: string;
  impact: 'high' | 'medium' | 'low' | 'positive';
}

// Metadata about the tax efficiency analysis
export interface TaxEfficiencyMetadata {
  taxableAssetsValue: number;
  taxAdvantagedAssetsValue: number;
  taxInefficientAssets: number;
  taxEfficientAssets: number;
  analyzedHoldings: number;
}

// Complete response structure from the Tax Efficiency API
export interface TaxEfficiencyResponse {
  overallScore: number;
  inefficientPlacements: TaxEfficientHolding[];
  efficientPlacements: TaxEfficientHolding[];
  insights: string[];
  recommendations: TaxEfficiencyRecommendation[];
  metadata: TaxEfficiencyMetadata;
}
