'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function SubscriptionManagementPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

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

  async function handleManageSubscription() {
    setOpeningPortal(true);

    try {
      const response = await fetch('/api/subscriptions/billing-portal', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to open billing portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error('Billing portal error:', error);
      alert(error.message || 'Failed to open billing portal');
    } finally {
      setOpeningPortal(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const isActive = user?.subscription_status === 'active';
  const isTrial = user?.subscription_status === 'trial';
  const isFree = user?.subscription_status === 'free_feetfans';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-pink-600 hover:text-pink-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>

          {isFree && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🎓</span>
                <div>
                  <h3 className="font-semibold text-green-900">Course Graduate</h3>
                  <p className="text-sm text-green-700">Free lifetime access</p>
                </div>
              </div>
            </div>
          )}

          {isActive && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Pro - $9/month</h3>
                  <p className="text-sm text-blue-700">
                    {user.subscription_cancel_at_period_end
                      ? `Cancels ${new Date(user.subscription_period_end).toLocaleDateString()}`
                      : `Renews ${new Date(user.subscription_period_end).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={handleManageSubscription}
                  disabled={openingPortal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {openingPortal ? 'Loading...' : 'Manage'}
                </button>
              </div>
            </div>
          )}

          {isTrial && user.trial_ends_at && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-900">Trial</h3>
                  <p className="text-sm text-yellow-700">
                    {Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / 86400000))} days left
                  </p>
                </div>
                <Link href="/checkout" className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600">
                  Upgrade
                </Link>
              </div>
            </div>
          )}
        </div>

        {(isActive || isFree) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Billing</h2>
            <p className="text-gray-600 mb-4">Manage payment method and view invoices</p>
            <button
              onClick={handleManageSubscription}
              disabled={openingPortal}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              {openingPortal ? 'Loading...' : 'Billing Portal'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
