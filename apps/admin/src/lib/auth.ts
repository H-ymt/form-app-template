/**
 * 認証情報をlocalStorageに保存
 */
export function setAuth(username: string, password: string): void {
  const credentials = btoa(`${username}:${password}`);
  localStorage.setItem('auth', credentials);
}

/**
 * 認証情報をlocalStorageから取得
 */
export function getAuth(): string | null {
  return localStorage.getItem('auth');
}

/**
 * 認証情報をlocalStorageから削除
 */
export function clearAuth(): void {
  localStorage.removeItem('auth');
}

/**
 * 認証済みかどうかを確認
 */
export function isAuthenticated(): boolean {
  return getAuth() !== null;
}

/**
 * Authorization ヘッダーを取得
 */
export function getAuthHeader(): string | null {
  const auth = getAuth();
  return auth ? `Basic ${auth}` : null;
}
