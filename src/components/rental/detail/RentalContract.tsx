import { Descriptions } from 'antd';

import type { RentalDetail } from '@/types/rental';
import styles from '@/components/rental/detail/css/RentalDetail.module.css';

interface RentalContractProps {
  rental: RentalDetail;
}

export default function RentalContract({
                                         rental,
                                       }: RentalContractProps) {
  const renewalFee =
    rental.renewalFee === null
      ? '要確認'
      : rental.renewalFee === 0
        ? 'なし'
        : `${new Intl.NumberFormat('ja-JP').format(
          rental.renewalFee,
        )}円`;

  const items = [
    {
      key: 'available',
      label: '入居時期',
      children: rental.availableFrom,
    },
    {
      key: 'type',
      label: '契約形態',
      children: rental.contractType,
    },
    {
      key: 'period',
      label: '契約期間',
      children: rental.contractPeriod,
    },
    {
      key: 'renewal',
      label: '更新料',
      children: renewalFee,
    },
    {
      key: 'guarantee',
      label: '保証会社',
      children: rental.guaranteeCompany,
    },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>契約・入居</h2>

      <Descriptions
        className={styles.table}
        bordered
        size="small"
        column={1}
        items={items}
      />
    </section>
  );
}
