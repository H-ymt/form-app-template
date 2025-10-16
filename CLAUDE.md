# AI エージェント設定

## プロジェクト概要

このプロジェクトは、汎用的なフォーム送信を受け付け、管理画面で閲覧・CSV出力できるシステムです。
Cloudflare Workers + D1を使用し、pnpm workspacesでモノレポ管理されています。

### 技術スタック

#### 管理画面 (admin)

- **フレームワーク**: React + TypeScript
- **ルーティング**: Tanstack Router (ファイルベースルーティング)
- **スタイリング**: Tailwind CSS v4
- **ビルドツール**: Vite
- **デプロイ**: Cloudflare Pages (Workers)

#### API (api)

- **ランタイム**: Cloudflare Workers
- **フレームワーク**: Hono (軽量Webフレームワーク)
- **データベース**: Cloudflare D1 (SQLite)
- **バリデーション**: Zod
- **認証**: Basic認証

#### 公開Web (web)

- **用途**: フォーム送信用の公開Webサイト
- **ビルドツール**: Vite

## 設計作業ルール

設計作業を依頼された場合は、以下のルールに従ってファイルを作成すること：

- ファイル名: `YYYYMMDD_HHMM_{日本語の作業内容}.md`
- 保存場所: `docs/` 以下
- フォーマット: Markdown

例: `docs/20250815_1430_ユーザー認証システム設計.md`

## アプリケーションの実装ルール

### 共通ルール

- TypeScriptで型安全性を保つ（`any` の乱用を避ける）
- Tailwind CSSで、`/shared/styles/app.css`にて定義されたカスタムテーマ変数を利用して一貫したスタイリングを行う
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
│   │   │   ├── routes/            # Tanstack Router ルート定義
│   │   │   ├── lib/               # ユーティリティ (auth, api)
│   │   │   ├── types/             # 型定義
│   │   │   ├── components/        # Reactコンポーネント
│   │   │   └── hooks/             # カスタムフック
│   │   └── package.json
│   │
│   ├── api/                       # API (Cloudflare Workers)
│   │   ├── src/
│   │   │   ├── handlers/          # エンドポイントハンドラ
│   │   │   ├── middleware/        # ミドルウェア
│   │   │   ├── services/          # ビジネスロジック層
│   │   │   ├── repositories/      # データアクセス層
│   │   │   └── types/             # 型定義
│   │   ├── schema.sql             # D1データベーススキーマ
│   │   ├── wrangler.toml          # Cloudflare Workers設定
│   │   └── package.json
│   │
│   └── web/                       # 公開Web (フォーム送信用)
│       ├── src/
│       └── package.json
│
├── packages/                      # 共有パッケージ
│
├── docs/                          # ドキュメント
│
├── pnpm-workspace.yaml            # pnpm workspaces設定
├── package.json                   # ルートpackage.json
├── tsconfig.json                  # 基底TypeScript設定
└── CLAUDE.md                      # このファイル
```

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

## 開発コマンド

### プロジェクトルート

```bash
# すべての依存関係をインストール
pnpm install

# API開発サーバー起動
pnpm dev:api

# 管理画面開発サーバー起動
pnpm dev:admin

# 公開Web開発サーバー起動
pnpm dev:web

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

## 参考リソース

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Hono Documentation](https://hono.dev/)
- [Tanstack Router Documentation](https://tanstack.com/router/latest)
- [Tailwind CSS v4](https://tailwindcss.com/)

# GitHub 操作ルール

- ユーザーから PR を出して、と言われたときは、現在の作業のフィーチャーブランチを切りコミットを行ってから PR を出すようにする
- ユーザーから commit して、と言われたときは、必ず`git status`や`git diff`を行い、変更内容を確認してから conventional commit 形式でコミットメッセージを作成し、コミットを行うようにする
- develop や main への直接 push は禁止です
- D1データベースのマイグレーションを含む差分は自動デプロイで環境を壊しうるので、ユーザーに許可を取ってから実行してください
- ロジックにまつわる変更をしたあとの Push の前には、プロジェクトルートで `pnpm typecheck` と `pnpm lint` を行ってから Push するようにしてください
- PR 作成時は `gh pr create` コマンドに `--base` オプションを付けず、デフォルトのベースブランチを使用してください
