'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { socketService } from '@/services/websocket';
import { StatsCard } from '@/components/dashboard/stats-card';
import { BarChart3, Users, ShoppingCart, Activity } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Example of WebSocket connection
    // socketService.connect('ws://your-server-url');
    return () => socketService.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 rounded-lg border border-border bg-background"
            />
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
              Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Portfolio Value" 
            value="$245,673.24" 
            change="+2.5%" 
            icon={<BarChart3 className="h-5 w-5" />} 
          />
          <StatsCard 
            title="Cash Balance" 
            value="$12,345.67" 
            change="0%" 
            icon={<Users className="h-5 w-5" />} 
          />
          <StatsCard 
            title="Total Gain" 
            value="$45,678.90" 
            change="+15.3%" 
            icon={<ShoppingCart className="h-5 w-5" />} 
          />
          <StatsCard 
            title="Day Change" 
            value="$1,234.56" 
            change="+0.5%" 
            icon={<Activity className="h-5 w-5" />} 
          />
        </div>

        {/* Placeholder for portfolio chart */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8 h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Portfolio Performance Chart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Allocation */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Asset Allocation</h2>
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Asset Allocation Chart</p>
            </div>
          </div>
          
          {/* Recent Alerts */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
            <div className="space-y-4">
              <div className="p-3 bg-background border border-border rounded-md">
                <p className="font-medium">Price Alert: AAPL</p>
                <p className="text-sm text-muted-foreground">Apple Inc. has reached your target price of $180</p>
              </div>
              <div className="p-3 bg-background border border-border rounded-md">
                <p className="font-medium">Dividend Alert</p>
                <p className="text-sm text-muted-foreground">Microsoft (MSFT) dividend payment of $0.68 per share</p>
              </div>
              <div className="p-3 bg-background border border-border rounded-md">
                <p className="font-medium">Tax Harvesting Opportunity</p>
                <p className="text-sm text-muted-foreground">Potential tax loss harvesting for NVDA position</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
