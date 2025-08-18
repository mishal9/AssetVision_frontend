'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDemoMode } from '@/context/DemoModeContext';
import { 
  LayoutDashboard,
  PieChart,
  Bell,
  Bot,
  Calculator,
  Target,
  CreditCard,
  Settings,
  HelpCircle,
  Sparkles,
  PlayCircle,
  LogOut
} from 'lucide-react';

/**
 * Demo Sidebar Component
 * Navigation sidebar specifically for demo mode with demo indicators
 */
export function DemoSidebar() {
  const pathname = usePathname();
  const { endDemo } = useDemoMode();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/demo/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/demo/dashboard',
    },
    {
      name: 'Portfolio Drift',
      href: '/demo/dashboard/portfolio-drift',
      icon: PieChart,
      current: pathname === '/demo/dashboard/portfolio-drift',
    },
    {
      name: 'Optimize',
      href: '/demo/dashboard/optimize',
      icon: Target,
      current: pathname === '/demo/dashboard/optimize',
    },
    {
      name: 'Alerts',
      href: '/demo/dashboard/alerts',
      icon: Bell,
      current: pathname?.startsWith('/demo/dashboard/alerts'),
      badge: 3, // Demo alert count
    },
    {
      name: 'Ask AI',
      href: '/demo/dashboard/ask-ai',
      icon: Bot,
      current: pathname === '/demo/dashboard/ask-ai',
      badge: 'NEW',
    },
    {
      name: 'Tax Strategies',
      href: '/demo/dashboard/tax-strategies',
      icon: Calculator,
      current: pathname === '/demo/dashboard/tax-strategies',
    },
    {
      name: 'Connected Accounts',
      href: '/demo/dashboard/connected-accounts',
      icon: CreditCard,
      current: pathname === '/demo/dashboard/connected-accounts',
    },
    {
      name: 'Preferences',
      href: '/demo/dashboard/preferences',
      icon: Settings,
      current: pathname === '/demo/dashboard/preferences',
    },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Demo Logo/Brand */}
      <div className="flex items-center gap-2 p-6 border-b border-gray-200 dark:border-gray-800">
        <Sparkles className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-xl font-bold">AlphaOptimize</h1>
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <PlayCircle className="h-3 w-3 mr-1" />
            DEMO
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href}>
            <Button
              variant={item.current ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-left",
                item.current 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge 
                  variant={item.badge === 'NEW' ? 'default' : 'secondary'} 
                  className={cn(
                    "text-xs h-5",
                    item.badge === 'NEW' 
                      ? "bg-green-600 text-white" 
                      : "bg-red-600 text-white"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Demo Info & Exit */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Demo Mode
            </span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
            You're exploring AlphaOptimize with demo data. All features are fully functional!
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Ready to get started with your real portfolio?
          </p>
        </div>
        
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => window.open('/register', '_blank')}
          >
            Sign Up for Real Account
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs text-gray-600 dark:text-gray-400"
            onClick={endDemo}
          >
            <LogOut className="h-3 w-3 mr-2" />
            Exit Demo
          </Button>
        </div>
      </div>
    </div>
  );
}
