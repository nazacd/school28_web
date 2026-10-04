// Helpers for the few server-side (non-prerendered) routes.

export const env = (key: string) => process.env[key]?.trim() || undefined;

/** Public site URL at runtime (falls back to the request URL). */
export function siteOrigin(request: Request): string {
  const configured = env('SITE_URL');
  if (configured) return new URL(configured).origin;
  const u = new URL(request.url);
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? u.host;
  const proto = request.headers.get('x-forwarded-proto') ?? u.protocol.replace(':', '');
  return `${proto}://${host}`;
}

/**
 * Rejects cross-site form posts. Browsers always send an Origin header on POST,
 * so a missing header means a non-browser client (allowed).
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = new Set(
    [
      request.headers.get('host'),
      request.headers.get('x-forwarded-host'),
      env('SITE_URL') && new URL(env('SITE_URL')!).host,
      new URL(request.url).host,
    ].filter(Boolean) as string[],
  );
  return allowed.has(host);
}

export function clientIp(request: Request, fallback: string): string {
  if (env('TRUST_PROXY') === 'true') {
    const fwd = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (fwd) return fwd;
    const real = request.headers.get('x-real-ip');
    if (real) return real;
  }
  return fallback;
}

/** Very small in-memory rate limiter: `limit` requests per `windowMs` per key. */
export function rateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    }
    return recent.length <= limit;
  };
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
