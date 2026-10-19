'use client';

import { useEffect, useRef } from 'react';

import { userApi } from '@/api/user';
import { useAuthStore } from '@/stores/useAuthStore';

interface Props {
  rentalId: string;
}

export default function RentalHistoryTracker({
                                               rentalId,
                                             }: Props) {
  const userId = useAuthStore((state) => state.user?.id);

  const recordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || !rentalId) {
      recordedRef.current = null;
      return;
    }

    const recordKey = JSON.stringify([userId, rentalId]);

    if (recordedRef.current === recordKey) {
      return;
    }

    // Avoid duplicate submissions during the current mount.
    recordedRef.current = recordKey;

    // Keep the write running if the visitor leaves the detail page.
    void userApi.recordHistory(rentalId).catch((error: unknown) => {
      if (recordedRef.current === recordKey) {
        recordedRef.current = null;
      }

      console.warn('Failed to record browsing history:', error);
    });
  }, [userId, rentalId]);

  return null;
}
