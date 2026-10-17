'use client';

import { Suspense, useState } from 'react';
import {
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { App, Avatar, Button, Upload } from 'antd';
import type { UploadProps } from 'antd';
import {
  LockOutlined,
  MessageOutlined,
  SettingOutlined,
  UserOutlined,
  HistoryOutlined,
} from '@ant-design/icons';

import ProfileSettings from '@/components/account/ProfileSettings';
import PasswordSettings from '@/components/account/PasswordSettings';

import { useAuthStore } from '@/stores/useAuthStore';

import styles from './page.module.css';
import MessageCenter from "@/components/messages/MessageCenter";
import BrowsingHistory from "@/components/account/BrowsingHistory";

type SettingTab =
  | 'profile'
  | 'password'
  | 'messages'
  | 'history';

const settings = [
  {
    key: 'profile' as const,
    label: '基本情報',
    icon: <SettingOutlined />,
  },
  {
    key: 'messages' as const,
    label: 'メッセージ',
    icon: <MessageOutlined />,
  },
  {
    key: 'history' as const,
    label: '閲覧履歴',
    icon: <HistoryOutlined />,
  },
  {
    key: 'password' as const,
    label: 'パスワード変更',
    icon: <LockOutlined />,
  },
];

const headings: Record<
  SettingTab,
  { title: string; description: string }
> = {
  profile: {
    title: '基本情報',
    description: '表示名や連絡先を変更できます。',
  },
  messages: {
    title: 'メッセージ',
    description: 'お部屋について、担当者に相談できます。',
  },
  history: {
    title: '閲覧履歴',
    description: '最近チェックしたお部屋を確認できます。',
  },
  password: {
    title: 'パスワード変更',
    description: 'アカウントのパスワードを変更します。',
  },
};

function AccountContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { message } = App.useApp();

  const user = useAuthStore((state) => state.user);
  const openLogin = useAuthStore((state) => state.openLogin);
  const updateProfile = useAuthStore(
    (state) => state.updateProfile,
  );

  const [uploading, setUploading] = useState(false);

  // 根据 URL 决定显示哪个组件。
  const tab = searchParams.get('tab');

  const activeTab: SettingTab =
    tab === 'messages' ||
    tab === 'password' ||
    tab === 'history'
      ? tab
      : 'profile';

  const handleTabChange = (nextTab: SettingTab) => {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (nextTab === 'profile') {
      params.delete('tab');
    } else {
      params.set('tab', nextTab);
    }

    const query = params.toString();

    router.push(
      query ? `${pathname}?${query}` : pathname,
      { scroll: false },
    );
  };

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(
        file.type,
      )
    ) {
      message.error('JPEG・PNG・WebPの画像を選択してください');
      return Upload.LIST_IGNORE;
    }

    if (file.size > 2 * 1024 * 1024) {
      message.error('画像のサイズは2MB以下にしてください');
      return Upload.LIST_IGNORE;
    }

    setUploading(true);

    const reader = new FileReader();
    const uploadingUserId = user?.id;

    reader.onload = () => {
      const currentUser = useAuthStore.getState().user;

      if (
        typeof reader.result === 'string' &&
        currentUser &&
        currentUser.id === uploadingUserId
      ) {
        updateProfile({
          avatar: reader.result,
        });

        message.success('プロフィール画像を更新しました');
      }

      setUploading(false);
    };

    reader.onerror = () => {
      setUploading(false);
      message.error('画像を読み込めませんでした');
    };

    reader.readAsDataURL(file);

    // 暂时仅在浏览器内读取，不上传到服务器。
    return false;
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <section className={styles.loginPanel}>
          <h1>マイページ</h1>
          <p>ログインしてアカウント情報を確認できます。</p>

          <Button
            type="primary"
            onClick={() => openLogin()}
          >
            ログイン
          </Button>
        </section>
      </div>
    );
  }

  const heading = headings[activeTab];

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>マイページ</h1>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.userInfo}>
            <Upload
              accept="image/jpeg,image/png,image/webp"
              beforeUpload={beforeUpload}
              showUploadList={false}
              disabled={uploading}
            >
              <button
                type="button"
                className={styles.avatarButton}
                disabled={uploading}
                aria-label="プロフィール画像を変更"
              >
                <Avatar
                  size={80}
                  src={user.avatar}
                  icon={<UserOutlined />}
                  className={styles.avatar}
                />

                <span className={styles.avatarOverlay}>
                  {uploading ? '読込中' : '変更'}
                </span>
              </button>
            </Upload>

            <p className={styles.avatarHint}>
              クリックして画像を変更
            </p>

            <h2 className={styles.nickname}>
              {user.nickname}
            </h2>

            <p className={styles.userLabel}>
              @{user.username}
            </p>
          </div>

          <nav
            className={styles.menu}
            aria-label="マイページメニュー"
          >
            {settings.map((setting) => (
              <button
                key={setting.key}
                type="button"
                className={`${styles.menuButton} ${
                  activeTab === setting.key
                    ? styles.active
                    : ''
                }`}
                onClick={() => handleTabChange(setting.key)}
                aria-current={
                  activeTab === setting.key
                    ? 'true'
                    : undefined
                }
              >
                {setting.icon}
                <span>{setting.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section
          className={`${styles.content} ${
            activeTab === 'messages'
              ? styles.messageContent
              : ''
          }`}
        >
          <header className={styles.contentHeading}>
            <h2>{heading.title}</h2>
            <p>{heading.description}</p>
          </header>

          {activeTab === 'profile' && (
            <div className={styles.formArea}>
              <ProfileSettings key={user.id} />
            </div>
          )}
          {activeTab === 'history' && (
            <BrowsingHistory key={user.id} />
          )}
          {activeTab === 'password' && (
            <div className={styles.formArea}>
              <PasswordSettings />
            </div>
          )}

          {/* 保持挂载，切换菜单时保留本地会话状态。 */}
          <div hidden={activeTab !== 'messages'}>
            <MessageCenter
              key={user.id}
              user={user}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          読み込み中...
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
