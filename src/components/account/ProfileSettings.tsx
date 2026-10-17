'use client';

import { App, Button, Form, Input } from 'antd';

import { useAuthStore } from '@/stores/useAuthStore';
import styles from './css/ProfileSettings.module.css';

interface ProfileValues {
  nickname: string;
  email: string;
  phone: string;
}

export default function ProfileSettings() {
  const { message } = App.useApp();
  const [form] = Form.useForm<ProfileValues>();

  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  function handleSubmit(values: ProfileValues) {
    const profile = {
      nickname: values.nickname.trim(),
      email: (values.email ?? '').trim(),
      phone: (values.phone ?? '').trim(),
    };

    updateProfile(profile);
    form.setFieldsValue(profile);
    message.success('プロフィールを更新しました');
  }

  function handleCancel() {
    // 恢复当前已保存的值，而不是最初打开页面时的值
    const currentUser = useAuthStore.getState().user;

    form.setFieldsValue({
      nickname: currentUser?.nickname ?? '',
      email: currentUser?.email ?? '',
      phone: currentUser?.phone ?? '',
    });

    form.setFields(
      (['nickname', 'email', 'phone'] as const).map((name) => ({
        name,
        errors: [],
        warnings: [],
      })),
    );
  }

  return (
    <Form<ProfileValues>
      form={form}
      layout="vertical"
      initialValues={{
        nickname: user?.nickname ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
      }}
      onFinish={handleSubmit}
      requiredMark={false}
    >
      <Form.Item
        label="ユーザー名"
        extra="ログインに使用するユーザー名です。変更できません。"
      >
        <Input value={user?.username ?? ''} disabled />
      </Form.Item>

      <Form.Item
        name="nickname"
        label="表示名"
        rules={[
          {
            required: true,
            whitespace: true,
            message: '表示名を入力してください',
          },
          {
            max: 32,
            message: '32文字以内で入力してください',
          },
        ]}
      >
        <Input
          maxLength={32}
          placeholder="表示名"
          autoComplete="nickname"
        />
      </Form.Item>

      <Form.Item
        name="email"
        label="メールアドレス"
        extra="任意項目です。現在は連絡先の入力のみで、メール認証は行いません。"
        normalize={(value: string) => value.trim()}
        rules={[
          {
            type: 'email',
            message: '有効なメールアドレスを入力してください',
          },
          {
            max: 254,
            message: '254文字以内で入力してください',
          },
        ]}
      >
        <Input
          type="email"
          placeholder="example@email.com"
          autoComplete="email"
          maxLength={254}
        />
      </Form.Item>

      <Form.Item
        name="phone"
        label="電話番号"
        extra="任意項目です。ハイフンや国番号も入力できます。"
        normalize={(value: string) => value.trim()}
        rules={[
          {
            pattern: /^\+?[0-9 ()-]{7,25}$/,
            message: '電話番号の形式を確認してください',
          },
        ]}
      >
        <Input
          type="tel"
          placeholder="090-1234-5678"
          autoComplete="tel"
          maxLength={25}
        />
      </Form.Item>

      <div className={styles.actions}>
        <Button type="primary" htmlType="submit">
          変更を保存
        </Button>

        <Button htmlType="button" onClick={handleCancel}>
          キャンセル
        </Button>
      </div>
    </Form>
  );
}
