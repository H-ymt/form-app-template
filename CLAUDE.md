# AI エージェント設定

## プロジェクト概要

このプロジェクトは、汎用的なフォーム送信を受け付け、管理画面で閲覧・CSV出力できるシステムです。
Cloudflare Workers + D1を使用し、pnpm workspacesでモノレポ管理されています。

### 技術スタック

#### 管理画面 (apps/admin)
- **フレームワーク**: React + TypeScript
- **ルーティング**: Tanstack Router (ファイルベースルーティング)
- **スタイリング**: Tailwind CSS v4
- **ビルドツール**: Vite
- **デプロイ**: Cloudflare Pages (Workers)

#### API (apps/api)
- **ランタイム**: Cloudflare Workers
- **フレームワーク**: Hono (軽量Webフレームワーク)
- **データベース**: Cloudflare D1 (SQLite)
- **バリデーション**: Zod
- **認証**: Basic認証

#### 共通 (shared)
- **型定義**: TypeScript interfaces/types
- **パッケージ名**: `@form-app/shared`

## 設計作業ルール

設計作業を依頼された場合は、以下のルールに従ってファイルを作成すること：

- ファイル名: `YYYYMMDD_HHMM_{日本語の作業内容}.md`
- 保存場所: `docs/` 以下
- フォーマット: Markdown

例: `docs/20250815_1430_ユーザー認証システム設計.md`

## アプリケーションの実装ルール

### 共通ルール

- TypeScriptで型安全性を保つ（`any` の乱用を避ける）
- 小さく単一責務のコンポーネント/関数を作成
- ESLint + Prettierによるコード品質維持
- import は一貫したパス戦略を採用（`@/` エイリアスを使用）
- 相対パスの深さを避ける

### React (管理画面) 固有のルール

- Props と state は明示的に型付けする
- 再利用性は明確な型で担保する
- 不要な再レンダリングを避ける（依存配列の管理、memoization を適用）
- 重い処理は分離する
- アクセシビリティとセマンティックな HTML を優先する（キーボード操作・ARIA を考慮）

### API固有のルール

- Honoのミドルウェアパターンに従う
- Repository パターンでデータアクセスを分離
- Service 層でビジネスロジックを実装
- Handler 層でHTTPリクエスト/レスポンスを処理
- Zodでリクエストバリデーションを行う

## ディレクトリ構成

```
form-app-template/
├── apps/
│   ├── admin/                     # 管理画面 (React SPA)
│   │   ├── src/
│   │   │   ├── routes/            # Tanstack Router (ファイルベースルーティング)
│   │   │   │   ├── __root.tsx    # ルートレイアウト
│   │   │   │   ├── index.tsx     # 一覧画面 (/)
│   │   │   │   ├── login.tsx     # ログイン画面 (/login)
│   │   │   │   └── submissions.$id.tsx  # 詳細画面 (/submissions/:id)
│   │   │   ├── lib/               # ユーティリティ
│   │   │   │   ├── auth.ts        # 認証関連 (localStorage管理)
│   │   │   │   └── api.ts         # API クライアント (fetch wrapper)
│   │   │   ├── index.css          # Tailwind CSS v4
│   │   │   └── main.tsx           # エントリーポイント
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                       # API (Cloudflare Workers)
│       ├── src/
│       │   ├── handlers/          # エンドポイントハンドラ
│       │   │   ├── form.handler.ts      # フォーム送信
│       │   │   └── admin.handler.ts     # 管理API
│       │   ├── middleware/        # ミドルウェア
│       │   │   ├── auth.ts        # Basic認証
│       │   │   └── cors.ts        # CORS設定
│       │   ├── services/          # ビジネスロジック層
│       │   │   └── submission.service.ts
│       │   ├── repositories/      # データアクセス層
│       │   │   └── submission.repository.ts
│       │   ├── types/             # 型定義
│       │   │   └── env.ts         # Cloudflare Workers環境変数型
│       │   └── index.ts           # エントリーポイント (Hono app)
│       ├── schema.sql             # D1データベーススキーマ
│       ├── wrangler.toml          # Cloudflare Workers設定
│       ├── tsconfig.json
│       └── package.json
│
├── shared/                        # 共通型定義
│   ├── src/
│   │   ├── types/
│   │   │   └── index.ts           # FormSubmission等の型定義
│   │   └── index.ts               # エクスポート
│   ├── tsconfig.json
│   └── package.json (@form-app/shared)
│
├── docs/                          # ドキュメント
│   └── 20251015_0000_フォーム管理システム要件定義.md
│
├── pnpm-workspace.yaml            # pnpm workspaces設定
├── package.json                   # ルートpackage.json
├── tsconfig.json                  # 基底TypeScript設定
├── .eslintrc.json
├── .prettierrc.json
├── .gitignore
└── README.md
```

