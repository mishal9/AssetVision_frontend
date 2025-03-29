'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { Building2, AlertCircle } from 'lucide-react';
import { plaidApi } from '@/services/plaid-api';

interface PlaidLinkButtonProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit?: () => void;
  isLoading?: boolean;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * Plaid Link Button Component
 * 
 * This component renders a button that opens the Plaid Link interface when clicked.
 * It handles the Plaid Link flow and calls the onSuccess callback with the public token
 * when a user successfully connects their account.
 */
export function PlaidLinkButton({
  onSuccess,
  onExit,
  isLoading = false,
  className = '',
  variant = 'outline'
}: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  // Fetch a link token from the backend
  const generateLinkToken = useCallback(async () => {
    try {
      setIsGeneratingToken(true);
      setError(null);
      
      // Call the backend to create a link token
      const token = await plaidApi.createLinkToken();
      setLinkToken(token);
    } catch (error) {
      console.error('Error generating link token:', error);
      setError('Unable to connect to Plaid. Please try again later.');
      if (onExit) onExit();
    } finally {
      setIsGeneratingToken(false);
    }
  }, [onExit]);

  const onPlaidSuccess = useCallback((publicToken: string, metadata: any) => {
    console.log('Plaid Link success');
    onSuccess(publicToken, metadata);
  }, [onSuccess]);

  const onPlaidExit = useCallback(() => {
    console.log('User exited Plaid Link');
    if (onExit) onExit();
  }, [onExit]);
  
  // Generate link token on component mount
  useEffect(() => {
    if (!linkToken && !isGeneratingToken && !error) {
      generateLinkToken();
    }
  }, [linkToken, generateLinkToken, isGeneratingToken, error]);

  const config = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  };

  const { open, ready } = usePlaidLink(config);

  const handleClick = useCallback(() => {
    if (error) {
      // If there was an error, retry generating the token
      setError(null);
      generateLinkToken();
    } else if (linkToken) {
      // If we have a token, open Plaid Link
      open();
    } else if (!isGeneratingToken) {
      // If we don't have a token and aren't already generating one, generate it
      generateLinkToken();
    }
  }, [linkToken, open, generateLinkToken, isGeneratingToken, error]);

  return (
    <div className="flex flex-col">
      <Button
        onClick={handleClick}
        disabled={isLoading || isGeneratingToken || (linkToken && !ready)}
        className={className}
        variant={variant}
      >
        {isLoading || isGeneratingToken ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            {isGeneratingToken ? 'Preparing Connection...' : 'Connecting...'}
          </>
        ) : (
          <>
            <Building2 className="mr-2 h-4 w-4" />
            Connect Bank Account
          </>
        )}
      </Button>
      
      {error && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
