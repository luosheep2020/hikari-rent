'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { getPopularAreas } from '@/api/areas';
import type { PopularAreaItem } from '@/types/area';

import styles from './PopularAreas.module.css';

type AreaPresentation = {
  description: string;
  image: string;
};

const defaultAreas: PopularAreaItem[] = [
  {
    code: '13104',
    name: '新宿区',
  },
  {
    code: '13113',
    name: '渋谷区',
  },
  {
    code: '13114',
    name: '中野区',
  },
  {
    code: '13203',
    name: '武蔵野市',
  },
];

const areaPresentations: Record<string, AreaPresentation> = {
  '13104': {
    description: '都心の便利さと多彩な暮らし',
    image: '/images/home/shinjuku.png',
  },
  '13113': {
    description: 'カルチャーが集まる最先端の街',
    image: '/images/home/shibuya.png',
  },
  '13114': {
    description: '落ち着いた雰囲気と住みやすさ',
    image: '/images/home/nakano.png',
  },
  '13203': {
    description: '吉祥寺周辺の緑とおしゃれな暮らし',
    image: '/images/home/kichijoji.png',
  },
};

const defaultPresentation: AreaPresentation = {
  description: 'このエリアで、あなたに合うお部屋を',
  image: '/images/home/hero.png',
};

function fillPopularAreas(
  rankedAreas: PopularAreaItem[],
): PopularAreaItem[] {
  const uniqueAreas = new Map<string, PopularAreaItem>();

  for (const area of [...rankedAreas, ...defaultAreas]) {
    if (
      !area ||
      typeof area.code !== 'string' ||
      !/^\d{5}$/.test(area.code) ||
      typeof area.name !== 'string' ||
      !area.name.trim()
    ) {
      continue;
    }

    if (!uniqueAreas.has(area.code)) {
      uniqueAreas.set(area.code, area);
    }

    if (uniqueAreas.size === 4) {
      break;
    }
  }

  return [...uniqueAreas.values()];
}

export default function PopularAreas() {
  const [areas, setAreas] =
    useState<PopularAreaItem[]>(defaultAreas);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPopularAreas() {
      try {
        const data = await getPopularAreas(
          controller.signal,
        );

        if (controller.signal.aborted) {
          return;
        }

        if (!Array.isArray(data)) {
          throw new Error('Invalid popular area response');
        }

        setAreas(fillPopularAreas(data));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        // Keep the default cards when the API is unavailable.
        console.warn('Failed to load popular areas:', error);
      }
    }

    void loadPopularAreas();

    return () => controller.abort();
  }, []);

  return (
    <section aria-labelledby="popular-areas-title">
      <div className={styles.heading}>
        <h2
          id="popular-areas-title"
          className={styles.title}
        >
          人気のエリアから探す
        </h2>

        <Link
          href="/rentals"
          className={styles.moreLink}
        >
          エリアをもっと見る
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className={styles.grid}>
        {areas.map((area) => {
          const presentation =
            areaPresentations[area.code] ??
            defaultPresentation;

          return (
            <Link
              key={area.code}
              href={`/rentals?areaCode=${encodeURIComponent(area.code)}`}
              className={styles.card}
            >
              <Image
                src={presentation.image}
                alt=""
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={styles.image}
              />

              <div className={styles.content}>
                <div className={styles.text}>
                  <h3 className={styles.areaName}>
                    {area.name}
                  </h3>

                  <p className={styles.description}>
                    {presentation.description}
                  </p>
                </div>

                <span
                  className={styles.arrow}
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
