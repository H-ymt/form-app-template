import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { listSubmissions } from '@/lib/api';
import { clearAuth } from '@/lib/auth';
import type { FormSubmission, ListSubmissionsResponse } from '@/types/form';

// URLクエリパラメータの型定義
type SearchParams = {
  page?: number;
  formId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
};

// フィルター状態の型定義
interface FilterState {
  formId: string;
  startDate: string;
  endDate: string;
  keyword: string;
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      page: Number(search?.page) || undefined,
      formId: (search?.formId as string) || undefined,
      startDate: (search?.startDate as string) || undefined,
      endDate: (search?.endDate as string) || undefined,
      keyword: (search?.keyword as string) || undefined,
    };
  },
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const [data, setData] = useState<ListSubmissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // フィルター状態（URLパラメータから初期化）
  const [filters, setFilters] = useState<FilterState>({
    formId: searchParams.formId || '',
    startDate: searchParams.startDate || '',
    endDate: searchParams.endDate || '',
    keyword: searchParams.keyword || '',
  });

  // 現在のページ（URLパラメータから初期化）
  const currentPage = searchParams.page || 1;

  useEffect(() => {
    loadSubmissions();
  }, [searchParams]);

  // バリデーション関数
  function validateFilters(filters: FilterState): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 日付の妥当性チェック
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);

      if (start > end) {
        errors.push('開始日は終了日より前の日付を指定してください');
      }
    }

    // 未来の日付チェック
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 時刻をリセット

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (startDate > today) {
        errors.push('開始日に未来の日付は指定できません');
      }
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(0, 0, 0, 0);
      if (endDate > today) {
        errors.push('終了日に未来の日付は指定できません');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // データ取得関数
  async function loadSubmissions() {
    try {
      setLoading(true);
      setError(null);
      const response = await listSubmissions({
        page: currentPage,
        limit: 20,
        ...(searchParams.formId && { formId: searchParams.formId }),
        ...(searchParams.startDate && { startDate: searchParams.startDate }),
        ...(searchParams.endDate && { endDate: searchParams.endDate }),
        ...(searchParams.keyword && { search: searchParams.keyword }),
      });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  // 検索実行
  function handleSearch() {
    // バリデーション
    const validation = validateFilters(filters);
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    // URLパラメータを更新（ページは1にリセット）
    navigate({
      to: '/',
      search: {
        page: 1,
        ...(filters.formId && { formId: filters.formId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.keyword && { keyword: filters.keyword }),
      },
    });
  }

  // フィルタークリア
  function handleClear() {
    const clearedFilters: FilterState = {
      formId: '',
      startDate: '',
      endDate: '',
      keyword: '',
    };
    setFilters(clearedFilters);
    setValidationErrors([]);

    // URLパラメータもクリア
    navigate({
      to: '/',
      search: {},
    });
  }

  function handleLogout() {
    clearAuth();
    navigate({ to: '/login' });
  }

  // ページ遷移
  function handlePageChange(newPage: number) {
    navigate({
      to: '/',
      search: {
        ...searchParams,
        page: newPage,
      },
    });
  }

  function handleRowClick(id: string) {
    navigate({ to: '/submissions/$id', params: { id } });
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function truncateData(data: Record<string, unknown>): string {
    const str = JSON.stringify(data);
    return str.length > 100 ? str.substring(0, 100) + '...' : str;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">フォーム送信一覧</h1>
            <button
              onClick={handleLogout}
              className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* フィルター */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">フィルター</h2>

          <div className="space-y-4">
            {/* フォームID */}
            <div>
              <label htmlFor="formId" className="block text-sm font-medium text-gray-700">
                フォームID
              </label>
              <input
                id="formId"
                type="text"
                value={filters.formId}
                onChange={(e) => setFilters({ ...filters, formId: e.target.value })}
                placeholder="例: contact-form"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 日付範囲 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  開始日
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  終了日
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* キーワード検索 */}
            <div>
              <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">
                キーワード検索
              </label>
              <input
                id="keyword"
                type="text"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                placeholder="フォームIDまたはフォームデータ内を検索"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">※フォームIDまたはフォームデータ内を検索</p>
            </div>

            {/* バリデーションエラー */}
            {validationErrors.length > 0 && (
              <div className="rounded-md bg-red-50 p-3">
                <ul className="list-disc space-y-1 pl-5 text-sm text-red-800">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ボタン */}
            <div className="flex gap-3">
              <button
                onClick={handleSearch}
                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                検索
              </button>
              <button
                onClick={handleClear}
                className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                クリア
              </button>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* ローディング表示 */}
        {loading && (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        )}

        {/* データ表示 */}
        {!loading && data && (
          <>
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      送信日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      フォームID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      データ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      IPアドレス
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data.data.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        データがありません
                      </td>
                    </tr>
                  ) : (
                    data.data.map((submission: FormSubmission) => (
                      <tr
                        key={submission.id}
                        onClick={() => handleRowClick(submission.id)}
                        className="cursor-pointer transition-colors hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {formatDate(submission.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {submission.formId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-md overflow-hidden text-ellipsis">
                            {truncateData(submission.data)}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {submission.metadata.ipAddress || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ページネーション */}
            {data.pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow">
                <div className="text-sm text-gray-700">
                  全{data.pagination.totalItems}件中 {(currentPage - 1) * data.pagination.limit + 1}〜
                  {Math.min(currentPage * data.pagination.limit, data.pagination.totalItems)}件を表示
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    前へ
                  </button>
                  <span className="flex items-center px-4 text-sm text-gray-700">
                    {currentPage} / {data.pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      handlePageChange(Math.min(data.pagination.totalPages, currentPage + 1))
                    }
                    disabled={currentPage === data.pagination.totalPages}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    次へ
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
