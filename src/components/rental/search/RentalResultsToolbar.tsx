import { Button, Select } from 'antd';
import {
  AppstoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

import type {
  RentalSort,
  RentalView,
} from '@/types/rentalSearch';

import styles from './css/RentalResultsToolbar.module.css';

type Props = {
  total: number;
  sort: RentalSort;
  view: RentalView;
  onSortChange: (value: RentalSort) => void;
  onViewChange: (value: RentalView) => void;
};

export default function RentalResultsToolbar({
                                               total,
                                               sort,
                                               view,
                                               onSortChange,
                                               onViewChange,
                                             }: Props) {
  return (
    <div className={styles.toolbar}>
      <p className={styles.count} aria-live="polite">
        該当物件
        <strong>{total.toLocaleString('ja-JP')}</strong>
        件
      </p>

      <div className={styles.controls}>
        <div className={styles.sortGroup}>
          <span className={styles.label}>並び替え</span>

          <Select<RentalSort>
            value={sort}
            onChange={onSortChange}
            aria-label="物件の並び替え"
            className={styles.sortSelect}
            options={[
              {
                value: 'recommended',
                label: 'おすすめ順',
              },
              {
                value: 'rentAsc',
                label: '賃料が安い順',
              },
              {
                value: 'rentDesc',
                label: '賃料が高い順',
              },
              {
                value: 'areaDesc',
                label: '面積が広い順',
              },
              {
                value: 'walkingAsc',
                label: '駅から近い順',
              },
            ]}
          />
        </div>

        <div
          className={styles.viewGroup}
          role="group"
          aria-label="物件の表示方法"
        >
          <span className={styles.label}>表示方法</span>

          <Button
            type={view === 'list' ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            aria-pressed={view === 'list'}
            onClick={() => onViewChange('list')}
          >
            リスト
          </Button>

          <Button
            type={view === 'grid' ? 'primary' : 'default'}
            icon={<AppstoreOutlined />}
            aria-pressed={view === 'grid'}
            onClick={() => onViewChange('grid')}
          >
            写真大
          </Button>
        </div>
      </div>
    </div>
  );
}
