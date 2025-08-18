'use client';

import { useEffect } from 'react';
import DashboardPage from '@/app/dashboard/page';

/**
 * Demo Dashboard Page
 * Uses the actual dashboard page component with demo data
 */
export default function DemoDashboardPage() {
  useEffect(() => {
    // Ensure demo mode is set
    sessionStorage.setItem('demo_mode', 'true');
  }, []);

  // Use the actual dashboard page component
  return <DashboardPage />;
}