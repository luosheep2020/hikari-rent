'use client';

import Link from 'next/link';
import {
  App,
  Button,
  Checkbox,
  Form,
  Input,
  Select,
} from 'antd';

import styles from '../info.module.css';

type ContactValues = {
  name: string;
  email: string;
  category: string;
  subject: string;
  content: string;
  accepted: boolean;
};

export default function ContactForm() {
  const { message } = App.useApp();

  const handleFinish = () => {
    message.success(
      '入力内容を確認しました（デモ）。送信・保存は行われていません。',
    );
  };

  return (
    <Form<ContactValues>
      layout="vertical"
      requiredMark="optional"
      onFinish={handleFinish}
      className={styles.contactForm}
    >
      <Form.Item
        name="name"
        label="お名前"
        rules={[
          {
            required: true,
            whitespace: true,
            message: 'お名前を入力してください',
          },
          {
            max: 50,
            message: '50文字以内で入力してください',
          },
        ]}
      >
        <Input
          placeholder="デモ用のお名前"
          autoComplete="name"
          maxLength={50}
        />
      </Form.Item>

      <Form.Item
        name="email"
        label="メールアドレス"
        rules={[
          {
            required: true,
            message: 'メールアドレスを入力してください',
          },
          {
            type: 'email',
            message: '有効なメールアドレスを入力してください',
          },
        ]}
      >
        <Input
          placeholder="example@email.com"
          autoComplete="email"
          inputMode="email"
        />
      </Form.Item>

      <Form.Item
        name="category"
        label="お問い合わせの種類"
        rules={[
          {
            required: true,
            message: '種類を選択してください',
          },
        ]}
      >
        <Select
          placeholder="選択してください"
          options={[
            { value: 'service', label: 'サービスについて' },
            {
              value: 'account',
              label: 'アカウント・マイページについて',
            },
            { value: 'bug', label: '不具合について' },
            { value: 'other', label: 'その他' },
          ]}
        />
      </Form.Item>

      <Form.Item
        name="subject"
        label="件名"
        rules={[
          {
            required: true,
            whitespace: true,
            message: '件名を入力してください',
          },
          {
            max: 100,
            message: '100文字以内で入力してください',
          },
        ]}
      >
        <Input
          placeholder="お問い合わせの件名"
          maxLength={100}
        />
      </Form.Item>

      <Form.Item
        name="content"
        label="お問い合わせ内容"
        rules={[
          {
            required: true,
            whitespace: true,
            message: 'お問い合わせ内容を入力してください',
          },
          {
            max: 2000,
            message: '2000文字以内で入力してください',
          },
        ]}
      >
        <Input.TextArea
          placeholder="デモ用の内容を入力してください"
          autoSize={{ minRows: 6, maxRows: 12 }}
          maxLength={2000}
          showCount
        />
      </Form.Item>

      <Form.Item
        name="accepted"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value: boolean | undefined) =>
              value
                ? Promise.resolve()
                : Promise.reject(
                  new Error('内容をご確認ください'),
                ),
          },
        ]}
      >
        <Checkbox>
          <Link href="/privacy">
            プライバシーポリシー
          </Link>
          と、デモ版では送信されないことを確認しました
        </Checkbox>
      </Form.Item>

      <div className={styles.formFooter}>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          className={styles.submitButton}
        >
          入力内容を確認（デモ）
        </Button>
      </div>
    </Form>
  );
}
