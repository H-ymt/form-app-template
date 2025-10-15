import { Context } from 'hono';
import { z } from 'zod';
import { SubmissionRepository } from '../repositories/submission.repository';
import { SubmissionService } from '../services/submission.service';
import type { Env } from '../types/env';

const submitFormSchema = z.object({
  formId: z.string().min(1),
});

/**
 * フォーム送信エンドポイント
 */
export async function submitFormHandler(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json();

    // バリデーション
    const validation = submitFormSchema.safeParse(body);
    if (!validation.success) {
      return c.json(
        {
          success: false,
          error: 'Invalid request: formId is required',
        },
        400
      );
    }

    // メタデータ取得
    const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || '';
    const userAgent = c.req.header('User-Agent') || '';
    const referrer = c.req.header('Referer');

    // サービス呼び出し
    const repository = new SubmissionRepository(c.env.DB);
    const service = new SubmissionService(repository);

    const submissionId = await service.submitForm(body, {
      ipAddress,
      userAgent,
      referrer,
    });

    return c.json({
      success: true,
      submissionId,
    });
  } catch (error) {
    console.error('Submit form error:', error);
    return c.json(
      {
        success: false,
        error: 'Internal server error',
      },
      500
    );
  }
}
