import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Create Supabase client for server (route handler)
 * Replaces deprecated createRouteHandlerClient
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Get auth token from cookies
  const cookieStore = cookies();
  const authToken = cookieStore.get('sb-access-token')?.value;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: authToken
        ? {
            Authorization: `Bearer ${authToken}`,
          }
        : {},
    },
  });

  return client;
}
