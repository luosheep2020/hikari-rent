'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';


import styles from './css/MapSearch.module.css';
import {RentalListItemData} from "@/types/rental";

interface MapRentalListProps {
  rentals: RentalListItemData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const formatter = new Intl.NumberFormat('ja-JP', {
  maximumFractionDigits: 2,
});

export default function MapRentalList({
                                        rentals,
                                        selectedId,
                                        onSelect,
                                      }: MapRentalListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const itemRefs = useRef(
    new Map<string, HTMLButtonElement>(),
  );

  useEffect(() => {
    if (!selectedId) return;

    const list = listRef.current;
    const item = itemRefs.current.get(selectedId);

    if (!list || !item) return;

    const listRect = list.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    if (itemRect.top < listRect.top) {
      list.scrollTop += itemRect.top - listRect.top;
    } else if (itemRect.bottom > listRect.bottom) {
      list.scrollTop += itemRect.bottom - listRect.bottom;
    }
  }, [selectedId]);

  return (
    <aside className={styles.listPanel} aria-label="房源一覧">
      <div className={styles.listHeading}>
        <h2>このエリアの物件</h2>
        <span>{rentals.length}件</span>
      </div>

      <div ref={listRef} className={styles.listBody}>
        {rentals.length === 0 ? (
          <p className={styles.listEmpty}>
            このエリアに物件がありません。地図を移動するか、縮小してください。
          </p>
        ) : (
          rentals.map((rental) => {
            const selected = rental.id === selectedId;

            return (
              <button
                key={rental.id}
                ref={(element) => {
                  if (element) {
                    itemRefs.current.set(rental.id, element);
                  } else {
                    itemRefs.current.delete(rental.id);
                  }
                }}
                type="button"
                className={`${styles.listItem} ${
                  selected ? styles.selectedListItem : ''
                }`}
                onClick={() => onSelect(rental.id)}
                aria-pressed={selected}
              >
                <div className={styles.listImage}>
                  <Image
                    src={rental.image || '/images/rentals/placeholder.svg'}
                    alt=""
                    fill
                    sizes="110px"
                    className={styles.image}
                  />
                </div>

                <div className={styles.listInformation}>
                  <h3 className={styles.listName}>
                    {rental.name}
                  </h3>

                  <p className={styles.listPrice}>
                    {formatter.format(rental.monthlyRent / 10000)}
                    <span>万円</span>
                  </p>

                  <p className={styles.listMeta}>
                    {rental.floorPlan} / {rental.area}m²
                  </p>

                  <p className={styles.listStation}>
                 <span>
                  {rental.station ?? '最寄り駅情報は準備中です'}
                   {rental.walkingMinutes != null && (
                     <> 徒歩{rental.walkingMinutes}分</>
                   )}
                  </span>
                  </p>

                  <div className={styles.listTags}>
                    {rental.amenities.slice(0, 2).map((amenity) => (
                      <span key={amenity}>{amenity}</span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
