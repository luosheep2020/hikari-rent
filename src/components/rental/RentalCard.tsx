'use client';

import Image from 'next/image';
import Link from 'next/link';
import { App } from 'antd';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/useAuthStore';
import type { RentalSummary } from '@/types/rental';
import { useFavoriteStore } from '@/stores/useFavoriteStore';
import styles from '@/components/rental/css/RentalCard.module.css';

interface RentalCardProps {
  rental: RentalSummary;
}

export default function RentalCard({ rental }: RentalCardProps) {
  const { message } = App.useApp();

  const user = useAuthStore((state) => state.user);
  const openLogin = useAuthStore((state) => state.openLogin);

  const isFavorite = useFavoriteStore((state) =>
    user
      ? (state.favoritesByUser[user.id]?.includes(rental.id) ?? false)
      : false,
  );

  const toggleFavorite = useFavoriteStore(
    (state) => state.toggleFavorite,
  );
  const rentText = new Intl.NumberFormat('ja-JP', {
    maximumFractionDigits: 2,
  }).format(rental.monthlyRent / 10000);

  function handleFavorite() {
    if (!user) {
      message.info('お気に入りを利用するにはログインしてください');
      openLogin();
      return;
    }

    toggleFavorite(user.id, rental.id);

    message.success(
      isFavorite
        ? 'お気に入りから削除しました'
        : 'お気に入りに追加しました',
    );
  }

  return (
    <article className={styles.card}>
      <Link
        href={`/rentals/${rental.id}`}
        className={styles.detailLink}
        aria-label={`${rental.name}の詳細を見る`}
      >
        <div className={styles.imageWrapper}>
          <Image
            src={rental.image}
            alt={`${rental.name}の室内`}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={styles.image}
          />

          {rental.isNew && (
            <span className={styles.badge}>新着</span>
          )}
        </div>

        <div className={styles.content}>
          <p className={styles.address}>{rental.address}</p>

          <h3 className={styles.name}>{rental.name}</h3>

          <p className={styles.price}>
            {rentText}
            <span className={styles.priceUnit}>万円/月</span>
          </p>

          <p className={styles.meta}>
            {rental.floorPlan} / {rental.area}m²
          </p>

          <p className={styles.station}>
            {rental.station} 徒歩{rental.walkingMinutes}分
          </p>
        </div>
      </Link>

      <button
        type="button"
        className={`${styles.favoriteButton} ${
          isFavorite ? styles.favorited : ''
        }`}
        onClick={handleFavorite}
        aria-label={
          isFavorite
            ? `${rental.name}をお気に入りから削除`
            : `${rental.name}をお気に入りに追加`
        }
        aria-pressed={isFavorite}
      >
        {isFavorite ? <HeartFilled /> : <HeartOutlined />}
      </button>
    </article>
  );
}
