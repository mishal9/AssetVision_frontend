import React from 'react';
import { Metadata } from 'next';
import EditAlertPage from '../../../../../components/alerts/EditAlertPage';

export const metadata: Metadata = {
  title: 'Edit Alert - AlphaOptimize',
  description: 'Edit an existing alert',
};

export default async function EditAlert({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditAlertPage id={id} />;
}
