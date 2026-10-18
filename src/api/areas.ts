import { request } from './client';
import type { AreaTreeNode, PopularAreaItem } from '@/types/area';

const AREAS_PATH = '/api/areas';

export const areasApi = {
  getAreaTree(
    signal?: AbortSignal,
  ): Promise<AreaTreeNode[]> {
    return request<AreaTreeNode[]>(`${AREAS_PATH}/tree`, {
      signal,
    });
  },

  getPopularAreas(
    signal?: AbortSignal,
  ): Promise<PopularAreaItem[]> {
    return request<PopularAreaItem[]>(`${AREAS_PATH}/popular`, {
      signal,
    });
  },

  recordAreaSearch(
    code: string,
  ): Promise<void> {
    return request<void>(
      `${AREAS_PATH}/${encodeURIComponent(code)}/search-events`,
      {
        method: 'POST',
      },
    );
  },
};

// Keep named exports compatible with existing components.
export const {
  getAreaTree,
  getPopularAreas,
  recordAreaSearch,
} = areasApi;
