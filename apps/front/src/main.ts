import './index.css';

console.log('Form app loaded');

// アプリケーションのエントリーポイント
const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
    <div class="container">
      <h1>フォーム送信画面</h1>
      <p>Coming soon...</p>
    </div>
  `;
}
