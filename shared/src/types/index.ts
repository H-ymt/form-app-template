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
 * フォーム送信のメタデータ
 */
export interface FormSubmissionMetadata {
  ipAddress: string;
  userAgent: string;
  referrer?: string;
}

/**
 * フォーム送信APIのリクエスト
 */
export interface SubmitFormRequest {
  formId: string;
  [key: string]: unknown;
}

/**
 * フォーム送信APIのレスポンス（成功）
 */
export interface SubmitFormSuccessResponse {
  success: true;
  submissionId: string;
}

/**
 * フォーム送信APIのレスポンス（失敗）
 */
export interface SubmitFormErrorResponse {
  success: false;
  error: string;
}

/**
 * フォーム送信APIのレスポンス
 */
export type SubmitFormResponse = SubmitFormSuccessResponse | SubmitFormErrorResponse;

/**
 * 一覧取得のページネーション情報
 */
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

/**
 * 送信一覧取得のレスポンス
 */
export interface ListSubmissionsResponse {
  data: FormSubmission[];
  pagination: Pagination;
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
 * 削除APIのレスポンス
 */
export interface DeleteSubmissionResponse {
  success: boolean;
}
