import type { RentalDetail } from '@/types/rental';

import styles from '@/components/rental/detail/css/RentalDetail.module.css';

export default function RentalAmenities({
                                          rental,
                                        }: {
  rental: RentalDetail;
}) {
  const groups = [
    { label: '設備', values: rental.amenities },
    { label: 'その他条件', values: rental.conditions },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>設備・条件</h2>

      <div className={styles.conditionRows}>
        {groups.map((group) => (
          <div key={group.label} className={styles.conditionRow}>
            <h3 className={styles.conditionLabel}>
              {group.label}
            </h3>

            {group.values.length > 0 ? (
              <ul className={styles.tags}>
                {group.values.map((value) => (
                  <li key={value} className={styles.tag}>
                    {value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.muted}>要確認</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
