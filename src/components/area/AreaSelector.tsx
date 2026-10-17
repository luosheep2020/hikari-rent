'use client';

import { useEffect, useState } from 'react';
import { Button, Cascader } from 'antd';

import {
  getAreaTree,
  type AreaTreeNode,
} from '@/api/areas';

interface AreaOption {
  value: string;
  label: string;
  children?: AreaOption[];
}

interface AreaSelectorProps {
  value?: string;
  onChange: (code: string | undefined) => void;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  id?: string;
  placeholder?: string;
}

// 将后端区域树转换成 Cascader 的 options。
function toOptions(nodes: AreaTreeNode[]): AreaOption[] {
  return nodes.map((node) => ({
    value: node.code,
    label: node.name,

    // 叶子节点不设置 children，避免显示空的下一级。
    children: node.children?.length
      ? toOptions(node.children)
      : undefined,
  }));
}

// 根据市区町村编码找到完整路径，用于回显。
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
      const found = findAreaPath(
        option.children,
        code,
        path,
      );

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
  const [options, setOptions] = useState<AreaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAreas() {
      setLoading(true);
      setFailed(false);

      try {
        const tree = await getAreaTree(controller.signal);

        if (!controller.signal.aborted) {
          setOptions(toOptions(tree));
        }
      } catch (error) {
        // 组件卸载导致的取消，不显示加载失败。
        if (controller.signal.aborted) {
          return;
        }

        console.error('Failed to load areas:', error);
        setFailed(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadAreas();

    return () => {
      controller.abort();
    };
  }, [retryCount]);

  const selectedPath = value
    ? findAreaPath(options, value) ?? []
    : [];

  return (
    <Cascader
      id={id}
      className={className}
      style={{ width: '100%' }}
      size={size}
      options={options}
      value={selectedPath}
      disabled={loading}
      placeholder={
        loading ? 'エリアを読み込み中...' : placeholder
      }
      aria-label="地区を選択"
      status={failed ? 'error' : undefined}
      allowClear
      expandTrigger="click"
      changeOnSelect={false}
      displayRender={(labels) => labels.join(' / ')}
      notFoundContent={
        failed ? (
          <div>
            <span>エリアを読み込めませんでした。</span>

            <Button
              type="link"
              size="small"
              onClick={() => {
                setRetryCount((count) => count + 1);
              }}
            >
              再試行
            </Button>
          </div>
        ) : (
          'エリアがありません'
        )
      }
      onChange={(path) => {
        // 继续只允许选择完整三级区域。
        const code =
          path?.length === 3
            ? String(path[2])
            : undefined;

        onChange(code);
      }}
    />
  );
}
