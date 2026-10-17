'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Cascader } from 'antd';

import { getStationTree } from '@/api/stations';
import type { StationTreeNode } from '@/types/station';

// Omit empty children so Cascader recognizes leaf nodes.
function toOptions(
  nodes: StationTreeNode[],
): StationTreeNode[] {
  return nodes.map((node) => ({
    value: node.value,
    label: node.label,
    children: node.children?.length
      ? toOptions(node.children)
      : undefined,
  }));
}

function normalizeText(value: string): string {
  return value.normalize('NFKC').trim().toLowerCase();
}

function getKeywordVariants(keyword: string): string[] {
  const variants = [keyword];

  // Accept station names with a Chinese or Japanese suffix.
  if (
    keyword.length > 1 &&
    (keyword.endsWith('站') || keyword.endsWith('駅'))
  ) {
    variants.push(keyword.slice(0, -1));
  }

  return variants;
}

// Index complete station paths for selection restoration.
function buildPathIndex(
  nodes: StationTreeNode[],
): Map<string, string[]> {
  const index = new Map<string, string[]>();

  function visit(
    currentNodes: StationTreeNode[],
    parentPath: string[],
  ) {
    for (const node of currentNodes) {
      const path = [...parentPath, node.value];

      if (path.length === 3) {
        index.set(node.value, path);
      } else if (node.children) {
        visit(node.children, path);
      }
    }
  }

  visit(nodes, []);

  return index;
}

interface StationSelectorProps {
  value?: string;
  onChange: (stationId: string | undefined) => void;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
}

export default function StationSelector({
                                          value,
                                          onChange,
                                          size = 'middle',
                                          className,
                                          id,
                                          disabled = false,
                                          placeholder = '鉄道会社・路線・駅名で検索',
                                        }: StationSelectorProps) {
  const [options, setOptions] = useState<StationTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTree() {
      setLoading(true);
      setFailed(false);

      try {
        const tree = await getStationTree(
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setOptions(toOptions(tree));
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(
          'Failed to load station tree:',
          error,
        );

        setFailed(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadTree();

    return () => {
      controller.abort();
    };
  }, [retryCount]);

  const pathIndex = useMemo(
    () => buildPathIndex(options),
    [options],
  );

  const selectedPath = value
    ? pathIndex.get(value) ?? []
    : [];

  return (
    <Cascader<StationTreeNode>
      id={id}
      className={className}
      style={{ width: '100%' }}
      size={size}
      options={options}
      value={selectedPath}
      disabled={disabled || loading}
      placeholder={
        loading ? '路線・駅を読み込み中...' : placeholder
      }
      aria-label="鉄道会社・路線・駅を検索"
      status={failed ? 'error' : undefined}
      allowClear
      expandTrigger="click"
      changeOnSelect={false}
      displayRender={(labels) => labels.join(' / ')}
      showSearch={{
        limit: 50,

        filter: (inputValue, path) => {
          const keywords = normalizeText(inputValue)
            .split(/\s+/)
            .filter(Boolean);

          const pathText = normalizeText(
            path.map((node) => node.label).join(' / '),
          );

          // Match every keyword against the complete path.
          return keywords.every((keyword) =>
            getKeywordVariants(keyword).some((variant) =>
              pathText.includes(variant),
            ),
          );
        },

        render: (_inputValue, path) =>
          path.map((node) => node.label).join(' / '),
      }}
      notFoundContent={
        failed ? (
          <div>
            <span>路線・駅を読み込めませんでした。</span>

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
          '該当する路線・駅がありません'
        )
      }
      onChange={(path) => {
        if (!path || path.length === 0) {
          onChange(undefined);
          return;
        }

        // Submit only the station ID from the third level.
        if (path.length === 3) {
          onChange(String(path[2]));
        }
      }}
    />
  );
}
