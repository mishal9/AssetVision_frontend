import React, { Suspense } from 'react';
import { BarChart3 } from 'lucide-react';
import ResetPasswordForm from '@/components/reset-password-form';

// Loading component for the form
function ResetPasswordFormLoading() {
  return (
    <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
      <div className="text-center mb-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
      </div>
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <BarChart3 className="size-4" />
          </div>
          AlphaOptimize
        </a>
        <Suspense fallback={<ResetPasswordFormLoading />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}


