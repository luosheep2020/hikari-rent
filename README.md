# Hikari Rent

**くらしに、ひかりを。**

日本の賃貸物件を、エリアや駅、地図から探せるWebアプリです。このリポジトリでは、入居希望者向けのフロントエンドを管理しています。

## 主な機能

- **物件検索**：エリア・駅・賃料・間取り・設備などで絞り込み、結果を並べ替え
- **地図検索**：地図の表示範囲内にある物件を確認し、現在地周辺からも検索
- **物件詳細**：写真・間取り図、初期費用、設備、契約条件、担当者情報を表示
- **マイページ**：アカウント登録・ログイン、お気に入り、閲覧履歴、プロフィール編集
- **物件相談**：物件の担当者とメッセージでやり取り

## 技術スタック

| 用途 | 技術 |
| --- | --- |
| フロントエンド | Next.js (App Router)、React、TypeScript |
| UI・状態管理 | Ant Design、CSS Modules、Zustand |
| 地図 | Google Maps JavaScript API |
| API通信 | Fetch API、JWT認証 |
| バックエンド（別リポジトリ） | Spring Boot、Spring Security、MyBatis-Plus、MySQL |

## English

Hikari Rent is a portfolio web app for finding rental properties in Japan.

- **Search:** Filter by area, train station, rent, layout, and amenities. Browse listings on a map or search near your current location.
- **Property details:** View photos, floor plans, move-in costs, lease terms, and agent information.
- **Account:** Register or sign in, save favorites, review browsing history, and edit your profile.
- **Messaging:** Contact the agent about a property.

The frontend uses Next.js, TypeScript, Ant Design, and Zustand. It connects to a Spring Boot API maintained in a separate repository.
