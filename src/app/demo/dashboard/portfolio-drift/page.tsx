'use client';

import { useEffect } from 'react';
import PortfolioDriftPage from '@/app/dashboard/portfolio-drift/page';

/**
 * Demo Portfolio Drift Page
 * Uses the actual portfolio drift page with demo data
 */
export default function DemoPortfolioDriftPage() {
  useEffect(() => {
    // Ensure demo mode is set
    sessionStorage.setItem('demo_mode', 'true');
  }, []);

  // Use the actual portfolio drift page component
  return <PortfolioDriftPage />;
}
