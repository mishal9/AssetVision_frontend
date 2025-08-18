'use client';

import { useEffect } from 'react';
import OptimizePage from '@/app/dashboard/optimize/page';

/**
 * Demo Optimize Page
 * Uses the actual optimize page with demo data
 */
export default function DemoOptimizePage() {
  useEffect(() => {
    // Ensure demo mode is set
    sessionStorage.setItem('demo_mode', 'true');
  }, []);

  // Use the actual optimize page component
  return <OptimizePage />;
}
