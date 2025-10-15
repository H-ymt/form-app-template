import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { listSubmissions } from '@/lib/api';
import { clearAuth } from '@/lib/auth';
import type { FormSubmission, ListSubmissionsResponse } from '@/types/form';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [data, setData] = useState<ListSubmissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formIdFilter, setFormIdFilter] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, [currentPage, formIdFilter]);

  async function loadSubmissions() {
    try {
      setLoading(true);
      setError(null);
      const response = await listSubmissions({
        page: currentPage,
        limit: 20,
        ...(formIdFilter && { formId: formIdFilter }),
      });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearAuth();
    navigate({ to: '/login' });
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
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="flex items-center gap-4">
            <label htmlFor="formId" className="text-sm font-medium text-gray-700">
              フォームID:
            </label>
            <input
              id="formId"
              type="text"
              value={formIdFilter}
              onChange={(e) => {
                setFormIdFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="フィルター（空欄で全件表示）"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {formIdFilter && (
              <button
                onClick={() => {
                  setFormIdFilter('');
                  setCurrentPage(1);
                }}
                className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                クリア
              </button>
            )}
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
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    前へ
                  </button>
                  <span className="flex items-center px-4 text-sm text-gray-700">
                    {currentPage} / {data.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(data.pagination.totalPages, p + 1))}
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
