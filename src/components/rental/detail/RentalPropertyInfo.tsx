import Image from 'next/image';
import { Descriptions } from 'antd';
import type { RentalDetail } from '@/types/rental';

import styles from '@/components/rental/detail/css/RentalDetail.module.css';

export default function RentalPropertyInfo({
                                             rental,
                                           }: {
  rental: RentalDetail;
}) {
  const items = [
    {
      key: 'layout',
      label: '間取り',
      children: rental.floorPlan,
    },
    {
      key: 'area',
      label: '専有面積',
      children: `${rental.area}m²`,
    },
    {
      key: 'floor',
      label: '所在階',
      children: `${rental.floor}階 / ${rental.totalFloors}階建`,
    },
    {
      key: 'direction',
      label: '向き',
      children: rental.direction,
    },
    {
      key: 'structure',
      label: '構造',
      children: rental.buildingStructure,
    },
    {
      key: 'built',
      label: '築年月',
      children: `${rental.builtYear}年${rental.builtMonth}月`,
    },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>物件情報</h2>

      <div
        className={
          rental.floorPlanImage ? styles.propertyLayout : undefined
        }
      >
        <Descriptions
          className={styles.table}
          bordered
          size="small"
          column={1}
          items={items}
        />

        {rental.floorPlanImage && (
          <figure className={styles.floorPlan}>
            <div className={styles.floorPlanImage}>
              <Image
                src={rental.floorPlanImage}
                alt={`${rental.name}の間取り図`}
                fill
                sizes="160px"
                className={styles.planImage}
              />
            </div>

            <figcaption>間取り図</figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
