'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Breadcrumb, Empty, Pagination } from 'antd';

import type { RentalDetail } from '@/types/rental';
import type {
  RentalSearchFilters,
  RentalSort,
  RentalView,
} from '@/types/rentalSearch';
import { filterRentals, sortRentals } from '@/lib/filterRentals';

import RentalCard from '@/components/rental/RentalCard';
import RentalSearchBar from './RentalSearchBar';
import RentalFilters, {
  type RentalConditionFilters,
} from './RentalFilters';
import RentalResultsToolbar from './RentalResultsToolbar';
import RentalListItem from './RentalListItem';

import styles from './css/RentalSearch.module.css';

type Props = {
  rentals: RentalDetail[];
  initialFilters: RentalSearchFilters;
};

const PAGE_SIZE = 6;

export default function RentalSearch({
                                       rentals,
                                       initialFilters,
                                     }: Props) {
  const [filters, setFilters] = useState<RentalSearchFilters>(
    () => ({
      ...initialFilters,
      floorPlans: [...initialFilters.floorPlans],
      amenities: [...initialFilters.amenities],
      conditions: [...initialFilters.conditions],
    }),
  );

  const [sort, setSort] = useState<RentalSort>('recommended');
  const [view, setView] = useState<RentalView>('list');
  const [page, setPage] = useState(1);

  const filteredRentals = filterRentals(rentals, filters);
  const sortedRentals = sortRentals(filteredRentals, sort);

  const total = sortedRentals.length;

  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(total / PAGE_SIZE)),
  );

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRentals = sortedRentals.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  const handleKeywordSearch = (keyword: string) => {
    setFilters((current) => ({
      ...current,
      keyword: keyword || undefined,
    }));

    setPage(1);
  };

  const handleConditionsSearch = (
    conditions: RentalConditionFilters,
  ) => {
    setFilters((current) => ({
      ...conditions,
      // 左侧条件搜索保留顶部关键词。
      keyword: current.keyword,
    }));

    setPage(1);
  };

  const handleSortChange = (nextSort: RentalSort) => {
    setSort(nextSort);
    setPage(1);
  };

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
              rentals={rentals}
              initialFilters={initialFilters}
              onSearch={handleConditionsSearch}
            />
          </div>

          <section
            className={styles.results}
            aria-label="物件検索結果"
          >
            <RentalResultsToolbar
              total={total}
              sort={sort}
              view={view}
              onSortChange={handleSortChange}
              onViewChange={setView}
            />

            {total === 0 ? (
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
                  {pageRentals.map((rental) =>
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
                    current={currentPage}
                    total={total}
                    pageSize={PAGE_SIZE}
                    onChange={(nextPage) => {
                      setPage(nextPage);
                    }}
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
