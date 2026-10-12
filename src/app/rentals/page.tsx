import type { Metadata } from 'next';

import RentalSearch from '@/components/rental/search/RentalSearch';
import { mockRentals } from '@/lib/mockRentals';
import { createDefaultRentalFilters } from '@/types/rentalSearch';

export const metadata: Metadata = {
  title: '賃貸物件を探す',
  description:
    'エリア・駅・賃料・間取りから、あなたに合うお部屋を探せます。',
};

type SearchParams = Record<
  string,
  string | string[] | undefined
>;

type Props = {
  searchParams: Promise<SearchParams>;
};

function getFirst(
  value: string | string[] | undefined,
): string | undefined {
  const result = Array.isArray(value) ? value[0] : value;

  return result?.trim() || undefined;
}

function getNonNegativeNumber(
  value: string | string[] | undefined,
): number | undefined {
  const text = getFirst(value);

  if (text === undefined) {
    return undefined;
  }

  const number = Number(text);

  return Number.isFinite(number) && number >= 0
    ? number
    : undefined;
}

export default async function RentalPage({
                                           searchParams,
                                         }: Props) {
  const params = await searchParams;

  const initialFilters = createDefaultRentalFilters();

  initialFilters.keyword = getFirst(params.keyword);
  initialFilters.areaCode = getFirst(params.areaCode);
  initialFilters.station = getFirst(params.station);
  initialFilters.minRent = getNonNegativeNumber(params.minRent);
  initialFilters.maxRent = getNonNegativeNumber(params.maxRent);

  const floorPlan = getFirst(params.floorPlan);

  if (floorPlan) {
    initialFilters.floorPlans = [floorPlan];
  }

  // 无效的租金范围恢复为不限。
  if (
    initialFilters.minRent !== undefined &&
    initialFilters.maxRent !== undefined &&
    initialFilters.minRent > initialFilters.maxRent
  ) {
    initialFilters.minRent = undefined;
    initialFilters.maxRent = undefined;
  }

  return (
    <RentalSearch
      key={JSON.stringify(initialFilters)}
      rentals={mockRentals}
      initialFilters={initialFilters}
    />
  );
}
