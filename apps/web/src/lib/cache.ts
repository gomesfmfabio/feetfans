// @ts-nocheck
/**
 * Caching utilities with in-memory fallback
 * Supports Redis (Upstash) when configured
 */

import { createClient } from '@vercel/kv';

// Check if Redis is configured
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

const redis = KV_REST_API_URL && KV_REST_API_TOKEN
  ? createClient({
      url: KV_REST_API_URL,
      token: KV_REST_API_TOKEN,
    })
  : null;

// In-memory cache fallback (for development)
const memoryCache = new Map<string, { value: any; expiresAt: number }>();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.expiresAt < now) {
        memoryCache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Get value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    if (redis) {
      const value = await redis.get<T>(key);
      return value;
    }

    // Fallback to memory cache
    const entry = memoryCache.get(key);
    if (!entry) return null;

    if (entry.expiresAt < Date.now()) {
      memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set value in cache with TTL (seconds)
 */
export async function cacheSet(
  key: string,
  value: any,
  ttl: number = 60
): Promise<void> {
  try {
    if (redis) {
      await redis.set(key, value, { ex: ttl });
      return;
    }

    // Fallback to memory cache
    memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Delete value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    if (redis) {
      await redis.del(key);
      return;
    }

    memoryCache.delete(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * Delete multiple keys matching pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<void> {
  try {
    if (redis) {
      // Note: scan is expensive, use with caution
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return;
    }

    // Fallback to memory cache
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
        memoryCache.delete(key);
      }
    }
  } catch (error) {
    console.error('Cache delete pattern error:', error);
  }
}

/**
 * Cache wrapper for async functions
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 60
): Promise<T> {
  // Try to get from cache
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function and cache result
  const result = await fn();
  await cacheSet(key, result, ttl);

  return result;
}

/**
 * Cache key builders
 */
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userStats: (userId: string) => `user:${userId}:stats`,
  content: (contentId: string) => `content:${contentId}`,
  feed: (page: number) => `feed:${page}`,
  creatorContent: (creatorId: string, page: number) => `creator:${creatorId}:content:${page}`,
  analytics: (metric: string) => `analytics:${metric}`,
  adminStats: () => 'admin:stats',
};

/**
 * Cache TTLs (seconds)
 */
export const CacheTTL = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  day: 86400, // 24 hours
};
