import { Descriptions } from 'antd';
import type { RentalDetail } from '@/types/rental';

import styles from '@/components/rental/detail/css/RentalDetail.module.css';

const formatter = new Intl.NumberFormat('ja-JP');

function formatAmount(amount: number | null) {
  if (amount === null) return '要確認';
  if (amount === 0) return '無料';

  return `${formatter.format(amount)}円`;
}

function formatDeposit(rent: number, months: number) {
  if (months === 0) return 'なし';

  return `${formatAmount(rent * months)}（${months}ヶ月）`;
}

export default function RentalFees({
                                     rental,
                                   }: {
  rental: RentalDetail;
}) {
  const items = [
    {
      key: 'rent',
      label: '賃料',
      children: `${formatter.format(rental.monthlyRent)}円/月`,
    },
    {
      key: 'management',
      label: '管理費',
      children: `${formatter.format(rental.managementFee)}円/月`,
    },
    {
      key: 'deposit',
      label: '敷金',
      children: formatDeposit(
        rental.monthlyRent,
        rental.depositMonths,
      ),
    },
    {
      key: 'keyMoney',
      label: '礼金',
      children: formatDeposit(
        rental.monthlyRent,
        rental.keyMoneyMonths,
      ),
    },
    {
      key: 'brokerage',
      label: '仲介手数料',
      children: formatAmount(rental.brokerageFee),
    },
    {
      key: 'guarantee',
      label: '保証料',
      children: formatAmount(rental.guaranteeFee),
    },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>賃料・初期費用</h2>

      <Descriptions
        className={styles.table}
        bordered
        size="small"
        column={1}
        items={items}
      />

      <p className={styles.note}>
        ※保険料・清掃費など、別途費用が発生する場合があります。
        初期費用の総額は担当者にご確認ください。
      </p>
    </section>
  );
}
