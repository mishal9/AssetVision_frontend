'use client';

import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useAlertNotifications } from "@/hooks/useAlertNotifications";

/**
 * Dashboard layout component
 * Provides the common layout structure for all dashboard pages
 * Includes header, fixed sidebar with profile at bottom, and main content
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize alert notifications monitoring
  useAlertNotifications();

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-52 flex flex-col">
        <div className="px-6">
          <Header />
        </div>
        <main className="flex-1 px-6 pt-1 pb-4">{children}</main>
      </div>
    </div>
  );
}
