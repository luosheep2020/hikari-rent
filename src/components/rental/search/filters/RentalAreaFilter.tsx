import { EnvironmentOutlined } from '@ant-design/icons';
import AreaSelector from '@/components/area/AreaSelector';
import StationSelector from '@/components/station/StationSelector';
import type { RentalSearchFilters } from '@/types/rentalSearch';
import styles from '../css/RentalFilters.module.css';

type Props = {
  areaCode?: string;
  stationId?: string;
  onChange: (values: Partial<RentalSearchFilters>) => void;
};

export default function RentalAreaFilter({
  areaCode,
  stationId,
  onChange,
}: Props) {
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
            // Preserve the existing behavior of clearing the station on area changes.
            onChange({
              areaCode: nextAreaCode,
              stationId: undefined,
              station: undefined,
            });
          }}
          placeholder="エリアを選択"
          className={styles.control}
        />

        <StationSelector
          value={stationId}
          onChange={(nextStationId) => {
            onChange({ stationId: nextStationId, station: undefined });
          }}
          placeholder="鉄道会社・路線・駅名で検索"
          className={styles.control}
        />
      </div>
    </section>
  );
}
