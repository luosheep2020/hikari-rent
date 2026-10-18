import type { RentalPropertyType } from '@/types/rental';

const propertyTypeLabels: Record<RentalPropertyType, string> = {
  1: 'マンション',
  2: 'アパート',
  3: '一戸建て・その他',
};

export function getPropertyTypeLabel(
  value: RentalPropertyType | null | undefined,
): string {
  return value == null
    ? '種別未登録'
    : propertyTypeLabels[value] ?? '種別未登録';
}
