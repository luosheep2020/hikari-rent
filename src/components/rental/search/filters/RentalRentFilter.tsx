import { InputNumber, Slider } from 'antd';
import { DollarOutlined } from '@ant-design/icons';

import type { RentalSearchFilters } from '@/types/rentalSearch';

import styles from '../css/RentalFilters.module.css';

type RentValues = Pick<
  RentalSearchFilters,
  'minRent' | 'maxRent'
>;

type Props = {
  minRent?: number;
  maxRent?: number;
  onInputChange: (values: Partial<RentValues>) => void;
  onSliding: (values: RentValues) => void;
  onSlideComplete: (values: RentValues) => void;
};

function toRentValues(values: number[]): RentValues {
  return {
    minRent: values[0] === 0 ? undefined : values[0],
    maxRent: values[1],
  };
}

export default function RentalRentFilter({
                                           minRent,
                                           maxRent,
                                           onInputChange,
                                           onSliding,
                                           onSlideComplete,
                                         }: Props) {
  const sliderMax = Math.max(
    300000,
    minRent ?? 0,
    maxRent ?? 0,
  );

  const invalidRange =
    minRent !== undefined &&
    maxRent !== undefined &&
    minRent > maxRent;

  const sliderValue: [number, number] = invalidRange
    ? [maxRent ?? 0, minRent ?? sliderMax]
    : [minRent ?? 0, maxRent ?? sliderMax];

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        <DollarOutlined aria-hidden="true" />
        賃料（月額）
      </h3>

      <div className={styles.rentInputs}>
        <InputNumber<number>
          value={minRent ?? null}
          onChange={(value) => {
            onInputChange({
              minRent: value ?? undefined,
            });
          }}
          min={0}
          step={5000}
          precision={0}
          placeholder="下限なし"
          aria-label="最低賃料（円）"
          className={styles.rentInput}
        />

        <span className={styles.rangeSeparator}>〜</span>

        <InputNumber<number>
          value={maxRent ?? null}
          onChange={(value) => {
            onInputChange({
              maxRent: value ?? undefined,
            });
          }}
          min={0}
          step={5000}
          precision={0}
          placeholder="上限なし"
          aria-label="最高賃料（円）"
          className={styles.rentInput}
        />
      </div>

      <p className={styles.hint}>金額の単位：円</p>

      <Slider
        range
        min={0}
        max={sliderMax}
        step={5000}
        value={sliderValue}
        disabled={invalidRange}
        onChange={(values) => {
          onSliding(toRentValues(values));
        }}
        onChangeComplete={(values) => {
          onSlideComplete(toRentValues(values));
        }}
        tooltip={{
          formatter: (value) =>
            value === undefined
              ? ''
              : `${(value / 10000).toLocaleString('ja-JP')}万円`,
        }}
        className={styles.rentSlider}
      />

      {invalidRange && (
        <p className={styles.error} role="alert">
          上限は下限以上の金額にしてください
        </p>
      )}

      <p className={styles.hint}>
        管理費・共益費は含みません
      </p>
    </section>
  );
}
