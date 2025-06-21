"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertRule, AlertRuleInput, ConditionType } from '../../types/alerts';
import { alertsApi } from '../../services/alerts-api';
import { DriftAlertForm } from './DriftAlertForm';
import { 
  ArrowLeft,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

interface Portfolio {
  id: string;
  name: string;
}

interface Sector {
  id: string;
  name: string;
}

interface AssetClass {
  id: string;
  name: string;
}

interface EditAlertPageProps {
  id: string;
}

export default function EditAlertPage({ id }: EditAlertPageProps) {
  const router = useRouter();
  const [alert, setAlert] = useState<AlertRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [assetClasses, setAssetClasses] = useState<AssetClass[]>([]);

  // Fetch alert data and supporting data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch alert data
        const alertData = await alertsApi.getAlertRule(id);
        setAlert(alertData);

        // In a real implementation, you'd fetch this data from your API
        // For now, use dummy data
        setPortfolios([
          { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Main Portfolio' },
          { id: '223e4567-e89b-12d3-a456-426614174001', name: 'Retirement Portfolio' },
        ]);
        
        setSectors([
          { id: 'sector1', name: 'Technology' },
          { id: 'sector2', name: 'Healthcare' },
          { id: 'sector3', name: 'Financials' },
          { id: 'sector4', name: 'Consumer Discretionary' },
          { id: 'sector5', name: 'Energy' },
        ]);
        
        setAssetClasses([
          { id: 'asset1', name: 'Equities' },
          { id: 'asset2', name: 'Fixed Income' },
          { id: 'asset3', name: 'Cash & Equivalents' },
          { id: 'asset4', name: 'Real Estate' },
          { id: 'asset5', name: 'Alternatives' },
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleUpdateAlert = async (data: AlertRuleInput) => {
    setSubmitting(true);
    try {
      await alertsApi.updateAlertRule(id, data);
      router.push(`/dashboard/alerts/${id}`);
    } catch (error) {
      console.error('Error updating alert:', error);
      // In a real app, you'd display an error message to the user
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/alerts/${id}`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-muted-foreground">Loading alert data...</p>
      </div>
    );
  }

  // Show error state if alert not found
  if (!alert) {
    return (
      <div className="container mx-auto py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold mt-4">Alert Not Found</h2>
        <p className="text-muted-foreground mt-2">The alert you're trying to edit doesn't exist or has been deleted.</p>
        <Button onClick={() => router.push('/dashboard/alerts')} className="mt-6">
          <ArrowLeft size={16} className="mr-2" />
          Back to Alerts
        </Button>
      </div>
    );
  }

  // Determine if this is a drift-type alert
  const isDriftAlert = [
    ConditionType.DRIFT,
    ConditionType.SECTOR_DRIFT,
    ConditionType.ASSET_CLASS_DRIFT
  ].includes(alert.conditionType);

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mr-2"
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Alert</h1>
          <p className="text-muted-foreground">
            Modify settings for {alert.name}
          </p>
        </div>
      </div>
      
      {isDriftAlert ? (
        <Card>
          <CardHeader>
            <CardTitle>Drift Alert Settings</CardTitle>
            <CardDescription>
              Update your drift alert configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DriftAlertForm
              initialData={alert}
              portfolios={portfolios}
              sectors={sectors}
              assetClasses={assetClasses}
              isLoading={submitting}
              onSubmit={handleUpdateAlert}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Edit Alert</CardTitle>
            <CardDescription>
              This alert type editing is not yet supported in the UI.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              The edit UI for {alert.conditionType.replace('_', ' ')} alerts is under development.
            </p>
            <div className="flex justify-center mt-6">
              <Button onClick={handleCancel} variant="outline">
                <ArrowLeft size={16} className="mr-2" />
                Back to Alert Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
