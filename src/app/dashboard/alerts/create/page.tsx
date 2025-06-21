import React from 'react';
import { Metadata } from 'next';
import CreateAlertPage from '../../../../components/alerts/CreateAlertPage';

export const metadata: Metadata = {
  title: 'Create Alert - Asset Vision',
  description: 'Create a new asset alert',
};

export default function CreateAlert() {
  return <CreateAlertPage />;
}
