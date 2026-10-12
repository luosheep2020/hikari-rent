'use client';

import Link from 'next/link';
import { HomeOutlined } from '@ant-design/icons';
import styles from './Footer.module.css';
const links = [
  { href: '/about', label: '会社概要' },
  { href: '/terms', label: '利用規約' },
  { href: '/privacy', label: 'プライバシーポリシー' },
  { href: '/faq', label: 'よくあるご質問' },
  { href: '/contact', label: 'お問い合わせ' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <HomeOutlined className={styles.brandIcon} />

          <div>
            <span className={styles.brandName}>Hikari Rent</span>
            <span className={styles.tagline}>
              くらしに、ひかりを。
            </span>
          </div>
        </Link>

        <nav className={styles.links} aria-label="フッターナビゲーション">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.information}>
          <p>WENJIE LUO</p>
          <small>Copyright ©2026 Hikari Rent</small>
        </div>
      </div>
    </footer>
  );
}
