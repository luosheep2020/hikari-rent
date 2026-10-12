import type { Metadata } from 'next';
import Link from 'next/link';

import styles from '../info.module.css';

export const metadata: Metadata = {
  title: '利用規約',
};

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="パンくず">
        <Link href="/">ホーム</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">利用規約</span>
      </nav>

      <header className={styles.heading}>
        <p className={styles.eyebrow}>TERMS OF USE</p>
        <h1 className={styles.title}>利用規約</h1>
        <p className={styles.description}>
          デモサイトをご利用いただく際のお願い。
        </p>
      </header>

      <p className={styles.notice}>
        このページはデモ版に関する利用説明です。
        実際の不動産サービスに適用する規約ではありません。
      </p>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>1. サービスについて</h2>
          <p>
            Hikari Rentは賃貸住宅検索の操作を体験できる
            ポートフォリオサイトです。
            実際の契約、予約、仲介および決済は行いません。
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. 掲載情報について</h2>
          <p>
            物件名、所在地、賃料、設備、担当者などはサンプル情報です。
            実際の空室状況や契約条件を示すものではありません。
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. アカウント機能について</h2>
          <p>
            現在のログイン・登録はデモ機能です。
            実際の本人認証やアカウント作成は行われません。
            デモ操作には架空の情報をご使用ください。
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. ご利用時のお願い</h2>
          <ul>
            <li>第三者の個人情報を入力しないでください。</li>
            <li>
              不正アクセスやサービスを妨げる操作はお控えください。
            </li>
            <li>
              掲載内容を実在する物件の募集情報として
              使用しないでください。
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. デモ版の変更について</h2>
          <p>
            開発に伴い機能や掲載内容を変更する場合があります。
            デモデータは初期化されることがあります。
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. データの取り扱い</h2>
          <p>
            <Link href="/privacy">
              プライバシーポリシー
            </Link>
            をご確認ください。
          </p>
        </section>
      </div>
    </div>
  );
}
