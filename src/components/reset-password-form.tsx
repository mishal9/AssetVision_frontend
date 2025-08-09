'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Supabase recovery link provides access_token in query, sometimes via hash; Next preserves query.
  const token = useMemo(() => {
    // Try common keys: access_token (Supabase), token
    const fromQuery = searchParams?.get('access_token') || searchParams?.get('token');
    if (fromQuery) return fromQuery;
    if (typeof window !== 'undefined' && window.location.hash) {
      // Parse hash fragment like #access_token=...&type=recovery
      const hash = window.location.hash.replace(/^#/, '');
      const params = new URLSearchParams(hash);
      return params.get('access_token') || params.get('token') || '';
    }
    return '';
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError('Invalid or missing recovery token. Please use the link from your email.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      // Optionally redirect to login after short delay
    } catch (err: any) {
      const message = err?.authErrorMessage || err?.message || 'Failed to reset password.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Reset Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/15 text-destructive mb-4 rounded-md p-3 text-sm">{error}</div>
        )}
        {success ? (
          <div className="bg-green-100 text-green-800 mb-4 rounded-md p-3 text-sm dark:bg-green-900/30 dark:text-green-400">
            Your password has been reset successfully.
            <div className="mt-4">
              <Button className="w-full" onClick={() => router.push('/login')}>Return to Login</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Set New Password'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}


