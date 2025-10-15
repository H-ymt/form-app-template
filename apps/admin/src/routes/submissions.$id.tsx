import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/submissions/$id')({
  component: SubmissionDetail,
});

function SubmissionDetail() {
  const { id } = Route.useParams();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">送信詳細</h1>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-gray-600">ID: {id}</p>
          <p className="mt-2 text-gray-600">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
