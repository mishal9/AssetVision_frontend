import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { AlertRule, ConditionType } from '../../types/alerts';
import { formatDistanceToNow } from 'date-fns';

interface DriftAlertCardProps {
  alert: AlertRule;
  onResolve?: () => void;
  onView?: () => void;
  onEdit?: () => void;
}

const DriftAlertCard: React.FC<DriftAlertCardProps> = ({ 
  alert, 
  onResolve, 
  onView, 
  onEdit 
}) => {
  // Only handle drift-type alerts
  const isDriftAlert = [
    ConditionType.DRIFT, 
    ConditionType.SECTOR_DRIFT, 
    ConditionType.ASSET_CLASS_DRIFT
  ].includes(alert.conditionType);

  if (!isDriftAlert) {
    return null;
  }

  // Extract drift-specific information
  const { conditionConfig } = alert;
  const thresholdPercent = Number(conditionConfig.thresholdPercent) || 5;
  const driftType = (conditionConfig.driftType as string) || 'absolute';
  
  // Format last triggered time if available
  const lastTriggeredText = alert.lastTriggered
    ? formatDistanceToNow(new Date(alert.lastTriggered), { addSuffix: true })
    : 'Never triggered';

  // Determine alert type label
  const alertTypeLabel = () => {
    switch (alert.conditionType) {
      case ConditionType.DRIFT:
        return 'Portfolio Drift';
      case ConditionType.SECTOR_DRIFT:
        return 'Sector Drift';
      case ConditionType.ASSET_CLASS_DRIFT:
        return 'Asset Class Drift';
      default:
        return 'Drift';
    }
  };

  // Determine badge color based on alert status
  const getBadgeVariant = () => {
    if (!alert.isActive) return 'secondary';
    return alert.lastTriggered ? 'destructive' : 'outline';
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="bg-muted/50 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{alert.name}</CardTitle>
          <Badge variant={getBadgeVariant()}>
            {alert.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1 text-sm">
          {alertTypeLabel()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" />
            <span className="text-sm">
              Trigger when {driftType === 'absolute' ? 'absolute' : 'relative'} drift exceeds {thresholdPercent}%
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            <span className="text-xs text-muted-foreground">
              Last triggered: {lastTriggeredText}
            </span>
          </div>
          
          {alert.conditionType === ConditionType.SECTOR_DRIFT && (
            <div className="mt-2 text-xs">
              <span className="font-medium">Sectors: </span>
              {(conditionConfig.sectorId as string) ? 'Specific sector' : 'All sectors'}
              {Array.isArray(conditionConfig.excludedSectors) && (conditionConfig.excludedSectors as string[]).length > 0 && 
                ` (${(conditionConfig.excludedSectors as string[]).length} excluded)`
              }
            </div>
          )}
          
          {alert.conditionType === ConditionType.ASSET_CLASS_DRIFT && (
            <div className="mt-2 text-xs">
              <span className="font-medium">Asset Classes: </span>
              {(conditionConfig.assetClassId as string) ? 'Specific asset class' : 'All asset classes'}
              {Array.isArray(conditionConfig.excludedAssetClasses) && (conditionConfig.excludedAssetClasses as string[]).length > 0 && 
                ` (${(conditionConfig.excludedAssetClasses as string[]).length} excluded)`
              }
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 pb-3 bg-muted/30">
        {alert.lastTriggered && onResolve && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs" 
            onClick={onResolve}
          >
            <CheckCircle2 size={14} className="mr-1" />
            Resolve
          </Button>
        )}
        
        {onView && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs" 
            onClick={onView}
          >
            View
          </Button>
        )}
        
        {onEdit && (
          <Button 
            variant="secondary" 
            size="sm" 
            className="text-xs" 
            onClick={onEdit}
          >
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DriftAlertCard;
