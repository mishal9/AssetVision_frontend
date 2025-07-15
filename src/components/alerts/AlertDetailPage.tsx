"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertRule, AlertHistory, ConditionType } from '../../types/alerts';
import { alertsApi } from '../../services/alerts-api';

import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import {
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Info,
  AlertTriangle,
  Trash2,
  ChevronRight,
  Loader2,
  BarChart3
} from 'lucide-react';

import { DriftVisualization } from './DriftVisualization';

interface AlertDetailPageProps {
  id: string;
}

export default function AlertDetailPage({ id }: AlertDetailPageProps) {
  const router = useRouter();
  const [alert, setAlert] = useState<AlertRule | null>(null);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [driftData, setDriftData] = useState<any | null>(null);
  const [driftDataLoading, setDriftDataLoading] = useState(false);
  const [driftDataError, setDriftDataError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Removed tabs state
  
  // Fetch alert details on component mount
  useEffect(() => {
    const fetchAlertDetails = async () => {
      setLoading(true);
      try {
        const alertData = await alertsApi.getAlertRule(id);
        setAlert(alertData);
        
        // Fetch alert history
        const historyData = await alertsApi.getAlertHistory(id);
        setHistory(historyData);
        
        // If it's a drift alert, fetch current drift data
        if (
          [ConditionType.DRIFT, ConditionType.SECTOR_DRIFT, ConditionType.ASSET_CLASS_DRIFT].includes(
            alertData.conditionType
          )
        ) {
          // For MVP, we assume user has only one portfolio
          setDriftDataLoading(true);
          setDriftDataError(null);
          
          try {
            // Use the user's default portfolio ID or the one from the alert if available
            // In MVP we assume user has only one portfolio, so we can pass "default" or user ID
            const portfolioId = alertData.portfolioId || 'default';
            const driftData = await alertsApi.getPortfolioDrift(portfolioId);
            setDriftData(driftData);
          } catch (error) {
            console.error('Error fetching drift data:', error);
            setDriftDataError('Failed to load drift data. Please try again later.');
          } finally {
            setDriftDataLoading(false);
          }
        }
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
  
  // Format alert condition type for display
  const getAlertTypeDisplay = (type: string) => {
    return type.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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
                {alert.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm">{getAlertTypeDisplay(alert.conditionType)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
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
                <p>{getAlertTypeDisplay(alert.conditionType)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Frequency</h3>
                <p>{getAlertTypeDisplay(alert.frequency)}</p>
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
                  
                  {alert.conditionType === ConditionType.SECTOR_DRIFT && (alert.conditionConfig.sectorId as string) && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Specific Sector</h3>
                      <p>Sector ID: {alert.conditionConfig.sectorId as string}</p>
                    </div>
                  )}
                  
                  {alert.conditionType === ConditionType.ASSET_CLASS_DRIFT && (alert.conditionConfig.assetClassId as string) && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Specific Asset Class</h3>
                      <p>Asset Class ID: {alert.conditionConfig.assetClassId as string}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events for this alert</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">No recent activity for this alert</p>
            ) : (
              <div className="space-y-4">
                {history.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-start gap-3">
                      {item.wasTriggered ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Info className="h-5 w-5 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {item.wasTriggered ? 'Alert Triggered' : 'Alert Checked'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.triggeredAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* History and Drift Analysis sections removed */}
    </div>
  );
}
