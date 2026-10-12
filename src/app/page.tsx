import Link from 'next/link';

import HeroSearch from '@/components/home/HeroSearch';
import PopularAreas from '@/components/home/PopularAreas';
import RentalCard from '@/components/rental/RentalCard';
import { mockRentals } from '@/lib/mockRentals';
import styles from './page.module.css';


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
            <h2 id="latest-rentals-title" className={styles.sectionTitle}>
              新着のお部屋
            </h2>

            <Link href="/rentals?sort=newest" className={styles.moreLink}>
              新着のお部屋をもっと見る
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className={styles.rentalGrid}>
            {mockRentals.slice(0, 4).map((rental) => (
              <RentalCard key={rental.id} rental={rental} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
