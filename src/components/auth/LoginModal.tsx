'use client';

import { useState } from 'react';
import {
  App,
  Button,
  Form,
  Input,
  Modal,
} from 'antd';
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { useAuthStore } from '@/stores/useAuthStore';
import styles from './css/LoginModal.module.css';

type AuthMode = 'login' | 'register';

interface LoginValues {
  email: string;
  password: string;
}

interface RegisterValues {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const EMAIL_MAX_LENGTH = 254;
const NICKNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 20;

export default function LoginModal() {
  const { message } = App.useApp();

  const loginOpen = useAuthStore((state) => state.loginOpen);
  const closeLogin = useAuthStore((state) => state.closeLogin);
  const login = useAuthStore((state) => state.login);

  const [mode, setMode] = useState<AuthMode>('login');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [loginForm] = Form.useForm<LoginValues>();
  const [registerForm] = Form.useForm<RegisterValues>();

  const isLogin = mode === 'login';

  const handleAfterClose = () => {
    setMode('login');
    setRegisteredEmail('');
  };

  const handleSwitchMode = () => {
    // Reset only the currently mounted form.
    if (isLogin) {
      loginForm.resetFields();
    } else {
      registerForm.resetFields();
    }

    setRegisteredEmail('');

    setMode((current) =>
      current === 'login' ? 'register' : 'login',
    );
  };

  const handleLogin = (values: LoginValues) => {
    const email = values.email.trim().toLowerCase();

    // Demo authentication; never store passwords in Zustand.
    login({
      id: `demo:${email}`,
      username: email,
      nickname: email
        .split('@')[0]
        .slice(0, NICKNAME_MAX_LENGTH),
      email,
      phone: '',
    });

    closeLogin();
    message.success('ログインしました');
  };

  const handleRegister = (values: RegisterValues) => {
    const email = values.email.trim().toLowerCase();

    registerForm.resetFields();

    // Prefill the login form after it mounts.
    setRegisteredEmail(email);
    setMode('login');

    message.success(
      '登録フォームの確認が完了しました（デモ）。ログインをお試しください。',
    );
  };

  return (
    <Modal
      open={loginOpen}
      onCancel={() => closeLogin()}
      afterClose={handleAfterClose}
      destroyOnHidden
      footer={null}
      width={440}
      centered
      title={isLogin ? 'ログイン' : '新規登録'}
      className={styles.modal}
    >
      <div className={styles.heading}>
        <span className={styles.brand}>
          Hikari Rent
        </span>

        <p className={styles.description}>
          {isLogin
            ? 'お気に入りのお部屋を、もっと身近に。'
            : 'アカウントを作成して、お部屋探しを始めましょう。'}
        </p>
      </div>

      {isLogin ? (
        <Form<LoginValues>
          key="login"
          form={loginForm}
          initialValues={{ email: registeredEmail }}
          clearOnDestroy
          layout="vertical"
          requiredMark={false}
          onFinish={handleLogin}
          className={styles.form}
        >
          <Form.Item
            name="email"
            label="メールアドレス"
            normalize={(value: string) => value.trim()}
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'メールアドレスを入力してください',
              },
              {
                type: 'email',
                message: '有効なメールアドレスを入力してください',
              },
              {
                max: EMAIL_MAX_LENGTH,
                message: '254文字以内で入力してください',
              },
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined />}
              placeholder="example@email.com"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={EMAIL_MAX_LENGTH}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="パスワード"
            rules={[
              {
                required: true,
                message: 'パスワードを入力してください',
              },
              {
                min: PASSWORD_MIN_LENGTH,
                message: '8文字以上で入力してください',
              },
              {
                max: PASSWORD_MAX_LENGTH,
                message: '20文字以内で入力してください',
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="8〜20文字"
              autoComplete="current-password"
              maxLength={PASSWORD_MAX_LENGTH}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            className={styles.submitButton}
          >
            ログイン
          </Button>
        </Form>
      ) : (
        <Form<RegisterValues>
          key="register"
          form={registerForm}
          clearOnDestroy
          layout="vertical"
          requiredMark={false}
          onFinish={handleRegister}
          className={styles.form}
        >
          <Form.Item
            name="nickname"
            label="ニックネーム"
            normalize={(value: string) => value.trim()}
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'ニックネームを入力してください',
              },
              {
                max: NICKNAME_MAX_LENGTH,
                message: '20文字以内で入力してください',
              },
            ]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="表示するお名前"
              autoComplete="nickname"
              maxLength={NICKNAME_MAX_LENGTH}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="メールアドレス"
            normalize={(value: string) => value.trim()}
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'メールアドレスを入力してください',
              },
              {
                type: 'email',
                message: '有効なメールアドレスを入力してください',
              },
              {
                max: EMAIL_MAX_LENGTH,
                message: '254文字以内で入力してください',
              },
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined />}
              placeholder="example@email.com"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={EMAIL_MAX_LENGTH}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="パスワード"
            extra="8〜20文字で入力してください。"
            rules={[
              {
                required: true,
                message: 'パスワードを入力してください',
              },
              {
                min: PASSWORD_MIN_LENGTH,
                message: '8文字以上で入力してください',
              },
              {
                max: PASSWORD_MAX_LENGTH,
                message: '20文字以内で入力してください',
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="8〜20文字"
              autoComplete="new-password"
              maxLength={PASSWORD_MAX_LENGTH}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="パスワード（確認）"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: '確認用パスワードを入力してください',
              },
              {
                max: PASSWORD_MAX_LENGTH,
                message: '20文字以内で入力してください',
              },
              ({ getFieldValue }) => ({
                validator(_, value: string | undefined) {
                  if (
                    !value ||
                    getFieldValue('password') === value
                  ) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error('パスワードが一致しません'),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="もう一度入力"
              autoComplete="new-password"
              maxLength={PASSWORD_MAX_LENGTH}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            className={styles.submitButton}
          >
            アカウントを作成
          </Button>
        </Form>
      )}

      <div className={styles.switchSection}>
        <span className={styles.switchText}>
          {isLogin
            ? 'アカウントをお持ちでない方'
            : 'すでにアカウントをお持ちの方'}
        </span>

        <button
          type="button"
          onClick={handleSwitchMode}
          className={styles.switchButton}
        >
          {isLogin ? '新規登録' : 'ログイン'}
        </button>
      </div>

      <p className={styles.demoNote}>
        現在はデモ版です。アカウントの作成・認証は行われません。
      </p>
    </Modal>
  );
}
