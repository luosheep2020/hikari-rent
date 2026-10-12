import type {RentalDetail} from '@/types/rental';
import type {RentalSearchFilters, RentalSort,} from '@/types/rentalSearch';

/** 统一全角、半角和英文字母大小写 */
function normalizeText(value: string): string {
  return value.normalize('NFKC').trim().toLowerCase();
}

/** 户型比较时忽略空格 */
function normalizeFloorPlan(value: string): string {
  return normalizeText(value).replace(/\s+/g, '');
}

/** 根据建成月份计算完整建筑年限 */
function getBuildingAge(
  rental: RentalDetail,
  currentDate: Date,
): number {
  let age = currentDate.getFullYear() - rental.builtYear;

  const currentMonth = currentDate.getMonth() + 1;

  if (currentMonth < rental.builtMonth) {
    age -= 1;
  }

  return Math.max(0, age);
}

/** 获取参与搜索的车站 */
function getStations(rental: RentalDetail) {
  return [
    {
      name: rental.station,
      walkingMinutes: rental.walkingMinutes,
    },
    ...rental.stations,
  ];
}

/** 筛选房源，不修改原数组 */
export function filterRentals(
  rentals: readonly RentalDetail[],
  filters: RentalSearchFilters,
  currentDate: Date = new Date(),
): RentalDetail[] {
  const keyword = normalizeText(filters.keyword ?? '');
  const stationKeyword = normalizeText(filters.station ?? '');

  const selectedFloorPlans = filters.floorPlans.map(
    normalizeFloorPlan,
  );

  return rentals.filter((rental) => {
    // 顶部房源名称搜索
    if (
      keyword &&
      !normalizeText(rental.name).includes(keyword)
    ) {
      return false;
    }

    // 区域筛选
    if (
      filters.areaCode &&
      rental.areaCode !== filters.areaCode
    ) {
      return false;
    }

    // 最低租金
    if (
      filters.minRent !== undefined &&
      rental.monthlyRent < filters.minRent
    ) {
      return false;
    }

    // 最高租金
    if (
      filters.maxRent !== undefined &&
      rental.monthlyRent > filters.maxRent
    ) {
      return false;
    }

    // 户型多选：满足其中一种即可
    if (
      selectedFloorPlans.length > 0 &&
      !selectedFloorPlans.includes(
        normalizeFloorPlan(rental.floorPlan),
      )
    ) {
      return false;
    }

    // 建筑年限
    if (
      filters.maxBuildingAge !== undefined &&
      getBuildingAge(rental, currentDate) >
      filters.maxBuildingAge
    ) {
      return false;
    }

    // 车站名称和步行时间需要由同一个车站满足。
    const hasStationFilter = stationKeyword.length > 0;
    const hasWalkingFilter =
      filters.maxWalkingMinutes !== undefined;

    if (hasStationFilter || hasWalkingFilter) {
      const hasMatchingStation = getStations(rental).some(
        (station) => {
          const matchesName =
            !hasStationFilter ||
            normalizeText(station.name).includes(
              stationKeyword,
            );

          const matchesWalking =
            filters.maxWalkingMinutes === undefined ||
            station.walkingMinutes <=
            filters.maxWalkingMinutes;

          return matchesName && matchesWalking;
        },
      );

      if (!hasMatchingStation) {
        return false;
      }
    }

    // 设备多选：必须同时具备全部所选设备
    const matchesAmenities = filters.amenities.every(
      (amenity) => rental.amenities.includes(amenity),
    );

    if (!matchesAmenities) {
      return false;
    }

    // 入住条件多选：必须同时满足全部所选条件
    return  filters.conditions.every(
      (condition) => rental.conditions.includes(condition),
    );


  });
}

/** 获取最近车站的步行时间 */
function getNearestWalkingMinutes(
  rental: RentalDetail,
): number {
  return Math.min(
    ...getStations(rental).map(
      (station) => station.walkingMinutes,
    ),
  );
}

/** 排序房源，不修改传入数组 */
export function sortRentals(
  rentals: readonly RentalDetail[],
  sort: RentalSort,
): RentalDetail[] {
  const result = [...rentals];

  switch (sort) {
    case 'rentAsc':
      return result.sort(
        (a, b) => a.monthlyRent - b.monthlyRent,
      );

    case 'rentDesc':
      return result.sort(
        (a, b) => b.monthlyRent - a.monthlyRent,
      );

    case 'areaDesc':
      return result.sort((a, b) => b.area - a.area);

    case 'walkingAsc':
      return result.sort(
        (a, b) =>
          getNearestWalkingMinutes(a) -
          getNearestWalkingMinutes(b),
      );

    case 'recommended':
    default:
      // 暂时保持模拟数据的原始顺序。
      return result;
  }
}
