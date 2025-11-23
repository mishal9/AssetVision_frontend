"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertRuleInput, ConditionType } from '../../types/alerts';
import { alertsApi } from '../../services/alerts-api';
import { portfolioApi } from '../../services/api';
import { DriftAlertForm } from './DriftAlertForm';
import { 
  ArrowLeft,
  Loader2 
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';

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

export default function CreateAlertPage() {
  const router = useRouter();
  const [alertType, setAlertType] = useState<string>('drift');
  const [loading, setLoading] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [assetClasses, setAssetClasses] = useState<AssetClass[]>([]);

  // Fetch needed data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching sectors and asset classes from API...');
        
        // Fetch real data from API
        const [sectorsData, assetClassesData] = await Promise.all([
          portfolioApi.getSectors(),
          portfolioApi.getAssetClasses()
        ]);
        
        if (!Array.isArray(sectorsData)) {
          throw new Error('Sectors data must be an array');
        }
        if (!Array.isArray(assetClassesData)) {
          throw new Error('Asset classes data must be an array');
        }
        
        console.log('✅ Fetched sectors:', sectorsData);
        console.log('✅ Fetched asset classes:', assetClassesData);
        setSectors(sectorsData);
        setAssetClasses(assetClassesData);
        
        // Portfolios should be fetched from API - no hardcoded fallback
        // TODO: Implement portfolio fetching from API
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    };
    
    fetchData();
  }, []);

  const handleCreateAlert = async (data: AlertRuleInput) => {
    setLoading(true);
    console.log("Data for alerts ",data)
    try {
      const createdAlert = await alertsApi.createAlertRule(data);
      router.push('/dashboard/alerts');
    } catch (error) {
      console.error('Error creating alert:', error);
      // In a real app, you'd display an error message to the user
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/alerts');
  };

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
          <h1 className="text-2xl font-bold tracking-tight">Create New Alert</h1>
          <p className="text-muted-foreground">
            Set up a new alert to monitor your investments
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="drift" value={alertType} onValueChange={setAlertType}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="drift">Portfolio Drift</TabsTrigger>
          <TabsTrigger value="price">Price Movement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        
        <TabsContent value="drift" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Drift Alert</CardTitle>
              <CardDescription>
                Get notified when your portfolio allocation drifts away from your targets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DriftAlertForm
                portfolios={portfolios}
                sectors={sectors}
                assetClasses={assetClasses}
                isLoading={loading}
                onSubmit={handleCreateAlert}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="price" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Price Movement Alert</CardTitle>
              <CardDescription>
                Get notified when a security price moves significantly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Price movement alerts coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Performance Alert</CardTitle>
              <CardDescription>
                Get notified when your portfolio performance reaches a threshold.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Performance alerts coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="other" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Other Alerts</CardTitle>
              <CardDescription>
                Additional alert types for various conditions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Additional alert types coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
