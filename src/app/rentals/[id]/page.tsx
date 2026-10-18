import {Suspense} from 'react';
import Link from 'next/link';
import {notFound} from 'next/navigation';

import {ApiError} from '@/api/client';
import {rentalsApi} from '@/api/rentals';

import RentalGallery from '@/components/rental/detail/RentalGallery';
import RentalPricePanel from '@/components/rental/detail/RentalPricePanel';
import RentalContact from '@/components/rental/detail/RentalContact';
import RentalFees from '@/components/rental/detail/RentalFees';
import RentalPropertyInfo from '@/components/rental/detail/RentalPropertyInfo';
import RentalAmenities from '@/components/rental/detail/RentalAmenities';
import RentalContract from '@/components/rental/detail/RentalContract';
import RentalLocation from '@/components/rental/detail/RentalLocation';
import RentalDescription from '@/components/rental/detail/RentalDescription';
import RentalManagement from '@/components/rental/detail/RentalManagement';
import RentalHistoryTracker from '@/components/account/RentalHistoryTracker';

import styles from './page.module.css';
import {getPropertyTypeLabel} from "@/utils/rental";

interface RentalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function RentalDetailPage({
                                           params,
                                         }: RentalDetailPageProps) {
  return (
    <Suspense fallback={<div role="status">物件情報を読み込み中...</div>}>
      <RentalDetailContent params={params}/>
    </Suspense>
  );
}

async function RentalDetailContent({
                                     params,
                                   }: RentalDetailPageProps) {
  const {id} = await params;

  if (!/^[1-9]\d{0,18}$/.test(id)) {
    notFound();
  }

  const rental = await rentalsApi.getDetail(id).catch(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 404) {
        notFound();
      }

      throw error;
    },
  );

  const photos = (rental.images ?? []).filter(
    (url) => typeof url === 'string' && url.trim() !== '',
  );

  const galleryImages =
    photos.length > 0
      ? photos
      : rental.image
        ? [rental.image]
        : ['/images/rentals/placeholder.svg'];

  return (
    <div className={styles.container}>
      <nav
        className={styles.breadcrumb}
        aria-label="パンくずリスト"
      >
        <Link href="/">ホーム</Link>
        <span aria-hidden="true">/</span>

        <Link href="/rentals">お部屋探し</Link>
        <span aria-hidden="true">/</span>

        <span aria-current="page">{rental.name}</span>
      </nav>

      <header className={styles.heading}>
        <h1 className={styles.title}>{rental.name}</h1>
        <span className={styles.propertyType}>
          {getPropertyTypeLabel(rental.propertyType)}
        </span>
        <div className={styles.location}>
          <span>{rental.address}</span>

          <span>
            {rental.station ? (
              <>
                {rental.station}
                {rental.walkingMinutes != null && (
                  <> 徒歩{rental.walkingMinutes}分</>
                )}
              </>
            ) : (
              '最寄り駅情報は準備中です'
            )}
          </span>
        </div>
      </header>

      {/* Property photos, pricing, and contact information. */}
      <div className={styles.topGrid}>
        <RentalGallery
          key={rental.id}
          images={galleryImages}
          name={rental.name}
        />

        <div className={styles.sidebar}>
          <RentalPricePanel rental={rental}/>

          {rental.agent && (
            <RentalContact
              key={rental.id}
              rental={rental}
            />
          )}
        </div>
      </div>

      {/* Property detail sections. */}
      <div className={styles.detailsGrid}>
        <RentalFees rental={rental}/>
        <RentalPropertyInfo rental={rental}/>
        <RentalAmenities rental={rental}/>
        <RentalContract rental={rental}/>
        <RentalLocation rental={rental}/>
        <RentalDescription rental={rental}/>
      </div>

      <RentalHistoryTracker
        key={rental.id}
        rentalId={rental.id}
      />

      {rental.managementCompany && (
        <RentalManagement rental={rental}/>
      )}
    </div>
  );
}
