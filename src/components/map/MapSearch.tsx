'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { App, Button, Spin } from 'antd';
import { APIProvider } from '@vis.gl/react-google-maps';

import { request } from '@/api/client';

import { createDefaultRentalFilters } from '@/types/rentalSearch';

import type {
  MapBounds,
  MapFiltersValue,
  RentalMapQuery,
  RentalMapResult,
} from '@/types/map';

import RentalMap from './RentalMap';
import MapFilters from './MapFilters';
import MapRentalList from './MapRentalList';
import RentalPreview from './RentalPreview';

import styles from './css/MapSearch.module.css';
import {mapApi} from "@/api/map";

type Position = {
  lat: number;
  lng: number;
  zoom?: number;
};

type AreaPositionNode = {
  code: string;
  latitude: number | null;
  longitude: number | null;
  children?: AreaPositionNode[];
};

type ResultState = RentalMapResult & {
  key: string;
  error?: string;
};

const JAPAN_BOUNDS: MapBounds = {
  north: 46,
  south: 24,
  east: 146,
  west: 122,
};

function findArea(
  nodes: AreaPositionNode[],
  code: string,
): AreaPositionNode | undefined {
  for (const node of nodes) {
    if (node.code === code) {
      return node;
    }

    if (node.children) {
      const found = findArea(node.children, code);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

function normalizeBounds(
  bounds: MapBounds,
): MapBounds | null {
  if (
    ![
      bounds.north,
      bounds.south,
      bounds.east,
      bounds.west,
    ].every(Number.isFinite)
  ) {
    return null;
  }

  const next: MapBounds = {
    north: Math.min(bounds.north, JAPAN_BOUNDS.north),
    south: Math.max(bounds.south, JAPAN_BOUNDS.south),
    east: Math.min(bounds.east, JAPAN_BOUNDS.east),
    west: Math.max(bounds.west, JAPAN_BOUNDS.west),
  };

  if (
    next.north <= next.south ||
    next.east <= next.west
  ) {
    return null;
  }

  return next;
}

function boundsEqual(
  previous: MapBounds | null,
  next: MapBounds,
): boolean {
  if (!previous) {
    return false;
  }

  const tolerance = 0.000001;

  return (
    Math.abs(previous.north - next.north) < tolerance &&
    Math.abs(previous.south - next.south) < tolerance &&
    Math.abs(previous.east - next.east) < tolerance &&
    Math.abs(previous.west - next.west) < tolerance
  );
}

export default function MapSearch() {
  const { message } = App.useApp();

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [bounds, setBounds] =
    useState<MapBounds | null>(null);

  const [filters, setFilters] =
    useState<MapFiltersValue>({});

  const [result, setResult] =
    useState<ResultState | null>(null);

  const [retry, setRetry] = useState(0);
  const [mapError, setMapError] = useState(false);
  const [locating, setLocating] = useState(false);

  const [panTarget, setPanTarget] =
    useState<Position | null>(null);

  const [currentPosition, setCurrentPosition] =
    useState<Position | null>(null);

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const query = useMemo<RentalMapQuery | null>(() => {
    if (!bounds || !apiKey || mapError) {
      return null;
    }

    return {
      ...createDefaultRentalFilters(),
      ...bounds,
      areaCode: filters.areaCode,
      maxRent: filters.maxRent,
      floorPlans: filters.floorPlan
        ? [filters.floorPlan]
        : [],
      sort: 'recommended',
    };
  }, [
    bounds,
    apiKey,
    mapError,
    filters.areaCode,
    filters.maxRent,
    filters.floorPlan,
  ]);

  const requestKey = JSON.stringify({
    query,
    retry,
  });

  const loading =
    query !== null &&
    result?.key !== requestKey;

  // Keep the previous results visible while refreshing.
  const rentals = result?.records ?? [];
  const hasMore = result?.hasMore ?? false;

  const error =
    result?.key === requestKey
      ? result.error
      : undefined;

  const selectedRental = rentals.find(
    (rental) => rental.id === selectedId,
  );

  const activeSelectedId =
    selectedRental?.id ?? null;

  // Debounce viewport and filter changes.
  useEffect(() => {
    if (!query) {
      return;
    }

    const params: RentalMapQuery = query;
    const controller = new AbortController();

    async function loadRentals(
      requestParams: RentalMapQuery,
    ) {
      try {
        const data = await mapApi.getRentals(
          requestParams,
          controller.signal,
        );

        if (controller.signal.aborted) {
          return;
        }

        setResult({
          ...data,
          key: requestKey,
        });

        setSelectedId((currentId) => {
          return data.records.some(
            (rental) => rental.id === currentId,
          )
            ? currentId
            : null;
        });
      } catch (cause) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(
          'Failed to load map rentals:',
          cause,
        );

        setResult({
          key: requestKey,
          records: [],
          hasMore: false,
          limit: 200,
          error:
            '物件を読み込めませんでした。再試行してください。',
        });
      }
    }

    const timer = setTimeout(() => {
      void loadRentals(params);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, requestKey]);

  // Move the map when the selected area changes.
  useEffect(() => {
    const areaCode = filters.areaCode;

    if (!areaCode || !apiKey || mapError) {
      return;
    }

    const selectedAreaCode: string = areaCode;
    const controller = new AbortController();

    async function moveToArea(code: string) {
      try {
        const tree = await request<AreaPositionNode[]>(
          '/api/areas/tree',
          {
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) {
          return;
        }

        const area = findArea(tree, code);

        if (
          !area ||
          typeof area.latitude !== 'number' ||
          typeof area.longitude !== 'number' ||
          !Number.isFinite(area.latitude) ||
          !Number.isFinite(area.longitude)
        ) {
          message.info(
            'このエリアの地図位置は準備中です',
          );
          return;
        }

        setPanTarget({
          lat: area.latitude,
          lng: area.longitude,
        });
      } catch (cause) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(
          'Failed to load area position:',
          cause,
        );

        message.warning(
          'エリアの位置情報を取得できませんでした',
        );
      }
    }

    void moveToArea(selectedAreaCode);

    return () => controller.abort();
  }, [
    filters.areaCode,
    apiKey,
    mapError,
    message,
  ]);

  const handleBoundsChange = useCallback(
    (nextBounds: MapBounds) => {
      const normalized = normalizeBounds(nextBounds);

      if (!normalized) {
        return;
      }

      setBounds((previous) => {
        return boundsEqual(previous, normalized)
          ? previous
          : normalized;
      });
    },
    [],
  );

  function handleSelect(id: string) {
    const rental = rentals.find(
      (item) => item.id === id,
    );

    if (
      !rental ||
      typeof rental.latitude !== 'number' ||
      typeof rental.longitude !== 'number' ||
      !Number.isFinite(rental.latitude) ||
      !Number.isFinite(rental.longitude)
    ) {
      return;
    }

    setSelectedId(id);

    setPanTarget({
      lat: rental.latitude,
      lng: rental.longitude,
    });
  }

  function handleFiltersChange(
    nextFilters: MapFiltersValue,
  ) {
    setFilters(nextFilters);
    setSelectedId(null);
  }

  function handleLocate() {
    if (locating) {
      return;
    }

    if (!navigator.geolocation) {
      message.warning(
        'このブラウザは位置情報に対応していません',
      );
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);

        const { latitude, longitude } = coords;

        // This rectangle is an approximate service boundary.
        if (
          latitude < JAPAN_BOUNDS.south ||
          latitude > JAPAN_BOUNDS.north ||
          longitude < JAPAN_BOUNDS.west ||
          longitude > JAPAN_BOUNDS.east
        ) {
          message.info(
            '現在地は地図の対応範囲外です。エリアを選択してください',
          );
          return;
        }

        const position: Position = {
          lat: latitude,
          lng: longitude,
        };

        setSelectedId(null);

        setFilters((previous) => ({
          ...previous,
          areaCode: undefined,
        }));

        setCurrentPosition(position);

        setPanTarget({
          ...position,
          zoom: 15,
        });

        message.success('現在地を取得しました');
      },
      (cause) => {
        setLocating(false);

        const text =
          cause.code === 1
            ? '位置情報の利用を許可してください'
            : cause.code === 3
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
          rentals={rentals}
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
          rentals={rentals}
          selectedId={activeSelectedId}
          onSelect={handleSelect}
        />

        {(loading || error || hasMore) && (
          <div
            role={error ? 'alert' : 'status'}
            style={{
              position: 'absolute',
              top: 88,
              right: 24,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              maxWidth: 'calc(100% - 48px)',
              padding: '10px 16px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: '#fff',
              color: 'var(--text)',
              fontSize: 13,
              boxShadow:
                '0 4px 16px rgba(0, 0, 0, 0.08)',
            }}
          >
            {loading ? (
              <>
                <Spin size="small" />
                <span>この範囲の物件を検索中...</span>
              </>
            ) : error ? (
              <>
                <span>{error}</span>

                <Button
                  size="small"
                  onClick={() => {
                    setRetry((value) => value + 1);
                  }}
                >
                  再試行
                </Button>
              </>
            ) : (
              <span>
                表示件数が多いため、地図を拡大してください。
              </span>
            )}
          </div>
        )}

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
