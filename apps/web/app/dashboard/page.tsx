'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user?.nickname || 'Creator'}!
              </h1>
              <p className="text-gray-600 mt-1">
                {user?.email}
              </p>
              {user?.subscription_status === 'trial' && user?.trial_ends_at && (
                <p className="text-sm text-blue-600 mt-2">
                  🎁 Trial: {Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days remaining
                </p>
              )}
              {user?.subscription_status === 'active' && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Pro Member ($9/month)
                </p>
              )}
            </div>
            <Link
              href="/profile/edit"
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Link
            href="/upload"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">📸</div>
            <h3 className="font-semibold text-gray-900 mb-1">Upload Content</h3>
            <p className="text-sm text-gray-600">Share new photos and videos</p>
          </Link>

          <Link
            href="/inbox"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-semibold text-gray-900 mb-1">Messages</h3>
            <p className="text-sm text-gray-600">Chat with AI agents and buyers</p>
          </Link>

          <Link
            href="/my-content"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🖼️</div>
            <h3 className="font-semibold text-gray-900 mb-1">My Gallery</h3>
            <p className="text-sm text-gray-600">View and manage your content</p>
          </Link>

          <Link
            href="/feed"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🌟</div>
            <h3 className="font-semibold text-gray-900 mb-1">Discover</h3>
            <p className="text-sm text-gray-600">Browse other creators</p>
          </Link>

          {user?.subscription_status === 'trial' && (
            <Link
              href="/checkout"
              className="bg-gradient-to-br from-pink-500 to-purple-500 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-white"
            >
              <div className="text-2xl mb-2">⭐</div>
              <h3 className="font-semibold mb-1">Upgrade to Pro</h3>
              <p className="text-sm opacity-90">Unlock all features - $9/month</p>
            </Link>
          )}

          {(user?.subscription_status === 'active' || user?.subscription_status === 'free_feetfans') && (
            <Link
              href="/dashboard/subscription"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">💳</div>
              <h3 className="font-semibold text-gray-900 mb-1">Subscription</h3>
              <p className="text-sm text-gray-600">Manage billing</p>
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="text-2xl mb-2">🚪</div>
            <h3 className="font-semibold text-gray-900 mb-1">Sign Out</h3>
            <p className="text-sm text-gray-600">Log out of your account</p>
          </button>
        </div>

        {/* Status Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">📊 Account Status</h3>
          <div className="grid grid-cols-2 gap-4 text-xs text-blue-800">
            <div>
              <span className="font-medium">Role:</span> {user?.role}
            </div>
            <div>
              <span className="font-medium">Status:</span> {user?.subscription_status}
            </div>
            <div>
              <span className="font-medium">Age Verified:</span> {user?.age_verified ? '✓ Yes' : '✗ No'}
            </div>
            <div>
              <span className="font-medium">Member Since:</span> {new Date(user?.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
