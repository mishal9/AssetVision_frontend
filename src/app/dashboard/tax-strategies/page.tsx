'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaxLossOpportunity, TaxLossResponse } from '@/types/tax';
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
  const [taxData, setTaxData] = useState<TaxLossResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<TaxLossOpportunity | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchTaxLossHarvesting = async () => {
      try {
        setLoading(true);
        const data = await portfolioApi.getTaxLossHarvestingOpportunities();
        setTaxData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tax loss harvesting data:', err);
        setError('Failed to load tax strategy recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaxLossHarvesting();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tax Strategies</h1>
        <p className="text-muted-foreground mt-2">
          Optimize your portfolio's tax efficiency with our recommendations.
        </p>
      </div>

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

      {/* Tax Loss Details Modal */}
      <TaxLossDetailsModal
        opportunity={selectedOpportunity}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}
