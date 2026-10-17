import { request } from './client';
import type {
  StationOption,
  StationTreeNode,
} from '@/types/station';

export function getStationOperators(
  signal?: AbortSignal,
): Promise<StationOption[]> {
  return request<StationOption[]>(
    '/api/stations/operators',
    { signal },
  );
}

export function getStationLines(
  operatorCode: string,
  signal?: AbortSignal,
): Promise<StationOption[]> {
  return request<StationOption[]>('/api/stations/lines', {
    query: { operatorCode },
    signal,
  });
}

export function getStationsByLine(
  lineId: string,
  signal?: AbortSignal,
): Promise<StationOption[]> {
  return request<StationOption[]>('/api/stations/options', {
    query: { lineId },
    signal,
  });
}

export function getStationTree(
  signal?: AbortSignal,
): Promise<StationTreeNode[]> {
  return request<StationTreeNode[]>('/api/stations/tree', {
    signal,
  });
}
