'use client';

import Link from 'next/link';
import { Button, Empty } from 'antd';

import RentalCard from '@/components/rental/RentalCard';
import { mockRentals } from '@/lib/mockRentals';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFavoriteStore } from '@/stores/useFavoriteStore';

import styles from './page.module.css';

const EMPTY_IDS: string[] = [];

export default function FavoritesPage() {
  const user = useAuthStore((state) => state.user);
  const openLogin = useAuthStore((state) => state.openLogin);

  const favoriteIds = useFavoriteStore((state) =>
    user ? state.favoritesByUser[user.id] ?? EMPTY_IDS : EMPTY_IDS,
  );

  const favorites = mockRentals.filter((rental) =>
    favoriteIds.includes(rental.id),
  );

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <h1>お気に入り</h1>
        {user && <span>{favorites.length}件</span>}
      </div>

      {!user ? (
        <div className={styles.emptyPanel}>
          <Empty description="ログインしてお気に入りを確認できます">
            <Button type="primary" onClick={() => openLogin()}>
              ログイン
            </Button>
          </Empty>
        </div>
      ) : favorites.length === 0 ? (
        <div className={styles.emptyPanel}>
          <Empty description="お気に入りの物件はまだありません">
            <Link href="/rentals" className={styles.searchLink}>
              お部屋を探す →
            </Link>
          </Empty>
        </div>
      ) : (
        <div className={styles.grid}>
          {favorites.map((rental) => (
            <RentalCard key={rental.id} rental={rental} />
          ))}
        </div>
      )}
    </div>
  );
}
