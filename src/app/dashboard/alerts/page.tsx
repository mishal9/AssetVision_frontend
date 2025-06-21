import React from 'react';
import { Metadata } from 'next';
import AlertsOverviewPage from '../../../components/alerts/AlertsOverviewPage';

export const metadata: Metadata = {
  title: 'Asset Vision - Alerts',
  description: 'View and manage your asset alerts',
};

export default function AlertsPage() {
  return <AlertsOverviewPage />;
}
