/**
 * Admin authentication and authorization middleware
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type AdminPermission =
  | 'read'
  | 'moderate'
  | 'manage_users'
  | 'manage_content'
  | 'full_access';

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin', { user_id: userId });

  if (error) {
    console.error('Admin check error:', error);
    return false;
  }

  return data === true;
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(
  userId: string,
  permission: AdminPermission
): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_permission', {
    user_id: userId,
    permission,
  });

  if (error) {
    console.error('Permission check error:', error);
    return false;
  }

  return data === true;
}

/**
 * Get admin user with permissions
 */
export async function getAdminUser(userId: string) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, role, created_at')
    .eq('id', userId)
    .eq('role', 'admin')
    .single();

  if (userError || !user) {
    return null;
  }

  const { data: adminData } = await supabase
    .from('admin_users')
    .select('permissions, last_login')
    .eq('id', userId)
    .single();

  return {
    ...user,
    permissions: adminData?.permissions || ['read'],
    lastLogin: adminData?.last_login,
  };
}

/**
 * Update admin last login
 */
export async function updateAdminLastLogin(userId: string) {
  await supabase
    .from('admin_users')
    .upsert({
      id: userId,
      last_login: new Date().toISOString(),
    });
}

/**
 * Middleware response helpers
 */
export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({
      error: 'Unauthorized',
      message: 'Admin access required',
    }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export function forbiddenResponse(requiredPermission?: AdminPermission) {
  return new Response(
    JSON.stringify({
      error: 'Forbidden',
      message: `Permission required: ${requiredPermission || 'admin'}`,
    }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
