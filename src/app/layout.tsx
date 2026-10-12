import React from "react";
import type {Metadata} from 'next';
import {AntdRegistry} from '@ant-design/nextjs-registry';
import AppProvider from '@/components/layout/AppProvider';
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css';



export const metadata: Metadata = {
  title: {default: 'Hikari Rent | お部屋探し', template: '%s  | Hikari Rent'},
  description: 'エリアや地図から、あなたに合う賃貸のお部屋を探せます。',
};
export default function RootLayout({children}: { children: React.ReactNode }) {
  return <html lang="ja">
  <body>
  <AntdRegistry><AppProvider>
    <div className="site-layout">
      <Header/>
      <main className="site-main">{children}</main>
      <Footer/>
    </div>
  </AppProvider></AntdRegistry></body>
  </html>;
}
