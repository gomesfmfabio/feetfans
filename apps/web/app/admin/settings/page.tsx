'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { featureFlags } from '@/lib/feature-flags';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<Record<string, boolean>>(featureFlags);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const response = await fetch('/api/admin/check');

    if (!response.ok) {
      router.push('/dashboard');
      return;
    }

    setLoading(false);
  }

  async function handleToggle(flag: string) {
    const newValue = !flags[flag];
    setFlags({ ...flags, [flag]: newValue });

    // Note: Feature flags are currently static in code
    // This UI is a preview - would need backend implementation to persist
    console.log(`Feature flag ${flag} toggled to ${newValue}`);
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
        <div className="mb-6">
          <Link href="/admin" className="text-pink-600 hover:text-pink-700 mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Platform configuration and feature flags</p>
        </div>

        {/* Feature Flags */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Feature Flags</h2>
          <p className="text-sm text-gray-600 mb-6">
            Control feature rollout and enable/disable functionality
          </p>

          <div className="space-y-4">
            {Object.entries(flags).map(([flag, enabled]) => (
              <div key={flag} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {flag.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getFlagDescription(flag)}
                  </p>
                </div>

                <button
                  onClick={() => handleToggle(flag)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Note:</strong> Feature flags are currently static in code.
              Changes here are for preview only and won't persist after refresh.
              Backend implementation coming soon.
            </p>
          </div>
        </div>

        {/* Platform Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Platform Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trial Duration (days)
              </label>
              <input
                type="number"
                defaultValue={7}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription Price (USD/month)
              </label>
              <input
                type="number"
                defaultValue={9}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Upload Size (MB)
              </label>
              <input
                type="number"
                defaultValue={50}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                disabled
              />
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-500">
                Platform settings are configured via environment variables and code.
                UI for dynamic configuration coming in future updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFlagDescription(flag: string): string {
  const descriptions: Record<string, string> = {
    stripe_integration: 'Enable Stripe payment processing for subscriptions',
    admin_dashboard: 'Enable admin dashboard and moderation tools',
    video_upload: 'Allow video uploads (in addition to photos)',
    push_notifications: 'Enable push notifications for mobile users',
    read_receipts: 'Show read receipts in messages',
    ai_content_moderation: 'Automatic content moderation using AI',
    redis_caching: 'Enable Redis caching for better performance',
  };

  return descriptions[flag] || 'No description available';
}
