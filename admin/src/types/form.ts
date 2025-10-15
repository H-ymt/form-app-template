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
 * 送信一覧のレスポンス
 */
export interface ListSubmissionsResponse {
  data: FormSubmission[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

/**
 * 削除のレスポンス
 */
export interface DeleteSubmissionResponse {
  success: boolean;
}
