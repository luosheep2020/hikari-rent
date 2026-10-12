'use client';

import { useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  Map,
} from '@vis.gl/react-google-maps';
import {
  EnvironmentOutlined,
  HomeFilled,
} from '@ant-design/icons';

import type { RentalDetail } from '@/types/rental';

import styles from '@/components/rental/detail/css/RentalLocation.module.css';

interface RentalLocationProps {
  rental: RentalDetail;
}

export default function RentalLocation({
                                         rental,
                                       }: RentalLocationProps) {
  const [mapError, setMapError] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { latitude, longitude } = rental;

  const position =
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
      ? { lat: latitude, lng: longitude }
      : null;

  let placeholderText = '';

  if (!position) {
    placeholderText = '位置情報は準備中です';
  } else if (!apiKey) {
    placeholderText = '地図の設定は準備中です';
  } else if (mapError) {
    placeholderText = '地図を読み込めませんでした';
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>所在地・アクセス</h2>

      <div className={styles.layout}>
        <div className={styles.mapWrapper}>
          {position && apiKey && !mapError ? (
            <APIProvider
              apiKey={apiKey}
              language="ja"
              region="JP"
              onError={() => setMapError(true)}
            >
              <Map
                key={`${rental.id}-${latitude}-${longitude}`}
                defaultCenter={position}
                defaultZoom={16}
                mapId="DEMO_MAP_ID"
                style={{ width: '100%', height: '100%' }}
                gestureHandling="cooperative"
                disableDefaultUI
                zoomControl
                clickableIcons={false}
              >
                <AdvancedMarker
                  position={position}
                  title={rental.name}
                >
                  <div className={styles.marker}>
                    <HomeFilled />
                  </div>
                </AdvancedMarker>
              </Map>
            </APIProvider>
          ) : (
            <div className={styles.placeholder}>
              <EnvironmentOutlined />
              <span>{placeholderText}</span>
            </div>
          )}
        </div>

        <div className={styles.information}>
          <div className={styles.address}>
            <EnvironmentOutlined className={styles.addressIcon} />
            <span>{rental.address}</span>
          </div>

          <h3 className={styles.subtitle}>最寄り駅</h3>

          {rental.stations.length > 0 ? (
            <ul className={styles.stationList}>
              {rental.stations.map((station) => (
                <li key={`${station.line}-${station.name}`}>
                  <p className={styles.line}>{station.line}</p>

                  <div className={styles.stationDetail}>
                    <span className={styles.stationName}>
                      {station.name}
                    </span>
                    <span className={styles.walkingTime}>
                      徒歩{station.walkingMinutes}分
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.note}>交通情報は要確認です。</p>
          )}
        </div>
      </div>
    </section>
  );
}
