import type { Metadata } from 'next';
import Link from 'next/link';

import styles from '../info.module.css';

export const metadata: Metadata = {
  title: 'よくあるご質問',
};

const questions = [
  {
    question: '掲載物件に申し込めますか？',
    answer:
      '掲載物件は開発用のサンプルです。実際の申し込み、内見予約、賃貸契約には対応していません。',
  },
  {
    question: '物件はどのように検索できますか？',
    answer:
      '物件名、エリア、駅、賃料、間取り、築年数、設備などで検索できます。地図から周辺の物件を探すこともできます。',
  },
  {
    question: 'お気に入りにはログインが必要ですか？',
    answer:
      'はい。ログイン後、物件のハートボタンから登録・解除できます。現在のログインはデモ機能です。',
  },
  {
    question: '地図で現在地を取得できません。',
    answer:
      'ブラウザの位置情報の許可をご確認ください。現在地への移動は、地図に設定された対応範囲内で利用できます。',
  },
  {
    question: '間取り図が表示されません。',
    answer:
      '間取り図が未登録の物件では「間取り図は準備中」と表示されます。',
  },
  {
    question: 'プロフィールを変更できますか？',
    answer:
      'マイページでニックネームやプロフィールを編集できます。左側のアバターをクリックすると画像を変更できます。',
  },
  {
    question: '担当者に連絡できますか？',
    answer:
      '連絡機能は開発中です。デモの物件情報を使って実際の問い合わせを行わないでください。',
  },
];

export default function FaqPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="パンくず">
        <Link href="/">ホーム</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">よくあるご質問</span>
      </nav>

      <header className={styles.heading}>
        <p className={styles.eyebrow}>FAQ</p>
        <h1 className={styles.title}>よくあるご質問</h1>
        <p className={styles.description}>
          お部屋探しやデモ機能に関するご案内。
        </p>
      </header>

      <div className={styles.content}>
        {questions.map((item) => (
          <details
            key={item.question}
            className={styles.section}
          >
            <summary className={styles.question}>
              {item.question}
            </summary>

            <p className={styles.answer}>
              {item.answer}
            </p>
          </details>
        ))}

        <section className={styles.section}>
          <h2>その他のお問い合わせ</h2>
          <p>
            <Link href="/contact">
              お問い合わせページ
            </Link>
            をご確認ください。
          </p>
        </section>
      </div>
    </div>
  );
}
