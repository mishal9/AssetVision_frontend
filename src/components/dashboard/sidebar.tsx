'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Receipt,
  Bot,
  Sliders,
  BarChart2,
  Bell,
  PieChart
} from 'lucide-react';

/**
 * Sidebar component for dashboard
 * Provides navigation and access to analysis tools
 */
export function Sidebar() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const navItems = [
    {
      name: 'Optimize Portfolio',
      icon: <Sliders className="h-5 w-5" />,
      path: '/dashboard/optimize',
      featured: true, // Mark as the key differentiator
    },
    {
      name: 'Tax strategies',
      icon: <Receipt className="h-5 w-5" />,
      path: '/dashboard/tax-strategies',
    },
    {
      name: 'Portfolio Drift',
      icon: <PieChart className="h-5 w-5" />,
      path: '/dashboard/portfolio-drift',
    },
    {
      name: 'Alert Center',
      icon: <Bell className="h-5 w-5" />,
      path: '/dashboard/alerts',
    },
  ];

  return (
    <div 
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card transition-all duration-300 z-20 shadow-sm",
        expanded ? "w-64" : "w-16"
      )}
    >
      {/* Hamburger toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-4 bg-primary text-primary-foreground rounded-full p-1 shadow-md hover:bg-primary/90 transition-colors"
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      
      <div className="py-4">
        <div className="px-4 mb-6">
          <div className={cn(
            "flex items-center",
            expanded ? "justify-start" : "justify-center"
          )}>
            <BarChart2 className="h-6 w-6 text-primary" />
            {expanded && (
              <span className="ml-2 font-semibold text-lg">Analysis Tools</span>
            )}
          </div>
        </div>
        
        <div className="space-y-2 px-3">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant={item.featured ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                expanded ? "px-3" : "px-0 justify-center",
                item.featured && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              )}
              onClick={() => router.push(item.path)}
            >
              {item.icon}
              {expanded && (
                <span className="ml-2 flex items-center gap-2">
                  {item.name}
                  {item.featured && (
                    <span className="text-xs bg-primary-foreground/20 px-1.5 py-0.5 rounded-full">
                      NEW
                    </span>
                  )}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
