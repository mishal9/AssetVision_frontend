"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Error component for the Portfolio Drift page
 * Displays when an error occurs in the page or its child components
 */
export default function PortfolioDriftError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Portfolio Drift page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background px-6 py-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <Alert variant="destructive" className="border-destructive/50">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || "Something went wrong while loading the Portfolio Drift page."}
            </p>
            <Button onClick={reset} variant="outline">
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
