import Image from 'next/image';
import Link from 'next/link';

import styles from './PopularAreas.module.css';

const popularAreas = [
  {
    code: '13104',
    name: '新宿',
    description: '都心の便利さと多彩な暮らし',
    image: '/images/home/shinjuku.png',
  },
  {
    code: '13113',
    name: '渋谷',
    description: 'カルチャーが集まる最先端の街',
    image: '/images/home/shibuya.png',
  },
  {
    code: '13114',
    name: '中野',
    description: '落ち着いた雰囲気と住みやすさ',
    image: '/images/home/nakano.png',
  },
  {
    code: '13203',
    name: '吉祥寺',
    description: '緑とおしゃれなお店がある街',
    image: '/images/home/kichijoji.png',
  },
];

export default function PopularAreas() {
  return (
    <section aria-labelledby="popular-areas-title">
      <div className={styles.heading}>
        <h2 id="popular-areas-title" className={styles.title}>
          人気のエリアから探す
        </h2>

        <Link href="/rentals" className={styles.moreLink}>
          エリアをもっと見る
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className={styles.grid}>
        {popularAreas.map((area) => (
          <Link
            key={area.code}
            href={`/rentals?areaCode=${area.code}`}
            className={styles.card}
          >
            <Image
              src={area.image}
              alt=""
              fill
              sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={styles.image}
            />

            <div className={styles.content}>
              <div className={styles.text}>
                <h3 className={styles.areaName}>{area.name}</h3>
                <p className={styles.description}>{area.description}</p>
              </div>

              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
