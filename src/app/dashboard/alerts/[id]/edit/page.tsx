import React from 'react';
import { Metadata } from 'next';
import EditAlertPage from '../../../../../components/alerts/EditAlertPage';

export const metadata: Metadata = {
  title: 'Edit Alert - Asset Vision',
  description: 'Edit an existing alert',
};

export default function EditAlert({ params }: { params: { id: string } }) {
  return <EditAlertPage id={params.id} />;
}
