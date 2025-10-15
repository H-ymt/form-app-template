import type { FormSubmission, ListSubmissionsQuery } from '../types/form';

interface DBSubmission {
  id: string;
  form_id: string;
  data: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  created_at: string;
}

export class SubmissionRepository {
  constructor(private db: D1Database) {}

  /**
   * 送信データを作成
   */
  async create(submission: FormSubmission): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO form_submissions (id, form_id, data, ip_address, user_agent, referrer, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        submission.id,
        submission.formId,
        JSON.stringify(submission.data),
        submission.metadata.ipAddress,
        submission.metadata.userAgent,
        submission.metadata.referrer || null,
        submission.createdAt
      )
      .run();
  }

  /**
   * 送信一覧を取得
   */
  async list(query: ListSubmissionsQuery): Promise<{
    submissions: FormSubmission[];
    total: number;
  }> {
    const { page = 1, limit = 20, formId, startDate, endDate, search } = query;
    const offset = (page - 1) * limit;

    // WHERE条件を構築
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (formId) {
      conditions.push('form_id = ?');
      params.push(formId);
    }

    if (startDate) {
      conditions.push('created_at >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('created_at <= ?');
      params.push(endDate);
    }

    if (search) {
      conditions.push('(form_id LIKE ? OR data LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 総数を取得
    const countResult = await this.db
      .prepare(`SELECT COUNT(*) as count FROM form_submissions ${whereClause}`)
      .bind(...params)
      .first<{ count: number }>();

    const total = countResult?.count || 0;

    // データを取得
    const results = await this.db
      .prepare(
        `SELECT * FROM form_submissions ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...params, limit, offset)
      .all<DBSubmission>();

    const submissions = (results.results || []).map(this.mapToFormSubmission);

    return { submissions, total };
  }

  /**
   * IDで送信データを取得
   */
  async findById(id: string): Promise<FormSubmission | null> {
    const result = await this.db
      .prepare('SELECT * FROM form_submissions WHERE id = ?')
      .bind(id)
      .first<DBSubmission>();

    return result ? this.mapToFormSubmission(result) : null;
  }

  /**
   * IDで送信データを削除
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM form_submissions WHERE id = ?')
      .bind(id)
      .run();

    return (result.meta.changes || 0) > 0;
  }

  /**
   * DBレコードをFormSubmissionに変換
   */
  private mapToFormSubmission(row: DBSubmission): FormSubmission {
    return {
      id: row.id,
      formId: row.form_id,
      data: JSON.parse(row.data) as Record<string, unknown>,
      metadata: {
        ipAddress: row.ip_address || '',
        userAgent: row.user_agent || '',
        referrer: row.referrer || undefined,
      },
      createdAt: row.created_at,
    };
  }
}
