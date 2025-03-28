import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../styles/tailwind.css";
import "./globals.css";
import { ReduxProvider } from "@/providers/redux-provider";
import { cn } from "@/utils";
import { Header } from "@/components/dashboard/header";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Asset Vision Dashboard",
  description: "A modern dashboard built with Next.js, TypeScript, Redux Toolkit, and Shadcn/UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background text-foreground font-sans antialiased",
        geist.variable
      )}>
        <ReduxProvider>
          <Header />
          <main>{children}</main>
        </ReduxProvider>
      </body>
    </html>
  );
