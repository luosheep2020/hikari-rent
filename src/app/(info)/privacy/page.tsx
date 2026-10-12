import type { Metadata } from 'next';
import Link from 'next/link';

import styles from '../info.module.css';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="パンくず">
        <Link href="/">ホーム</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">プライバシーポリシー</span>
      </nav>

      <header className={styles.heading}>
        <p className={styles.eyebrow}>PRIVACY POLICY</p>
        <h1 className={styles.title}>
          プライバシーポリシー
        </h1>
        <p className={styles.description}>
          デモ版における入力情報の取り扱い。
        </p>
      </header>

      <p className={styles.notice}>
        本ページは現在のデモ実装に関する説明です。
        認証・保存・送信機能を追加した際は、
        実装に合わせて更新します。
      </p>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>1. ログイン・プロフィール情報</h2>
          <p>
            入力されたメールアドレスやプロフィール情報は、
            ブラウザ内の一時的な状態として使用します。
            現在はアプリの認証サーバーへの送信を行いません。
          </p>
          <p>
            パスワードはユーザー状態に保存しません。
            デモ操作には架空の情報をご使用ください。
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. アバター画像</h2>
          <p>
            選択した画像はブラウザ内で読み込み、
            プロフィール表示に使用します。
            現在はアプリのサーバーへアップロードしません。
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. 位置情報・地図</h2>
          <p>
            現在地を取得する際は、ブラウザの許可を得て
            位置情報を使用し、地図の表示位置を変更します。
            現在地をアプリのデータベースに保存する処理はありません。
          </p>
          <p>
            地図表示にはGoogle Mapsを使用し、
            地図の読み込みに伴うGoogleへの通信が発生します。
            詳細は
            <a
              href="https://policies.google.com/privacy?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
            >
              Googleのプライバシーポリシー
            </a>
            をご確認ください。
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. お問い合わせフォーム</h2>
          <p>
            現在は入力確認のデモです。
            入力内容のメール送信やデータベース保存は行いません。
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. 公開時の更新</h2>
          <p>
            公開環境で使用するサービスやログ、
            アクセス解析などの構成が決まった際は、
            その内容を確認して本ページを更新します。
          </p>
        </section>
      </div>
    </div>
  );
}
