import { Context, Next } from 'hono';
import type { Env } from '../types/env';

/**
 * CORSミドルウェア
 */
export async function corsMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const origin = c.req.header('Origin');
  const allowedOrigins = c.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

  // すべてのオリジンを許可する場合
  if (allowedOrigins.includes('*')) {
    c.header('Access-Control-Allow-Origin', '*');
  } else if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Vary', 'Origin');
  }

  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Max-Age', '86400');

  // プレフライトリクエストの処理
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  await next();
}
