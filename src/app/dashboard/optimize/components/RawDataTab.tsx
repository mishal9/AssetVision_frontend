import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OptimizationResults } from '@/store/optimizationSlice';

interface RawDataTabProps {
  results: OptimizationResults;
}

export function RawDataTab({ results }: RawDataTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Raw Optimization Data</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="p-4 bg-gray-100 rounded-md overflow-x-auto">
          <code>{JSON.stringify(results, null, 2)}</code>
        </pre>
      </CardContent>
    </Card>
  );
} 