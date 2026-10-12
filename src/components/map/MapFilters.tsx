'use client';

import {Button, Select} from 'antd';
import {
  AimOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  LayoutOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

import AreaSelector from '@/components/area/AreaSelector';
import type {MapFiltersValue} from '@/types/map';

import styles from './css/MapSearch.module.css';

interface MapFiltersProps {
  value: MapFiltersValue;
  onChange: (value: MapFiltersValue) => void;
  onLocate: () => void;
  locating: boolean;
}

export default function MapFilters({
                                     value,
                                     onChange,
                                     onLocate,
                                     locating,
                                   }: MapFiltersProps) {
  return (
    <div className={styles.filters} aria-label="物件の検索条件">
      <div className={styles.filterField}>
        <label htmlFor="map-area">
          <EnvironmentOutlined/>
          <span>エリア</span>
        </label>

        <AreaSelector
          id="map-area"
          className={styles.filterSelect}
          placeholder="地区を選択"
          value={value.areaCode}
          onChange={(areaCode) =>
            onChange({...value, areaCode})
          }
        />
      </div>

      <div className={styles.filterField}>
        <label htmlFor="map-rent">
          <DollarOutlined/>
          <span>家賃上限</span>
        </label>

        <Select
          id="map-rent"
          className={styles.filterSelect}
          placeholder="指定なし"
          value={value.maxRent}
          onChange={(maxRent) =>
            onChange({...value, maxRent})
          }
          allowClear
          options={[
            {value: 100000, label: '10万円以下'},
            {value: 120000, label: '12万円以下'},
            {value: 150000, label: '15万円以下'},
            {value: 200000, label: '20万円以下'},
          ]}
        />
      </div>

      <div className={styles.filterField}>
        <label htmlFor="map-floor-plan">
          <LayoutOutlined/>
          <span>間取り</span>
        </label>

        <Select
          id="map-floor-plan"
          className={styles.filterSelect}
          placeholder="指定なし"
          value={value.floorPlan}
          onChange={(floorPlan) =>
            onChange({...value, floorPlan})
          }
          allowClear
          options={[
            {value: '1R', label: 'ワンルーム'},
            {value: '1K', label: '1K'},
            {value: '1DK', label: '1DK'},
            {value: '1LDK', label: '1LDK'},
            {value: '2LDK', label: '2LDK'},
          ]}
        />
      </div>

      <div className={styles.filterActions}>
        <Button
          type="text"
          icon={<AimOutlined/>}
          loading={locating}
          onClick={onLocate}
          aria-label="現在地に移動"
          title="現在地に移動"
        >
        </Button>
        <Button
          type="text"
          icon={<ReloadOutlined/>}
          onClick={() => onChange({})}
          aria-label="検索条件をクリア"
          title="検索条件をクリア"
        >
        </Button>
      </div>
    </div>
  );
}
