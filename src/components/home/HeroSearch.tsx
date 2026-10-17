'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';
import {
  EnvironmentFilled,
  SearchOutlined,
} from '@ant-design/icons';

import styles from './HeroSearch.module.css';
import AreaSelector from '@/components/area/AreaSelector';
import StationSelector from '@/components/station/StationSelector';

type SearchMode = 'area' | 'station';

export default function HeroSearch() {
  const router = useRouter();

  const [mode, setMode] = useState<SearchMode>('area');
  const [areaCode, setAreaCode] = useState<string>();
  const [stationId, setStationId] = useState<string>();

  function handleSearch() {
    const params = new URLSearchParams();

    if (mode === 'area' && areaCode) {
      params.set('areaCode', areaCode);
    }

    if (mode === 'station' && stationId) {
      params.set('stationId', stationId);
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
              {/* Keep both selectors mounted to preserve loaded branches. */}
              <div
                className={styles.selectorField}
                hidden={mode !== 'area'}
              >
                <AreaSelector
                  value={areaCode}
                  onChange={setAreaCode}
                  size="large"
                  className={styles.areaSelect}
                  placeholder="地方・都道府県・市区町村を選択"
                />
              </div>

              <div
                className={styles.selectorField}
                hidden={mode !== 'station'}
              >
                <StationSelector
                  value={stationId}
                  onChange={setStationId}
                  size="large"
                  className={styles.areaSelect}
                  placeholder="鉄道会社・路線・駅を選択"
                />
              </div>

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
