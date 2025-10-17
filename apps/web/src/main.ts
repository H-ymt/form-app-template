import './index.css';

// 型定義
interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

// 環境変数（本番環境では適切なAPIエンドポイントを設定）
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
const FORM_ID = 'contact-form';

// 状態管理
let state: FormState = {
  isSubmitting: false,
  isSuccess: false,
  error: null,
};

// DOM要素
const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App element not found');
}

// フォームHTML生成
function renderForm(): string {
  if (state.isSuccess) {
    return `
      <div class="container mx-auto max-w-2xl px-4 py-12">
        <div class="rounded-lg bg-green-50 p-8 text-center">
          <svg class="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <h2 class="mt-4 text-2xl font-bold text-green-900">送信完了</h2>
          <p class="mt-2 text-green-700">お問い合わせありがとうございます。<br>内容を確認次第、ご連絡させていただきます。</p>
          <button
            onclick="location.reload()"
            class="mt-6 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
          >
            新しいお問い合わせを送る
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="container mx-auto max-w-2xl px-4 py-12">
      <div class="rounded-lg bg-white p-8 shadow-lg">
        <h1 class="mb-2 text-3xl font-bold text-gray-900">お問い合わせ</h1>
        <p class="mb-8 text-gray-600">以下のフォームからお気軽にお問い合わせください</p>

        ${
          state.error
            ? `
          <div class="mb-6 rounded-lg bg-red-50 p-4" role="alert">
            <p class="text-sm text-red-800">${state.error}</p>
          </div>
        `
            : ''
        }

        <form id="contactForm" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              お名前 <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              ${state.isSubmitting ? 'disabled' : ''}
              class="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="山田 太郎"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              メールアドレス <span class="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              ${state.isSubmitting ? 'disabled' : ''}
              class="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label for="subject" class="block text-sm font-medium text-gray-700">
              件名 <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              ${state.isSubmitting ? 'disabled' : ''}
              class="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="お問い合わせの件名"
            />
          </div>

          <div>
            <label for="message" class="block text-sm font-medium text-gray-700">
              お問い合わせ内容 <span class="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows="6"
              required
              ${state.isSubmitting ? 'disabled' : ''}
              class="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="お問い合わせ内容をご記入ください"
            ></textarea>
          </div>

          <button
            type="submit"
            ${state.isSubmitting ? 'disabled' : ''}
            class="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            ${state.isSubmitting ? '送信中...' : '送信する'}
          </button>
        </form>
      </div>
    </div>
  `;
}

// フォーム送信処理
async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  const data: FormData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    subject: formData.get('subject') as string,
    message: formData.get('message') as string,
  };

  // 状態更新: 送信中
  state = { isSubmitting: true, isSuccess: false, error: null };
  render();

  try {
    const response = await fetch(`${API_URL}/api/forms/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formId: FORM_ID,
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || '送信に失敗しました');
    }

    // 成功
    state = { isSubmitting: false, isSuccess: true, error: null };
    render();
  } catch (error) {
    // エラー
    state = {
      isSubmitting: false,
      isSuccess: false,
      error: error instanceof Error ? error.message : '送信に失敗しました',
    };
    render();
  }
}

// レンダリング
function render(): void {
  if (!app) return;

  app.innerHTML = renderForm();

  // イベントリスナーの再設定
  const form = document.querySelector<HTMLFormElement>('#contactForm');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
}

// 初期レンダリング
render();

console.log('Contact form loaded');
