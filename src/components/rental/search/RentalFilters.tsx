import { useEffect, useRef, useState } from 'react';

import {
  createDefaultRentalFilters,
  type RentalSearchFilters,
} from '@/types/rentalSearch';


import RentalRentFilter from './filters/RentalRentFilter';
import RentalPropertyFilter from './filters/RentalPropertyFilter';


import styles from './css/RentalFilters.module.css';
import RentalAreaFilter from "@/components/rental/search/filters/RentalAreaFilter";
import RentalFeatureFilter from "@/components/rental/search/filters/RentalFeatureFilter";

export type RentalConditionFilters = Omit<
  RentalSearchFilters,
  'keyword'
>;

type Props = {
  initialFilters: RentalSearchFilters;
  onSearch: (filters: RentalConditionFilters) => void;
};

function getConditions(
  filters: RentalSearchFilters,
): RentalConditionFilters {
  return {
    areaCode: filters.areaCode,
    stationId: filters.stationId,
    propertyTypes: [...(filters.propertyTypes ?? [])],
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
                                        initialFilters,
                                        onSearch,
                                      }: Props) {
  const [draft, setDraft] = useState<RentalConditionFilters>(
    () => getConditions(initialFilters),
  );

  // Keep the latest draft available during consecutive updates.
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
      propertyTypes: [...conditions.propertyTypes],
      floorPlans: [...conditions.floorPlans],
      amenities: [...conditions.amenities],
      conditions: [...conditions.conditions],
    });
  };

  // Submit discrete selection changes immediately.
  const handleImmediateChange = (
    values: Partial<RentalConditionFilters>,
  ) => {
    cancelPendingSearch();

    const next = updateDraft(values);
    submitConditions(next);
  };

  // Submit rent input after 300 ms without changes.
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

  // Update the draft while dragging the slider.
  const handleRentSliding = (
    values: Partial<RentalConditionFilters>,
  ) => {
    cancelPendingSearch();
    updateDraft(values);
  };

  // Submit after the slider interaction completes.
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
        areaCode={draft.areaCode}
        stationId={draft.stationId}
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
        propertyTypes={draft.propertyTypes}
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
