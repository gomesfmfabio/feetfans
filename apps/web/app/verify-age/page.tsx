'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function VerifyAgePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    // Check if user is already verified
    const checkVerificationStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/verify-age');
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('age_verified, role, account_blocked')
        .eq('id', session.user.id)
        .single();

      if (user?.account_blocked) {
        router.push('/account-blocked');
        return;
      }

      if (user?.age_verified) {
        // Redirect based on role
        if (user.role === 'creator') {
          router.push('/dashboard');
        } else {
          router.push('/feed');
        }
      }
    };

    checkVerificationStatus();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a JPEG, PNG, or PDF file');
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Generate preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        router.push('/login');
        return;
      }

      // Upload to Supabase Storage
      const filePath = `${session.user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('id-documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Call API endpoint to trigger verification
      // For MVP: Mock verification (auto-approve after upload)
      // TODO: Replace with real Onfido/Persona integration
      const response = await fetch('/api/verify-age', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          filePath,
          userId: session.user.id
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Verification failed');
      }

      // For MVP: Simulate immediate verification success
      // In production, this would be handled by webhook
      await supabase
        .from('users')
        .update({ age_verified: true })
        .eq('id', session.user.id);

      // Get user role for redirect
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      // Redirect based on role
      if (user?.role === 'creator') {
        router.push('/dashboard');
      } else {
        router.push('/feed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Age Verification</h1>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Privacy Notice:</strong> Your ID is encrypted and used only for age verification.
            We do not store your ID permanently and it will be automatically deleted after 30 days.
          </p>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          To comply with age restrictions, please upload a government-issued ID
          (driver's license, passport, or national ID card).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Government ID
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />

            {file && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>

                {preview && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Preview:</p>
                    <img
                      src={preview}
                      alt="ID preview"
                      className="max-w-full h-auto border rounded-md max-h-48 object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Submit for Verification'}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          By uploading your ID, you confirm that you are 18 years or older and consent to age verification.
        </p>
      </div>
    </div>
  );
}
