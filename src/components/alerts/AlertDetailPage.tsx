"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertRule, ConditionType } from '../../types/alerts';
import { alertsApi } from '../../services/alerts-api';

import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import {
  ArrowLeft,
  Edit,
  AlertTriangle,
  Trash2,
  Loader2,
  RefreshCw
} from 'lucide-react';


interface AlertDetailPageProps {
  id: string;
}

export default function AlertDetailPage({ id }: AlertDetailPageProps) {
  const router = useRouter();
  const [alert, setAlert] = useState<AlertRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch alert details on component mount
  useEffect(() => {
    const fetchAlertDetails = async () => {
      setLoading(true);
      try {
        const alertData = await alertsApi.getAlertRule(id);
        setAlert(alertData);
        
      } catch (error) {
        console.error('Error fetching alert details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlertDetails();
  }, [id]);
  
  // Handle alert actions
  const handleEdit = () => {
    router.push(`/dashboard/alerts/${id}/edit`);
  };
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this alert?')) {
      try {
        await alertsApi.deleteAlertRule(id);
        router.push('/dashboard/alerts');
      } catch (error) {
        console.error('Error deleting alert:', error);
      }
    }
  };
  
  const handleToggleStatus = async () => {
    if (!alert) return;
    
    try {
      await alertsApi.updateAlertRule(id, { isActive: !alert.isActive });
      setAlert({ ...alert, isActive: !alert.isActive });
    } catch (error) {
      console.error('Error updating alert status:', error);
    }
  };
  
  const handleBack = () => {
    router.push('/dashboard/alerts');
  };
  
  const handleRefresh = async () => {
    if (!alert) return;
    
    setRefreshing(true);
    try {
      const updatedAlert = await alertsApi.getAlertRule(id);
      setAlert(updatedAlert);
    } catch (error) {
      console.error('Error refreshing alert:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-muted-foreground">Loading alert details...</p>
      </div>
    );
  }
  
  // Error state
  if (!alert) {
    return (
      <div className="container mx-auto py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold mt-4">Alert Not Found</h2>
        <p className="text-muted-foreground mt-2">The alert you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={handleBack} className="mt-6">
          <ArrowLeft size={16} className="mr-2" />
          Back to Alerts
        </Button>
      </div>
    );
  }
  
  // Determine if this is a drift alert
  const isDriftAlert = [
    ConditionType.DRIFT,
    ConditionType.SECTOR_DRIFT,
    ConditionType.ASSET_CLASS_DRIFT
  ].includes(alert.conditionType);
  
  // Use display fields from API or format as fallback
  const getAlertTypeDisplay = (alert: AlertRule) => {
    // Use the display field from API if available, otherwise format the type
    if ((alert as any).conditionTypeDisplay) {
      return (alert as any).conditionTypeDisplay;
    }
    return alert.conditionType.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  const getFrequencyDisplay = (alert: AlertRule) => {
    // Use the display field from API if available, otherwise format the frequency
    if ((alert as any).frequencyDisplay) {
      return (alert as any).frequencyDisplay;
    }
    return alert.frequency.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  const getStatusDisplay = (alert: AlertRule) => {
    // Use the display field from API if available, otherwise use status
    if ((alert as any).statusDisplay) {
      return (alert as any).statusDisplay;
    }
    return alert.status;
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleBack} className="mr-2">
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{alert.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge variant={alert.isActive ? "outline" : "secondary"}>
                {getStatusDisplay(alert)}
              </Badge>
              <span className="text-sm">{getAlertTypeDisplay(alert)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleToggleStatus}>
            {alert.isActive ? 'Pause' : 'Activate'}
          </Button>
          <Button variant="secondary" onClick={handleEdit}>
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Overview Section */}
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Details</CardTitle>
              <CardDescription>Basic information about this alert</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Alert Type</h3>
                <p>{getAlertTypeDisplay(alert)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Frequency</h3>
                <p>{getFrequencyDisplay(alert)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Triggered</h3>
                <p>{alert.lastTriggered ? new Date(alert.lastTriggered).toLocaleString() : 'Never'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created On</h3>
                <p>{new Date(alert.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Condition Configuration</CardTitle>
              <CardDescription>Parameters for when this alert triggers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isDriftAlert && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Drift Type</h3>
                    <p>{(alert.conditionConfig.driftType as string) === 'absolute' ? 'Absolute (% change)' : 'Relative (% from target)'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Threshold</h3>
                    <p>{Number(alert.conditionConfig.thresholdPercent)}%</p>
                  </div>
                  
                  {alert.conditionType === ConditionType.SECTOR_DRIFT && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Specific Sector</h3>
                      <p>{(alert.conditionConfig as any).sectorName || (alert.conditionConfig.sectorId as string) || 'All Sectors'}</p>
                    </div>
                  )}
                  
                  {alert.conditionType === ConditionType.ASSET_CLASS_DRIFT && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Specific Asset Class</h3>
                      <p>{(alert.conditionConfig as any).assetClassName || (alert.conditionConfig.assetClassId as string) || 'All Asset Classes'}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
      </div>

      {/* History and Drift Analysis sections removed */}
    </div>
  );
}
