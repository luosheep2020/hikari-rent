import {RentalSearchFilters, RentalSort} from "@/types/rentalSearch";
import {RentalListItemData} from "@/types/rental";

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapFiltersValue {
  areaCode?: string;
  maxRent?: number;
  floorPlan?: string;
}
export interface RentalMapQuery extends RentalSearchFilters {
  north: number;
  south: number;
  east: number;
  west: number;
  sort?: RentalSort;
}

export interface RentalMapResult {
  records: RentalListItemData[];
  hasMore: boolean;
  limit: number;
}
