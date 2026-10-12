import type { Metadata } from 'next';
import Link from 'next/link';

import styles from '../info.module.css';

export const metadata: Metadata = {
  title: '会社概要',
};

const items = [
  {
    label: 'サービス名',
    value: 'Hikari Rent',
  },
  {
    label: 'コンセプト',
    value: 'くらしに、ひかりを。',
  },
  {
    label: 'プロジェクト概要',
    value:
      '日本の賃貸住宅探しをテーマに制作した、個人開発のポートフォリオです。',
  },
  {
    label: '主な機能',
    value:
      '物件検索、地図検索、お気に入り、物件詳細、マイページ。',
  },
  {
    label: '掲載情報',
    value:
      '掲載物件・担当者・管理会社の情報は、開発用のサンプルです。',
  },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="パンくず">
        <Link href="/">ホーム</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">会社概要</span>
      </nav>

      <header className={styles.heading}>
        <p className={styles.eyebrow}>ABOUT HIKARI RENT</p>
        <h1 className={styles.title}>会社概要</h1>
        <p className={styles.description}>
          Hikari Rentのサービスと制作プロジェクトについて。
        </p>
      </header>

      <p className={styles.notice}>
        Hikari Rentは個人開発のデモサイトです。
        実在する不動産会社の公式サイトではなく、
        賃貸契約の仲介・申し込み受付は行っていません。
      </p>

      <div className={styles.content}>
        <dl className={styles.companyInfo}>
          {items.map((item) => (
            <div key={item.label} className={styles.companyRow}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}

          <div className={styles.companyRow}>
            <dt>お問い合わせ</dt>
            <dd>
              <Link href="/contact">
                お問い合わせページ
              </Link>
              をご確認ください。
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
