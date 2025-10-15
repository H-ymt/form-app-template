export interface Env {
  DB: D1Database;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  ALLOWED_ORIGINS: string;
  RESEND_API_KEY?: string;
  NOTIFICATION_EMAIL?: string;
}
