'use client';

import { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, AlertCircle } from 'lucide-react';
import { usePlaidLinkContext } from '@/context/PlaidLinkContext';

interface PlaidLinkButtonProps {
  onSuccess: (publicToken: string, metadata: any) => void;
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

  // Customize the onSuccess handler with more detailed logging
  const onPlaidSuccess = useCallback((publicToken: string, metadata: any) => {
    console.log('PlaidLinkButton: onPlaidSuccess called with token', publicToken.substring(0, 5) + '...');
    console.log('PlaidLinkButton: metadata:', JSON.stringify(metadata).substring(0, 100) + '...');
    
    // Explicitly check for the callback before calling
    if (typeof onSuccess === 'function') {
      console.log('PlaidLinkButton: Calling parent onSuccess callback...');
      try {
        onSuccess(publicToken, metadata);
        console.log('PlaidLinkButton: Parent onSuccess callback completed');
      } catch (error) {
        console.error('PlaidLinkButton: Error in parent onSuccess callback:', error);
      }
    } else {
      console.error('PlaidLinkButton: onSuccess is not a function!', typeof onSuccess);
    }
  }, [onSuccess]);

  // Handle Plaid exit
  const onPlaidExit = useCallback(() => {
    console.log('User exited Plaid Link');
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
    console.log('PlaidLinkButton: Button clicked');
    
    if (error) {
      // If there was an error, retry generating the token
      console.log('PlaidLinkButton: Regenerating token due to error');
      generateLinkToken(userId, forUpdate, accountId);
    } else if (linkToken && ready) {
      // If we have a token and Plaid is ready, open Plaid Link
      console.log('PlaidLinkButton: Opening Plaid Link with token', linkToken.substring(0, 10) + '...');
      console.log('PlaidLinkButton: Success handler is a', typeof onPlaidSuccess);
      
      // Pass the handlers directly to the open function
      open(onPlaidSuccess, onPlaidExit);
    } else if (!isGeneratingToken) {
      // If we don't have a token and aren't already generating one, generate it
      console.log('PlaidLinkButton: Generating new link token');
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
