'use client';

import Image from 'next/image';
import Link from 'next/link';
import { App, Button } from 'antd';
import {
  EnvironmentOutlined,
  HeartFilled,
  HeartOutlined,
  RightOutlined,
} from '@ant-design/icons';

import type { RentalDetail } from '@/types/rental';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFavoriteStore } from '@/stores/useFavoriteStore';

import styles from './css/RentalListItem.module.css';

type Props = {
  rental: RentalDetail;
};

const yenFormatter = new Intl.NumberFormat('ja-JP');

function formatRent(value: number): string {
  return (value / 10000).toLocaleString('ja-JP', {
    maximumFractionDigits: 2,
  });
}

export default function RentalListItem({ rental }: Props) {
  const { message } = App.useApp();

  const user = useAuthStore((state) => state.user);
  const openLogin = useAuthStore((state) => state.openLogin);

  const toggleFavorite = useFavoriteStore(
    (state) => state.toggleFavorite,
  );

  const isFavorite = useFavoriteStore((state) =>
    user
      ? (
        state.favoritesByUser[user.id] ?? []
      ).includes(rental.id)
      : false,
  );

  const detailHref = `/rentals/${rental.id}`;
  const imageCount = rental.images.length;

  const handleFavorite = () => {
    if (!user) {
      openLogin();
      message.info('お気に入りの登録にはログインが必要です');
      return;
    }

    toggleFavorite(user.id, rental.id);

    message.success(
      isFavorite
        ? 'お気に入りから削除しました'
        : 'お気に入りに追加しました',
    );
  };

  return (
    <article className={styles.item}>
      <Link
        href={detailHref}
        className={styles.photo}
        aria-label={`${rental.name}の詳細を見る`}
      >
        <Image
          src={rental.image}
          alt={`${rental.name}の室内`}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 240px, 300px"
          className={styles.photoImage}
        />

        {imageCount > 0 && (
          <span className={styles.imageCount}>
            写真 {imageCount}枚
          </span>
        )}
      </Link>

      <div className={styles.information}>
        <div className={styles.titleRow}>
          <h2 className={styles.name}>
            <Link href={detailHref}>{rental.name}</Link>
          </h2>

          {rental.isNew && (
            <span className={styles.newBadge}>新着</span>
          )}
        </div>

        <p className={styles.station}>
          <EnvironmentOutlined aria-hidden="true" />

          <span>
            {rental.station}
            <strong>徒歩{rental.walkingMinutes}分</strong>
          </span>
        </p>

        <p className={styles.address}>
          <EnvironmentOutlined aria-hidden="true" />
          <span>{rental.address}</span>
        </p>

        <p className={styles.building}>
          {rental.floor}階 / {rental.totalFloors}階建
          <span aria-hidden="true">・</span>
          {rental.builtYear}年{rental.builtMonth}月築
        </p>

        <ul
          className={styles.amenities}
          aria-label="主な設備"
        >
          {rental.amenities.slice(0, 6).map((amenity) => (
            <li key={amenity}>{amenity}</li>
          ))}
        </ul>
      </div>

      <div className={styles.floorPlan}>
        <p className={styles.floorPlanMeta}>
          <strong>{rental.floorPlan}</strong>
          <span>{rental.area}㎡</span>
        </p>

        <div className={styles.floorPlanImage}>
          {rental.floorPlanImage ? (
            <Image
              src={rental.floorPlanImage}
              alt={`${rental.name}の間取り図`}
              fill
              sizes="150px"
              className={styles.planImage}
            />
          ) : (
            <span className={styles.planPlaceholder}>
              間取り図は
              <br />
              準備中
            </span>
          )}
        </div>
      </div>

      <div className={styles.pricePanel}>
        <p className={styles.rent}>
          <strong>{formatRent(rental.monthlyRent)}</strong>
          <span>万円</span>
        </p>

        <p className={styles.managementFee}>
          管理費
          <strong>
            {yenFormatter.format(rental.managementFee)}円
          </strong>
        </p>

        <div className={styles.initialFees}>
          <span>
            敷金
            <strong>
              {rental.depositMonths === 0
                ? 'なし'
                : `${rental.depositMonths}ヶ月`}
            </strong>
          </span>

          <span>
            礼金
            <strong>
              {rental.keyMoneyMonths === 0
                ? 'なし'
                : `${rental.keyMoneyMonths}ヶ月`}
            </strong>
          </span>
        </div>

        <div className={styles.actions}>
          <Button
            block
            icon={
              isFavorite ? <HeartFilled /> : <HeartOutlined />
            }
            onClick={handleFavorite}
            aria-pressed={isFavorite}
            className={
              isFavorite ? styles.favoriteActive : undefined
            }
          >
            {isFavorite ? '登録済み' : 'お気に入り'}
          </Button>

          <Link
            href={detailHref}
            className={styles.detailButton}
          >
            詳細を見る
            <RightOutlined aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
