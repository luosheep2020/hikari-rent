'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Select } from 'antd';
import {
  EnvironmentFilled,
  SearchOutlined,
} from '@ant-design/icons';

import styles from './HeroSearch.module.css';
import AreaSelector from "@/components/area/AreaSelector";

type SearchMode = 'area' | 'station';



const stationOptions = [
  { value: '西新宿五丁目駅', label: '西新宿五丁目駅' },
  { value: '渋谷駅', label: '渋谷駅' },
  { value: '中野駅', label: '中野駅' },
  { value: '吉祥寺駅', label: '吉祥寺駅' },
];

export default function HeroSearch() {
  const router = useRouter();

  const [mode, setMode] = useState<SearchMode>('area');
  const [areaCode, setAreaCode] = useState<string>();
  const [station, setStation] = useState<string>();

  function handleSearch() {
    const params = new URLSearchParams();

    if (mode === 'area' && areaCode) {
      params.set('areaCode', areaCode);
    }

    if (mode === 'station' && station) {
      params.set('station', station);
    }

    const query = params.toString();

    router.push(query ? `/rentals?${query}` : '/rentals');
  }

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>HIKARI RENT</p>

          <h1 id="hero-title" className={styles.title}>
            自分らしい暮らしを、
            <br />
            ここから。
          </h1>

          <p className={styles.description}>
            好きな街で、好きなお部屋で、あたらしい毎日を。
          </p>

          <div className={styles.searchBox}>
            <div className={styles.searchModes}>
              <button
                type="button"
                className={`${styles.modeButton} ${
                  mode === 'area' ? styles.activeMode : ''
                }`}
                onClick={() => setMode('area')}
                aria-pressed={mode === 'area'}
              >
                <EnvironmentFilled />
                <span>エリアから探す</span>
              </button>

              <button
                type="button"
                className={`${styles.modeButton} ${
                  mode === 'station' ? styles.activeMode : ''
                }`}
                onClick={() => setMode('station')}
                aria-pressed={mode === 'station'}
              >
                <span aria-hidden="true">🚆</span>
                <span>駅から探す</span>
              </button>
            </div>

            <form
              className={styles.searchForm}
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch();
              }}
            >
              {mode === 'area' ? (
                <AreaSelector
                  value={areaCode}
                  onChange={setAreaCode}
                  size="large"
                  className={styles.areaSelect}
                  placeholder="地方・都道府県・市区町村を選択"
                />
              ) : (
                <Select
                  key="station"
                  className={styles.areaSelect}
                  size="large"
                  placeholder="駅を選択（例：渋谷駅・中野駅・吉祥寺駅）"
                  aria-label="検索する駅"
                  options={stationOptions}
                  value={station}
                  onChange={setStation}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                />
              )}

              <Button
                className={styles.searchButton}
                type="primary"
                size="large"
                htmlType="submit"
                icon={<SearchOutlined />}
              >
                検索
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
