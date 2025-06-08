'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaxLossOpportunity, TaxLossResponse, TaxEfficiencyResponse, TaxEfficientHolding } from '@/types/tax';
import { portfolioApi } from '@/services/api';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowDownIcon, ArrowUpIcon, InfoIcon, AlertTriangleIcon, CheckCircleIcon, DollarSignIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TaxLossDetailsModal } from '@/components/dashboard/tax-loss-details-modal';

export default function TaxStrategiesPage() {
  // Tax Loss Harvesting state
  const [taxData, setTaxData] = useState<TaxLossResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<TaxLossOpportunity | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  
  // Tax Efficiency Analysis state
  const [taxEfficiencyData, setTaxEfficiencyData] = useState<TaxEfficiencyResponse | null>(null);
  const [efficiencyLoading, setEfficiencyLoading] = useState<boolean>(true);
  const [efficiencyError, setEfficiencyError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("taxLoss");

  useEffect(() => {
    const fetchTaxLossHarvesting = async () => {
      try {
        setLoading(true);
        const data = await portfolioApi.getTaxLossHarvestingOpportunities();
        setTaxData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tax loss harvesting data:', err);
        setError('Failed to load tax loss harvesting recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchTaxEfficiencyAnalysis = async () => {
      try {
        setEfficiencyLoading(true);
        const data = await portfolioApi.getTaxEfficiencyAnalysis();
        setTaxEfficiencyData(data);
        setEfficiencyError(null);
      } catch (err) {
        console.error('Error fetching tax efficiency data:', err);
        setEfficiencyError('Failed to load tax efficiency analysis. Please try again later.');
      } finally {
        setEfficiencyLoading(false);
      }
    };

    fetchTaxLossHarvesting();
    fetchTaxEfficiencyAnalysis();
  }, []);

  // Helper functions for displaying data elements
  const getBadgeForRecommendation = (recommendation: string) => {
    if (recommendation.startsWith('STRONGLY RECOMMENDED')) {
      return <Badge className="bg-green-600 hover:bg-green-700">Strongly Recommended</Badge>;
    } else if (recommendation.startsWith('RECOMMENDED')) {
      return <Badge className="bg-green-500 hover:bg-green-600">Recommended</Badge>;
    } else if (recommendation.startsWith('CONSIDER')) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Consider</Badge>;
    } else {
      return <Badge className="bg-gray-500 hover:bg-gray-600">Hold</Badge>;
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // No data or opportunities
  if (!taxData || taxData.opportunities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tax Loss Harvesting</CardTitle>
          <CardDescription>Optimize your portfolio's tax efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No Opportunities Found</AlertTitle>
            <AlertDescription>
              We currently don't see any tax loss harvesting opportunities in your portfolio. 
              This could be because your investments are performing well or there aren't enough unrealized losses to take advantage of.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Helper functions for Tax Efficiency cards
  const getEfficiencyBadge = (classification: string) => {
    if (classification === 'tax_efficient') {
      return <Badge className="bg-green-600 hover:bg-green-700">Tax Efficient</Badge>;
    } else if (classification === 'tax_neutral') {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Tax Neutral</Badge>;
    } else {
      return <Badge className="bg-amber-600 hover:bg-amber-700">Tax Inefficient</Badge>;
    }
  };

  const getPlacementBadge = (isOptimal: boolean) => {
    if (isOptimal) {
      return <Badge className="bg-green-600 hover:bg-green-700">Optimal Placement</Badge>;
    } else {
      return <Badge className="bg-amber-600 hover:bg-amber-700">Suboptimal Placement</Badge>;
    }
  };

  const getAccountTypeDisplay = (accountType: string, isTaxAdvantaged: boolean) => {
    return (
      <div>
        <Badge variant="outline" className={isTaxAdvantaged ? "bg-blue-50" : "bg-amber-50"}>
          {accountType}
        </Badge>
        <p className="text-xs text-muted-foreground mt-1">
          {isTaxAdvantaged ? "Tax-Advantaged" : "Taxable"}
          {isTaxAdvantaged && 
            <span className="ml-1">
              <InfoIcon className="h-3 w-3 inline text-muted-foreground" />
            </span>
          }
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tax Strategies</h1>
        <p className="text-muted-foreground mt-2">
          Optimize your portfolio's tax efficiency with our recommendations.
        </p>
      </div>
      
      <Tabs defaultValue="taxLoss" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="taxLoss">Tax Loss Harvesting</TabsTrigger>
          <TabsTrigger value="taxEfficiency">Tax Efficiency Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="taxLoss" className="space-y-6 mt-6">
          {/* Tax Loss Harvesting Content */}
          {loading && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!loading && !error && (!taxData || taxData.opportunities.length === 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Tax Loss Harvesting</CardTitle>
                <CardDescription>Optimize your portfolio's tax efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>No Opportunities Found</AlertTitle>
                  <AlertDescription>
                    We currently don't see any tax loss harvesting opportunities in your portfolio. 
                    This could be because your investments are performing well or there aren't enough unrealized losses to take advantage of.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
          
          {!loading && !error && taxData && taxData.opportunities.length > 0 && (
            <>
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Tax Loss Summary for {taxData.metadata.taxYear}</CardTitle>
                  <CardDescription>
                    {taxData.metadata.daysLeftInTaxYear} days remaining in the tax year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">YTD Realized Losses</p>
                      <p className="text-2xl font-bold">{formatCurrency(taxData.realizedLossSummary.ytdRealizedLosses)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Applied Against Ordinary Income</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center gap-1">
                            <p className="text-2xl font-bold">{formatCurrency(taxData.realizedLossSummary.appliedAgainstOrdinaryIncome)}</p>
                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>The IRS allows up to $3,000 of capital losses to offset ordinary income each year.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {/* Progress bar for $3,000 limit */}
                      <div className="mt-2 mb-1">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-600 transition-all duration-500 ease-in-out"
                            style={{ width: `${taxData.metadata.progressPct}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>You've harvested {formatCurrency(taxData.realizedLossSummary.appliedAgainstOrdinaryIncome)} / $3,000</span>
                        <span>{Math.round(taxData.metadata.progressPct)}% complete</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Loss Carryover</p>
                      <p className="text-2xl font-bold">{formatCurrency(taxData.realizedLossSummary.carryover)}</p>
                      <p className="text-xs text-muted-foreground">For future tax years</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Opportunities Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Tax Loss Harvesting Opportunities</CardTitle>
                  <CardDescription>
                    Potential tax savings: {formatCurrency(
                      taxData.opportunities.reduce((sum, opportunity) => sum + opportunity.potentialTaxSavings, 0)
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Security</TableHead>
                        <TableHead>Unrealized Loss</TableHead>
                        <TableHead>Potential Savings</TableHead>
                        <TableHead>Holding Period</TableHead>
                        <TableHead>Recommendation</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxData.opportunities.map((opportunity, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{opportunity.symbol}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-[140px]">
                                {opportunity.securityName}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-red-500">
                              {formatCurrency(opportunity.unrealizedGainLoss)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatPercent(opportunity.unrealizedGLPercent)}
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(opportunity.potentialTaxSavings)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {opportunity.isLongTerm ? (
                                <Badge variant="outline" className="bg-blue-50">Long-term</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50">Short-term</Badge>
                              )}
                              <span className="ml-2 text-sm text-muted-foreground">
                                {opportunity.holdingPeriodDays} days
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getBadgeForRecommendation(opportunity.recommendedAction)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOpportunity(opportunity);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {/* Tax Loss Harvesting Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Details & Considerations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Wash Sale Rules</h4>
                        <p className="text-sm text-muted-foreground">
                          The IRS wash sale rule prohibits claiming a loss if you buy the same or "substantially identical" 
                          security within 30 days before or after the sale. Our recommendations account for this rule.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Tax Rates</h4>
                        <p className="text-sm text-muted-foreground">
                          Using your current tax rates: {formatPercent(taxData.metadata.userTaxRate)} for short-term capital gains 
                          and {formatPercent(taxData.metadata.userLongTermRate)} for long-term capital gains.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Replacement Securities</h4>
                        <p className="text-sm text-muted-foreground">
                          Our system suggests alternative investments that offer similar exposure while avoiding wash sale rules.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Optimal Timing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {taxData.opportunities
                        .filter(opp => opp.recommendedAction.startsWith('STRONGLY') || opp.recommendedAction.startsWith('RECOMMENDED'))
                        .slice(0, 3)
                        .map((opportunity, index) => (
                          <div key={index} className="border-b pb-3 last:border-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{opportunity.symbol}</p>
                                {opportunity.optimalSellDate && (
                                  <p className="text-sm">
                                    Recommended sell: <span className="font-medium">{formatDate(opportunity.optimalSellDate)}</span>
                                  </p>
                                )}
                              </div>
                              <div>
                                {opportunity.washSaleRisk ? (
                                  <Badge variant="destructive">Wash Sale Risk</Badge>
                                ) : (
                                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {taxData.opportunities
                          .filter(opp => opp.recommendedAction.startsWith('STRONGLY') || opp.recommendedAction.startsWith('RECOMMENDED'))
                          .length === 0 && (
                          <p className="text-sm text-muted-foreground">No immediate actions recommended at this time.</p>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
          
          {/* Tax Loss Details Modal */}
          <TaxLossDetailsModal
            opportunity={selectedOpportunity}
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
          />
        </TabsContent>
        
        <TabsContent value="taxEfficiency" className="space-y-6 mt-6">
          {/* Tax Efficiency Analysis Content */}
          {efficiencyLoading && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {efficiencyError && (
            <Alert variant="destructive">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{efficiencyError}</AlertDescription>
            </Alert>
          )}
          
          {!efficiencyLoading && !efficiencyError && (!taxEfficiencyData || (taxEfficiencyData.inefficientPlacements.length === 0 && taxEfficiencyData.efficientPlacements.length === 0)) && (
            <Card>
              <CardHeader>
                <CardTitle>Tax Efficiency Analysis</CardTitle>
                <CardDescription>Optimize placement of assets in taxable vs. tax-advantaged accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>No Analysis Available</AlertTitle>
                  <AlertDescription>
                    We couldn't analyze your portfolio for tax efficiency. This might be because you don't have a mix of both
                    taxable and tax-advantaged accounts, or because there isn't enough data available for the assets in your portfolio.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
          
          {!efficiencyLoading && !efficiencyError && taxEfficiencyData && (taxEfficiencyData.inefficientPlacements.length > 0 || taxEfficiencyData.efficientPlacements.length > 0) && (
            <>
              {/* Tax Efficiency Score Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Tax Efficiency</CardTitle>
                  <CardDescription>Overall score based on asset placement in taxable vs. tax-advantaged accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="relative h-36 w-36">
                      <svg className="h-full w-full" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                          className="stroke-gray-200"
                          strokeWidth="8"
                          cx="50"
                          cy="50"
                          r="46"
                          fill="transparent"
                        />
                        {/* Score circle */}
                        <circle
                          className={`${taxEfficiencyData.overallScore >= 80 ? 'stroke-green-600' : 
                                       taxEfficiencyData.overallScore >= 60 ? 'stroke-blue-500' : 
                                       taxEfficiencyData.overallScore >= 40 ? 'stroke-amber-500' : 'stroke-red-500'}`}
                          strokeWidth="8"
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="46"
                          fill="transparent"
                          strokeDasharray="289"
                          strokeDashoffset={289 - (289 * taxEfficiencyData.overallScore / 100)}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{Math.round(taxEfficiencyData.overallScore)}</span>
                        <span className="text-sm text-muted-foreground">out of 100</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Taxable Assets</p>
                      <p className="text-xl font-bold">{formatCurrency(taxEfficiencyData.metadata.taxableAssetsValue)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Tax-Advantaged Assets</p>
                      <p className="text-xl font-bold">{formatCurrency(taxEfficiencyData.metadata.taxAdvantagedAssetsValue)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Suboptimal Placements</p>
                      <p className="text-xl font-bold">{taxEfficiencyData.metadata.taxInefficientAssets} of {taxEfficiencyData.metadata.analyzedHoldings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Insights and Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {taxEfficiencyData.insights.map((insight, index) => (
                        <Alert key={index} variant="default" className="bg-blue-50 border-blue-200">
                          <InfoIcon className="h-4 w-4 text-blue-700" />
                          <AlertDescription className="text-blue-700">{insight}</AlertDescription>
                        </Alert>
                      ))}
                      
                      {taxEfficiencyData.insights.length === 0 && (
                        <p className="text-sm text-muted-foreground">No specific insights available.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {taxEfficiencyData.recommendations.map((rec, index) => (
                        <div key={index} className="border-b pb-3 last:border-0">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="font-medium">{rec.title}</p>
                              <p className="text-sm text-muted-foreground">{rec.description}</p>
                              <p className="text-sm mt-1 font-medium">
                                Suggested action: <span className="text-blue-600">{rec.action}</span>
                              </p>
                            </div>
                            <Badge className={`
                              ${rec.impact === 'high' ? 'bg-green-600 hover:bg-green-700' : 
                                rec.impact === 'medium' ? 'bg-blue-500 hover:bg-blue-600' : 
                                rec.impact === 'low' ? 'bg-gray-500 hover:bg-gray-600' : 
                                'bg-amber-500 hover:bg-amber-600'}
                            `}>
                              {rec.impact === 'high' ? 'High Impact' : 
                               rec.impact === 'medium' ? 'Medium Impact' : 
                               rec.impact === 'low' ? 'Low Impact' : 
                               'Positive Impact'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      
                      {taxEfficiencyData.recommendations.length === 0 && (
                        <p className="text-sm text-muted-foreground">No recommendations available at this time.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Asset Placement Tables */}
              {taxEfficiencyData.inefficientPlacements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Suboptimal Asset Placements</CardTitle>
                    <CardDescription>Assets that may benefit from placement in different account types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Security</TableHead>
                          <TableHead>Market Value</TableHead>
                          <TableHead>Account Type</TableHead>
                          <TableHead>Tax Classification</TableHead>
                          <TableHead>Placement</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {taxEfficiencyData.inefficientPlacements.map((holding, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{holding.symbol}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(holding.quantity)} shares
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(holding.marketValue)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={holding.isTaxAdvantaged ? "bg-blue-50" : "bg-amber-50"}>
                                {holding.accountType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getEfficiencyBadge(holding.taxProfile.classification)}
                              <p className="text-xs text-muted-foreground mt-1">
                                {holding.taxProfile.dividendYield > 0 ? 
                                  `${formatPercent(holding.taxProfile.dividendYield)} yield` : 
                                  'No dividend'}
                              </p>
                            </TableCell>
                            <TableCell>
                              {getPlacementBadge(holding.isOptimalPlacement)}
                              <div title={`${holding.insights.join(" ")}\n\nScore explanation: 100 = Optimal, 80 = Good, 30 = Suboptimal`} className="flex items-center gap-1 cursor-help mt-1">
                                <p className="text-xs text-muted-foreground">Score: {holding.placementScore}</p>
                                <InfoIcon className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
              
              {taxEfficiencyData.efficientPlacements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Optimal Asset Placements</CardTitle>
                    <CardDescription>Assets that are well-placed from a tax perspective</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Security</TableHead>
                          <TableHead>Market Value</TableHead>
                          <TableHead>Account Type</TableHead>
                          <TableHead>Tax Classification</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {taxEfficiencyData.efficientPlacements.map((holding, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{holding.symbol}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(holding.quantity)} shares
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(holding.marketValue)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={holding.isTaxAdvantaged ? "bg-blue-50" : "bg-amber-50"}>
                                {holding.accountType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getEfficiencyBadge(holding.taxProfile.classification)}
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {holding.taxProfile.dividendYield > 0 ? 
                                  `${formatPercent(holding.taxProfile.dividendYield)} yield` : 
                                  'No dividend'}
                              </p>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
