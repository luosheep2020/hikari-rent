'use client';

import { useEffect } from 'react';

import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AuthBootstrap() {
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function restoreSession() {
      try {
        await useAuthStore.persist.rehydrate();

        if (!active) {
          return;
        }

        const token =
          useAuthStore.getState().accessToken;

        if (!token) {
          return;
        }

        const user = await authApi.getCurrentUser(
          controller.signal,
        );

        if (
          active
          && useAuthStore.getState().accessToken === token
        ) {
          useAuthStore.getState().setUser(user);
        }

      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn(
            'Failed to restore authentication',
            error,
          );
        }

      } finally {
        if (active) {
          useAuthStore.getState().setHydrated();
        }
      }
    }

    void restoreSession();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return null;
}
