'use client';

import { useEffect } from 'react';
import AlertsOverviewPage from '@/components/alerts/AlertsOverviewPage';

/**
 * Demo Alerts Page
 * Uses the actual alerts overview component with demo data
 */
export default function DemoAlertsPage() {
  useEffect(() => {
    // Ensure demo mode is set
    sessionStorage.setItem('demo_mode', 'true');
  }, []);

  // Use the actual alerts overview component directly
  return <AlertsOverviewPage />;
}
