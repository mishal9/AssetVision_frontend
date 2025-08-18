'use client';

import { useEffect } from 'react';
import TaxStrategiesPage from '@/app/dashboard/tax-strategies/page';

/**
 * Demo Tax Strategies Page
 * Uses the actual tax strategies page with demo data
 */
export default function DemoTaxStrategiesPage() {
  useEffect(() => {
    // Ensure demo mode is set
    sessionStorage.setItem('demo_mode', 'true');
  }, []);

  // Use the actual tax strategies page component
  return <TaxStrategiesPage />;
}
