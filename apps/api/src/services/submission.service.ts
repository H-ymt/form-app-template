import type {
  FormSubmission,
  SubmitFormRequest,
  ListSubmissionsQuery,
  Pagination,
} from '@form-app/shared';
import { SubmissionRepository } from '../repositories/submission.repository';

export class SubmissionService {
  constructor(private repository: SubmissionRepository) {}

  /**
   * フォーム送信を作成
   */
  async submitForm(
    request: SubmitFormRequest,
    metadata: { ipAddress: string; userAgent: string; referrer?: string }
  ): Promise<string> {
    const { formId, ...data } = request;

    const submission: FormSubmission = {
      id: crypto.randomUUID(),
      formId,
      data,
      metadata,
      createdAt: new Date().toISOString(),
    };

    await this.repository.create(submission);

    return submission.id;
  }

  /**
   * 送信一覧を取得
   */
  async listSubmissions(query: ListSubmissionsQuery): Promise<{
    data: FormSubmission[];
    pagination: Pagination;
  }> {
    const { page = 1, limit = 20 } = query;

    const { submissions, total } = await this.repository.list(query);

    const totalPages = Math.ceil(total / limit);

    return {
      data: submissions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        limit,
      },
    };
  }

  /**
   * 送信詳細を取得
   */
  async getSubmission(id: string): Promise<FormSubmission | null> {
    return await this.repository.findById(id);
  }

  /**
   * 送信を削除
   */
  async deleteSubmission(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }
}
