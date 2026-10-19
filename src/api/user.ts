
import { request } from './client';

import type {
  AuthUser,
  UpdateProfileRequest,
} from '@/types/user';

import type { RentalListItemData } from '@/types/rental';
const PROFILE_PATH = '/api/account/profile';
const FAVORITES_PATH = '/api/user/favorites';
const HISTORY_PATH = '/api/user/history';

export const userApi = {
  updateProfile(
    values: UpdateProfileRequest,
  ): Promise<AuthUser> {
    return request<AuthUser>(PROFILE_PATH, {
      method: 'PATCH',
      body: values,
    });
  },

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
};
