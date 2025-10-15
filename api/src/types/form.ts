/**
 * フォーム送信データの型定義
 */
export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  metadata: FormSubmissionMetadata;
  createdAt: string;
}

/**
 * フォーム送信時のメタデータ
 */
export interface FormSubmissionMetadata {
  ipAddress?: string;
  userAgent?: string;
  referrer?: string | null;
}

/**
 * 送信一覧取得のクエリパラメータ
 */
export interface ListSubmissionsQuery {
  page?: number;
  limit?: number;
  formId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * フォーム送信リクエスト
 */
export interface SubmitFormRequest {
  formId: string;
  [key: string]: unknown;
}

/**
 * ページネーション情報
 */
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}
