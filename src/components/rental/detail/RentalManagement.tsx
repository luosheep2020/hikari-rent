'use client';

import { Button } from 'antd';
import { BankOutlined, MailOutlined } from '@ant-design/icons';

import type { RentalDetail } from '@/types/rental';
import styles from '@/components/rental/detail/css/RentalManagement.module.css';

export default function RentalManagement({
                                           rental,
                                         }: {
  rental: RentalDetail;
}) {
  const company = rental.managementCompany;

  const mailHref = company.email
    ? `mailto:${company.email}?subject=${encodeURIComponent(
      `【Hikari Rent】${rental.name}について`,
    )}&body=${encodeURIComponent(
      `物件名：${rental.name}\n物件ID：${rental.id}\n\nお問い合わせ内容：\n`,
    )}`
    : undefined;

  return (
    <section className={styles.panel}>
      <div className={styles.information}>
        <h2 className={styles.title}>管理会社・お問い合わせ</h2>

        <div className={styles.company}>
          <div className={styles.icon} aria-hidden="true">
            <BankOutlined />
          </div>

          <div className={styles.companyDetails}>
            <h3 className={styles.name}>{company.name}</h3>
            <p className={styles.address}>{company.address}</p>

            {company.licenseNumber && (
              <p className={styles.license}>
                {company.licenseNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      <Button
        type="primary"
        size="large"
        icon={<MailOutlined />}
        href={mailHref}
        disabled={!company.email}
        className={styles.emailButton}
      >
        {company.email
          ? 'メールでお問い合わせ'
          : 'メールアドレスは準備中'}
      </Button>

      <p className={styles.note}>
        掲載情報はサンプルです。
        <br />
        詳細は担当者にご確認ください。
      </p>
    </section>
  );
}
