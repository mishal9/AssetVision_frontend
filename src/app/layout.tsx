import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/tailwind.css";
import "./globals.css";
import { ReduxProvider } from "@/providers/redux-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { PlaidLinkProvider } from "@/context/PlaidLinkContext";
import { cn } from "@/utils";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AlphaOptimize Dashboard",
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
        inter.variable
      )}>
        <ReduxProvider>
          <AuthProvider>
            <ThemeProvider>
              <PlaidLinkProvider>
                <Toaster position="top-right" />
                <main>{children}</main>
              </PlaidLinkProvider>
            </ThemeProvider>
          </AuthProvider>
        </ReduxProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
