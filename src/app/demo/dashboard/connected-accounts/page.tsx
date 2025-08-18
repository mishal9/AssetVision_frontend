'use client';

import { useEffect } from 'react';
import ConnectedAccountsPage from '@/app/dashboard/connected-accounts/page';

/**
 * Demo Connected Accounts Page
 * Uses the actual connected accounts page with demo data
 */
export default function DemoConnectedAccountsPage() {
  useEffect(() => {
    // Ensure demo mode is set
    sessionStorage.setItem('demo_mode', 'true');
  }, []);

  // Use the actual connected accounts page component
  return <ConnectedAccountsPage />;
}
