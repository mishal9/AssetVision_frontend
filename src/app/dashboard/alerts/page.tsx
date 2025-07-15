import React from 'react';
import { Metadata } from 'next';
import AlertsOverviewPage from '../../../components/alerts/AlertsOverviewPage';

export const metadata: Metadata = {
  title: 'Asset Vision - Alert Center',
  description: 'View and manage all of your alerts',
};

export default function AlertsPage() {
  return <AlertsOverviewPage />;
}
