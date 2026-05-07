/**
 * Database query optimizations and best practices
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Optimized feed query with pagination
 */
export async function getOptimizedFeed(page: number = 0, limit: number = 20) {
  const offset = page * limit;

  const { data, error, count } = await supabase
    .from('content')
    .select(
      `
      id,
      file_url,
      file_type,
      categories,
      created_at,
      creator:creator_id (
        id,
        nickname,
        avatar_url
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return {
    content: data || [],
    total: count || 0,
    hasMore: count ? offset + limit < count : false,
  };
}

/**
 * Optimized user content query
 */
export async function getUserContent(userId: string, page: number = 0, limit: number = 20) {
  const offset = page * limit;

  const { data, error } = await supabase
    .from('content')
    .select('id, file_url, file_type, categories, created_at')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return data || [];
}

/**
 * Optimized conversation query
 */
export async function getConversation(
  userId: string,
  otherUserId: string,
  limit: number = 50
) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, content, sender_id, created_at, read_at')
    .or(
      `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

/**
 * Optimized unread count query
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .is('read_at', null);

  return count || 0;
}

/**
 * Batch user lookup (avoid N+1 queries)
 */
export async function batchGetUsers(userIds: string[]) {
  const { data, error } = await supabase
    .from('users')
    .select('id, nickname, avatar_url, role')
    .in('id', userIds);

  const userMap = new Map();
  data?.forEach((user) => userMap.set(user.id, user));

  return userMap;
}

/**
 * Efficient search with full-text search
 */
export async function searchContent(query: string, limit: number = 20) {
  // Use GIN index on categories for fast search
  const { data, error } = await supabase
    .from('content')
    .select(
      `
      id,
      file_url,
      file_type,
      categories,
      created_at,
      creator:creator_id (
        id,
        nickname
      )
    `
    )
    .contains('categories', [query])
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

/**
 * Bulk operations helper
 */
export async function bulkInsert<T>(table: string, records: T[]) {
  const chunkSize = 100; // Supabase recommended batch size
  const chunks = [];

  for (let i = 0; i < records.length; i += chunkSize) {
    chunks.push(records.slice(i, i + chunkSize));
  }

  const results = await Promise.all(
    chunks.map((chunk) => supabase.from(table).insert(chunk))
  );

  return results;
}

/**
 * Connection pooling stats (for monitoring)
 */
export async function getDbStats() {
  // This would typically query pg_stat_database
  // For now, return placeholder
  return {
    activeConnections: 0,
    idleConnections: 0,
    maxConnections: 100,
  };
}
