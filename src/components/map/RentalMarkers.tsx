'use client';

import { useEffect, useRef } from 'react';
import {
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';

import {
  MarkerClusterer,
  SuperClusterAlgorithm,
} from '@googlemaps/markerclusterer';

import type { RentalListItemData } from '@/types/rental';

import styles from './css/MapSearch.module.css';

type Props = {
  rentals: RentalListItemData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

type MarkerEntry = {
  marker: google.maps.marker.AdvancedMarkerElement;
  element: HTMLDivElement;
};

const formatter = new Intl.NumberFormat('ja-JP', {
  maximumFractionDigits: 2,
});

export default function RentalMarkers({
                                        rentals,
                                        selectedId,
                                        onSelect,
                                      }: Props) {
  const map = useMap();
  const markerLibrary = useMapsLibrary('marker');

  const entriesRef =
    useRef<Record<string, MarkerEntry>>({});

  const onSelectRef = useRef(onSelect);
  const selectedIdRef = useRef(selectedId);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    selectedIdRef.current = selectedId;

    for (const [id, entry] of Object.entries(
      entriesRef.current,
    )) {
      const selected = id === selectedId;

      entry.element.className = selected
        ? `${styles.priceMarker} ${styles.selectedMarker}`
        : styles.priceMarker;

      entry.marker.zIndex = selected ? 10 : 1;
    }
  }, [selectedId]);

  useEffect(() => {
    if (!map || !markerLibrary) {
      return;
    }

    const activeMap = map;
    const { AdvancedMarkerElement } = markerLibrary;

    const entries: Record<string, MarkerEntry> = {};
    const markers: google.maps.marker.AdvancedMarkerElement[] =
      [];

    const listeners: google.maps.MapsEventListener[] =
      [];

    for (const rental of rentals) {
      const { latitude, longitude } = rental;

      if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        Math.abs(latitude) > 90 ||
        Math.abs(longitude) > 180
      ) {
        continue;
      }

      const selected =
        rental.id === selectedIdRef.current;

      const rentText = formatter.format(
        rental.monthlyRent / 10000,
      );

      const element = document.createElement('div');

      element.className = selected
        ? `${styles.priceMarker} ${styles.selectedMarker}`
        : styles.priceMarker;

      element.textContent = `${rentText}万円`;

      const marker = new AdvancedMarkerElement({
        position: {
          lat: latitude,
          lng: longitude,
        },
        content: element,
        title: `${rental.name} ${rentText}万円`,
        zIndex: selected ? 10 : 1,
      });

      listeners.push(
        marker.addListener('click', () => {
          onSelectRef.current(rental.id);
        }),
      );

      entries[rental.id] = {
        marker,
        element,
      };

      markers.push(marker);
    }

    entriesRef.current = entries;

    const clusterer = new MarkerClusterer({
      map: activeMap,
      markers,

      algorithm: new SuperClusterAlgorithm({
        radius: 100,
        maxZoom: 14,
      }),

      renderer: {
        render({ count, position }) {
          const element =
            document.createElement('div');

          element.className = styles.clusterMarker;
          element.textContent = `${count}件`;

          return new AdvancedMarkerElement({
            position,
            content: element,
            title: `${count}件の物件を表示`,
            zIndex: 100 + count,
          });
        },
      },
    });

    return () => {
      for (const listener of listeners) {
        listener.remove();
      }

      clusterer.clearMarkers(true);
      clusterer.setMap(null);

      for (const marker of markers) {
        marker.map = null;
      }

      entriesRef.current = {};
    };
  }, [map, markerLibrary, rentals]);

  return null;
}
