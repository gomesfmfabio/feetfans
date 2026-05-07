'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient();

      // Get the code from URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        // Set the session
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        // Get user data
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Fetch user role
          const { data: userData } = await supabase
            .from('users')
            .select('role, age_verified')
            .eq('id', user.id)
            .single();

          // Redirect based on role
          if (userData?.role === 'creator' && !userData.age_verified) {
            router.push('/verify-age');
          } else if (userData?.role === 'creator') {
            router.push('/dashboard');
          } else {
            router.push('/feed');
          }
        } else {
          router.push('/login');
        }
      } else {
        // No tokens, redirect to login
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Verificando autenticação...</p>
      </div>
    </div>
  );
}
