'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  Alert,
  Button,
  Empty,
  Spin,
} from 'antd';

import { userApi } from '@/api/user';

import RentalCard from '@/components/rental/RentalCard';

import { useAuthStore } from '@/stores/useAuthStore';
import { useFavoriteStore } from '@/stores/useFavoriteStore';

import type { RentalListItemData } from '@/types/rental';

import styles from './page.module.css';

const EMPTY_IDS: string[] = [];

type ResultState = {
  key: string;
  records: RentalListItemData[];
  error?: string;
};

export default function FavoritesPage() {
  const userId = useAuthStore(
    (state) => state.user?.id ?? null,
  );

  const openLogin = useAuthStore(
    (state) => state.openLogin,
  );

  const loadFavorites = useFavoriteStore(
    (state) => state.loadFavorites,
  );

  const favoriteIds = useFavoriteStore((state) =>
    userId
      ? state.favoritesByUser[userId] ?? EMPTY_IDS
      : EMPTY_IDS,
  );

  const [retry, setRetry] = useState(0);

  const [result, setResult] =
    useState<ResultState | null>(null);

  const requestKey = JSON.stringify({
    userId,
    retry,
  });

  const loading =
    userId !== null &&
    result?.key !== requestKey;

  const error =
    result?.key === requestKey
      ? result.error
      : undefined;

  const favorites =
    result?.key === requestKey
      ? result.records.filter((rental) =>
        favoriteIds.includes(rental.id),
      )
      : [];

  useEffect(() => {
    if (!userId) {
      return;
    }

    const activeUserId = userId;
    const controller = new AbortController();

    async function loadPage() {
      try {
        const [records] = await Promise.all([
          userApi.getFavorites(controller.signal),
          loadFavorites(activeUserId),
        ]);

        if (controller.signal.aborted) {
          return;
        }

        setResult({
          key: requestKey,
          records,
        });
      } catch (cause) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(
          'Failed to load favorites:',
          cause,
        );

        setResult({
          key: requestKey,
          records: [],
          error:
            'お気に入りを読み込めませんでした。再試行してください。',
        });
      }
    }

    void loadPage();

    return () => controller.abort();
  }, [userId, requestKey, loadFavorites]);

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <h1>お気に入り</h1>

        {userId && !loading && !error && (
          <span>{favorites.length}件</span>
        )}
      </div>

      {!userId ? (
        <div className={styles.emptyPanel}>
          <Empty description="ログインしてお気に入りを確認できます">
            <Button
              type="primary"
              onClick={() => openLogin()}
            >
              ログイン
            </Button>
          </Empty>
        </div>
      ) : loading ? (
        <div
          className={styles.emptyPanel}
          role="status"
        >
          <Spin />
          <p>お気に入りを読み込み中...</p>
        </div>
      ) : error ? (
        <div className={styles.emptyPanel}>
          <Alert
            type="error"
            title="読み込みに失敗しました"
            description={error}
            showIcon
            action={
              <Button
                size="small"
                onClick={() => {
                  setRetry((value) => value + 1);
                }}
              >
                再試行
              </Button>
            }
          />
        </div>
      ) : favorites.length === 0 ? (
        <div className={styles.emptyPanel}>
          <Empty description="現在表示できるお気に入りの物件はありません">
            <Link
              href="/rentals"
              className={styles.searchLink}
            >
              お部屋を探す →
            </Link>
          </Empty>
        </div>
      ) : (
        <div className={styles.grid}>
          {favorites.map((rental) => (
            <RentalCard
              key={rental.id}
              rental={rental}
            />
          ))}
        </div>
      )}
    </div>
  );
}
