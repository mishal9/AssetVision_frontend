import React from 'react';
import { Metadata } from 'next';
import AlertDetailPage from '../../../../components/alerts/AlertDetailPage';

export const metadata: Metadata = {
  title: 'Alert Details - Asset Vision',
  description: 'View and manage alert details',
};

export default async function AlertDetail({ params }: { params: { id: string } }) {
  // Await params to satisfy Next.js dynamic API requirements
  const { id } = await Promise.resolve(params);
  return <AlertDetailPage id={id} />;
}
