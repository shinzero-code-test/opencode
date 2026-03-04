export interface Env {
  ENVIRONMENT: string;
  ADMIN_TOKEN: string;
  PUBLIC_BASE_URL: string;
  DEFAULT_CONCURRENCY: string;
  DB: D1Database;
  CACHE: KVNamespace;
  RATE_LIMITER: DurableObjectNamespace;
  BROWSER: Fetcher;
}
