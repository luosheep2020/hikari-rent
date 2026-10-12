// 首页、列表、收藏页使用
export interface RentalSummary {
  id: string;
  areaCode: string;
  name: string;
  address: string;
  image: string;
  monthlyRent: number;
  floorPlan: string;
  area: number;
  station: string;
  walkingMinutes: number;
  isNew: boolean;
}

// 联系人
export interface RentalAgent {
  id: string;
  name: string;
  avatar?: string;
  company: string;
  phone: string | null;
  businessHours: string;
  closedDays: string;
}

// 附近车站
export interface RentalStation {
  name: string;
  line: string;
  walkingMinutes: number;
}

// 详情页使用
export interface RentalDetail extends RentalSummary {
  images: string[];
  floorPlanImage: string | null;

  // 费用：金额单位为日元，未知费用用 null
  managementFee: number;
  depositMonths: number;
  keyMoneyMonths: number;
  brokerageFee: number | null;
  guaranteeFee: number | null;
  renewalFee: number | null;

  // 建筑信息
  floor: number;
  totalFloors: number;
  builtYear: number;
  builtMonth: number;
  direction: string;
  buildingStructure: string;

  // 设备、条件
  amenities: string[];
  conditions: string[];

  // 合同、入住
  availableFrom: string;
  contractType: string;
  contractPeriod: string;
  guaranteeCompany: string;

  // 位置
  latitude: number | null;
  longitude: number | null;
  stations: RentalStation[];
  managementCompany: RentalManagementCompany;
  description: string;
  agent: RentalAgent;
}
export interface RentalManagementCompany {
  name: string;
  address: string;
  licenseNumber: string | null;
  email: string | null;
}
