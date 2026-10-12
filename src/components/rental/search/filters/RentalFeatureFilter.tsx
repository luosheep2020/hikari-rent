import { Checkbox } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

import type { RentalSearchFilters } from '@/types/rentalSearch';
import {
  amenityOptions,
  conditionOptions,
} from './filterOptions';

import styles from '../css/RentalFilters.module.css';

type Props = {
  amenities: string[];
  conditions: string[];
  onChange: (values: Partial<RentalSearchFilters>) => void;
};

export default function RentalFeatureFilter({
                                              amenities,
                                              conditions,
                                              onChange,
                                            }: Props) {
  return (
    <>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <SettingOutlined aria-hidden="true" />
          こだわり条件・設備
        </h3>

        <Checkbox.Group<string>
          value={amenities}
          options={amenityOptions}
          onChange={(values) => {
            onChange({ amenities: values });
          }}
          className={styles.equipmentOptions}
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          入居条件
        </h3>

        <Checkbox.Group<string>
          value={conditions}
          options={conditionOptions}
          onChange={(values) => {
            onChange({ conditions: values });
          }}
          className={styles.equipmentOptions}
        />
      </section>
    </>
  );
}
