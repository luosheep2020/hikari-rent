import { Suspense } from 'react';
import Link from 'next/link';

import HeroSearch from '@/components/home/HeroSearch';
import PopularAreas from '@/components/home/PopularAreas';
import RentalCard from '@/components/rental/RentalCard';

import { rentalsApi } from '@/api/rentals';
import { createDefaultRentalFilters } from '@/types/rentalSearch';

import styles from './page.module.css';

async function LatestRentalCards() {
  let result;

  try {
    result = await rentalsApi.getPage({
      ...createDefaultRentalFilters(),
      page: 1,
      pageSize: 4,
      sort: 'recommended',
    });
  } catch (error) {
    console.error('Failed to load latest rentals:', error);

    return (
      <p role="alert">
        新着物件を読み込めませんでした。時間をおいて再度お試しください。
      </p>
    );
  }

  if (result.records.length === 0) {
    return <p>現在、掲載中の物件はありません。</p>;
  }

  return (
    <div className={styles.rentalGrid}>
      {result.records.map((rental) => (
        <RentalCard key={rental.id} rental={rental} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSearch />

      <div className={styles.container}>
        <PopularAreas />

        <section
          className={styles.latestSection}
          aria-labelledby="latest-rentals-title"
        >
          <div className={styles.sectionHeading}>
            <h2
              id="latest-rentals-title"
              className={styles.sectionTitle}
            >
              新着のお部屋
            </h2>

            <Link
              href="/rentals"
              className={styles.moreLink}
            >
              新着のお部屋をもっと見る
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <Suspense
            fallback={
              <p role="status">新着物件を読み込み中...</p>
            }
          >
            <LatestRentalCards />
          </Suspense>
        </section>
      </div>
    </>
  );
}
