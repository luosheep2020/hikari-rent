/** 搜索页筛选条件 */
export type RentalSearchFilters = {
  /** 房源名称关键词 */
  keyword?: string;

  /** 区域代码，与 AreaSelector 一致 */
  areaCode?: string;

  /** 车站名称，暂时匹配现有模拟数据 */
  station?: string;

  /** 最低月租，单位：日元 */
  minRent?: number;

  /** 最高月租，单位：日元 */
  maxRent?: number;

  /** 户型多选，空数组表示不限 */
  floorPlans: string[];

  /** 最大建筑年限，undefined 表示不限 */
  maxBuildingAge?: number;

  /** 到车站的最长步行时间，单位：分钟 */
  maxWalkingMinutes?: number;

  /** 设备多选，房源需要同时具备所有选中设备 */
  amenities: string[];

  /** 入住条件多选，例如宠物可商量 */
  conditions: string[];
};

/** 排序方式 */
export type RentalSort =
  | 'recommended'
  | 'rentAsc'
  | 'rentDesc'
  | 'areaDesc'
  | 'walkingAsc';

/** 展示方式 */
export type RentalView = 'list' | 'grid';

/** 每次创建独立的默认条件，避免共用数组 */
export function createDefaultRentalFilters(): RentalSearchFilters {
  return {
    keyword: undefined,
    areaCode: undefined,
    station: undefined,
    minRent: undefined,
    maxRent: undefined,
    floorPlans: [],
    maxBuildingAge: undefined,
    maxWalkingMinutes: undefined,
    amenities: [],
    conditions: [],
  };
}
