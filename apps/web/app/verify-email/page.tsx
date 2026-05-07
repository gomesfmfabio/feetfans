'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    // Get email from URL params or session
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Try to get from session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          setEmail(session.user.email);
        }
      });
    }
  }, [searchParams]);

  async function handleResend() {
    if (!email) return;

    setResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      setResent(true);

      // Reset after 5 seconds
      setTimeout(() => setResent(false), 5000);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            We sent a verification link to <strong>{email}</strong>
          </p>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-medium text-blue-900 mb-2">📧 Next Steps:</h3>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Check your inbox (and spam folder)</li>
              <li>Click the verification link in the email</li>
              <li>Return here and log in</li>
            </ol>
          </div>

          {/* Resend button */}
          {resent ? (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">✓ Verification email sent!</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mb-4">
              Didn't receive the email?{' '}
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-pink-600 hover:text-pink-700 font-medium disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend'}
              </button>
            </p>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              Go to Login
            </Link>

            <Link href="/" className="block text-sm text-gray-600 hover:text-gray-900">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
