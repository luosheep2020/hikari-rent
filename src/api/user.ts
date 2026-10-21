
import { request } from './client';

import type {

  UpdateProfileRequest, UserProfileResponse,
} from '@/types/user';

import type { RentalListItemData } from '@/types/rental';
const FAVORITES_PATH = '/api/user/favorites';
const HISTORY_PATH = '/api/user/history';

export const userApi = {


  getFavorites(
    signal?: AbortSignal,
  ): Promise<RentalListItemData[]> {
    return request<RentalListItemData[]>(
      FAVORITES_PATH,
      { signal },
    );
  },

  getFavoriteIds(): Promise<string[]> {
    return request<string[]>(
      `${FAVORITES_PATH}/ids`,
    );
  },

  addFavorite(rentalId: string): Promise<void> {
    return request<void>(
      `${FAVORITES_PATH}/${encodeURIComponent(rentalId)}`,
      { method: 'PUT' },
    );
  },

  removeFavorite(rentalId: string): Promise<void> {
    return request<void>(
      `${FAVORITES_PATH}/${encodeURIComponent(rentalId)}`,
      { method: 'DELETE' },
    );
  },
  getHistory(
    signal?: AbortSignal,
  ): Promise<RentalListItemData[]> {
    return request<RentalListItemData[]>(HISTORY_PATH, {
      signal,
    });
  },

  recordHistory(rentalId: string): Promise<void> {
    return request<void>(
      `${HISTORY_PATH}/${encodeURIComponent(rentalId)}`,
      {
        method: 'POST',
      },
    );
  },

  removeHistory(rentalId: string): Promise<void> {
    return request<void>(
      `${HISTORY_PATH}/${encodeURIComponent(rentalId)}`,
      {
        method: 'DELETE',
      },
    );
  },

  clearHistory(): Promise<void> {
    return request<void>(HISTORY_PATH, {
      method: 'DELETE',
    });
  },
  getProfile(
    signal?: AbortSignal,
  ): Promise<UserProfileResponse> {
    return request<UserProfileResponse>(
      '/api/user/account/profile',
      {
        method: 'GET',
        signal,
        auth: 'required',
      },
    );
  },

  updateProfile(
    data: UpdateProfileRequest,
    signal?: AbortSignal,
  ): Promise<UserProfileResponse> {
    return request<UserProfileResponse>(
      '/api/user/account/profile',
      {
        method: 'PATCH',
        body: data,
        signal,
        auth: 'required',
      },
    );
  },

};
