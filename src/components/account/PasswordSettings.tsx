'use client';

import {App, Button, Form, Input} from 'antd';

interface PasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function PasswordSettings() {
  const [form] = Form.useForm<PasswordValues>();
  const { message } = App.useApp();

  function handleSubmit() {
    message.info(
      '入力チェックが完了しました。API未接続のため、パスワードは変更されていません。',
    );
    form.resetFields();
  }

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="currentPassword"
          label="現在のパスワード"
          rules={[
            {
              required: true,
              message: '現在のパスワードを入力してください',
            },
          ]}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="新しいパスワード"
          dependencies={['currentPassword']}
          rules={[
            {
              required: true,
              message: '新しいパスワードを入力してください',
            },
            {
              min: 8,
              message: '8文字以上で入力してください',
            },
            {
              max: 64,
              message: '64文字以内で入力してください',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (
                  !value ||
                  value !== getFieldValue('currentPassword')
                ) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error('現在のパスワードと異なるものを入力してください'),
                );
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="新しいパスワード（確認）"
          dependencies={['newPassword']}
          rules={[
            {
              required: true,
              message: '確認用パスワードを入力してください',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || value === getFieldValue('newPassword')) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error('パスワードが一致しません'),
                );
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          パスワードを変更
        </Button>
      </Form>
    </>
  );
}
