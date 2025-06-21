"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertRule, 
  ConditionType,
  AlertStatus
} from '../../types/alerts';
import { alertsApi } from '../../services/alerts-api';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus,
  Filter, 
  Bell, 
  Search, 
  ArrowUpDown, 
  BarChart3,
  AlertCircle 
} from 'lucide-react';
import DriftAlertCard from './DriftAlertCard';

export default function AlertsOverviewPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Fetch alerts on component mount
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters();
  }, [alerts, activeTab, searchQuery, statusFilter, typeFilter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const alertsData = await alertsApi.getAlertRules();
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...alerts];

    // Apply tab filter
    if (activeTab === 'drift') {
      filtered = filtered.filter(alert => 
        [ConditionType.DRIFT, ConditionType.SECTOR_DRIFT, ConditionType.ASSET_CLASS_DRIFT].includes(alert.conditionType)
      );
    } else if (activeTab === 'price') {
      filtered = filtered.filter(alert => alert.conditionType === ConditionType.PRICE_MOVEMENT);
    } else if (activeTab === 'other') {
      filtered = filtered.filter(alert => 
        ![
          ConditionType.DRIFT, 
          ConditionType.SECTOR_DRIFT, 
          ConditionType.ASSET_CLASS_DRIFT,
          ConditionType.PRICE_MOVEMENT
        ].includes(alert.conditionType)
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(alert => 
        alert.name.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => 
        statusFilter === 'active' ? alert.isActive : !alert.isActive
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.conditionType === typeFilter);
    }

    setFilteredAlerts(filtered);
  };

  const handleCreateAlert = () => {
    router.push('/dashboard/alerts/create');
  };

  const handleViewAlert = (alertId: string) => {
    router.push(`/dashboard/alerts/${alertId}`);
  };

  const handleEditAlert = (alertId: string) => {
    router.push(`/dashboard/alerts/${alertId}/edit`);
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      // Update alert status to resolved/inactive in this case
      await alertsApi.updateAlertRule(alertId, { isActive: false });
      
      // Refresh the alerts list
      fetchAlerts();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const renderDriftAlerts = () => {
    const driftAlerts = filteredAlerts.filter(alert => 
      [ConditionType.DRIFT, ConditionType.SECTOR_DRIFT, ConditionType.ASSET_CLASS_DRIFT].includes(alert.conditionType)
    );

    if (driftAlerts.length === 0) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No drift alerts found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a drift alert to monitor your portfolio allocation
          </p>
          <Button onClick={handleCreateAlert} className="mt-4">
            <Plus size={16} className="mr-2" />
            Create Drift Alert
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {driftAlerts.map((alert) => (
          <DriftAlertCard
            key={alert.id}
            alert={alert}
            onResolve={() => handleResolveAlert(alert.id)}
            onView={() => handleViewAlert(alert.id)}
            onEdit={() => handleEditAlert(alert.id)}
          />
        ))}
      </div>
    );
  };

  const renderAlertCards = () => {
    if (loading) {
      return <div className="py-8 text-center">Loading alerts...</div>;
    }

    if (filteredAlerts.length === 0) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No alerts found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery ? 'Try adjusting your search or filters' : 'Create an alert to get started'}
          </p>
          {!searchQuery && (
            <Button onClick={handleCreateAlert} className="mt-4">
              <Plus size={16} className="mr-2" />
              Create Alert
            </Button>
          )}
        </div>
      );
    }

    // If we're showing drift alerts, use the dedicated component
    if (activeTab === 'drift') {
      return renderDriftAlerts();
    }

    // For other types, render generic alert cards
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{alert.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${alert.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                {alert.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {alert.conditionType.replace('_', ' ')}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleViewAlert(alert.id)}>
                View
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleEditAlert(alert.id)}>
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">
            Monitor changes in your portfolio and get notified
          </p>
        </div>
        <Button onClick={handleCreateAlert}>
          <Plus size={16} className="mr-2" />
          Create Alert
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Alerts</TabsTrigger>
            <TabsTrigger value="drift">Drift Alerts</TabsTrigger>
            <TabsTrigger value="price">Price Alerts</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2 items-center">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                className="pl-8 w-full md:w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="py-6">
          <TabsContent value="all" className="mt-0">
            {renderAlertCards()}
          </TabsContent>
          
          <TabsContent value="drift" className="mt-0">
            {renderDriftAlerts()}
          </TabsContent>
          
          <TabsContent value="price" className="mt-0">
            {renderAlertCards()}
          </TabsContent>
          
          <TabsContent value="other" className="mt-0">
            {renderAlertCards()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
