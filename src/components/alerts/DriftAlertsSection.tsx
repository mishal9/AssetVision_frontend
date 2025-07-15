"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { alertsApi } from '@/services/alerts-api';
import { AlertRule, ConditionType, AlertRuleInput } from '@/types/alerts';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import DriftAlertCard from '@/components/alerts/DriftAlertCard';
import { DriftAlertForm } from '@/components/alerts/DriftAlertForm';
import { Plus, RefreshCw, Loader2 } from 'lucide-react';

/**
 * DriftAlertsSection component
 * Displays existing drift alerts and allows users to create or edit alerts
 */
const DriftAlertsSection: React.FC = () => {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingAlert, setEditingAlert] = useState<AlertRule | null>(null);

  // Fetch drift alerts on mount or refresh
  const fetchDriftAlerts = async () => {
    setLoading(true);
    try {
      const allAlerts = await alertsApi.getAlertRules();
      const driftAlerts = allAlerts.filter((alert) =>
        [
          ConditionType.DRIFT,
          ConditionType.SECTOR_DRIFT,
          ConditionType.ASSET_CLASS_DRIFT,
        ].includes(alert.conditionType)
      );
      setAlerts(driftAlerts);
      setError(null);
    } catch (err) {
      console.error('Error fetching drift alerts:', err);
      setError('Failed to load drift alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriftAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle create or update submission
  const handleSubmit = async (data: AlertRuleInput) => {
    if (editingAlert) {
      // Update existing
      await alertsApi.updateAlertRule(editingAlert.id, data);
    } else {
      // Create new
      await alertsApi.createAlertRule(data);
    }
    setDialogOpen(false);
    setEditingAlert(null);
    await fetchDriftAlerts();
  };

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
              onClick={fetchDriftAlerts}
              disabled={loading}
              className="flex items-center gap-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span>Refresh</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => {
                setEditingAlert(null);
                setDialogOpen(true);
              }}
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
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="text-center text-destructive py-6">{error}</p>
      ) : alerts.length === 0 ? (
        <p className="text-center py-6">No drift alerts configured.</p>
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