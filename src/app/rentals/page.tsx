import { Suspense } from 'react';
import type { Metadata } from 'next';
import RentalSearch from '@/components/rental/search/RentalSearch';
import {
  createDefaultRentalFilters,
  type RentalSearchFilters,
  type RentalSort,
} from '@/types/rentalSearch';

export const metadata: Metadata = {
  title: '賃貸物件を探す',
};

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
  searchParams: Promise<SearchParams>;
};

function first(value: string | string[] | undefined): string | undefined {
  return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
}

function integer(
  value: string | string[] | undefined,
  min: number,
  max: number,
): number | undefined {
  const text = first(value);
  if (!text || !/^\d+$/.test(text)) return undefined;
  const number = Number(text);
  return Number.isSafeInteger(number) && number >= min && number <= max
    ? number
    : undefined;
}

function values(value: string | string[] | undefined): string[] {
  const items = value == null ? [] : Array.isArray(value) ? value : [value];
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function initialSort(value: string | undefined): RentalSort {
  switch (value) {
    case 'rentAsc':
    case 'rentDesc':
    case 'areaDesc':
    case 'walkingAsc':
      return value;
    default:
      // The backend default already orders by publication time.
      return 'recommended';
  }
}

async function RentalSearchContent({ searchParams }: Props) {
  const params = await searchParams;
  const area = first(params.areaCode);
  const station = first(params.stationId);
  const minRent = integer(params.minRent, 0, 4294967295);
  const maxRent = integer(params.maxRent, 0, 4294967295);

  const filters: RentalSearchFilters = {
    ...createDefaultRentalFilters(),
    keyword: first(params.keyword)?.slice(0, 100),
    areaCode: area && /^\d{5}$/.test(area) ? area : undefined,
    stationId: station && /^[1-9]\d{0,18}$/.test(station)
      ? station
      : undefined,
    minRent,
    propertyTypes: values(params.propertyTypes)
      .filter((value) => ['1', '2', '3'].includes(value))
      .map(Number),
    maxRent: minRent != null && maxRent != null && minRent > maxRent
      ? undefined
      : maxRent,
    floorPlans: values(params.floorPlans)
      .filter((value) => /^(1R|[1-9](K|DK|LDK))$/.test(value))
      .slice(0, 20),
    maxBuildingAge: integer(params.maxBuildingAge, 0, 200),
    maxWalkingMinutes: integer(params.maxWalkingMinutes, 1, 180),
    amenities: values(params.amenities)
      .filter((value) => /^[a-z][a-z0-9_]{0,63}$/.test(value))
      .slice(0, 15),
    conditions: values(params.conditions)
      .filter((value) => /^[a-z][a-z0-9_]{0,63}$/.test(value))
      .slice(0, 15),
  };
  const sort = initialSort(first(params.sort));

  return (
    <RentalSearch
      key={JSON.stringify({ filters, sort })}
      initialFilters={filters}
      initialSort={sort}
    />
  );
}

export default function RentalsPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<p role="status">物件検索を読み込み中...</p>}>
      <RentalSearchContent searchParams={searchParams} />
    </Suspense>
  );
}
