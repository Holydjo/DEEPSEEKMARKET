/**
 * Best-effort in-memory rate limiter for public forms.
 *
 * This protects a single Node process from casual bursts/spam. It is not a
 * substitute for a shared store (Redis/Upstash) in a multi-instance deployment.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

export function rateLimit(
  key: string,
  limit = 8,
  windowMs = 10 * 60_000,
  now = Date.now(),
): RateLimitResult {
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: current.resetAt - now };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: limit - current.count,
    retryAfterMs: 0,
  };
}

/** Test helper; also useful when a user logs in/out in the same process. */
export function resetRateLimits(): void {
  buckets.clear();
}
