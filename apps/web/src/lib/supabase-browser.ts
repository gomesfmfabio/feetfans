import { createClient } from '@supabase/supabase-js';

/**
 * Create Supabase client for browser (client component)
 * Replaces deprecated createClientComponentClient
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * Singleton instance for convenience
 * Use this for simple cases where you don't need custom config
 */
export const supabase = createBrowserClient();
