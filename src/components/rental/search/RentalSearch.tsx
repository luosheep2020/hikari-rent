'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { recordAreaSearch } from '@/api/areas';
import Link from 'next/link';
import {
  Alert,
  Breadcrumb,
  Button,
  Empty,
  Pagination,
  Spin,
} from 'antd';

import { rentalsApi } from '@/api/rentals';
import type { RentalListItemData } from '@/types/rental';
import type {
  RentalPageQuery,
  RentalSearchFilters,
  RentalSort,
  RentalView,
} from '@/types/rentalSearch';

import RentalCard from '@/components/rental/RentalCard';
import RentalSearchBar from './RentalSearchBar';
import RentalFilters, {
  type RentalConditionFilters,
} from './RentalFilters';
import RentalResultsToolbar from './RentalResultsToolbar';
import RentalListItem from './RentalListItem';

import styles from './css/RentalSearch.module.css';

type Props = {
  initialFilters: RentalSearchFilters;
  initialSort?: RentalSort;
};

type ResultState = {
  key: string;
  attempt: number;
  records: RentalListItemData[];
  total: number;
  error?: string;
};

export default function RentalSearch({
                                       initialFilters,
                                       initialSort = 'recommended',
                                     }: Props) {
  const [filters, setFilters] = useState<RentalSearchFilters>(
    () => ({
      ...initialFilters,
      propertyTypes: [...(initialFilters.propertyTypes ?? [])],
      floorPlans: [...initialFilters.floorPlans],
      amenities: [...initialFilters.amenities],
      conditions: [...initialFilters.conditions],
    }),
  );

  const [sort, setSort] = useState<RentalSort>(initialSort);
  const [view, setView] = useState<RentalView>('list');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [retry, setRetry] = useState(0);

  const [result, setResult] = useState<ResultState | null>(null);

  const query = useMemo<RentalPageQuery>(
    () => ({
      ...filters,
      page,
      pageSize,
      sort,
    }),
    [filters, page, pageSize, sort],
  );

  const requestKey = JSON.stringify(query);

  const loading =
    result?.key !== requestKey ||
    result?.attempt !== retry;

  const total = loading ? 0 : (result?.total ?? 0);
  const records = loading ? [] : (result?.records ?? []);
  const error = loading ? undefined : result?.error;
  const reportedAreaRef = useRef<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadPage() {
      try {
        const data = await rentalsApi.getPage(
          query,
          controller.signal,
        );

        if (controller.signal.aborted) {
          return;
        }
        const areaCode = query.areaCode;

        if (!areaCode) {
          reportedAreaRef.current = null;
        } else if (reportedAreaRef.current !== areaCode) {
          reportedAreaRef.current = areaCode;

          void recordAreaSearch(areaCode).catch((error) => {
            console.warn('Failed to record area search:', error);
          });
        }
        const lastPage = Math.max(
          1,
          Math.ceil(data.total / query.pageSize),
        );

        if (query.page > lastPage) {
          setPage(lastPage);
          return;
        }

        setResult({
          key: requestKey,
          attempt: retry,
          records: data.records,
          total: data.total,
        });
      } catch (cause) {
        if (controller.signal.aborted) {
          return;
        }

        console.error('Failed to load rental page:', cause);

        setResult({
          key: requestKey,
          attempt: retry,
          records: [],
          total: 0,
          error:
            '物件を読み込めませんでした。時間をおいて再試行してください。',
        });
      }
    }

    void loadPage();

    return () => controller.abort();
  }, [query, requestKey, retry]);

  function handleKeywordSearch(keyword: string) {
    setFilters((current) => ({
      ...current,
      keyword: keyword.trim() || undefined,
    }));

    setPage(1);
  }

  function handleConditionsSearch(
    conditions: RentalConditionFilters,
  ) {
    // Preserve the submitted keyword when sidebar conditions change.
    setFilters((current) => ({
      ...conditions,
      propertyTypes: [...(conditions.propertyTypes ?? [])],
      floorPlans: [...conditions.floorPlans],
      amenities: [...conditions.amenities],
      conditions: [...conditions.conditions],
      keyword: current.keyword,
    }));

    setPage(1);
  }

  function handleSortChange(nextSort: RentalSort) {
    setSort(nextSort);
    setPage(1);
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Breadcrumb
          className={styles.breadcrumb}
          items={[
            {
              title: <Link href="/">ホーム</Link>,
            },
            {
              title: '賃貸物件を探す',
            },
          ]}
        />

        <RentalSearchBar
          initialKeyword={initialFilters.keyword}
          onSearch={handleKeywordSearch}
        />

        <div className={styles.layout}>
          <div className={styles.sidebar}>
            <RentalFilters
              initialFilters={initialFilters}
              onSearch={handleConditionsSearch}
            />
          </div>

          <section
            className={styles.results}
            aria-label="物件検索結果"
            aria-busy={loading}
          >
            <RentalResultsToolbar
              total={total}
              sort={sort}
              view={view}
              pageSize={pageSize}
              onSortChange={handleSortChange}
              onViewChange={setView}
              onPageSizeChange={handlePageSizeChange}
            />

            {loading ? (
              <div className={styles.empty} role="status">
                <Spin />

                <p className={styles.emptyHint}>
                  物件を読み込み中...
                </p>
              </div>
            ) : error ? (
              <Alert
                type="error"
                title="物件の読み込みに失敗しました"
                description={error}
                showIcon
                action={
                  <Button
                    size="small"
                    onClick={() => {
                      setRetry((current) => current + 1);
                    }}
                  >
                    再試行
                  </Button>
                }
              />
            ) : total === 0 ? (
              <div className={styles.empty}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="条件に一致する物件が見つかりませんでした"
                />

                <p className={styles.emptyHint}>
                  検索キーワードや絞り込み条件を変更して、
                  もう一度お試しください。
                </p>
              </div>
            ) : (
              <>
                <div
                  className={
                    view === 'list'
                      ? styles.list
                      : styles.grid
                  }
                >
                  {records.map((rental) =>
                    view === 'list' ? (
                      <RentalListItem
                        key={rental.id}
                        rental={rental}
                      />
                    ) : (
                      <RentalCard
                        key={rental.id}
                        rental={rental}
                      />
                    ),
                  )}
                </div>

                <div className={styles.pagination}>
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={pageSize}
                    onChange={setPage}
                    showSizeChanger={false}
                    hideOnSinglePage
                  />
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
