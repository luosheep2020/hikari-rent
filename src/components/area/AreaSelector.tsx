'use client';

import { Cascader } from 'antd';

import {
  mockAreaOptions,
  type AreaOption,
} from '@/lib/mockAreas';

interface AreaSelectorProps {
  value?: string;
  onChange: (code: string | undefined) => void;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  id?: string;
  placeholder?: string;
}

function findAreaPath(
  options: AreaOption[],
  code: string,
  parentPath: string[] = [],
): string[] | undefined {
  for (const option of options) {
    const path = [...parentPath, option.value];

    if (option.value === code) {
      return path;
    }

    if (option.children) {
      const found = findAreaPath(option.children, code, path);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

export default function AreaSelector({
                                       value,
                                       onChange,
                                       size = 'middle',
                                       className,
                                       id,
                                       placeholder = '地方・都道府県・市区町村を選択',
                                     }: AreaSelectorProps) {
  const selectedPath = value
    ? findAreaPath(mockAreaOptions, value) ?? []
    : [];

  return (
    <Cascader
      id={id}
      className={className}
      style={{ width: '100%' }}
      size={size}
      options={mockAreaOptions}
      value={selectedPath}
      placeholder={placeholder}
      aria-label="地区を選択"
      allowClear
      expandTrigger="click"
      displayRender={(labels) => labels.join(' / ')}
      onChange={(path) => {
        // 当前只支持选择完整三级地区
        const code = path?.length === 3
          ? String(path[2])
          : undefined;

        onChange(code);
      }}
    />
  );
}
