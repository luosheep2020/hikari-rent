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

type LoginValues = {
  email: string;
  password: string;
};

type RegisterValues = {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
};

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

  const handleClose = () => {
    closeLogin();
  };

  const handleAfterClose = () => {
    setMode('login');
    setRegisteredEmail('');
  };

  const handleSwitchMode = () => {
    // 只操作当前已经挂载的表单。
    if (mode === 'login') {
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

    // 模拟登录，密码不保存到 Zustand。
    login({
      id: `demo:${email}`,
      username: email,
      nickname: email.split('@')[0],
      email,
      phone: '',
    });

    closeLogin();
    message.success('ログインしました');
  };

  const handleRegister = (values: RegisterValues) => {
    const email = values.email.trim().toLowerCase();

    registerForm.resetFields();

    // 登录表单挂载后通过 initialValues 读取邮箱。
    setRegisteredEmail(email);
    setMode('login');

    message.success(
      '登録フォームの確認が完了しました（デモ）。ログインをお試しください。',
    );
  };

  return (
    <Modal
      open={loginOpen}
      onCancel={handleClose}
      afterClose={handleAfterClose}
      destroyOnHidden
      footer={null}
      width={440}
      centered
      title={isLogin ? 'ログイン' : '新規登録'}
      className={styles.modal}
    >
      <div className={styles.heading}>
        <span className={styles.brand}>Hikari Rent</span>

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
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined />}
              placeholder="example@email.com"
              autoComplete="username"
              inputMode="email"
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
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="パスワードを入力"
              autoComplete="current-password"
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
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'ニックネームを入力してください',
              },
              {
                max: 30,
                message: '30文字以内で入力してください',
              },
            ]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="表示するお名前"
              autoComplete="nickname"
              maxLength={30}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="メールアドレス"
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
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined />}
              placeholder="example@email.com"
              autoComplete="email"
              inputMode="email"
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
                min: 8,
                message: '8文字以上で入力してください',
              },
              {
                max: 72,
                message: '72文字以内で入力してください',
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="8文字以上"
              autoComplete="new-password"
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
