'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CloseOutlined } from '@ant-design/icons';


import styles from './css/MapSearch.module.css';
import {RentalListItemData} from "@/types/rental";

interface RentalPreviewProps {
  rental: RentalListItemData;
  onClose: () => void;
}

export default function RentalPreview({
                                        rental,
                                        onClose,
                                      }: RentalPreviewProps) {
  const rentText = new Intl.NumberFormat('ja-JP', {
    maximumFractionDigits: 2,
  }).format(rental.monthlyRent / 10000);

  return (
    <section className={styles.preview} aria-label="選択した物件">
      <div className={styles.previewImage}>
        <Image
          src={rental.image || '/images/rentals/placeholder.svg'}
          alt={`${rental.name}の室内`}
          fill
          sizes="(max-width: 600px) 100vw, 320px"
          className={styles.image}
        />

        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="物件プレビューを閉じる"
        >
          <CloseOutlined />
        </button>
      </div>

      <div className={styles.previewContent}>
        <h2 className={styles.previewName}>{rental.name}</h2>

        <div className={styles.previewSummary}>
          <p className={styles.previewPrice}>
            {rentText}<span>万円</span>
          </p>

          <span className={styles.previewMeta}>
            {rental.floorPlan} / {rental.area}m²
          </span>
        </div>

        <p className={styles.previewStation}>
       <span>
          {rental.station ?? '最寄り駅情報は準備中です'}
         {rental.walkingMinutes != null && (
           <> 徒歩{rental.walkingMinutes}分</>
         )}
          </span>
        </p>

        <div className={styles.previewTags}>
          {rental.amenities.slice(0, 3).map((amenity) => (
            <span key={amenity}>{amenity}</span>
          ))}
        </div>

        <Link
          href={`/rentals/${rental.id}`}
          className={styles.detailLink}
        >
          詳細を見る →
        </Link>
      </div>
    </section>
  );
}
