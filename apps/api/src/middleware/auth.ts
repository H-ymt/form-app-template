import { Context, Next } from 'hono';
import type { Env } from '../types/env';

/**
 * Basic認証ミドルウェア
 */
export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const base64Credentials = authHeader.slice(6);
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(':');

    const validUsername = c.env.ADMIN_USERNAME;
    const validPassword = c.env.ADMIN_PASSWORD;

    if (username === validUsername && password === validPassword) {
      await next();
    } else {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
  } catch {
    return c.json({ success: false, error: 'Invalid authorization header' }, 401);
  }
}
