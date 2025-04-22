'use client';

import { useState } from 'react';
import { LinkedAccount } from '@/store/userSlice';
import { LinkedAccounts } from '@/components/plaid/linked-accounts';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  Building2, 
  PieChart, 
  ListFilter, 
  Info,
  ArrowRightCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { plaidApi } from '@/services/plaid-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation'; // Changed from next/router to next/navigation for App Router

/**
 * Connected Accounts Page
 * 
 * This page allows users to:
 * 1. View and manage their connected brokerage accounts
 * 2. Create portfolios from specific accounts
 * 3. View account details and portfolio options
 */
export function ConnectedAccountsPage() {
  const router = useRouter();
  // No need to check authentication as this page is only accessible to authenticated users
  const [selectedAccount, setSelectedAccount] = useState<LinkedAccount | null>(null);
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);

  // Handle portfolio creation from selected account
  const handleCreatePortfolio = async () => {
    if (!selectedAccount) return;
    
    try {
      setIsCreatingPortfolio(true);
      
      // Connection ID is needed to identify the account on the backend
      if (!selectedAccount.connectionId) {
        throw new Error("Connection ID not available for this account");
      }
      
      // Create portfolio using the account's connection ID
      await plaidApi.createPortfolioFromPlaid(
        selectedAccount.connectionId, 
        `${selectedAccount.institutionName} Portfolio`
      );
      
      toast.success("Portfolio Created", {
        description: `Successfully created portfolio from your ${selectedAccount.institutionName} account.`,
      });
      
      // Navigate to the portfolios page
      router.push('/portfolios');
      
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error("Error Creating Portfolio", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsCreatingPortfolio(false);
    }
  };

  // Authentication check removed as page is only accessible to authenticated users

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brokerage Integration</h1>
          <p className="text-muted-foreground mt-2">
            Connect and manage your brokerage accounts to import investment data.
          </p>
        </div>

        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Connected Accounts</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>Portfolio Creation</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts" className="mt-0">
            <LinkedAccounts showCreatePortfolio />
          </TabsContent>
          
          <TabsContent value="portfolio" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListFilter className="h-5 w-5" />
                      Select Account
                    </CardTitle>
                    <CardDescription>
                      Choose a brokerage account to create a portfolio from
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LinkedAccounts 
                      onSelectAccount={(account) => setSelectedAccount(account)} 
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Account Details
                    </CardTitle>
                    <CardDescription>
                      {selectedAccount 
                        ? `${selectedAccount.institutionName} - ${selectedAccount.accountName}`
                        : 'Select an account to view details'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedAccount ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Institution</p>
                          <p className="font-medium">{selectedAccount.institutionName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Account</p>
                          <p className="font-medium">
                            {selectedAccount.accountType} •••• {selectedAccount.accountMask}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className="font-medium capitalize">{selectedAccount.status}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Updated</p>
                          <p className="font-medium">
                            {new Date(selectedAccount.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Select an account from the list</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex-col space-y-3">
                    <Button 
                      className="w-full"
                      disabled={!selectedAccount || isCreatingPortfolio}
                      onClick={handleCreatePortfolio}
                    >
                      {isCreatingPortfolio ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Creating Portfolio...
                        </>
                      ) : (
                        <>
                          <ArrowRightCircle className="mr-2 h-4 w-4" />
                          Create Portfolio
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      This will import all holdings from your selected account to create a new portfolio.
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
