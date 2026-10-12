import { Checkbox, Select } from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  HomeOutlined,
} from '@ant-design/icons';

import type { RentalSearchFilters } from '@/types/rentalSearch';
import {
  buildingAgeOptions,
  floorPlanOptions,
  walkingOptions,
} from './filterOptions';

import styles from '../css/RentalFilters.module.css';

type Props = {
  floorPlans: string[];
  maxBuildingAge?: number;
  maxWalkingMinutes?: number;
  onChange: (values: Partial<RentalSearchFilters>) => void;
};

export default function RentalPropertyFilter({
                                               floorPlans,
                                               maxBuildingAge,
                                               maxWalkingMinutes,
                                               onChange,
                                             }: Props) {
  return (
    <>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <HomeOutlined aria-hidden="true" />
          間取り
        </h3>

        <Checkbox.Group<string>
          value={floorPlans}
          options={floorPlanOptions}
          onChange={(values) => {
            onChange({ floorPlans: values });
          }}
          className={styles.floorPlanOptions}
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <CalendarOutlined aria-hidden="true" />
          築年数
        </h3>

        <Select<number>
          value={maxBuildingAge}
          onChange={(value) => {
            onChange({ maxBuildingAge: value });
          }}
          placeholder="指定なし"
          aria-label="築年数"
          allowClear
          options={buildingAgeOptions}
          className={styles.control}
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <EnvironmentOutlined aria-hidden="true" />
          駅徒歩
        </h3>

        <Select<number>
          value={maxWalkingMinutes}
          onChange={(value) => {
            onChange({ maxWalkingMinutes: value });
          }}
          placeholder="指定なし"
          aria-label="駅までの徒歩時間"
          allowClear
          options={walkingOptions}
          className={styles.control}
        />
      </section>
    </>
  );
}
