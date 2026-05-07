'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      // Check if user is admin
      const response = await fetch('/api/admin/check');

      if (!response.ok) {
        router.push('/dashboard');
        return;
      }

      await loadStats();
    } catch (error) {
      console.error('Admin check error:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const response = await fetch('/api/admin/stats');

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Platform management and moderation</p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Creators</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.activeCreators || 0}
                </p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reports</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats?.pendingReports || 0}
                </p>
              </div>
              <div className="text-3xl">🚨</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Content</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalContent || 0}
                </p>
              </div>
              <div className="text-3xl">📸</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/users"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">👤</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              User Management
            </h3>
            <p className="text-sm text-gray-600">
              View, ban, and manage user accounts
            </p>
          </Link>

          <Link
            href="/admin/moderation"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Moderation Queue
            </h3>
            <p className="text-sm text-gray-600">
              Review and moderate reported content
            </p>
          </Link>

          <Link
            href="/admin/content"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">📁</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Content Management
            </h3>
            <p className="text-sm text-gray-600">
              Browse and manage all platform content
            </p>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analytics
            </h3>
            <p className="text-sm text-gray-600">
              View platform metrics and trends
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Settings
            </h3>
            <p className="text-sm text-gray-600">
              Platform configuration and feature flags
            </p>
          </Link>

          <Link
            href="/admin/audit"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Audit Log
            </h3>
            <p className="text-sm text-gray-600">
              View admin actions and system events
            </p>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="text-sm text-gray-600">
            Activity feed coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}
