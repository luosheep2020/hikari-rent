import { request } from './client';
import type {
  StationOption,
  StationTreeNode,
} from '@/types/station';

const STATIONS_PATH = '/api/stations';

export const stationsApi = {
  getStationOperators(
    signal?: AbortSignal,
  ): Promise<StationOption[]> {
    return request<StationOption[]>(
      `${STATIONS_PATH}/operators`,
      { signal },
    );
  },

  getStationLines(
    operatorCode: string,
    signal?: AbortSignal,
  ): Promise<StationOption[]> {
    return request<StationOption[]>(`${STATIONS_PATH}/lines`, {
      query: { operatorCode },
      signal,
    });
  },

  getStationsByLine(
    lineId: string,
    signal?: AbortSignal,
  ): Promise<StationOption[]> {
    return request<StationOption[]>(`${STATIONS_PATH}/options`, {
      query: { lineId },
      signal,
    });
  },

  getStationTree(
    signal?: AbortSignal,
  ): Promise<StationTreeNode[]> {
    return request<StationTreeNode[]>(`${STATIONS_PATH}/tree`, {
      signal,
    });
  },
};

// Keep named exports compatible with existing components.
export const {
  getStationOperators,
  getStationLines,
  getStationsByLine,
  getStationTree,
} = stationsApi;
