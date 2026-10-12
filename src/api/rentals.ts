import { request } from './client';

import type { PageResult } from '@/types/api';
import type {
  RentalDetail,
  RentalSummary,
} from '@/types/rental';
import type {
  RentalSearchFilters,
  RentalSort,
} from '@/types/rentalSearch';

export type RentalPageQuery = RentalSearchFilters & {
  page: number;
  pageSize: number;
  sort: RentalSort;
};

export const rentalsApi = {
  getPage(
    params: RentalPageQuery,
    signal?: AbortSignal,
  ): Promise<PageResult<RentalDetail>> {
    return request<PageResult<RentalDetail>>('/api/rentals', {
      query: {
        keyword: params.keyword,
        areaCode: params.areaCode,
        station: params.station,
        minRent: params.minRent,
        maxRent: params.maxRent,
        floorPlans: params.floorPlans,
        maxBuildingAge: params.maxBuildingAge,
        maxWalkingMinutes: params.maxWalkingMinutes,
        amenities: params.amenities,
        conditions: params.conditions,
        page: params.page,
        pageSize: params.pageSize,
        sort: params.sort,
      },
      signal,
    });
  },

  getDetail(
    id: string,
    signal?: AbortSignal,
  ): Promise<RentalDetail> {
    return request<RentalDetail>(
      `/api/rentals/${encodeURIComponent(id)}`,
      { signal },
    );
  },

  getFavorites(
    signal?: AbortSignal,
  ): Promise<RentalSummary[]> {
    return request<RentalSummary[]>('/api/account/favorites', {
      signal,
    });
  },

  addFavorite(rentalId: string): Promise<void> {
    return request<void>(
      `/api/account/favorites/${encodeURIComponent(rentalId)}`,
      { method: 'PUT' },
    );
  },

  removeFavorite(rentalId: string): Promise<void> {
    return request<void>(
      `/api/account/favorites/${encodeURIComponent(rentalId)}`,
      { method: 'DELETE' },
    );
  },
};
