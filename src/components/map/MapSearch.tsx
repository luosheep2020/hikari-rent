'use client';

import { useCallback, useState } from 'react';
import { App } from 'antd';
import { APIProvider } from '@vis.gl/react-google-maps';

import type { RentalDetail } from '@/types/rental';
import type {
  MapBounds,
  MapFiltersValue,
} from '@/types/map';

import RentalMap from './RentalMap';
import MapFilters from './MapFilters';
import MapRentalList from './MapRentalList';
import RentalPreview from './RentalPreview';

import styles from './css/MapSearch.module.css';

interface MapSearchProps {
  rentals: RentalDetail[];
}

// 开发阶段的地区中心，之后替换为接口数据
const areaPositions: Record<string, { lat: number; lng: number }> = {
  '13104': { lat: 35.694, lng: 139.69 },
  '13113': { lat: 35.664, lng: 139.699 },
  '13114': { lat: 35.707, lng: 139.665 },
  '13203': { lat: 35.704, lng: 139.58 },
};

function isWithinBounds(
  rental: RentalDetail,
  bounds: MapBounds,
) {
  const { latitude, longitude } = rental;

  if (latitude === null || longitude === null) {
    return false;
  }

  const latitudeMatches =
    latitude >= bounds.south && latitude <= bounds.north;

  const longitudeMatches =
    bounds.west <= bounds.east
      ? longitude >= bounds.west && longitude <= bounds.east
      : longitude >= bounds.west || longitude <= bounds.east;

  return latitudeMatches && longitudeMatches;
}

export default function MapSearch({ rentals }: MapSearchProps) {
  const { message } = App.useApp();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [filters, setFilters] = useState<MapFiltersValue>({});
  const [mapError, setMapError] = useState(false);
  const [locating, setLocating] = useState(false);

  // 每次设置新对象，触发一次地图移动
  const [panTarget, setPanTarget] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [currentPosition, setCurrentPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const locatedRentals = rentals.filter(
    (rental) =>
      typeof rental.latitude === 'number' &&
      typeof rental.longitude === 'number' &&
      Number.isFinite(rental.latitude) &&
      Number.isFinite(rental.longitude) &&
      Math.abs(rental.latitude) <= 90 &&
      Math.abs(rental.longitude) <= 180,
  );

  const filteredRentals = locatedRentals.filter((rental) => {
    if (
      filters.maxRent !== undefined &&
      rental.monthlyRent > filters.maxRent
    ) {
      return false;
    }

    if (
      filters.floorPlan &&
      rental.floorPlan !== filters.floorPlan
    ) {
      return false;
    }

    return true;
  });

  const visibleRentals = bounds
    ? filteredRentals.filter((rental) =>
      isWithinBounds(rental, bounds),
    )
    : filteredRentals;

  const selectedRental = visibleRentals.find(
    (rental) => rental.id === selectedId,
  );

  const activeSelectedId = selectedRental?.id ?? null;

  const handleBoundsChange = useCallback(
    (nextBounds: MapBounds) => {
      setBounds(nextBounds);

      setSelectedId((currentId) => {
        const selected = rentals.find(
          (rental) => rental.id === currentId,
        );

        return selected && isWithinBounds(selected, nextBounds)
          ? currentId
          : null;
      });
    },
    [rentals],
  );

  function handleSelect(id: string) {
    const rental = locatedRentals.find((item) => item.id === id);

    if (
      !rental ||
      rental.latitude === null ||
      rental.longitude === null
    ) {
      return;
    }

    setSelectedId(id);
    setPanTarget({
      lat: rental.latitude,
      lng: rental.longitude,
    });
  }

  function handleFiltersChange(nextFilters: MapFiltersValue) {
    const areaChanged = nextFilters.areaCode !== filters.areaCode;

    setFilters(nextFilters);
    setSelectedId(null);

    if (areaChanged && nextFilters.areaCode) {
      const position = areaPositions[nextFilters.areaCode];

      if (position) {
        setPanTarget({ ...position });
      } else {
        message.info('このエリアの地図位置は準備中です');
      }
    }
  }

  function handleLocate() {
    if (locating) return;

    if (!navigator.geolocation) {
      message.warning('このブラウザは位置情報に対応していません');
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);

        const { latitude, longitude } = coords;

        // 現在の地図制限と同じ矩形範囲。精密な国境判定ではありません。
        if (
          latitude < 24 ||
          latitude > 46 ||
          longitude < 122 ||
          longitude > 146
        ) {
          message.info(
            '現在地は地図の対応範囲外です。エリアを選択してください',
          );
          return;
        }

        const position = {
          lat: latitude,
          lng: longitude,
        };

        setSelectedId(null);
        setFilters((previous) => ({
          ...previous,
          areaCode: undefined,
        }));

        setCurrentPosition(position);
        setPanTarget({ ...position });

        message.success('現在地を取得しました');
      },
      (error) => {
        setLocating(false);

        const text =
          error.code === 1
            ? '位置情報の利用を許可してください'
            : error.code === 3
              ? '位置情報の取得がタイムアウトしました'
              : '現在地を取得できませんでした';

        message.warning(text);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

  if (!apiKey || mapError) {
    return (
      <div className={styles.error}>
        {!apiKey
          ? '地図の設定は準備中です'
          : '地図を読み込めませんでした'}
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={apiKey}
      language="ja"
      region="JP"
      onError={() => setMapError(true)}
    >
      <div className={styles.container}>
        <RentalMap
          rentals={filteredRentals}
          selectedId={activeSelectedId}
          onSelect={handleSelect}
          onBoundsChange={handleBoundsChange}
          panTarget={panTarget}
          currentPosition={currentPosition}
        />

        <MapFilters
          value={filters}
          onChange={handleFiltersChange}
          onLocate={handleLocate}
          locating={locating}
        />

        <MapRentalList
          rentals={visibleRentals}
          selectedId={activeSelectedId}
          onSelect={handleSelect}
        />

        {selectedRental && (
          <RentalPreview
            rental={selectedRental}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </APIProvider>
  );
}
