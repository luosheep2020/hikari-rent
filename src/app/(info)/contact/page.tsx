import type { Metadata } from 'next';
import Link from 'next/link';

import ContactForm from './ContactForm';
import styles from '../info.module.css';

export const metadata: Metadata = {
  title: 'お問い合わせ',
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="パンくず">
        <Link href="/">ホーム</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">お問い合わせ</span>
      </nav>

      <header className={styles.heading}>
        <p className={styles.eyebrow}>CONTACT</p>
        <h1 className={styles.title}>お問い合わせ</h1>
        <p className={styles.description}>
          サービスに関するご質問やご意見はこちら。
        </p>
      </header>

      <p className={styles.notice}>
        現在はフォーム操作のデモです。
        入力内容の送信・保存は行われません。
        デモ用の情報をご入力ください。
      </p>

      <div className={styles.content}>
        <ContactForm />
      </div>
    </div>
  );
}
