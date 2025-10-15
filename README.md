# Form App Template

汎用的なフォーム送信を受け付け、管理画面で閲覧・CSV出力できるシステム。
Cloudflare Workers + D1でのデプロイを前提としたモノレポ構成。

## 📁 プロジェクト構成

```
form-app-template/
├── apps/
│   ├── admin/              # 管理画面 (React SPA)
│   │   ├── src/
│   │   │   ├── routes/     # Tanstack Router
│   │   │   ├── lib/        # API client, auth
│   │   │   └── main.tsx
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/                # API (Cloudflare Workers)
│       ├── src/
│       │   ├── handlers/   # エンドポイントハンドラ
│       │   ├── middleware/ # 認証・CORS
│       │   ├── services/   # ビジネスロジック
│       │   ├── repositories/ # データアクセス
│       │   └── index.ts
│       ├── schema.sql      # D1スキーマ
│       ├── wrangler.toml
│       └── package.json
│
├── shared/                 # 共通型定義
│   ├── src/
│   │   └── types/
│   └── package.json
│
├── docs/                   # ドキュメント
│   └── 20251015_0000_フォーム管理システム要件定義.md
│
├── pnpm-workspace.yaml
└── package.json
```

## 🛠️ 技術スタック

### 管理画面 (apps/admin)
- **フレームワーク**: React + TypeScript
- **ルーティング**: Tanstack Router
- **スタイリング**: Tailwind CSS v4
- **ビルドツール**: Vite
- **デプロイ**: Cloudflare Pages (Workers)

### API (apps/api)
- **ランタイム**: Cloudflare Workers
- **フレームワーク**: Hono
- **データベース**: Cloudflare D1 (SQLite)
- **バリデーション**: Zod
- **認証**: Basic認証

### 共通
- **パッケージマネージャ**: pnpm workspaces
- **言語**: TypeScript
- **リンター**: ESLint + Prettier

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. D1データベースのセットアップ

#### ローカル開発用

```bash
cd apps/api

# ローカルD1にスキーマを適用
pnpm wrangler d1 execute form-app-db --local --file=./schema.sql
```

#### 本番環境用

```bash
cd apps/api

# D1データベースを作成（初回のみ）
pnpm wrangler d1 create form-app-db

# 作成されたdatabase_idをwrangler.tomlに設定
# [[d1_databases]]
# database_id = "your-database-id"

# 本番環境にスキーマを適用
pnpm wrangler d1 execute form-app-db --remote --file=./schema.sql
```

### 3. 環境変数の設定

`apps/api/wrangler.toml` の `[vars]` セクションを編集：

```toml
[vars]
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "your-secure-password"
ALLOWED_ORIGINS = "*"  # 本番環境では具体的なオリジンを指定
```

**本番環境では `wrangler secret` コマンドを使用:**

```bash
cd apps/api
pnpm wrangler secret put ADMIN_PASSWORD
```

## 💻 開発

### API開発サーバー起動

```bash
pnpm dev:api
```

- ローカルサーバー: `http://localhost:8787`
- ヘルスチェック: `http://localhost:8787/health`

### 管理画面開発サーバー起動

```bash
pnpm dev:admin
```

- ローカルサーバー: `http://localhost:5173`

### すべてのパッケージをビルド

```bash
pnpm build
```

### 型チェック

```bash
pnpm typecheck
```

### Lint実行

```bash
pnpm lint
```

## 📡 API エンドポイント

### フォーム送信 (Public)

```http
POST /api/forms/submit
Content-Type: application/json

{
  "formId": "contact-form",
  "name": "山田太郎",
  "email": "yamada@example.com",
  "message": "お問い合わせ内容"
}
```

**レスポンス:**
```json
{
  "success": true,
  "submissionId": "uuid-here"
}
```

### 送信一覧取得 (Admin)

```http
GET /api/admin/submissions?page=1&limit=20
Authorization: Basic base64(username:password)
```

**クエリパラメータ:**
- `page`: ページ番号 (default: 1)
- `limit`: 1ページあたりの件数 (default: 20)
- `formId`: フォームIDでフィルター (optional)
- `startDate`: 開始日 ISO8601 (optional)
- `endDate`: 終了日 ISO8601 (optional)

### 詳細取得 (Admin)

```http
GET /api/admin/submissions/:id
Authorization: Basic base64(username:password)
```

### 削除 (Admin)

```http
DELETE /api/admin/submissions/:id
Authorization: Basic base64(username:password)
```

## 🚢 デプロイ

### APIのデプロイ

```bash
cd apps/api
pnpm run deploy
```

### 管理画面のデプロイ

```bash
cd apps/admin
pnpm run deploy
```

## 🗄️ データベーススキーマ

```sql
CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  data TEXT NOT NULL,          -- JSON文字列
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_form_id ON form_submissions(form_id);
CREATE INDEX idx_created_at ON form_submissions(created_at);
```

## 🔐 認証

管理画面およびAdmin APIエンドポイントは **Basic認証** で保護されています。

- **開発環境**: `wrangler.toml` の `[vars]` セクションで設定
- **本番環境**: `wrangler secret` コマンドで設定を推奨

```bash
# 本番環境でのシークレット設定
cd apps/api
pnpm wrangler secret put ADMIN_PASSWORD
```

## 📊 管理画面機能

### 実装済み
- ✅ ログイン画面 (`/login`)
- ✅ Basic認証によるセキュリティ

### 実装予定
- ⬜ フォーム送信一覧表示 (`/`)
  - ページネーション
  - フィルター機能（日付範囲、フォームID）
  - 検索機能
- ⬜ 詳細表示 (`/submissions/:id`)
  - 全フィールド表示
  - メタデータ表示
  - 削除機能
- ⬜ CSV出力機能

## 🧪 テスト

### APIテスト例

```bash
# フォーム送信テスト
curl -X POST http://localhost:8787/api/forms/submit \
  -H "Content-Type: application/json" \
  -d '{"formId":"test-form","name":"テストユーザー","email":"test@example.com"}'

# 一覧取得テスト (Basic認証)
curl http://localhost:8787/api/admin/submissions \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)"
```

## 📝 コーディング規約

詳細は [CLAUDE.md](./CLAUDE.md) を参照してください。

### 主要な規約
- TypeScriptで型安全性を保つ（`any` の乱用を避ける）
- 小さく単一責務のコンポーネント/関数を作成
- ESLint + Prettierによるコード品質維持
- コミット前に `pnpm typecheck` と `pnpm lint` を実行

## 🔧 トラブルシューティング

### D1テーブルが見つからないエラー

```bash
# ローカル開発環境でスキーマを適用
cd apps/api
pnpm wrangler d1 execute form-app-db --local --file=./schema.sql
```

### 認証エラー

`wrangler.toml` の `ADMIN_USERNAME` と `ADMIN_PASSWORD` が正しく設定されているか確認してください。

## 📚 ドキュメント

- [要件定義書](./docs/20251015_0000_フォーム管理システム要件定義.md)
- [プロジェクトコンテキスト](./CLAUDE.md)

## 🔗 参考リンク

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Hono](https://hono.dev/)
- [Tanstack Router](https://tanstack.com/router/latest)
- [Tailwind CSS v4](https://tailwindcss.com/)

## 📄 ライセンス

MIT
