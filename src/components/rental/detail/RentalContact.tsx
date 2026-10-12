'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { App, Avatar, Button } from 'antd';
import {
  MessageFilled,
  PhoneFilled,
  UserOutlined,
} from '@ant-design/icons';

import type { RentalDetail } from '@/types/rental';
import { useAuthStore } from '@/stores/useAuthStore';

import styles from '@/components/rental/detail/css/RentalContact.module.css';

interface RentalContactProps {
  rental: RentalDetail;
}

export default function RentalContact({
                                        rental,
                                      }: RentalContactProps) {
  const router = useRouter();
  const { message } = App.useApp();

  const user = useAuthStore((state) => state.user);
  const openLogin = useAuthStore((state) => state.openLogin);

  const [phoneViewerId, setPhoneViewerId] = useState<string | null>(
    null,
  );

  const agent = rental.agent;

  const phoneVisible =
    Boolean(user) && phoneViewerId === user?.id;

  function handleChat() {
    if (!user) {
      message.info('担当者に相談するにはログインしてください');
      openLogin();
      return;
    }

    const params = new URLSearchParams({
      rentalId: rental.id,
      agentId: agent.id,
    });

    router.push(`/messages?${params.toString()}`);
  }

  function handleShowPhone() {
    if (!user) {
      message.info('電話番号を確認するにはログインしてください');
      openLogin();
      return;
    }

    setPhoneViewerId(user.id);
  }

  return (
    <section className={styles.panel} aria-label="物件の担当者">
      <h2 className={styles.title}>
        この物件について担当者に相談できます
      </h2>

      <div className={styles.agent}>
        <Avatar
          size={80}
          src={agent.avatar}
          icon={<UserOutlined />}
          className={styles.avatar}
        />

        <div className={styles.agentInfo}>
          <p className={styles.role}>物件担当者</p>
          <h3 className={styles.name}>{agent.name}</h3>
          <p className={styles.company}>{agent.company}</p>
          <p className={styles.hours}>
            営業時間 {agent.businessHours} / {agent.closedDays}定休
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          type="primary"
          icon={<MessageFilled />}
          onClick={handleChat}
          className={styles.chatButton}
          block
        >
          チャットで相談
        </Button>

        {phoneVisible && agent.phone ? (
          <div className={styles.phoneNumber}>
            <PhoneFilled />
            <span>{agent.phone}</span>
          </div>
        ) : (
          <Button
            icon={<PhoneFilled />}
            onClick={handleShowPhone}
            disabled={!agent.phone}
            className={styles.phoneButton}
            block
          >
            {agent.phone ? '電話番号を表示' : '電話番号は準備中'}
          </Button>
        )}
      </div>
    </section>
  );
}
