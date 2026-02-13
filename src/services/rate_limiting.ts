import {redis} from "@/lib/redis";

interface RateLimitOptions {
  key: string;
  limit: number;
  window: number;
}
export async function rateLimit({ key, limit, window }: RateLimitOptions) {
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / window);
  const rediskey = `rate_limit:${key}:${bucket}`;
  const count = await redis.incr(rediskey);
  if (count === 1) {
    await redis.expire(rediskey, window);
  }

  const allowed = count <= limit;
  const remaining = Math.max(0, limit - count);

  let retryAfter: number | null = null;
  if (!allowed) {
   const secondsPassedInWindow = now % window;
   retryAfter = window - secondsPassedInWindow;
  }

  return { key: rediskey, allowed, remaining, limit, retryAfter };
}
