'use client';

import { useEffect } from 'react';
import {
  AdvancedMarker,
  Map,
  useMap,
} from '@vis.gl/react-google-maps';

import type { RentalListItemData } from '@/types/rental';
import type { MapBounds } from '@/types/map';
import RentalMarkers from './RentalMarkers';
import styles from './css/MapSearch.module.css';

interface Position {
  lat: number;
  lng: number;
  zoom?: number;
}

interface RentalMapProps {
  rentals: RentalListItemData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  panTarget: Position | null;
  currentPosition: Position | null;
}

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
    if (!map) {
      return;
    }

    const activeMap = map;

    function reportBounds() {
      const bounds = activeMap.getBounds();

      if (!bounds) {
        return;
      }

      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();

      onBoundsChange({
        north: northEast.lat(),
        south: southWest.lat(),
        east: northEast.lng(),
        west: southWest.lng(),
      });
    }

    const listener = activeMap.addListener(
      'idle',
      reportBounds,
    );

    reportBounds();

    return () => {
      listener.remove();
    };
  }, [map, onBoundsChange]);

  return null;
}

function MapPanSync({
                      target,
                    }: {
  target: Position | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !target) {
      return;
    }

    const activeMap = map;
    const { lat, lng, zoom } = target;

    if (zoom === undefined) {
      activeMap.panTo({ lat, lng });
      return;
    }

    const center = activeMap.getCenter();
    const currentZoom = activeMap.getZoom();

    if (!center || currentZoom === undefined) {
      activeMap.moveCamera({
        center: { lat, lng },
        zoom,
      });
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      activeMap.moveCamera({
        center: { lat, lng },
        zoom,
      });
      return;
    }

    const startLat = center.lat();
    const startLng = center.lng();
    const startZoom = currentZoom;
    const endZoom = zoom;

    const duration = 900;
    const startedAt = performance.now();

    let frameId = 0;
    let cancelled = false;

    function stopAnimation() {
      cancelled = true;
      cancelAnimationFrame(frameId);
    }

    function animate(now: number) {
      if (cancelled) {
        return;
      }

      const progress = Math.min(
        Math.max((now - startedAt) / duration, 0),
        1,
      );

      // Ease out without overshooting the target.
      const eased = 1 - Math.pow(1 - progress, 3);

      activeMap.moveCamera({
        center: {
          lat: startLat + (lat - startLat) * eased,
          lng: startLng + (lng - startLng) * eased,
        },
        zoom:
          startZoom + (endZoom - startZoom) * eased,
      });

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }

    const element = activeMap.getDiv();

    // Let manual interaction interrupt the animation.
    element.addEventListener(
      'pointerdown',
      stopAnimation,
    );

    element.addEventListener(
      'wheel',
      stopAnimation,
      { passive: true },
    );

    frameId = requestAnimationFrame(animate);

    return () => {
      stopAnimation();

      element.removeEventListener(
        'pointerdown',
        stopAnimation,
      );

      element.removeEventListener(
        'wheel',
        stopAnimation,
      );
    };
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
      style={{
        width: '100%',
        height: '100%',
      }}
      gestureHandling="greedy"
      disableDefaultUI
      zoomControl
      clickableIcons={false}
      restriction={mapRestriction}
      isFractionalZoomEnabled
    >
      <MapBoundsObserver
        onBoundsChange={onBoundsChange}
      />

      <MapPanSync target={panTarget} />

      {currentPosition && (
        <AdvancedMarker
          position={{
            lat: currentPosition.lat,
            lng: currentPosition.lng,
          }}
          title="現在地"
          zIndex={20}
        >
          <div
            className={styles.currentPositionMarker}
          />
        </AdvancedMarker>
      )}

      <RentalMarkers
        rentals={rentals}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </Map>
  );
}
