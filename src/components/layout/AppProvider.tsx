'use client';

import { App, ConfigProvider } from 'antd';
import jaJP from 'antd/locale/ja_JP';

import LoginModal from '@/components/auth/LoginModal';
import React from "react";

export default function AppProvider({
                                      children,
                                    }: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider
      locale={jaJP}
      theme={{
        token: {
          // 主色及交互状态
          colorPrimary: '#145447',
          colorPrimaryHover: '#216857',
          colorPrimaryActive: '#0d3d33',
          colorPrimaryBg: '#edf5f0',
          colorPrimaryBgHover: '#deece3',
          colorPrimaryBorder: '#b7d3c2',
          colorPrimaryBorderHover: '#83b39a',

          // 链接
          colorLink: '#145447',
          colorLinkHover: '#216857',
          colorLinkActive: '#0d3d33',

          // 信息提示
          colorInfo: '#145447',

          // 基础样式
          colorText: '#1f2937',
          colorBgLayout: '#f7f9f8',
          colorBorder: '#e2e8e5',
          borderRadius: 8,
          controlHeight: 40,
          fontFamily: 'Arial, "Yu Gothic", Meiryo, sans-serif',
        },

        components: {
          Input: {
            activeShadow: '0 0 0 2px rgba(20, 84, 71, 0.12)',
          },
          InputNumber: {
            activeShadow: '0 0 0 2px rgba(20, 84, 71, 0.12)',
          },
          Select: {
            activeOutlineColor: 'rgba(20, 84, 71, 0.12)',
            optionSelectedBg: '#edf5f0',
          },
        },
      }}
    >
      <App message={{ duration: 2 }}>
        {children}
        <LoginModal />
      </App>
    </ConfigProvider>
  );
}
