'use client';

import { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, AlertCircle } from 'lucide-react';
import { usePlaidLinkContext } from '@/context/PlaidLinkContext';
import { PlaidLinkOnSuccessMetadata } from 'react-plaid-link';

/**
 * Plaid Link metadata structure - using library's type
 */
type PlaidMetadata = PlaidLinkOnSuccessMetadata;

interface PlaidLinkButtonProps {
  onSuccess: (publicToken: string, metadata: PlaidMetadata) => void;
  onExit?: () => void;
  isLoading?: boolean;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  forUpdate?: boolean;
  accountId?: string;
  userId?: string;
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
  variant = 'outline',
  forUpdate = false,
  accountId,
  userId
}: PlaidLinkButtonProps) {
  // Use the shared Plaid Link context instead of local state
  const { 
    linkToken, 
    error, 
    isGeneratingToken, 
    generateLinkToken, 
    open, 
    ready 
  } = usePlaidLinkContext();

  // Customize the onSuccess handler
  const onPlaidSuccess = useCallback((publicToken: string, metadata: PlaidMetadata) => {
    // Explicitly check for the callback before calling
    if (typeof onSuccess === 'function') {
      onSuccess(publicToken, metadata);
    } else {
      throw new Error('onSuccess callback is required');
    }
  }, [onSuccess]);

  // Handle Plaid exit
  const onPlaidExit = useCallback(() => {
    if (onExit) onExit();
  }, [onExit]);
  
  // We no longer need to set up global event handlers here
  // as the PlaidLinkContext now handles this internally
  
  // Generate link token on component mount
  useEffect(() => {
    if (!linkToken && !isGeneratingToken) {
      generateLinkToken(userId, forUpdate, accountId);
    }
  }, [linkToken, generateLinkToken, isGeneratingToken, userId, forUpdate, accountId]);

  const handleClick = useCallback(() => {
    if (error) {
      // If there was an error, retry generating the token
      generateLinkToken(userId, forUpdate, accountId);
    } else if (linkToken && ready) {
      // If we have a token and Plaid is ready, open Plaid Link
      // Pass the handlers directly to the open function
      open(onPlaidSuccess, onPlaidExit);
    } else if (!isGeneratingToken) {
      // If we don't have a token and aren't already generating one, generate it
      generateLinkToken(userId, forUpdate, accountId);
    }
  }, [linkToken, open, generateLinkToken, isGeneratingToken, error, userId, forUpdate, accountId, ready, onPlaidSuccess, onPlaidExit]);

  return (
    <div className="flex flex-col">
      <Button
        onClick={handleClick}
        disabled={isLoading || isGeneratingToken || (!!linkToken && !ready)}
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
            {forUpdate ? 'Update Bank Connection' : 'Connect Bank Account'}
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
