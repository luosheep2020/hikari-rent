export interface AreaOption {
  value: string;
  label: string;
  children?: AreaOption[];
}

export const mockAreaOptions: AreaOption[] = [
  {
    value: 'kanto',
    label: '関東',
    children: [
      {
        value: '13',
        label: '東京都',
        children: [
          { value: '13104', label: '新宿区' },
          { value: '13113', label: '渋谷区' },
          { value: '13114', label: '中野区' },
          { value: '13203', label: '武蔵野市' },
        ],
      },
      {
        value: '14',
        label: '神奈川県',
        children: [
          { value: '14201', label: '横須賀市' },
          { value: '14205', label: '藤沢市' },
        ],
      },
    ],
  },
  {
    value: 'kansai',
    label: '関西',
    children: [
      {
        value: '27',
        label: '大阪府',
        children: [
          { value: '27203', label: '豊中市' },
          { value: '27205', label: '吹田市' },
        ],
      },
    ],
  },
];
