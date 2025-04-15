'use client';

import { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useEffect, 
  ReactNode 
} from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import { plaidApi } from '@/services/plaid-api';

interface PlaidLinkContextType {
  linkToken: string | null;
  error: string | null;
  isGeneratingToken: boolean;
  generateLinkToken: (userId?: string, forUpdate?: boolean, accountId?: string) => Promise<void>;
  open: (onSuccess?: (publicToken: string, metadata: any) => void, onExit?: () => void) => void;
  ready: boolean;
  isPlaidLoaded: boolean;
  resetLinkToken: () => void;
}

const PlaidLinkContext = createContext<PlaidLinkContextType | undefined>(undefined);

export const PlaidLinkProvider = ({ children }: { children: ReactNode }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [isPlaidLoaded, setIsPlaidLoaded] = useState(false);
  
  const resetLinkToken = useCallback(() => {
    setLinkToken(null);
  }, []);

  // Fetch a link token from the backend
  const generateLinkToken = useCallback(async (
    userId?: string, 
    forUpdate: boolean = false, 
    accountId?: string
  ) => {
    if (isGeneratingToken) return;
    
    try {
      setIsGeneratingToken(true);
      setError(null);
      
      // Call the backend to create a link token
      const token = await plaidApi.createLinkToken(userId, forUpdate, accountId);
      setLinkToken(token);
    } catch (error) {
      console.error('Error generating link token:', error);
      setError('Unable to connect to Plaid. Please try again later.');
    } finally {
      setIsGeneratingToken(false);
    }
  }, [isGeneratingToken]);

  // Keep track of current handlers
  const [successHandler, setSuccessHandler] = useState<((publicToken: string, metadata: any) => void) | null>(null);
  const [exitHandler, setExitHandler] = useState<(() => void) | null>(null);

  // Only initialize Plaid Link when we have a token
  const plaidConfig: PlaidLinkOptions = {
    token: linkToken || '',
    onSuccess: ((publicToken, metadata) => {
      console.log('Plaid Link success from context');
      // Call the component handler if provided
      if (successHandler) {
        successHandler(publicToken, metadata);
      }
    }) as PlaidLinkOnSuccess,
    onExit: () => {
      console.log('Plaid Link exit from context');
      // Call the component handler if provided
      if (exitHandler) {
        exitHandler();
      }
    },
    onLoad: () => {
      setIsPlaidLoaded(true);
    },
    env: 'sandbox', // Change to 'development' or 'production' as needed
    product: ['auth', 'transactions'], // Required products
  };
  
  // Initialize Plaid Link once with our configuration
  const { open: openPlaid, ready } = usePlaidLink(plaidConfig);
  
  // Wrap the open function to accept handlers
  const open = useCallback((onSuccess?: (publicToken: string, metadata: any) => void, onExit?: () => void) => {
    // Set the handlers before opening
    if (onSuccess) setSuccessHandler(() => onSuccess);
    if (onExit) setExitHandler(() => onExit);
    
    // Call the original open function
    openPlaid();
  }, [openPlaid]);

  // Set up a flag that's true once Plaid is loaded
  useEffect(() => {
    if (ready && linkToken) {
      setIsPlaidLoaded(true);
    }
  }, [ready, linkToken]);

  return (
    <PlaidLinkContext.Provider value={{
      linkToken,
      error,
      isGeneratingToken,
      generateLinkToken,
      open,
      ready,
      isPlaidLoaded,
      resetLinkToken
    }}>
      {children}
    </PlaidLinkContext.Provider>
  );
};

export const usePlaidLinkContext = () => {
  const context = useContext(PlaidLinkContext);
  if (context === undefined) {
    throw new Error('usePlaidLinkContext must be used within a PlaidLinkProvider');
  }
  return context;
};
