'use client';

import { App, Button } from 'antd';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';

import type { RentalDetail } from '@/types/rental';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFavoriteStore } from '@/stores/useFavoriteStore';

import styles from '@/components/rental/detail/css/RentalPricePanel.module.css';

interface RentalPricePanelProps {
  rental: RentalDetail;
}

export default function RentalPricePanel({
                                           rental,
                                         }: RentalPricePanelProps) {
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

  const managementFeeText = new Intl.NumberFormat('ja-JP').format(
    rental.managementFee,
  );

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
    <section className={styles.panel} aria-label="賃料と物件概要">
      <p className={styles.label}>賃料</p>

      <p className={styles.price}>
        {rentText}
        <span className={styles.priceUnit}>万円/月</span>
      </p>

      <p className={styles.managementFee}>
        管理費
        <strong>{managementFeeText}円/月</strong>
      </p>

      <dl className={styles.fees}>
        <div>
          <dt>敷金</dt>
          <dd>
            {rental.depositMonths === 0
              ? 'なし'
              : `${rental.depositMonths}ヶ月`}
          </dd>
        </div>

        <div>
          <dt>礼金</dt>
          <dd>
            {rental.keyMoneyMonths === 0
              ? 'なし'
              : `${rental.keyMoneyMonths}ヶ月`}
          </dd>
        </div>
      </dl>

      <dl className={styles.summary}>
        <div>
          <dt>間取り</dt>
          <dd>{rental.floorPlan}</dd>
        </div>

        <div>
          <dt>専有面積</dt>
          <dd>{rental.area}m²</dd>
        </div>

        <div>
          <dt>所在階 / 階建</dt>
          <dd>
            {rental.floor}階 / {rental.totalFloors}階建
          </dd>
        </div>
      </dl>

      <Button
        size="large"
        block
        icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
        onClick={handleFavorite}
        aria-pressed={isFavorite}
        className={`${styles.favoriteButton} ${
          isFavorite ? styles.favorited : ''
        }`}
      >
        {isFavorite ? 'お気に入りに追加済み' : 'お気に入りに追加'}
      </Button>
    </section>
  );
}
