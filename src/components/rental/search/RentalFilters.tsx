import { useEffect, useRef, useState } from 'react';

import type { RentalDetail } from '@/types/rental';
import {
  createDefaultRentalFilters,
  type RentalSearchFilters,
} from '@/types/rentalSearch';

import RentalAreaFilter from './filters/RentalAreaFilter';
import RentalRentFilter from './filters/RentalRentFilter';
import RentalPropertyFilter from './filters/RentalPropertyFilter';
import RentalFeatureFilter from './filters/RentalFeatureFilter';

import styles from './css/RentalFilters.module.css';

export type RentalConditionFilters = Omit<
  RentalSearchFilters,
  'keyword'
>;

type Props = {
  rentals: readonly RentalDetail[];
  initialFilters: RentalSearchFilters;
  onSearch: (filters: RentalConditionFilters) => void;
};

function getConditions(
  filters: RentalSearchFilters,
): RentalConditionFilters {
  return {
    areaCode: filters.areaCode,
    station: filters.station,
    minRent: filters.minRent,
    maxRent: filters.maxRent,
    floorPlans: [...filters.floorPlans],
    maxBuildingAge: filters.maxBuildingAge,
    maxWalkingMinutes: filters.maxWalkingMinutes,
    amenities: [...filters.amenities],
    conditions: [...filters.conditions],
  };
}

function isValidRentRange(
  filters: RentalConditionFilters,
): boolean {
  return (
    filters.minRent === undefined ||
    filters.maxRent === undefined ||
    filters.minRent <= filters.maxRent
  );
}

export default function RentalFilters({
                                        rentals,
                                        initialFilters,
                                        onSearch,
                                      }: Props) {
  const [draft, setDraft] = useState<RentalConditionFilters>(
    () => getConditions(initialFilters),
  );

  // 保存最新条件，连续修改时也能读取最新值。
  const draftRef = useRef(draft);

  const timerRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  const cancelPendingSearch = () => {
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
  };

  const updateDraft = (
    values: Partial<RentalConditionFilters>,
  ): RentalConditionFilters => {
    const next = {
      ...draftRef.current,
      ...values,
    };

    draftRef.current = next;
    setDraft(next);

    return next;
  };

  const submitConditions = (
    conditions: RentalConditionFilters,
  ) => {
    if (!isValidRentRange(conditions)) {
      return;
    }

    onSearch({
      ...conditions,
      floorPlans: [...conditions.floorPlans],
      amenities: [...conditions.amenities],
      conditions: [...conditions.conditions],
    });
  };

  // 区域、户型、设备等立即查询。
  const handleImmediateChange = (
    values: Partial<RentalConditionFilters>,
  ) => {
    cancelPendingSearch();

    const next = updateDraft(values);
    submitConditions(next);
  };

  // 租金输入停止 300ms 后查询。
  const handleRentInputChange = (
    values: Partial<RentalConditionFilters>,
  ) => {
    cancelPendingSearch();

    const next = updateDraft(values);

    if (!isValidRentRange(next)) {
      return;
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = undefined;
      submitConditions(draftRef.current);
    }, 300);
  };

  // 滑块拖动时只更新输入框和滑块。
  const handleRentSliding = (
    values: Partial<RentalConditionFilters>,
  ) => {
    cancelPendingSearch();
    updateDraft(values);
  };

  // 滑块松手时查询。
  const handleRentSlideComplete = (
    values: Partial<RentalConditionFilters>,
  ) => {
    cancelPendingSearch();

    const next = updateDraft(values);
    submitConditions(next);
  };

  const handleClear = () => {
    cancelPendingSearch();

    const cleared = getConditions(
      createDefaultRentalFilters(),
    );

    draftRef.current = cleared;
    setDraft(cleared);
    submitConditions(cleared);
  };

  return (
    <aside
      className={styles.panel}
      aria-label="物件の検索条件"
    >
      <div className={styles.heading}>
        <h2>条件で絞り込む</h2>

        <button
          type="button"
          onClick={handleClear}
          className={styles.clearButton}
        >
          条件をクリア
        </button>
      </div>

      <RentalAreaFilter
        rentals={rentals}
        areaCode={draft.areaCode}
        station={draft.station}
        onChange={handleImmediateChange}
      />

      <RentalRentFilter
        minRent={draft.minRent}
        maxRent={draft.maxRent}
        onInputChange={handleRentInputChange}
        onSliding={handleRentSliding}
        onSlideComplete={handleRentSlideComplete}
      />

      <RentalPropertyFilter
        floorPlans={draft.floorPlans}
        maxBuildingAge={draft.maxBuildingAge}
        maxWalkingMinutes={draft.maxWalkingMinutes}
        onChange={handleImmediateChange}
      />

      <RentalFeatureFilter
        amenities={draft.amenities}
        conditions={draft.conditions}
        onChange={handleImmediateChange}
      />
    </aside>
  );
}
