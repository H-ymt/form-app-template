import { getAuthHeader } from './auth';
import type {
  FormSubmission,
  ListSubmissionsResponse,
  ListSubmissionsQuery,
  DeleteSubmissionResponse,
} from '@form-app/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

/**
 * API リクエスト用のヘルパー関数
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const authHeader = getAuthHeader();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader && { Authorization: authHeader }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * 送信一覧を取得
 */
export async function listSubmissions(query: ListSubmissionsQuery = {}): Promise<ListSubmissionsResponse> {
  const params = new URLSearchParams();

  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.formId) params.append('formId', query.formId);
  if (query.startDate) params.append('startDate', query.startDate);
  if (query.endDate) params.append('endDate', query.endDate);
  if (query.search) params.append('search', query.search);

  const queryString = params.toString();
  const endpoint = `/api/admin/submissions${queryString ? `?${queryString}` : ''}`;

  return fetchAPI<ListSubmissionsResponse>(endpoint);
}

/**
 * 送信詳細を取得
 */
export async function getSubmission(id: string): Promise<FormSubmission> {
  return fetchAPI<FormSubmission>(`/api/admin/submissions/${id}`);
}

/**
 * 送信を削除
 */
export async function deleteSubmission(id: string): Promise<DeleteSubmissionResponse> {
  return fetchAPI<DeleteSubmissionResponse>(`/api/admin/submissions/${id}`, {
    method: 'DELETE',
  });
}

/**
 * ログイン（認証情報をテスト）
 */
export async function login(username: string, password: string): Promise<boolean> {
  try {
    const credentials = btoa(`${username}:${password}`);
    const response = await fetch(`${API_URL}/api/admin/submissions?limit=1`, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}
