'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    const response = await fetch('/api/admin/check');

    if (!response.ok) {
      router.push('/dashboard');
      return;
    }

    await loadAnalytics();
  }

  async function loadAnalytics() {
    setLoading(true);

    try {
      const response = await fetch('/api/admin/analytics');

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
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
        <div className="mb-6">
          <Link href="/admin" className="text-pink-600 hover:text-pink-700 mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Platform metrics and trends</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              ${analytics?.revenue?.total || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              MRR: ${analytics?.revenue?.mrr || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Active Subscriptions</p>
            <p className="text-3xl font-bold text-blue-600">
              {analytics?.subscriptions?.active || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Trial: {analytics?.subscriptions?.trial || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">New Users (7d)</p>
            <p className="text-3xl font-bold text-purple-600">
              {analytics?.users?.new7d || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Total: {analytics?.users?.total || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-2">Conversion Rate</p>
            <p className="text-3xl font-bold text-orange-600">
              {analytics?.conversion?.rate || 0}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Trial to Paid
            </p>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">User Growth</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Creators</span>
                  <span className="font-medium">{analytics?.users?.creators || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${((analytics?.users?.creators || 0) / (analytics?.users?.total || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Consumers</span>
                  <span className="font-medium">{analytics?.users?.consumers || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${((analytics?.users?.consumers || 0) / (analytics?.users?.total || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Active</span>
                  <span className="font-medium text-green-600">
                    {analytics?.subscriptions?.active || 0}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Trial</span>
                  <span className="font-medium text-yellow-600">
                    {analytics?.subscriptions?.trial || 0}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Expired</span>
                  <span className="font-medium text-red-600">
                    {analytics?.subscriptions?.expired || 0}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Free (Course)</span>
                  <span className="font-medium text-blue-600">
                    {analytics?.subscriptions?.free || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Content Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.content?.total || 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Photos</p>
              <p className="text-2xl font-bold text-blue-600">
                {analytics?.content?.photos || 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Videos</p>
              <p className="text-2xl font-bold text-purple-600">
                {analytics?.content?.videos || 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Last 7 Days</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics?.content?.new7d || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
