import { Select } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

import AreaSelector from '@/components/area/AreaSelector';
import type { RentalDetail } from '@/types/rental';
import type { RentalSearchFilters } from '@/types/rentalSearch';

import styles from '../css/RentalFilters.module.css';

type Props = {
  rentals: readonly RentalDetail[];
  areaCode?: string;
  station?: string;
  onChange: (values: Partial<RentalSearchFilters>) => void;
};

export default function RentalAreaFilter({
                                           rentals,
                                           areaCode,
                                           station,
                                           onChange,
                                         }: Props) {
  const areaRentals = areaCode
    ? rentals.filter((rental) => rental.areaCode === areaCode)
    : rentals;

  const stationNames = new Set<string>();

  areaRentals.forEach((rental) => {
    stationNames.add(rental.station);

    rental.stations.forEach((item) => {
      stationNames.add(item.name);
    });
  });

  const stationOptions = [...stationNames]
    .sort((a, b) => a.localeCompare(b, 'ja'))
    .map((name) => ({
      value: name,
      label: name,
    }));

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        <EnvironmentOutlined aria-hidden="true" />
        エリア・駅
      </h3>

      <div className={styles.fieldStack}>
        <AreaSelector
          value={areaCode}
          onChange={(nextAreaCode) => {
            onChange({
              areaCode: nextAreaCode,
              station: undefined,
            });
          }}
          placeholder="エリアを選択"
          className={styles.control}
        />

        <Select<string>
          value={station}
          onChange={(nextStation) => {
            onChange({ station: nextStation });
          }}
          options={stationOptions}
          placeholder="駅を選択"
          aria-label="駅を選択"
          allowClear
          showSearch
          notFoundContent="対象の駅がありません"
          className={styles.control}
        />
      </div>
    </section>
  );
}
