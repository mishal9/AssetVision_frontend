'use client';

import { useEffect } from 'react';
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DemoSessionIndicator } from "@/components/demo/DemoSessionIndicator";
import { DemoModeProvider } from '@/context/DemoModeContext';

/**
 * Demo Dashboard Layout
 * Uses the actual dashboard layout with demo mode enabled
 */
export default function DemoDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Ensure demo mode is set
    sessionStorage.setItem('demo_mode', 'true');
  }, []);

  return (
    <DemoModeProvider>
      <div className="relative flex flex-col min-h-screen">
        <DemoSessionIndicator />
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 ml-16 transition-all duration-300">{children}</main>
        </div>
      </div>
    </DemoModeProvider>
  );
}
