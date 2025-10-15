import { Hono } from 'hono';
import {
  listSubmissionsHandler,
  getSubmissionHandler,
  deleteSubmissionHandler,
} from './handlers/admin.handler';
import { submitFormHandler } from './handlers/form.handler';
import { authMiddleware } from './middleware/auth';
import { corsMiddleware } from './middleware/cors';
import type { Env } from './types/env';

const app = new Hono<{ Bindings: Env }>();

// CORSミドルウェアを全ルートに適用
app.use('*', corsMiddleware);

// 公開エンドポイント: フォーム送信
app.post('/api/forms/submit', submitFormHandler);

// 管理画面用エンドポイント（認証必須）
app.use('/api/admin/*', authMiddleware);
app.get('/api/admin/submissions', listSubmissionsHandler);
app.get('/api/admin/submissions/:id', getSubmissionHandler);
app.delete('/api/admin/submissions/:id', deleteSubmissionHandler);

// ヘルスチェック
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
