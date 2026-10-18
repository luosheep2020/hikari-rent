'use client';

import { useEffect } from 'react';
import { App } from 'antd';

import { useAuthStore } from '@/stores/useAuthStore';
import { useFavoriteStore } from '@/stores/useFavoriteStore';

export function useRentalFavorite(rentalId: string) {
  const { message } = App.useApp();

  const userId = useAuthStore(
    (state) => state.user?.id ?? null,
  );

  const openLogin = useAuthStore(
    (state) => state.openLogin,
  );

  const loadFavorites = useFavoriteStore(
    (state) => state.loadFavorites,
  );

  const toggleFavorite = useFavoriteStore(
    (state) => state.toggleFavorite,
  );

  const isFavorite = useFavoriteStore((state) =>
    userId
      ? (
        state.favoritesByUser[userId]
          ?.includes(rentalId) ?? false
      )
      : false,
  );

  const pending = useFavoriteStore((state) =>
    userId
      ? (
        state.pendingByUser[userId]?.[rentalId] ??
        false
      )
      : false,
  );

  const loading = useFavoriteStore((state) =>
    userId
      ? state.statusByUser[userId] === 'loading'
      : false,
  );

  useEffect(() => {
    if (!userId) {
      return;
    }

    // Loading errors can be retried by the next favorite action.
    void loadFavorites(userId).catch(() => {});
  }, [userId, loadFavorites]);

  async function handleFavorite() {
    if (!userId) {
      message.info(
        'お気に入りを利用するにはログインしてください',
      );

      openLogin();
      return;
    }

    try {
      const added = await toggleFavorite(
        userId,
        rentalId,
      );

      if (
        useAuthStore.getState().user?.id !== userId ||
        added === undefined
      ) {
        return;
      }

      message.success(
        added
          ? 'お気に入りに追加しました'
          : 'お気に入りから削除しました',
      );
    } catch (error) {
      if (
        useAuthStore.getState().user?.id !== userId
      ) {
        return;
      }

      console.error(
        'Failed to update favorite:',
        error,
      );

      message.error(
        'お気に入りを更新できませんでした。再度お試しください。',
      );
    }
  }

  return {
    isFavorite,
    busy: pending || loading,
    handleFavorite,
  };
}
