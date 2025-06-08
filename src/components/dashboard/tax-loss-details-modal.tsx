'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaxLossOpportunity, SimilarSecurity } from "@/types/tax";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, TrendingDown, Calendar, ArrowRight } from "lucide-react";

interface TaxLossDetailsModalProps {
  opportunity: TaxLossOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaxLossDetailsModal({ opportunity, isOpen, onClose }: TaxLossDetailsModalProps) {
  if (!opportunity) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const summarizeRecommendation = (recommendation: string): string => {
    // Remove the prefix like "STRONGLY RECOMMENDED: " or "HOLD: " to get just the advice
    const prefixes = ["STRONGLY RECOMMENDED: ", "RECOMMENDED: ", "CONSIDER: ", "HOLD: ", "CONSIDER DEFERRING: "];
    let result = recommendation;
    
    prefixes.forEach(prefix => {
      if (recommendation.startsWith(prefix)) {
        result = recommendation.substring(prefix.length);
      }
    });
    
    return result;
  };

  const getRecommendationBadge = (recommendation: string) => {
    if (recommendation.startsWith("STRONGLY RECOMMENDED")) {
      return <Badge className="bg-green-600">Strongly Recommended</Badge>;
    } else if (recommendation.startsWith("RECOMMENDED")) {
      return <Badge className="bg-green-500">Recommended</Badge>;
    } else if (recommendation.startsWith("CONSIDER")) {
      return <Badge className="bg-yellow-500">Consider</Badge>;
    } else {
      return <Badge className="bg-gray-500">Hold</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{opportunity.symbol}</span>
            <span className="text-muted-foreground font-normal text-sm">
              ({opportunity.securityName})
            </span>
          </DialogTitle>
          <DialogDescription>
            Tax loss harvesting opportunity details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-hidden">
          {/* Summary Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Unrealized Loss</div>
              <div className="text-lg font-semibold text-red-500">
                {formatCurrency(opportunity.unrealizedGainLoss)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPercent(opportunity.unrealizedGLPercent)}
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Potential Tax Savings</div>
              <div className="text-lg font-semibold">
                {formatCurrency(opportunity.potentialTaxSavings)}
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Account</div>
              <div className="text-lg font-semibold truncate max-w-full">
                {opportunity.accountName}
              </div>
              <div className="text-xs text-muted-foreground">
                {opportunity.accountType}
              </div>
            </div>
          </div>

          {/* Position Details */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">Position Details</CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
                <dt className="text-sm font-medium text-muted-foreground">Quantity</dt>
                <dd className="text-sm">{opportunity.quantity.toFixed(2)}</dd>
                
                <dt className="text-sm font-medium text-muted-foreground">Market Value</dt>
                <dd className="text-sm">{formatCurrency(opportunity.marketValue)}</dd>
                
                <dt className="text-sm font-medium text-muted-foreground">Cost Basis</dt>
                <dd className="text-sm">{formatCurrency(opportunity.costBasis)}</dd>
                
                <dt className="text-sm font-medium text-muted-foreground">Holding Period</dt>
                <dd className="text-sm flex items-center">
                  {opportunity.holdingPeriodDays} days
                  {opportunity.isLongTerm ? (
                    <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100" variant="outline">Long-term</Badge>
                  ) : (
                    <Badge className="ml-2 bg-orange-100 text-orange-800 hover:bg-orange-100" variant="outline">Short-term</Badge>
                  )}
                </dd>
                
                <dt className="text-sm font-medium text-muted-foreground">Tax Lots</dt>
                <dd className="text-sm">{opportunity.lotCount} {opportunity.lotCount > 1 ? "lots" : "lot"}</dd>
                
                <dt className="text-sm font-medium text-muted-foreground">Average Volume</dt>
                <dd className="text-sm">{opportunity.averageDailyVolume.toLocaleString()} shares</dd>
              </dl>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card>
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recommendation</CardTitle>
              <div>{getRecommendationBadge(opportunity.recommendedAction)}</div>
            </CardHeader>
            <CardContent className="py-3 space-y-3">
              <p>{summarizeRecommendation(opportunity.recommendedAction)}</p>
              
              {opportunity.washSaleRisk && (
                <div className="flex items-start gap-2 p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Wash Sale Risk</h4>
                    <p className="text-sm text-yellow-700">
                      Recent purchases detected across your accounts. Selling now risks a wash sale disallowance. 
                      Wait at least 31 days after the most recent purchase.
                    </p>
                  </div>
                </div>
              )}
              
              {(opportunity.optimalSellDate || opportunity.optimalReinvestmentDate) && (
                <div className="flex gap-2 p-3 border border-blue-200 bg-blue-50 rounded-md">
                  <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Optimal Timing</h4>
                    {opportunity.optimalSellDate && (
                      <p className="text-sm text-blue-700">
                        Recommended sell date: <span className="font-medium">{formatDate(opportunity.optimalSellDate)}</span>
                      </p>
                    )}
                    {opportunity.optimalReinvestmentDate && (
                      <p className="text-sm text-blue-700">
                        Earliest reinvestment date: <span className="font-medium">{formatDate(opportunity.optimalReinvestmentDate)}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Similar Securities */}
          {opportunity.similarSecurities?.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">Replacement Securities</CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <p className="text-sm mb-3">
                  Consider these alternatives to maintain market exposure while avoiding wash sale rules:
                </p>
                <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                  {opportunity.similarSecurities.map((security, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <div>
                        <div className="font-medium">{security.symbol}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-[200px] md:max-w-[250px]">{security.name}</div>
                      </div>
                      <div className="flex items-center">
                        <TrendingDown className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm">{(security.similarity * 100).toFixed(0)}% similar</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
