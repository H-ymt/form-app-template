-- フォーム送信データテーブル
CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  data TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TEXT NOT NULL
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON form_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_form_id_created_at ON form_submissions(form_id, created_at);
