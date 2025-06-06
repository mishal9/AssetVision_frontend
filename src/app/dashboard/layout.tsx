'use client';

import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";

/**
 * Dashboard layout component
 * Provides the common layout structure for all dashboard pages
 * Includes header, sidebar with analysis tools, and main content
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 ml-16 transition-all duration-300">{children}</main>
      </div>
    </div>
  );
}
