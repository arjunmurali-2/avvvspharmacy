import 'server-only';

/** One structured JSON line per unexpected failure, so it can be searched in Vercel's logs. */
export function logError(action: string, e: unknown, extra: Record<string, unknown> = {}) {
  console.error(JSON.stringify({
    level: 'error', scope: 'store', action,
    message: e instanceof Error ? e.message : String(e),
    ...extra, at: new Date().toISOString(),
  }));
}
