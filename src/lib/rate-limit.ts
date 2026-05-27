import 'server-only';

const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 5;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

type Bucket = number[];

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter: number;
  limit: number;
}

const buckets = new Map<string, Bucket>();
let lastCleanupAt = Date.now();

function parseForwardedFor(headers: Headers): string | null {
  const forwardedFor = headers.get('x-forwarded-for');
  if (!forwardedFor) return null;

  const firstIp = forwardedFor.split(',')[0]?.trim();
  return firstIp || null;
}

export function getClientIdentifier(headers: Headers): string {
  return parseForwardedFor(headers) || headers.get('x-real-ip')?.trim() || 'local';
}

function cleanupExpiredBuckets(now: number) {
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;

  const cutoff = now - WINDOW_MS;
  for (const [clientId, timestamps] of buckets.entries()) {
    const active = timestamps.filter((timestamp) => timestamp > cutoff);
    if (active.length === 0) {
      buckets.delete(clientId);
      continue;
    }
    buckets.set(clientId, active);
  }

  lastCleanupAt = now;
}

export function rateLimitRequest(headers: Headers, now: number = Date.now()): RateLimitResult {
  cleanupExpiredBuckets(now);

  const clientId = getClientIdentifier(headers);
  const cutoff = now - WINDOW_MS;
  const timestamps = buckets.get(clientId) || [];
  const active = timestamps.filter((timestamp) => timestamp > cutoff);

  if (active.length >= LIMIT) {
    const resetTime = active[0] + WINDOW_MS;
    const retryAfter = Math.max(0, Math.ceil((resetTime - now) / 1000));
    buckets.set(clientId, active);
    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfter,
      limit: LIMIT,
    };
  }

  active.push(now);
  buckets.set(clientId, active);

  const resetTime = active[0] + WINDOW_MS;
  return {
    allowed: true,
    remaining: LIMIT - active.length,
    resetTime,
    retryAfter: 0,
    limit: LIMIT,
  };
}