### 各ディレクトリの責務

#### apps/admin (管理画面)

- **routes/**: Tanstack Routerのファイルベースルーティング
  - `__root.tsx`: 全ページ共通のルートレイアウト
  - `index.tsx`: 一覧画面 (実装予定)
  - `login.tsx`: ログイン画面 (実装済み)
  - `submissions.$id.tsx`: 詳細画面 (実装予定)
- **lib/**: ユーティリティ関数
  - `auth.ts`: 認証状態管理 (localStorage)
  - `api.ts`: APIクライアント (fetch wrapper)
- **index.css**: Tailwind CSS v4 エントリーポイント

#### apps/api (API)

- **handlers/**: HTTPリクエスト/レスポンス処理
  - `form.handler.ts`: フォーム送信エンドポイント
  - `admin.handler.ts`: 管理API (一覧、詳細、削除)
- **middleware/**: 横断的な処理
  - `auth.ts`: Basic認証ミドルウェア
  - `cors.ts`: CORS設定ミドルウェア
- **services/**: ビジネスロジック層
  - `submission.service.ts`: フォーム送信に関するロジック
- **repositories/**: データアクセス層
  - `submission.repository.ts`: D1データベースへのクエリ
- **types/**: 型定義
  - `env.ts`: Cloudflare Workers環境変数型定義

#### shared

- **types/**: 管理画面とAPI間で共有する型定義
  - `FormSubmission`: フォーム送信データ型
  - `FormSubmissionMetadata`: メタデータ型

## アーキテクチャパターン

### API層の分離

```
Handler (HTTPレイヤー)
  ↓
Service (ビジネスロジック)
  ↓
Repository (データアクセス)
  ↓
D1 Database
```

- **Handler**: HTTPリクエスト/レスポンス処理、バリデーション
- **Service**: ビジネスロジック、UUID生成、タイムスタンプ生成
- **Repository**: SQLクエリ実行、データマッピング

### 管理画面の認証フロー

1. ユーザーが `/login` でユーザー名・パスワードを入力
2. `auth.ts` の `setAuth()` でBase64エンコードしてlocalStorageに保存
3. `api.ts` の `getAuthHeader()` でリクエストヘッダーに `Authorization: Basic ...` を付与
4. APIミドルウェアで認証チェック
5. 認証失敗時は401レスポンス → `/login` にリダイレクト

## APIエンドポイント

### Public API

#### フォーム送信

```http
POST /api/forms/submit
Content-Type: application/json

{
  "formId": "contact-form",
  "name": "山田太郎",
  "email": "yamada@example.com",
  "message": "お問い合わせ内容",
  // 任意のフィールドを追加可能
}
```

**レスポンス:**
```json
{
  "success": true,
  "submissionId": "8e1ae4d1-ac0f-4b71-b4ef-784ff245d0f5"
}
```

### Admin API (Basic認証必須)

#### 送信一覧取得

```http
GET /api/admin/submissions?page=1&limit=20&formId=contact-form
Authorization: Basic base64(username:password)
```

**クエリパラメータ:**
- `page`: ページ番号 (default: 1)
- `limit`: 1ページあたりの件数 (default: 20)
- `formId`: フォームIDでフィルター (optional)
- `startDate`: 開始日 ISO8601 (optional)
- `endDate`: 終了日 ISO8601 (optional)

**レスポンス:**
```json
{
  "data": [
    {
      "id": "8e1ae4d1-ac0f-4b71-b4ef-784ff245d0f5",
      "formId": "test-form",
      "data": { "name": "テストユーザー", "email": "test@example.com" },
      "metadata": {
        "ipAddress": "127.0.0.1",
        "userAgent": "curl/8.4.0",
        "referrer": null
      },
      "createdAt": "2025-10-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "limit": 20
  }
}
```

#### 詳細取得

```http
GET /api/admin/submissions/:id
Authorization: Basic base64(username:password)
```

#### 削除

```http
DELETE /api/admin/submissions/:id
Authorization: Basic base64(username:password)
```

## 開発コマンド

### プロジェクトルート

```bash
# すべての依存関係をインストール
pnpm install

# API開発サーバー起動
pnpm dev:api

# 管理画面開発サーバー起動
pnpm dev:admin

# すべてのパッケージをビルド
pnpm build

# すべてのパッケージで型チェック
pnpm typecheck

# すべてのパッケージでLint実行
pnpm lint
```

### API (apps/api)

```bash
cd apps/api

# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# デプロイ
pnpm deploy

# D1データベース操作
pnpm wrangler d1 list
pnpm wrangler d1 create form-app-db
pnpm wrangler d1 execute form-app-db --local --file=./schema.sql
pnpm wrangler d1 execute form-app-db --remote --file=./schema.sql

# シークレット設定
pnpm wrangler secret put ADMIN_PASSWORD
```

### 管理画面 (apps/admin)

```bash
cd apps/admin

# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# デプロイ
pnpm deploy
```

## データベーススキーマ

### form_submissions テーブル

```sql
CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,           -- UUID
  form_id TEXT NOT NULL,         -- フォーム識別子
  data TEXT NOT NULL,            -- フォームデータ (JSON)
  ip_address TEXT,               -- 送信元IPアドレス
  user_agent TEXT,               -- User-Agent
  referrer TEXT,                 -- Referrer
  created_at TEXT NOT NULL       -- 作成日時 (ISO8601)
);

CREATE INDEX IF NOT EXISTS idx_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON form_submissions(created_at);
```

## 環境変数

### API (wrangler.toml)

```toml
[vars]
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "password"  # 本番環境では wrangler secret を使用
ALLOWED_ORIGINS = "*"        # 本番環境では具体的なオリジンを指定
```

## 実装状況

### ✅ 実装済み

- [x] プロジェクト基盤 (pnpm workspaces)
- [x] 共通型定義 (shared)
- [x] API
  - [x] フォーム送信エンドポイント (`POST /api/forms/submit`)
  - [x] 管理API (一覧、詳細、削除)
  - [x] Basic認証ミドルウェア
  - [x] CORSミドルウェア
  - [x] D1データベース連携
- [x] 管理画面
  - [x] ログイン画面
  - [x] 認証管理 (localStorage)
  - [x] APIクライアント

### ⬜ 実装予定

- [ ] 管理画面
  - [ ] 送信一覧画面
  - [ ] 詳細画面
  - [ ] CSV出力機能
  - [ ] フィルター機能
  - [ ] ページネーション
  - [ ] 検索機能
- [ ] 拡張機能
  - [ ] Resend連携（メール通知）
  - [ ] Webhook機能
  - [ ] ファイルアップロード (R2)

## トラブルシューティング

### D1テーブルが見つからないエラー

ローカル開発環境でスキーマが適用されていない可能性があります。

```bash
cd apps/api
pnpm wrangler d1 execute form-app-db --local --file=./schema.sql
```

### 認証エラー (401 Unauthorized)

`wrangler.toml` の `ADMIN_USERNAME` と `ADMIN_PASSWORD` を確認してください。

```toml
[vars]
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "password"
```

### CORS エラー

`wrangler.toml` の `ALLOWED_ORIGINS` を確認してください。開発環境では `*` で問題ありませんが、本番環境では具体的なオリジンを指定してください。

## 参考リソース

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Hono Documentation](https://hono.dev/)
- [Tanstack Router Documentation](https://tanstack.com/router/latest)
- [Tailwind CSS v4](https://tailwindcss.com/)

# GitHub 操作ルール

- ユーザーから PR を出して、と言われたときは、現在の作業のフィーチャーブランチを切りコミットを行ってから PR を出すようにする
- develop や main への直接 push は禁止です
- D1データベースのマイグレーションを含む差分は自動デプロイで環境を壊しうるので、ユーザーに許可を取ってから実行してください
- ロジックにまつわる変更をしたあとの Push の前には、プロジェクトルートで `pnpm typecheck` と `pnpm lint` を行ってから Push するようにしてください
- PR 作成時は `gh pr create` コマンドに `--base` オプションを付けず、デフォルトのベースブランチを使用してください
