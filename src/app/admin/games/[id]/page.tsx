'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import GameForm from '../../../../components/admin/GameForm';

export default function EditGamePage() {
  const { id } = useParams() as { id: string };
  return <GameForm gameId={id} />;
}
