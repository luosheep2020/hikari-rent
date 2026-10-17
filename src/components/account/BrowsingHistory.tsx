'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { App, Button, Empty, Popconfirm, Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import styles from './css/BrowsingHistory.module.css';
import RentalCard from '@/components/rental/RentalCard';
import { mockRentals } from '@/lib/mockRentals';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  getHistoryOwner,
  hydrateHistory,
  useHistoryStore,
  type RentalHistoryEntry,
} from '@/stores/useHistoryStore';



const EMPTY_HISTORY: RentalHistoryEntry[] = [];

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Tokyo',
});

export default function BrowsingHistory() {
  const { message } = App.useApp();

  const userId = useAuthStore((state) => state.user?.id);
  const owner = getHistoryOwner(userId);

  const hydrated = useHistoryStore(
    (state) => state.hydrated,
  );

  const history = useHistoryStore(
    (state) => state.historyByOwner[owner] ?? EMPTY_HISTORY,
  );

  const removeHistory = useHistoryStore(
    (state) => state.removeHistory,
  );

  const clearHistory = useHistoryStore(
    (state) => state.clearHistory,
  );

  useEffect(() => {
    void hydrateHistory();
  }, []);

  const entries = history.flatMap((entry) => {
    const rental = mockRentals.find(
      (item) => item.id === entry.rentalId,
    );

    return rental ? [{ entry, rental }] : [];
  });

  if (!hydrated) {
    return (
      <div className={styles.loading}>
        <Spin />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <p>
          最近閲覧した物件
          <strong>{entries.length}</strong>
          件
        </p>

        <Popconfirm
          title="閲覧履歴をすべて削除しますか？"
          description="削除した履歴は元に戻せません。"
          okText="削除"
          cancelText="キャンセル"
          onConfirm={() => {
            clearHistory(owner);
            message.success('閲覧履歴を削除しました');
          }}
          disabled={history.length === 0}
        >
          <Button
            icon={<DeleteOutlined />}
            disabled={history.length === 0}
          >
            履歴をクリア
          </Button>
        </Popconfirm>
      </div>

      {entries.length === 0 ? (
        <div className={styles.empty}>
          <Empty description="閲覧履歴はまだありません" />

          <Link href="/rentals" className={styles.searchLink}>
            お部屋を探す
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {entries.map(({ entry, rental }) => (
            <div key={rental.id} className={styles.item}>
              <RentalCard rental={rental} />

              <div className={styles.itemFooter}>
                <time dateTime={entry.viewedAt}>
                  {dateFormatter.format(
                    new Date(entry.viewedAt),
                  )}
                  に閲覧
                </time>

                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  aria-label={`${rental.name}を閲覧履歴から削除`}
                  onClick={() => {
                    removeHistory(owner, rental.id);
                    message.success(
                      '閲覧履歴から削除しました',
                    );
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className={styles.note}>
        閲覧履歴はこのブラウザに最大30件保存されます。
      </p>
    </div>
  );
}
