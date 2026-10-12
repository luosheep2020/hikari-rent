import type {
  RentalAgent,
  RentalDetail,
  RentalSummary,
} from '@/types/rental';

const rentalSummaries: RentalSummary[] = [
  {
    id: '10001',
    areaCode: '13104',
    name: 'グリーンレジデンス新宿',
    address: '東京都新宿区西新宿',
    image: '/images/home/hero.png',
    monthlyRent: 125000,
    floorPlan: '1LDK',
    area: 34.2,
    station: '西新宿五丁目駅',
    walkingMinutes: 6,
    isNew: true,

  },
  {
    id: '10002',
    areaCode: '13113',
    name: 'ルミエール渋谷',
    address: '東京都渋谷区神南',
    image: '/images/home/hero.png',
    monthlyRent: 108000,
    floorPlan: '1K',
    area: 27.1,
    station: '渋谷駅',
    walkingMinutes: 9,
    isNew: true,
  },
  {
    id: '10003',
    areaCode: '13114',
    name: 'メゾン中野',
    address: '東京都中野区中野',
    image: '/images/home/hero.png',
    monthlyRent: 96000,
    floorPlan: '1K',
    area: 25.4,
    station: '中野駅',
    walkingMinutes: 5,
    isNew: true,
  },
  {
    id: '10004',
    areaCode: '13203',
    name: 'パークサイド吉祥寺',
    address: '東京都武蔵野市吉祥寺本町',
    image: '/images/home/hero.png',
    monthlyRent: 132000,
    floorPlan: '1LDK',
    area: 36.8,
    station: '吉祥寺駅',
    walkingMinutes: 8,
    isNew: true,
  },
];

const demoAgent: RentalAgent = {
  id: 'agent-001',
  name: '田中',
  company: 'Hikari 不動産',
  // 暂时没有真实联系方式，不填写可拨打的模拟号码
  phone: '07089715854',
  businessHours: '10:00〜18:00',
  closedDays: '水曜日',
};
// 开发演示坐标，不代表真实房源地址
const demoPositions: Record<
  string,
  { latitude: number; longitude: number }
> = {
  '10001': { latitude: 35.69, longitude: 139.685 },
  '10002': { latitude: 35.664, longitude: 139.699 },
  '10003': { latitude: 35.707, longitude: 139.665 },
  '10004': { latitude: 35.704, longitude: 139.58 },
};
export const mockRentals: RentalDetail[] = rentalSummaries.map(
  (rental) => ({
    ...rental,

    images: [rental.image],
    floorPlanImage: null,

    managementFee: 8000,
    depositMonths: 1,
    keyMoneyMonths: 1,
    brokerageFee: null,
    guaranteeFee: null,
    renewalFee: null,

    floor: 3,
    totalFloors: 8,
    builtYear: 2021,
    builtMonth: 4,
    direction: '南',
    buildingStructure: 'RC（鉄筋コンクリート造）',

    amenities: [
      'バス・トイレ別',
      'オートロック',
      'エアコン',
      '宅配ボックス',
      '独立洗面台',
      '室内洗濯機置き場',
    ],

    conditions: [
      'ペット相談',
      '楽器不可',
    ],

    availableFrom: '相談',
    contractType: '普通借家',
    contractPeriod: '2年',
    guaranteeCompany: '要確認',

    // 添加房源实际坐标后再显示地图
    latitude: demoPositions[rental.id]?.latitude ?? null,
    longitude: demoPositions[rental.id]?.longitude ?? null,

    stations: [
      {
        name: rental.station,
        line: '路線情報は準備中',
        walkingMinutes: rental.walkingMinutes,
      },
    ],

    description:
      '明るく落ち着いた室内で、毎日の暮らしを快適に。駅やお買い物施設へのアクセスも便利です。設備や契約条件の詳細は担当者にご確認ください。',

    agent: { ...demoAgent },
    managementCompany: {
      name: '三井不動産MITSUIFUDOSAN',
      address: '東京都新宿区西新宿',
      licenseNumber: null,
      email: null,
    },
  }),
);
