/**
 * Simple in-memory rate limiting
 * For production: use Redis or Upstash
 */

interface RateLimitConfig {
  interval: number; // milliseconds
  maxRequests: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 10 * 60 * 1000);

/**
 * Rate limit checker
 */
export function rateLimit(config: RateLimitConfig) {
  return {
    check: async (identifier: string): Promise<{ success: boolean; remaining: number; reset: number }> => {
      const now = Date.now();
      const key = `${identifier}`;

      // Get or create entry
      if (!store[key] || store[key].resetAt < now) {
        store[key] = {
          count: 0,
          resetAt: now + config.interval,
        };
      }

      const entry = store[key];

      // Check if limit exceeded
      if (entry.count >= config.maxRequests) {
        return {
          success: false,
          remaining: 0,
          reset: entry.resetAt,
        };
      }

      // Increment count
      entry.count++;

      return {
        success: true,
        remaining: config.maxRequests - entry.count,
        reset: entry.resetAt,
      };
    },
  };
}

/**
 * Preset rate limiters
 */

// 10 requests per minute (general API)
export const apiLimiter = rateLimit({
  interval: 60 * 1000,
  maxRequests: 10,
});

// 5 requests per minute (auth endpoints)
export const authLimiter = rateLimit({
  interval: 60 * 1000,
  maxRequests: 5,
});

// 20 uploads per hour
export const uploadLimiter = rateLimit({
  interval: 60 * 60 * 1000,
  maxRequests: 20,
});

// 30 messages per minute
export const messageLimiter = rateLimit({
  interval: 60 * 1000,
  maxRequests: 30,
});

/**
 * Get client identifier (IP or user ID)
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`;

  // Try to get IP from headers
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

  return `ip:${ip}`;
}

/**
 * Rate limit middleware wrapper
 */
export async function withRateLimit(
  request: Request,
  userId: string | undefined,
  limiter: ReturnType<typeof rateLimit>,
  handler: () => Promise<Response>
): Promise<Response> {
  const identifier = getClientIdentifier(request, userId);
  const { success, remaining, reset } = await limiter.check(identifier);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);

    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'You are making requests too quickly. Please slow down.',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limiter['config']?.maxRequests?.toString() || '0',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }

  // Add rate limit headers to successful response
  const response = await handler();
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());

  return response;
}
