export interface Area {
  code: string;
  name: string;
  parentCode: string | null;
  level: 1 | 2 | 3;
  latitude: number | null;
  longitude: number | null;
}

export interface AreaTreeNode {
  code: string;
  name: string;
  level: number;
  latitude: number | null;
  longitude: number | null;
  children: AreaTreeNode[];
}

export interface PopularAreaItem {
  code: string;
  name: string;
}
