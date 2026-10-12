'use client';

import {useState} from 'react';
import {App, Avatar, Button, Upload} from 'antd';
import type {UploadProps} from 'antd';
import {
  LockOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';

import ProfileSettings from '@/components/account/ProfileSettings';
import PasswordSettings from '@/components/account/PasswordSettings';
import {useAuthStore} from '@/stores/useAuthStore';

import styles from './page.module.css';

type SettingTab = 'profile' | 'password';

const settings = [
  {
    key: 'profile' as const,
    label: '基本情報',
    icon: <SettingOutlined/>,
  },
  {
    key: 'password' as const,
    label: 'パスワード変更',
    icon: <LockOutlined/>,
  },
];

export default function AccountPage() {
  const user = useAuthStore((state) => state.user);
  const openLogin = useAuthStore((state) => state.openLogin);

  const [activeTab, setActiveTab] = useState<SettingTab>('profile');
  const {message} = App.useApp();

  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [uploading, setUploading] = useState(false);

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      message.error('JPEG・PNG・WebPの画像を選択してください');
      return Upload.LIST_IGNORE;
    }

    if (file.size > 2 * 1024 * 1024) {
      message.error('画像のサイズは2MB以下にしてください');
      return Upload.LIST_IGNORE;
    }

    setUploading(true);

    const reader = new FileReader();

    reader.onload = () => {
      const currentUser = useAuthStore.getState().user;

      if (
        typeof reader.result === 'string' &&
        currentUser &&
        currentUser.id === user?.id
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

    // 暂时仅本地读取，不发送上传请求
    return false;
  };
  if (!user) {
    return (
      <div className={styles.container}>
        <section className={styles.loginPanel}>
          <h1>マイページ</h1>
          <p>ログインしてアカウント情報を確認できます。</p>
          <Button type="primary" onClick={() => openLogin()}>
            ログイン
          </Button>
        </section>
      </div>
    );
  }

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
                  icon={<UserOutlined/>}
                  className={styles.avatar}
                />

                <span className={styles.avatarOverlay}>
      {uploading ? '読込中' : '変更'}
    </span>
              </button>
            </Upload>
            <p className={styles.avatarHint}>クリックして画像を変更</p>
            <h2 className={styles.nickname}>{user.nickname}</h2>
            <p className={styles.userLabel}>@{user.username}</p>
          </div>

          <nav className={styles.menu} aria-label="アカウント設定">
            {settings.map((setting) => (
              <button
                key={setting.key}
                type="button"
                className={`${styles.menuButton} ${
                  activeTab === setting.key ? styles.active : ''
                }`}
                onClick={() => setActiveTab(setting.key)}
                aria-current={
                  activeTab === setting.key ? 'true' : undefined
                }
              >
                {setting.icon}
                <span>{setting.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className={styles.content}>
          <header className={styles.contentHeading}>
            <h2>
              {activeTab === 'profile' ? '基本情報' : 'パスワード変更'}
            </h2>
            <p>
              {activeTab === 'profile'
                ? '表示名や連絡先を変更できます。'
                : 'アカウントのパスワードを変更します。'}
            </p>
          </header>

          <div className={styles.formArea}>
            {activeTab === 'profile' ? (
              <ProfileSettings key={user.id}/>
            ) : (
              <PasswordSettings/>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
