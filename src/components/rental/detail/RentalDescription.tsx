import type { RentalDetail } from '@/types/rental';

import styles from '@/components/rental/detail/css/RentalDetail.module.css';

export default function RentalDescription({
                                            rental,
                                          }: {
  rental: RentalDetail;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>お部屋について</h2>
      <p className={styles.description}>
        {rental.description || '担当者にご確認ください。'}
      </p>
    </section>
  );
}
