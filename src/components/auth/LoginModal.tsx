'use client';

import { useRef, useState } from 'react';
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

import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import { useAuthStore } from '@/stores/useAuthStore';

import type {
  LoginRequest,
  RegisterRequest,
} from '@/types/auth';

import styles from './css/LoginModal.module.css';

type AuthMode = 'login' | 'register';

const EMAIL_MAX_LENGTH = 254;
const NICKNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 20;

function getAuthErrorMessage(
  error: unknown,
  mode: AuthMode,
): string {
  if (!(error instanceof ApiError)) {
    return '通信に失敗しました。接続を確認して、もう一度お試しください。';
  }

  switch (error.status) {
    case 400:
      return '入力内容を確認してください。';

    case 401:
      return mode === 'login'
        ? 'メールアドレスまたはパスワードが正しくありません。'
        : '登録できませんでした。もう一度お試しください。';

    case 409:
      return mode === 'register'
        ? 'このメールアドレスはすでに登録されています。'
        : '処理を完了できませんでした。もう一度お試しください。';

    case 429:
      return '試行回数が多すぎます。しばらくしてからお試しください。';

    case 503:
      return '現在サービスを利用できません。しばらくしてからお試しください。';

    default:
      return mode === 'login'
        ? 'ログインに失敗しました。もう一度お試しください。'
        : '登録に失敗しました。もう一度お試しください。';
  }
}

export default function LoginModal() {
  const { message } = App.useApp();

  const loginOpen = useAuthStore(
    (state) => state.loginOpen,
  );

  const closeLogin = useAuthStore(
    (state) => state.closeLogin,
  );

  const login = useAuthStore(
    (state) => state.login,
  );

  const [mode, setMode] = useState<AuthMode>('login');

  const [registeredEmail, setRegisteredEmail] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  const submittingRef = useRef(false);

  const isLogin = mode === 'login';

  function handleAfterClose() {
    setMode('login');
    setRegisteredEmail('');
  }

  function handleClose() {
    if (submittingRef.current) {
      return;
    }

    closeLogin();
  }

  function handleSwitchMode() {
    if (submittingRef.current) {
      return;
    }

    setRegisteredEmail('');

    // Switching forms clears their values through unmounting.
    setMode((current) =>
      current === 'login' ? 'register' : 'login',
    );
  }

  async function handleLogin(values: LoginRequest) {
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const result = await authApi.login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      // Save the authenticated session and close the modal.
      login(result);

      message.success('ログインしました');

    } catch (error) {
      message.error(
        getAuthErrorMessage(error, 'login'),
      );

    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  async function handleRegister(
    values: RegisterRequest,
  ) {
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    const email = values.email
      .trim()
      .toLowerCase();

    try {
      await authApi.register({
        nickname: values.nickname.trim(),
        email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      // Prefill only the email; never copy or persist passwords.
      setRegisteredEmail(email);
      setMode('login');

      message.success(
        'アカウントを作成しました。ログインしてください。',
      );

    } catch (error) {
      message.error(
        getAuthErrorMessage(error, 'register'),
      );

    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

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
      closable={{ disabled: submitting }}
      keyboard={!submitting}
      mask={{ closable: !submitting }}
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
        <Form<LoginRequest>
          key="login"
          initialValues={{
            email: registeredEmail,
          }}
          clearOnDestroy
          preserve={false}
          layout="vertical"
          requiredMark={false}
          disabled={submitting}
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
            loading={submitting}
            className={styles.submitButton}
          >
            ログイン
          </Button>
        </Form>
      ) : (
        <Form<RegisterRequest>
          key="register"
          clearOnDestroy
          preserve={false}
          layout="vertical"
          requiredMark={false}
          disabled={submitting}
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
                    !value
                    || getFieldValue('password') === value
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
            loading={submitting}
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
          disabled={submitting}
          className={styles.switchButton}
        >
          {isLogin ? '新規登録' : 'ログイン'}
        </button>
      </div>

      {!isLogin && (
        <p className={styles.demoNote}>
          登録後はログイン画面からログインしてください。
        </p>
      )}
    </Modal>
  );
}
