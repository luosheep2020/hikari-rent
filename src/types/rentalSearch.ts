export interface RentalSearchFilters {
  keyword?: string;
  areaCode?: string;
  stationId?: string;
  propertyTypes: number[];
  // Retained for existing mock-data consumers.
  station?: string;

  minRent?: number;
  maxRent?: number;
  floorPlans: string[];
  maxBuildingAge?: number;
  maxWalkingMinutes?: number;

  // Values are feature codes, not display names.
  amenities: string[];
  conditions: string[];
}

export type RentalSort =
  | 'recommended'
  | 'rentAsc'
  | 'rentDesc'
  | 'areaDesc'
  | 'walkingAsc';

export type RentalView = 'list' | 'grid';

export type RentalPageQuery = RentalSearchFilters & {
  page: number;
  pageSize: number;
  sort: RentalSort;
};

export interface RentalFeatureOption {
  code: string;
  name: string;
  category: 'AMENITY' | 'CONDITION';
}

export function createDefaultRentalFilters(): RentalSearchFilters {
  return {
    keyword: undefined,
    areaCode: undefined,
    propertyTypes: [],
    stationId: undefined,
    station: undefined,
    minRent: undefined,
    maxRent: undefined,
    floorPlans: [],
    maxBuildingAge: undefined,
    maxWalkingMinutes: undefined,
    amenities: [],
    conditions: [],
  };
}
