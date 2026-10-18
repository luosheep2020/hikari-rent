import { request } from './client';
import { userApi } from './user';
import type { PageResult } from '@/types/api';
import type {
  RentalDetail,
  RentalListItemData,
} from '@/types/rental';
import type {
  RentalFeatureOption,
  RentalPageQuery,
} from '@/types/rentalSearch';
export type { RentalPageQuery } from '@/types/rentalSearch';

const RENTALS_PATH = '/api/rentals';

export const rentalsApi = {
  getPage(
    params: RentalPageQuery,
    signal?: AbortSignal,
  ): Promise<PageResult<RentalListItemData>> {
    return request<PageResult<RentalListItemData>>(RENTALS_PATH, {
      query: {
        keyword: params.keyword?.trim() || undefined,
        areaCode: params.areaCode,
        stationId: params.stationId,
        propertyTypes: params.propertyTypes.map(String),
        minRent: params.minRent,
        maxRent: params.maxRent,
        floorPlans: params.floorPlans,
        maxBuildingAge: params.maxBuildingAge,
        maxWalkingMinutes: params.maxWalkingMinutes,
        featureCodes: [...new Set([
          ...params.amenities,
          ...params.conditions,
        ])],
        page: params.page,
        pageSize: params.pageSize,
        sort: params.sort,
      },
      signal,
    });
  },
  getFeatures(signal?: AbortSignal): Promise<RentalFeatureOption[]> {
    return request<RentalFeatureOption[]>(`${RENTALS_PATH}/features`, {
      signal,
    });
  },

  getDetail(id: string, signal?: AbortSignal): Promise<RentalDetail> {
    return request<RentalDetail>(
      `${RENTALS_PATH}/${encodeURIComponent(id)}`,
      { signal },
    );
  },

  // Keep older callers on the same user API endpoints.
  getFavorites(signal?: AbortSignal): Promise<RentalListItemData[]> {
    return userApi.getFavorites(signal);
  },

  addFavorite(rentalId: string): Promise<void> {
    return userApi.addFavorite(rentalId);
  },

  removeFavorite(rentalId: string): Promise<void> {
    return userApi.removeFavorite(rentalId);
  },
};
