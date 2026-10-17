import { request } from './client';
import {AreaTreeNode} from "@/types/area";



export function getAreaTree(
  signal?: AbortSignal,
): Promise<AreaTreeNode[]> {
  return request<AreaTreeNode[]>('/api/areas/tree', {
    signal,
  });
}
