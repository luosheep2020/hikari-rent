'use client';

import { useEffect, useRef } from 'react';

import { useAuthStore } from '@/stores/useAuthStore';
import {
  getHistoryOwner,
  hydrateHistory,
  useHistoryStore,
} from '@/stores/useHistoryStore';

type Props = {
  rentalId: string;
};

export default function RentalHistoryTracker({
                                               rentalId,
                                             }: Props) {
  const userId = useAuthStore((state) => state.user?.id);
  const owner = getHistoryOwner(userId);

  const recordedRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const recordKey = `${owner}:${rentalId}`;

    void hydrateHistory().then(() => {
      if (
        cancelled ||
        recordedRef.current === recordKey
      ) {
        return;
      }

      useHistoryStore.getState().addHistory(owner, rentalId);
      recordedRef.current = recordKey;
    });

    return () => {
      cancelled = true;
    };
  }, [owner, rentalId]);

  return null;
}
