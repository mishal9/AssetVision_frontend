"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { alertsApi } from '@/services/alerts-api';
import { AlertRule, ConditionType, AlertRuleInput } from '@/types/alerts';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import DriftAlertCard from '@/components/alerts/DriftAlertCard';
import { DriftAlertForm } from '@/components/alerts/DriftAlertForm';
import { Plus, RefreshCw, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * DriftAlertsSection component
 * Displays existing drift alerts and allows users to create or edit alerts
 * Optimized with caching and optimistic updates
 */
const DriftAlertsSection: React.FC = () => {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingAlert, setEditingAlert] = useState<AlertRule | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasLoadedRef = useRef(false);
  
  // Cache duration: 3 minutes for alerts
  const CACHE_DURATION = 3 * 60 * 1000;

  // Memoized drift alert filter
  const driftConditionTypes = useMemo(() => [
    ConditionType.DRIFT,
    ConditionType.SECTOR_DRIFT,
    ConditionType.ASSET_CLASS_DRIFT,
  ], []);

  // Optimized fetch function with caching
  const fetchDriftAlerts = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const shouldUseCache = !forceRefresh && (now - lastFetchTime) < CACHE_DURATION;
    
    // Prevent duplicate loading
    if (hasLoadedRef.current && !forceRefresh) {
      console.log('Alerts already loaded, skipping duplicate load');
      return;
    }
    
    if (shouldUseCache && isInitialized && alerts.length > 0) {
      console.log('Using cached drift alerts');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      hasLoadedRef.current = true;
      
      const allAlerts = await alertsApi.getAlertRules();
      const driftAlerts = allAlerts.filter((alert) =>
        driftConditionTypes.includes(alert.conditionType)
      );
      
      setAlerts(driftAlerts);
      setLastFetchTime(now);
      setIsInitialized(true);
    } catch (err) {
      console.error('Error fetching drift alerts:', err);
      setError('Failed to load drift alerts.');
      hasLoadedRef.current = false; // Reset on error
    } finally {
      setLoading(false);
    }
  }, [alerts.length, driftConditionTypes, lastFetchTime, isInitialized, CACHE_DURATION]);

  // Initial load
  useEffect(() => {
    console.log('🔄 DriftAlertsSection: Auto-loading alerts...');
    fetchDriftAlerts();
  }, [fetchDriftAlerts]);

  // Optimistic update function
  const optimisticUpdate = useCallback((newAlert: AlertRule) => {
    setAlerts(prev => {
      if (editingAlert) {
        // Update existing alert
        return prev.map(alert => alert.id === editingAlert.id ? newAlert : alert);
      } else {
        // Add new alert
        return [...prev, newAlert];
      }
    });
  }, [editingAlert]);

  // Handle create or update submission with optimistic updates
  const handleSubmit = useCallback(async (data: AlertRuleInput) => {
    try {
      // Optimistic update - create temporary alert
      const tempAlert: AlertRule = {
        id: editingAlert?.id || `temp-${Date.now()}`,
        name: data.name,
        description: data.description || '',
        conditionType: data.conditionType,
        threshold: data.threshold,
        isActive: data.isActive ?? true,
        portfolioId: data.portfolioId || 'default',
        createdAt: editingAlert?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active' as any,
        userId: 'current-user' // This would come from auth context
      };
      
      // Apply optimistic update
      optimisticUpdate(tempAlert);
      
      // Close dialog immediately
      setDialogOpen(false);
      setEditingAlert(null);
      
      // Perform actual API call
      if (editingAlert) {
        await alertsApi.updateAlertRule(editingAlert.id, data);
      } else {
        await alertsApi.createAlertRule(data);
      }
      
      // Refresh data to get the real server response
      await fetchDriftAlerts(true);
    } catch (error) {
      console.error('Error saving alert:', error);
      // Revert optimistic update on error
      await fetchDriftAlerts(true);
      setError('Failed to save alert. Please try again.');
    }
  }, [editingAlert, optimisticUpdate, fetchDriftAlerts]);

  // Memoized refresh handler
  const handleRefresh = useCallback(() => {
    fetchDriftAlerts(true);
  }, [fetchDriftAlerts]);

  return (
    <section className="mt-10">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Drift Alerts</CardTitle>
            <CardDescription>
              Monitor portfolio drift and receive notifications when thresholds are exceeded.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => router.push('/dashboard/alerts/create')}
            >
              <Plus className="h-4 w-4" />
              <span>New Alert</span>
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={() => router.push('/dashboard/alerts')}
            >
              View all alerts
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Alert list */}
      {loading && !isInitialized ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-4">No drift alerts configured.</p>
          <Button 
            variant="default" 
            onClick={() => router.push('/dashboard/alerts/create')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Your First Alert
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {alerts.map((alert) => (
            <DriftAlertCard
              key={alert.id}
              alert={alert}
              onEdit={() => {
                setEditingAlert(alert);
                setDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Dialog for create/edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAlert ? 'Edit Drift Alert' : 'Create Drift Alert'}</DialogTitle>
            <DialogDescription>
              {editingAlert ? 'Update alert settings and thresholds.' : 'Define conditions to be notified when your portfolio drifts.'}
            </DialogDescription>
          </DialogHeader>
          <DriftAlertForm
            initialData={editingAlert || undefined}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default DriftAlertsSection; 