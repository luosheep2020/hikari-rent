export interface Area {
  code: string;
  name: string;
  parentCode: string | null;
  level: 1 | 2 | 3;
  latitude: number | null;
  longitude: number | null;
}
