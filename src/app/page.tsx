'use client';

import { useEffect } from 'react';
import { socketService } from '@/services/websocket';
import { StatsCard } from '@/components/dashboard/stats-card';
import { BarChart3, Users, ShoppingCart, Activity } from 'lucide-react';

export default function Home() {
  useEffect(() => {
    // Example of WebSocket connection
    // socketService.connect('ws://your-server-url');
    return () => socketService.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]"
            />
            <button className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity">
              Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Revenue"
            value="$45,231.89"
            change="+20.1% from last month"
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <StatsCard
            title="Subscriptions"
            value="+2,350"
            change="+180.1% from last month"
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Sales"
            value="+12,234"
            change="+19% from last month"
            icon={<ShoppingCart className="h-4 w-4" />}
          />
          <StatsCard
            title="Active Now"
            value="+573"
            change="+201 since last hour"
            icon={<Activity className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          <div className="lg:col-span-4 rounded-xl bg-[hsl(var(--card))] p-6 border border-[hsl(var(--border))]">
            <h2 className="text-lg font-semibold mb-4">Overview</h2>
            <div className="h-[300px] flex items-center justify-center border border-[hsl(var(--border))] rounded-lg">
              Chart Placeholder
            </div>
          </div>
          <div className="lg:col-span-2 rounded-xl bg-[hsl(var(--card))] p-6 border border-[hsl(var(--border))]">
            <h2 className="text-lg font-semibold mb-4">Recent Sales</h2>
            <div className="space-y-4">
              {[
                { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '$1,999.00' },
                { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '$39.00' },
                { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '$299.00' },
                { name: 'William Kim', email: 'will@email.com', amount: '$99.00' },
                { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '$39.00' },
              ].map((sale, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{sale.name}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{sale.email}</p>
                  </div>
                  <p className="font-medium">{sale.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
