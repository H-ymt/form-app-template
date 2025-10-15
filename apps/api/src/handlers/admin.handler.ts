import { Context } from 'hono';
import type { Env } from '../types/env';
import type { ListSubmissionsQuery } from '@form-app/shared';
import { SubmissionService } from '../services/submission.service';
import { SubmissionRepository } from '../repositories/submission.repository';

/**
 * 送信一覧取得エンドポイント
 */
export async function listSubmissionsHandler(c: Context<{ Bindings: Env }>) {
  try {
    const query: ListSubmissionsQuery = {
      page: Number(c.req.query('page')) || 1,
      limit: Number(c.req.query('limit')) || 20,
      formId: c.req.query('formId'),
      startDate: c.req.query('startDate'),
      endDate: c.req.query('endDate'),
      search: c.req.query('search'),
    };

    const repository = new SubmissionRepository(c.env.DB);
    const service = new SubmissionService(repository);

    const result = await service.listSubmissions(query);

    return c.json(result);
  } catch (error) {
    console.error('List submissions error:', error);
    return c.json(
      {
        success: false,
        error: 'Internal server error',
      },
      500
    );
  }
}

/**
 * 送信詳細取得エンドポイント
 */
export async function getSubmissionHandler(c: Context<{ Bindings: Env }>) {
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ success: false, error: 'ID is required' }, 400);
    }

    const repository = new SubmissionRepository(c.env.DB);
    const service = new SubmissionService(repository);

    const submission = await service.getSubmission(id);

    if (!submission) {
      return c.json({ success: false, error: 'Not found' }, 404);
    }

    return c.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    return c.json(
      {
        success: false,
        error: 'Internal server error',
      },
      500
    );
  }
}

/**
 * 送信削除エンドポイント
 */
export async function deleteSubmissionHandler(c: Context<{ Bindings: Env }>) {
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ success: false, error: 'ID is required' }, 400);
    }

    const repository = new SubmissionRepository(c.env.DB);
    const service = new SubmissionService(repository);

    const deleted = await service.deleteSubmission(id);

    if (!deleted) {
      return c.json({ success: false, error: 'Not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete submission error:', error);
    return c.json(
      {
        success: false,
        error: 'Internal server error',
      },
      500
    );
  }
}
