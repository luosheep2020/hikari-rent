'use client';

import { useEffect } from 'react';
import {
  AdvancedMarker,
  Map,
  useMap,
} from '@vis.gl/react-google-maps';

import type { RentalDetail } from '@/types/rental';
import type { MapBounds } from '@/types/map';

import styles from './css/MapSearch.module.css';

interface Position {
  lat: number;
  lng: number;
}

interface RentalMapProps {
  rentals: RentalDetail[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  panTarget: Position | null;
  currentPosition: Position | null;
}

const formatter = new Intl.NumberFormat('ja-JP', {
  maximumFractionDigits: 2,
});

const mapRestriction = {
  latLngBounds: {
    north: 46,
    south: 24,
    west: 122,
    east: 146,
  },
  strictBounds: true,
};

function MapBoundsObserver({
                             onBoundsChange,
                           }: {
  onBoundsChange: (bounds: MapBounds) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    function reportBounds() {
      const bounds = map?.getBounds();

      if (!bounds) return;

      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();

      onBoundsChange({
        north: northEast.lat(),
        south: southWest.lat(),
        east: northEast.lng(),
        west: southWest.lng(),
      });
    }

    const listener = map.addListener('idle', reportBounds);

    reportBounds();

    return () => {
      listener.remove();
    };
  }, [map, onBoundsChange]);

  return null;
}

function MapPanSync({ target }: { target: Position | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !target) return;

    map.panTo(target);
  }, [map, target]);

  return null;
}

export default function RentalMap({
                                    rentals,
                                    selectedId,
                                    onSelect,
                                    onBoundsChange,
                                    panTarget,
                                    currentPosition,
                                  }: RentalMapProps) {
  return (
    <Map
      defaultCenter={{ lat: 35.688, lng: 139.65 }}
      defaultZoom={12}
      mapId="DEMO_MAP_ID"
      style={{ width: '100%', height: '100%' }}
      gestureHandling="greedy"
      disableDefaultUI
      zoomControl
      clickableIcons={false}
      restriction={mapRestriction}
    >
      <MapBoundsObserver onBoundsChange={onBoundsChange} />
      <MapPanSync target={panTarget} />

      {currentPosition && (
        <AdvancedMarker
          position={currentPosition}
          title="現在地"
          zIndex={20}
        >
          <div className={styles.currentPositionMarker} />
        </AdvancedMarker>
      )}

      {rentals.map((rental) => {
        const { latitude, longitude } = rental;

        if (
          typeof latitude !== 'number' ||
          typeof longitude !== 'number' ||
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          return null;
        }

        const selected = selectedId === rental.id;
        const rentText = formatter.format(
          rental.monthlyRent / 10000,
        );

        return (
          <AdvancedMarker
            key={rental.id}
            position={{
              lat: latitude,
              lng: longitude,
            }}
            title={`${rental.name} ${rentText}万円`}
            onClick={() => onSelect(rental.id)}
            zIndex={selected ? 10 : 1}
          >
            <div
              className={`${styles.priceMarker} ${
                selected ? styles.selectedMarker : ''
              }`}
            >
              {rentText}万円
            </div>
          </AdvancedMarker>
        );
      })}
    </Map>
  );
}
