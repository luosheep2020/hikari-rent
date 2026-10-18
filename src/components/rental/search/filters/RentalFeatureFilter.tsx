import { useEffect, useState } from 'react';
import { Button, Checkbox, Spin } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { rentalsApi } from '@/api/rentals';
import type {
  RentalFeatureOption,
  RentalSearchFilters,
} from '@/types/rentalSearch';
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
  const [features, setFeatures] = useState<RentalFeatureOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeatures() {
      setLoading(true);
      setFailed(false);

      try {
        const data = await rentalsApi.getFeatures(controller.signal);
        if (!controller.signal.aborted) {
          setFeatures(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to load rental features:', error);
          setFailed(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadFeatures();
    return () => controller.abort();
  }, [retry]);

  const amenityOptions = features
    .filter((feature) => feature.category === 'AMENITY')
    .map((feature) => ({ value: feature.code, label: feature.name }));

  const conditionOptions = features
    .filter((feature) => feature.category === 'CONDITION')
    .map((feature) => ({ value: feature.code, label: feature.name }));

  return (
    <>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <SettingOutlined aria-hidden="true" />
          こだわり条件・設備
        </h3>

        {loading && <Spin size="small" />}

        {failed && (
          <p role="alert" className={styles.hint}>
            条件を読み込めませんでした。
            <Button type="link" size="small" onClick={() => setRetry((n) => n + 1)}>
              再試行
            </Button>
          </p>
        )}

        {!loading && !failed && amenityOptions.length === 0 && (
          <p className={styles.hint}>登録されている設備はありません</p>
        )}

        <Checkbox.Group<string>
          value={amenities}
          options={amenityOptions}
          disabled={loading || failed}
          onChange={(values) => onChange({ amenities: values })}
          className={styles.equipmentOptions}
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>入居条件</h3>

        {!loading && !failed && conditionOptions.length === 0 && (
          <p className={styles.hint}>登録されている条件はありません</p>
        )}

        <Checkbox.Group<string>
          value={conditions}
          options={conditionOptions}
          disabled={loading || failed}
          onChange={(values) => onChange({ conditions: values })}
          className={styles.equipmentOptions}
        />
      </section>
    </>
  );
}
