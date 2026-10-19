'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import {
  Alert,
  App,
  Button,
  Empty,
  Popconfirm,
  Spin,
} from 'antd';

import { DeleteOutlined } from '@ant-design/icons';

import { userApi } from '@/api/user';
import RentalCard from '@/components/rental/RentalCard';
import { useAuthStore } from '@/stores/useAuthStore';
import type { RentalListItemData } from '@/types/rental';

import styles from './css/BrowsingHistory.module.css';

interface HistoryResult {
  key: string;
  records: RentalListItemData[];
  error?: string;
}

export default function BrowsingHistory() {
  const { message } = App.useApp();

  const userId = useAuthStore((state) => state.user?.id);
  const openLogin = useAuthStore((state) => state.openLogin);

  const [retry, setRetry] = useState(0);

  const [result, setResult] = useState<HistoryResult>({
    key: '',
    records: [],
  });

  const [pendingId, setPendingId] = useState<string | null>(null);

  const mutationPendingRef = useRef(false);

  const requestKey = JSON.stringify([userId, retry]);

  const loaded = result.key === requestKey;
  const loading = Boolean(userId) && !loaded;
  const busy = pendingId !== null;

  const records = loaded ? result.records : [];
  const error = loaded ? result.error : undefined;

  useEffect(() => {
    if (!userId) {
      return;
    }

    const controller = new AbortController();

    async function loadHistory() {
      try {
        const data = await userApi.getHistory(
          controller.signal,
        );

        if (controller.signal.aborted) {
          return;
        }

        setResult({
          key: requestKey,
          records: data,
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(
          'Failed to load browsing history:',
          error,
        );

        setResult({
          key: requestKey,
          records: [],
          error: '閲覧履歴を読み込めませんでした。',
        });
      }
    }

    void loadHistory();

    return () => {
      controller.abort();
    };
  }, [userId, requestKey]);

  async function handleRemove(rentalId: string) {
    if (!userId || mutationPendingRef.current) {
      return;
    }

    const ownerId = userId;

    mutationPendingRef.current = true;
    setPendingId(rentalId);

    try {
      await userApi.removeHistory(rentalId);

      if (
        useAuthStore.getState().user?.id !== ownerId
      ) {
        return;
      }

      setResult((current) => ({
        ...current,
        records: current.records.filter(
          (rental) => rental.id !== rentalId,
        ),
      }));

      message.success('閲覧履歴から削除しました');
    } catch (error: unknown) {
      console.error(
        'Failed to remove browsing history:',
        error,
      );

      if (
        useAuthStore.getState().user?.id === ownerId
      ) {
        message.error('閲覧履歴を削除できませんでした');
      }
    } finally {
      mutationPendingRef.current = false;
      setPendingId(null);
    }
  }

  async function handleClear() {
    if (!userId || mutationPendingRef.current) {
      return;
    }

    const ownerId = userId;

    mutationPendingRef.current = true;
    setPendingId('all');

    try {
      await userApi.clearHistory();

      if (
        useAuthStore.getState().user?.id !== ownerId
      ) {
        return;
      }

      setResult((current) => ({
        ...current,
        records: [],
      }));

      message.success('閲覧履歴を削除しました');
    } catch (error: unknown) {
      console.error(
        'Failed to clear browsing history:',
        error,
      );

      if (
        useAuthStore.getState().user?.id === ownerId
      ) {
        message.error('閲覧履歴を削除できませんでした');
      }
    } finally {
      mutationPendingRef.current = false;
      setPendingId(null);
    }
  }

  if (!userId) {
    return (
      <div className={styles.empty}>
        <Empty description="ログインして閲覧履歴を確認できます" />

        <Button
          type="primary"
          onClick={() => openLogin()}
        >
          ログイン
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        title={error}
        action={
          <Button
            size="small"
            onClick={() => setRetry((value) => value + 1)}
          >
            再試行
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <p>
          最近閲覧した物件
          <strong>{records.length}</strong>
          件
        </p>

        <Popconfirm
          title="閲覧履歴をすべて削除しますか？"
          description="削除した履歴は元に戻せません。"
          okText="削除"
          cancelText="キャンセル"
          onConfirm={handleClear}
          disabled={records.length === 0 || busy}
        >
          <Button
            icon={<DeleteOutlined />}
            loading={pendingId === 'all'}
            disabled={records.length === 0 || busy}
          >
            履歴をクリア
          </Button>
        </Popconfirm>
      </div>

      {records.length === 0 ? (
        <div className={styles.empty}>
          <Empty description="閲覧履歴はまだありません" />

          <Link
            href="/rentals"
            className={styles.searchLink}
          >
            お部屋を探す
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {records.map((rental) => (
            <div
              key={rental.id}
              className={styles.item}
            >
              <RentalCard rental={rental} />

              <div className={styles.itemFooter}>
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  loading={pendingId === rental.id}
                  disabled={busy}
                  aria-label={`${rental.name}を閲覧履歴から削除`}
                  onClick={() => {
                    void handleRemove(rental.id);
                  }}
                >
                  履歴から削除
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className={styles.note}>
        閲覧履歴はアカウントごとに最新30件まで保存されます。
        募集終了などにより表示されない物件があります。
      </p>
    </div>
  );
}
