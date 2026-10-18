import { request } from './client';

import type {
  RentalMapQuery,
  RentalMapResult,
} from '@/types/map';

const MAP_PATH = '/api/rentals/map';

export const mapApi = {
  getRentals(
    params: RentalMapQuery,
    signal?: AbortSignal,
  ): Promise<RentalMapResult> {
    return request<RentalMapResult>(MAP_PATH, {
      query: {
        north: params.north,
        south: params.south,
        east: params.east,
        west: params.west,

        keyword: params.keyword?.trim() || undefined,
        areaCode: params.areaCode,
        stationId: params.stationId,

        minRent: params.minRent,
        maxRent: params.maxRent,

        propertyTypes: (params.propertyTypes ?? []).map(String),
        floorPlans: params.floorPlans,

        maxBuildingAge: params.maxBuildingAge,
        maxWalkingMinutes: params.maxWalkingMinutes,

        featureCodes: [
          ...new Set([
            ...params.amenities,
            ...params.conditions,
          ]),
        ],

        sort: params.sort ?? 'recommended',
      },
      signal,
    });
  },
};
