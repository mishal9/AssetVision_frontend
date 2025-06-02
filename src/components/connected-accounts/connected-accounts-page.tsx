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
 * 2. View account details
 * 3. All connected accounts are automatically part of the user's portfolio
 */
export function ConnectedAccountsPage() {
  const router = useRouter();
  // No need to check authentication as this page is only accessible to authenticated users
  const [selectedAccount, setSelectedAccount] = useState<LinkedAccount | null>(null);

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
          <TabsList className="grid w-full md:w-auto grid-cols-1 mb-6">
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Connected Accounts</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts" className="mt-0">
            <div className="mb-4">
              <Card className="bg-muted/40 border-dashed">
                <CardContent className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <PieChart className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">All connected accounts are part of your portfolio</p>
                      <p className="text-sm text-muted-foreground">Holdings from all linked accounts are automatically imported and updated</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <LinkedAccounts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
