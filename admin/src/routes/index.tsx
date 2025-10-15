import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">フォーム送信一覧</h1>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
