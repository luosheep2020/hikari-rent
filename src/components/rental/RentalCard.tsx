'use client';

import RentalImage from '@/components/rental/RentalImage';
import Link from 'next/link';
import {App, Tag} from 'antd';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/useAuthStore';
import type { RentalSummary, RentalListItemData } from '@/types/rental';
import { useFavoriteStore } from '@/stores/useFavoriteStore';
import styles from '@/components/rental/css/RentalCard.module.css';
import {getPropertyTypeLabel} from "@/utils/rental";
import {useRentalFavorite} from "@/hooks/useRentalFavorite";

interface RentalCardProps {
  rental: RentalSummary | RentalListItemData;
}

export default function RentalCard({ rental }: RentalCardProps) {

  const {
    isFavorite,
    busy,
    handleFavorite,
  } = useRentalFavorite(rental.id);

  const rentText = new Intl.NumberFormat('ja-JP', {
    maximumFractionDigits: 2,
  }).format(rental.monthlyRent / 10000);


  return (
    <article className={styles.card}>
      <Link
        href={`/rentals/${rental.id}`}
        className={styles.detailLink}

        aria-label={`${rental.name}の詳細を見る`}
      >
        <div className={styles.imageWrapper}>
          <RentalImage
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
          <Tag>{getPropertyTypeLabel(rental.propertyType)}</Tag>
          <h3 className={styles.name}>{rental.name}</h3>
          <p className={styles.price}>
            {rentText}
            <span className={styles.priceUnit}>万円/月</span>
          </p>

          <p className={styles.meta}>
            {rental.floorPlan} / {rental.area}m²
          </p>

          <p className={styles.station}>
            {rental.station || '駅情報は準備中です'}
            {rental.walkingMinutes != null && ` 徒歩${rental.walkingMinutes}分`}
          </p>
        </div>
      </Link>

      <button
        type="button"
        className={`${styles.favoriteButton} ${
          isFavorite ? styles.favorited : ''
        }`}
        onClick={() => {
          void handleFavorite();
        }}
        disabled={busy}
        aria-busy={busy}
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
