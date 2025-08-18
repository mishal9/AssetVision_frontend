'use client';

import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";

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
