import React from 'react';
import { Metadata } from 'next';
import AlertDetailPage from '../../../../components/alerts/AlertDetailPage';

export const metadata: Metadata = {
  title: 'Alert Details - Asset Vision',
  description: 'View and manage alert details',
};

export default function AlertDetail({ params }: { params: { id: string } }) {
  return <AlertDetailPage id={params.id} />;
}
