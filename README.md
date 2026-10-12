# Hikari Rent

**くらしに、ひかりを。 — Bringing light to everyday living.**

A portfolio project exploring rental housing search in Japan, built with Next.js, TypeScript, and Ant Design.

日本の賃貸住宅検索をテーマにしたポートフォリオプロジェクトです。Next.js・TypeScript・Ant Designを使用し、物件検索、地図検索、お気に入り、マイページなどを実装しています。

> This README describes the frontend implementation discussed during development. Authentication and property data currently use demo behavior. Backend integration is planned; API client files alone do not mean the backend is connected. Verify the checked-in implementation before publishing this document.
>
> 本READMEは開発中のフロントエンド構成を説明しています。認証と物件データは現在デモ実装です。APIクライアントの作成とバックエンド接続の完了は別の作業です。公開前に実際のコードと説明の一致をご確認ください。

## Contents / 目次

- [English](#english)
  - [Overview](#overview)
  - [Features and status](#features-and-status)
  - [Technology stack](#technology-stack)
  - [Project structure](#project-structure)
  - [Running locally](#running-locally)
  - [API integration](#api-integration)
  - [Deployment](#deployment)
  - [Roadmap](#roadmap)
- [日本語](#日本語)
  - [プロジェクト概要](#プロジェクト概要)
  - [機能と実装状況](#機能と実装状況)
  - [技術スタック](#技術スタック)
  - [ディレクトリと設計](#ディレクトリと設計)
  - [ローカル起動](#ローカル起動)
  - [バックエンド連携](#バックエンド連携)
  - [デプロイ](#デプロイ)
  - [今後の開発](#今後の開発)

## English

### Overview

Hikari Rent provides a Japanese-language interface for discovering rental homes by location, budget, layout, and amenities. The frontend uses a forest-green and white theme across the home page, search results, property details, account pages, and informational pages.

The project is intended to demonstrate practical frontend development and, in a later phase, integration with a Java backend. It is a portfolio demonstration, not an operating real estate brokerage. Sample property names, coordinates, companies, prices, and agents should not be treated as actual listings.

### Features and status

| Area | Frontend functionality | Current limitation |
| --- | --- | --- |
| Home | Hero search, popular areas, newly listed properties | Uses sample data |
| Property search | Name, area, station, rent range, multiple layouts, building age, walking distance, amenities, and occupancy conditions | Filtering currently runs against local data |
| Search results | Result count, sorting, list/card views, pagination, and empty state | Pagination is visible only when enough results exist |
| Filter interaction | Immediate updates for selections, 300ms debounce for rent inputs, and slider submission on release | No server requests yet |
| Map search | Viewport-based results, price markers, selected-property preview, area navigation, and current location | Only properties with coordinates are shown; Japan restriction is an approximate rectangle |
| Property details | Photo carousel, thumbnails, enlarged preview, costs, building information, amenities, contract information, description, map, agent, and management company | Missing floor plans and unknown values use placeholders |
| Authentication | Login/register modal and account menu | Demo login; registration does not create an account or validate stored credentials |
| Favorites | Add/remove favorites and user-specific lists in Zustand | No backend persistence; state resets on a full reload |
| Account | Profile editing, avatar selection, and logout | Avatar is read locally; no upload or persistent profile storage |
| Contact actions | Login-gated phone display and navigation to a chat entry | Frontend gating is not backend authorization; messaging is planned |
| Information pages | About, demo terms, privacy explanation, FAQ, and contact form | Contact form validates input but does not send or store messages |
| API client | Shared fetch wrapper and proposed auth/property endpoints | Integration scaffolding; endpoint contracts must match the backend |

#### Search behavior

- Different filter categories are combined using AND.
- Multiple selected layouts match any selected layout (OR).
- Selected amenities and occupancy conditions must all be present (AND).
- Station and walking-distance conditions must be satisfied by the same station.
- Changing filters or sorting returns the result list to page one.
- Changing list/card view preserves the selected conditions.
- Name search preserves sidebar conditions; sidebar changes preserve the submitted name keyword.
- Search state is currently local to the page. Reloading restores initial URL parameters rather than all subsequent edits.
- Recommended sorting preserves the source order; there is no recommendation engine.

### Technology stack

| Technology | Purpose | Status |
| --- | --- | --- |
| Next.js App Router | Routes, layouts, metadata, and server/client component composition | Frontend |
| React | UI rendering, local state, and interaction | Frontend |
| TypeScript | Component props, domain models, and request/response types | Frontend |
| Ant Design | Forms, modal, dropdown, carousel, filters, pagination, and contextual messages | Frontend |
| `@ant-design/icons` | Consistent interface icons | Frontend |
| `@ant-design/nextjs-registry` | Ant Design style integration with Next.js | Frontend |
| Zustand | Authentication UI state and favorites state | Frontend |
| CSS Modules | Component-scoped styles | Frontend |
| Google Maps JavaScript API | Interactive map rendering | Frontend external service |
| `@vis.gl/react-google-maps` | React integration for Google Maps | Frontend |
| Fetch API | Shared HTTP client without Axios | Integration scaffolding |
| ESLint | Static code checks | Development |
| Vercel | Intended Next.js deployment platform | Deployment plan |
| Spring Boot / Spring Security | Backend APIs, authentication, and authorization | Planned |
| MyBatis-Plus / MySQL | Data access and persistence | Planned |

Exact package versions are defined by `package.json` and `package-lock.json`. This document does not claim that production builds or automated tests have passed.

### Project structure

The frontend currently has its own Next.js project root. The following tree focuses on important application files rather than every asset and configuration file. API modules shown here are the intended organization; some may not yet exist.

```text
hikari-rent/
├── public/
│   └── images/
│       └── home/                  # Hero and area/property image assets
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout, providers, header, and footer
│   │   ├── globals.css            # Global reset and green-theme CSS variables
│   │   ├── page.tsx               # Home page
│   │   ├── rentals/
│   │   │   ├── page.tsx           # Search route and initial URL conditions
│   │   │   └── [id]/page.tsx      # Individual property details
│   │   ├── map/page.tsx           # Map-based property search
│   │   ├── favorites/page.tsx     # Favorites page
│   │   ├── account/page.tsx       # Account/profile page
│   │   ├── messages/page.tsx      # Chat entry/placeholder
│   │   └── (info)/
│   │       ├── info.module.css    # Shared informational-page styles
│   │       ├── about/page.tsx
│   │       ├── terms/page.tsx
│   │       ├── privacy/page.tsx
│   │       ├── faq/page.tsx
│   │       └── contact/
│   │           ├── page.tsx
│   │           └── ContactForm.tsx
│   ├── components/
│   │   ├── layout/                # AppProvider, Header, Footer, and styles
│   │   ├── auth/                  # Login/register modal and styles
│   │   ├── home/                  # HeroSearch and PopularAreas
│   │   ├── area/                  # Reusable cascading AreaSelector
│   │   ├── map/                   # Map, filters, list, and property preview
│   │   └── rental/
│   │       ├── RentalCard.tsx     # Shared vertical property card
│   │       ├── css/               # Shared card styles
│   │       ├── search/
│   │       │   ├── RentalSearch.tsx
│   │       │   ├── RentalSearchBar.tsx
│   │       │   ├── RentalFilters.tsx
│   │       │   ├── RentalResultsToolbar.tsx
│   │       │   ├── RentalListItem.tsx
│   │       │   ├── filters/
│   │       │   │   ├── RentalAreaFilter.tsx
│   │       │   │   ├── RentalRentFilter.tsx
│   │       │   │   ├── RentalPropertyFilter.tsx
│   │       │   │   ├── RentalFeatureFilter.tsx
│   │       │   │   └── filterOptions.ts
│   │       │   └── css/
│   │       └── detail/
│   │           ├── RentalGallery.tsx
│   │           ├── RentalPricePanel.tsx
│   │           ├── RentalContact.tsx
│   │           ├── RentalFees.tsx
│   │           ├── RentalPropertyInfo.tsx
│   │           ├── RentalAmenities.tsx
│   │           ├── RentalContract.tsx
│   │           ├── RentalDescription.tsx
│   │           ├── RentalLocation.tsx
│   │           ├── RentalManagement.tsx
│   │           └── css/
│   ├── stores/
│   │   ├── useAuthStore.ts        # Current demo user and login modal state
│   │   └── useFavoriteStore.ts    # Favorites grouped by user ID
│   ├── lib/
│   │   ├── mockRentals.ts         # Sample property data
│   │   ├── mockAreas.ts           # Sample area hierarchy
│   │   └── filterRentals.ts       # Pure filtering and sorting functions
│   ├── types/
│   │   ├── rental.ts             # Summary, detail, agent, and company models
│   │   ├── rentalSearch.ts       # Search conditions, sorting, and view types
│   │   ├── map.ts                # Map bounds and map-filter types
│   │   └── api.ts                # API envelope and pagination types
│   ├── api/                      # Intended API-module organization
│   │   ├── client.ts             # Shared request handling
│   │   ├── auth.ts               # Login, registration, current user, logout
│   │   ├── account.ts            # Profile and avatar APIs (planned split)
│   │   ├── rentals.ts            # Property list/details and map search
│   │   ├── favorites.ts          # Favorite APIs (planned split)
│   │   └── areas.ts              # Area/station APIs (planned)
│   └── hooks/                    # Reusable hooks when needed
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

#### Directory responsibilities

| Directory | Responsibility |
| --- | --- |
| `app` | Route entry points, layout composition, and metadata |
| `components` | UI components grouped by purpose |
| `components/rental/search` | Search orchestration, controls, and result rows |
| `components/rental/search/filters` | Area, rent, property, and feature filter groups |
| `components/rental/detail` | Property-detail sections |
| `stores` | Shared client state; passwords are not stored here |
| `lib` | Data fixtures and UI-independent functions |
| `types` | Shared domain and API contracts |
| `api` | HTTP calls, isolated from UI components |
| `hooks` | Reusable interaction logic only when useful |
| `public` | Assets accessible by public URL, such as `/images/home/hero.png` |

The `(info)` folder is a route group. Its name is excluded from URLs: `(info)/about/page.tsx` maps to `/about`, not `/info/about`.

`RentalSearch` is the client entry point for interactive searching. Its children can use hooks and callbacks through the same client module tree without each declaring a new client boundary. Root and route components remain server components where interaction is unnecessary.

`RentalCard` is reused on home, favorites, and grid views. `RentalListItem` handles the horizontal search result. The floor plan and action buttons remain inside the result row rather than being split into small one-use components.

### Running locally

Use a Node.js version supported by the checked-in Next.js version.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create `.env.local` in the frontend project root:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_browser_maps_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

- The Maps key is needed for the interactive maps. Enable the Maps JavaScript API and configure the required Google Cloud billing settings.
- Restrict the browser Maps key by website referrer and API. Allow local and deployed site URLs as appropriate.
- The backend URL is needed only when API calls are connected. Mock-data pages can run before the backend exists.
- Restart the development server after changing environment variables.
- `NEXT_PUBLIC_` variables are exposed to browser code. Never use them for database passwords or private server credentials.
- Keep `.env.local` out of Git. Commit a placeholder `.env.example` if useful.

Available commands:

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Serve an existing production build
npm run lint     # ESLint checks
```

### API integration

The current client proposal expects an API envelope:

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

Pagination uses `records` and `total`. Match these names to the actual backend before integrating.

| Method | Proposed endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | Authenticate and return the current user |
| POST | `/api/auth/register` | Create an account |
| GET | `/api/auth/me` | Restore the current user |
| POST | `/api/auth/logout` | End the session |
| PATCH | `/api/account/profile` | Update profile |
| GET | `/api/rentals` | Filtered and sorted property page |
| GET | `/api/rentals/{id}` | Property details |
| GET | `/api/account/favorites` | Favorite properties |
| PUT | `/api/account/favorites/{id}` | Add favorite |
| DELETE | `/api/account/favorites/{id}` | Remove favorite |

These are proposed contracts, not verified running endpoints. Map, avatar, area, and chat contracts remain to be defined.

The initial fetch client sends cookies using `credentials: 'include'`. A cookie/session backend must configure the specific frontend CORS origin, credential handling, and CSRF integration. If JWT authentication is chosen instead, update the client to match the final authentication design. Server-side fetch calls do not automatically inherit a browser's session cookie.

Messages are displayed through Ant Design context (`App.useApp()`), so the configured theme applies to success/error notifications.

### Deployment

1. Run the production build and fix any errors.
2. Push the source and lockfile to GitHub; exclude environment files and build artifacts.
3. Import the repository into Vercel with the Next.js preset.
4. Configure the Maps key and, when available, the public HTTPS backend URL.
5. Redeploy after environment-variable changes.
6. Add the deployed domain to the Maps key's allowed referrers.
7. Add a custom domain in Vercel and apply the DNS records shown by its dashboard.

Do not use `localhost:8080` as a deployed browser API URL. It points to the visitor's own computer.

#### Future monorepo layout

When the backend is added, the repository can be reorganized as:

```text
hikari-rent/
├── frontend/     # Next.js project
├── backend/      # Spring Boot project
├── docs/         # Database and API design
└── README.md
```

In that layout, run frontend commands inside `frontend/` and set Vercel's Root Directory to `frontend`. This is a planned layout, not an assumption that these folders already exist.

### Roadmap

- Spring Security authentication, password hashing, and session restoration.
- MySQL-backed property search, sorting, pagination, and map-bounds queries.
- Persistent favorites and profile updates with ownership checks.
- Avatar/property-photo upload with file validation.
- Property administration: create, edit, publish, and unpublish listings.
- Agent/customer messaging, conversation history, and unread counts.
- Optional saved searches and viewing appointments.
- Validation checks for filtering, authorization, and critical user flows as backend integration progresses.

## 日本語

### プロジェクト概要

Hikari Rentは、エリア・予算・間取り・設備などの条件から賃貸住宅を探す、日本語UIのポートフォリオです。深緑と白を基調とし、ホーム、検索結果、物件詳細、マイページ、案内ページで統一したデザインを採用しています。

現在はフロントエンドのデモ機能を中心に実装し、今後Javaバックエンドとの連携を進める予定です。掲載情報はサンプルであり、実際の不動産仲介、契約、決済を提供するサービスではありません。

### 機能と実装状況

| 分類 | フロントエンドの機能 | 現在の制限 |
| --- | --- | --- |
| ホーム | メインビジュアル検索、人気エリア、新着物件 | サンプルデータを使用 |
| 条件検索 | 物件名、エリア、駅、賃料範囲、間取り複数選択、築年数、駅徒歩、設備、入居条件 | ローカルデータを絞り込み |
| 検索結果 | 件数、並び替え、リスト／カード切り替え、ページネーション、該当なし表示 | データ件数が少ない場合、ページネーションは非表示 |
| フィルター操作 | 選択時に反映、賃料入力は300msの防抖、スライダーは操作完了時に反映 | サーバー検索は未接続 |
| 地図検索 | 表示範囲内の物件、価格マーカー、選択物件プレビュー、エリア移動、現在地取得 | 座標のある物件のみ表示。日本の制限は概略の矩形 |
| 物件詳細 | カルーセル、サムネイル、拡大表示、費用、建物、設備、契約、紹介文、地図、担当者、管理会社 | 未登録の間取り図などはプレースホルダー |
| 認証UI | ログイン／登録モーダル、ログイン後のメニュー | デモ認証。登録で実アカウントは作成されない |
| お気に入り | 登録・解除、ユーザーID別の状態管理 | バックエンド未保存。再読み込みで初期化 |
| マイページ | プロフィール編集、アバター選択、ログアウト | 画像のサーバーアップロードと永続化は未実装 |
| 担当者連絡 | ログイン後の電話番号表示、チャット入口への遷移 | サーバー側の認可と実際のチャットは今後実装 |
| 案内ページ | 会社概要、利用説明、プライバシー説明、FAQ、お問い合わせ | 問い合わせは入力確認のみ。送信・保存なし |
| APIクライアント | 共通fetch処理、認証・物件の提案インターフェース | バックエンドとの契約確認と接続が必要 |

#### 検索ルール

- 異なる条件グループはANDで組み合わせます。
- 間取りの複数選択は、選択したいずれかに一致する物件を表示します。
- 設備・入居条件は、選択したすべての条件を満たす物件を表示します。
- 駅名と徒歩分数は、同じ駅で条件を満たす必要があります。
- 条件や並び順を変更すると1ページ目に戻ります。
- リスト／カード表示を切り替えても検索条件を保持します。
- 物件名の検索では左側条件を維持し、左側の操作では確定済みの物件名を維持します。
- 操作後の全条件はまだURLへ同期していません。再読み込みでは初期URLの条件に戻ります。
- 「おすすめ順」はデータの元の順序です。推薦アルゴリズムは未実装です。

### 技術スタック

| 技術 | 用途 | 状況 |
| --- | --- | --- |
| Next.js App Router | ルーティング、レイアウト、メタデータ、Server／Client Component | フロントエンド |
| React | UI描画、状態管理、イベント処理 | フロントエンド |
| TypeScript | Props、物件モデル、検索条件、API型 | フロントエンド |
| Ant Design | フォーム、モーダル、メニュー、カルーセル、フィルター、ページネーション、通知 | フロントエンド |
| `@ant-design/icons` | UIアイコン | フロントエンド |
| `@ant-design/nextjs-registry` | Next.jsでのAnt Designスタイル連携 | フロントエンド |
| Zustand | デモ認証状態、お気に入り状態 | フロントエンド |
| CSS Modules | コンポーネント単位のスタイル | フロントエンド |
| Google Maps JavaScript API | 地図表示 | 外部サービス |
| `@vis.gl/react-google-maps` | Google MapsのReact連携 | フロントエンド |
| Fetch API | 共通HTTPクライアント | 接続準備 |
| ESLint | 静的チェック | 開発環境 |
| Vercel | Next.jsの公開先 | 予定 |
| Spring Boot・Spring Security | API、認証、認可 | 予定 |
| MyBatis-Plus・MySQL | データアクセス、永続化 | 予定 |

正確なバージョンは`package.json`と`package-lock.json`をご確認ください。本READMEはビルド成功やテスト完了を保証するものではありません。

### ディレクトリと設計

詳細なツリーは英語セクションの[Project structure](#project-structure)を参照してください。現在はNext.jsプロジェクトのルートを基準にしています。

| ディレクトリ | 役割 |
| --- | --- |
| `src/app` | ページの入口、共通レイアウト、メタデータ |
| `src/app/(info)` | 会社概要、利用説明、プライバシー、FAQ、お問い合わせ |
| `src/components/layout` | Provider、Header、Footer |
| `src/components/auth` | ログイン／登録モーダル |
| `src/components/home` | HeroSearch、PopularAreas |
| `src/components/area` | 複数階層のエリア選択 |
| `src/components/map` | 地図、価格マーカー、フィルター、一覧、プレビュー |
| `src/components/rental/search` | 検索ページの状態、入力、並び替え、結果行 |
| `src/components/rental/search/filters` | エリア、賃料、物件条件、設備のフィルター群 |
| `src/components/rental/detail` | 写真、価格、担当者、費用、建物、設備、契約、地図など |
| `src/stores` | 複数画面で共有するクライアント状態 |
| `src/lib` | サンプルデータ、UIから独立した検索・並び替え処理 |
| `src/types` | 物件、検索、地図、APIの共通型 |
| `src/api` | バックエンドへの通信処理 |
| `src/hooks` | 必要に応じて追加する共通Hook |
| `public` | 公開URLから参照する画像などの静的アセット |

#### ページのURL

| URL | ページ |
| --- | --- |
| `/` | ホーム |
| `/rentals` | 条件検索 |
| `/rentals/[id]` | 物件詳細 |
| `/map` | 地図検索 |
| `/favorites` | お気に入り |
| `/account` | マイページ |
| `/messages` | チャット入口／開発中 |
| `/about` | 会社概要・プロジェクト紹介 |
| `/terms` | 利用説明 |
| `/privacy` | プライバシー説明 |
| `/faq` | よくある質問 |
| `/contact` | お問い合わせデモ |

`(info)`はRoute Groupです。URLには含まれず、`(info)/about/page.tsx`は`/about`になります。

#### 検索コンポーネント

| コンポーネント | 責務 |
| --- | --- |
| `RentalSearch` | 確定条件、並び順、表示方式、ページ番号の管理と全体の組み立て |
| `RentalSearchBar` | 物件名の入力、Enter／ボタンによる検索、クリア |
| `RentalFilters` | 編集中の条件、即時反映、賃料の防抖、条件クリア |
| `RentalAreaFilter` | エリアと、そのエリアに対応する駅の選択 |
| `RentalRentFilter` | 賃料入力、スライダー、範囲エラー表示 |
| `RentalPropertyFilter` | 間取り、築年数、駅徒歩 |
| `RentalFeatureFilter` | 設備と入居条件 |
| `RentalResultsToolbar` | 件数、並び順、表示方式 |
| `RentalListItem` | 横長の物件行、間取り図、賃料、お気に入り、詳細リンク |
| `RentalCard` | ホーム、お気に入り、カード表示で共用する物件カード |

`RentalSearch`をClient Componentの入口とし、その配下でイベントやHookを使用します。すべての子ファイルに独立した`'use client'`境界を作る必要はありません。

共有が必要な認証・お気に入りはZustandに置き、検索条件は検索ページ内で管理します。パスワードはZustandへ保存しません。共通通知は`App.useApp()`を使用し、Ant Designのテーマを反映します。

コンポーネントは機能のまとまりで分割します。間取り図、詳細リンク、ボタンなど、単独で再利用しない小さな要素まで過度に分割しません。

### ローカル起動

使用するNext.jsのバージョンに対応したNode.jsをご用意ください。

```bash
npm ci
npm run dev
```

[http://localhost:3000](http://localhost:3000)を開きます。

フロントエンドのプロジェクトルートに`.env.local`を作成します。

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_browser_maps_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

- 地図にはGoogle Maps JavaScript APIの有効化と必要な課金設定が必要です。
- ブラウザ用キーにHTTPリファラー制限とAPI制限を設定し、ローカル・公開先のURLを許可します。
- バックエンド未接続の段階では、サンプルデータでフロントエンドを確認できます。
- 環境変数変更後は開発サーバーを再起動します。
- `NEXT_PUBLIC_`の値はブラウザに公開されます。DBパスワードや非公開の認証情報は設定しません。
- `.env.local`はGitへ追加しません。必要に応じてダミー値の`.env.example`を用意します。

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | ビルド済みアプリ起動 |
| `npm run lint` | ESLintチェック |

### バックエンド連携

共通レスポンスは`code`、`message`、`data`を持つ形式を想定し、`code: 0`を成功として扱います。ページ結果は`records`と`total`を想定しています。実際のController・DTO・VOと一致させてください。

提案中の認証・物件・お気に入りエンドポイントは英語セクションの[API integration](#api-integration)に記載しています。まだ動作確認済みのAPI一覧ではありません。

共通クライアントはJSON変換、HTTP／業務エラー、10秒タイムアウト、AbortSignalによるキャンセルを担当します。TypeScriptの型は、実際に返された全フィールドの実行時検証を行うものではありません。

現在のクライアント案は`credentials: 'include'`によるCookie送信です。Session方式を採用する場合は、CORSの許可元・資格情報・CSRFをバックエンドと合わせます。JWT方式を選ぶ場合は、その認証設計に合わせて通信処理を変更します。Server Componentからのfetchは、ブラウザのCookieを自動では引き継ぎません。

### デプロイ

1. `npm run build`を実行し、エラーを修正します。
2. GitHubへソースとロックファイルをPushします。
3. VercelにリポジトリをImportし、Next.jsを選択します。
4. 地図キーと、接続する場合は公開HTTPSバックエンドURLを設定します。
5. 環境変数を変更したら再デプロイします。
6. Google Mapsキーに公開ドメインを許可します。
7. 独自ドメインを追加し、Vercelに表示されたDNSレコードを設定します。

公開フロントエンドのAPI URLに`localhost:8080`は使用しません。アクセスした利用者自身のPCを指してしまいます。

バックエンド追加後に`frontend/`・`backend/`・`docs/`へ整理する場合は、VercelのRoot Directoryを`frontend`に変更し、npmコマンドもそのディレクトリ内で実行します。

### 今後の開発

1. Spring Securityによる登録・ログイン、パスワードハッシュ化、ログイン状態の復元。
2. MySQLへの物件保存と、条件検索・並び替え・ページネーション・地図範囲検索。
3. お気に入りとプロフィールの永続化、ユーザーごとのデータアクセス制御。
4. アバター・物件写真・間取り図のアップロードとファイル検証。
5. 管理者向けの物件作成・編集・公開／非公開機能。
6. 担当者とのチャット、会話履歴、未読件数。
7. 必要に応じて検索条件保存や内見予約を追加。
8. バックエンド連携に合わせて検索・認可・主要操作を検証。

## Project notes / 補足

- No license has been declared in this README. Choose a license before granting reuse rights.
- Check image usage rights before publishing or redistributing assets.
- The information-page text is for this demo and must be updated to match a real service's operations.
- 本READMEではライセンスを指定していません。再利用を許諾する場合は別途選定してください。
- 画像の公開・再配布前に利用条件をご確認ください。
- 案内ページの説明はデモ用です。実サービス化する場合は運用内容に合わせて更新してください。
