'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

const CATEGORIES = [
  'Barefoot', 'Heels', 'Socks', 'Stockings', 'Nail Polish',
  'Jewelry', 'Outdoors', 'Beach', 'Gym', 'Yoga',
  'Artistic', 'Close-up', 'Action', 'Relaxing', 'Playful'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkUserEligibility();
  }, []);

  const checkUserEligibility = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/upload');
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('role, age_verified')
        .eq('id', session.user.id)
        .single();

      if (!user) {
        router.push('/');
        return;
      }

      setUserRole(user.role);

      // Redirect consumers to feed
      if (user.role === 'consumer') {
        router.push('/feed');
        return;
      }

      // Redirect unverified creators to age verification
      if (!user.age_verified) {
        router.push('/verify-age');
        return;
      }
    } catch (err) {
      console.error('Failed to check user eligibility:', err);
      router.push('/');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Validate files
    const validFiles: File[] = [];
    let hasError = false;

    for (const file of selectedFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`${file.name} is not a supported file type. Please upload JPEG, PNG, WebP, MP4, or MOV files.`);
        hasError = true;
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} exceeds 50MB limit. Please compress or choose a smaller file.`);
        hasError = true;
        break;
      }
      validFiles.push(file);
    }

    if (!hasError) {
      setFiles(validFiles.slice(0, 10)); // Max 10 files
      setError('');
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else if (selectedCategories.length < 5) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    if (selectedCategories.length === 0) {
      setError('Please select at least one category (1-5 tags)');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const totalFiles = files.length;
      let uploadedFiles = 0;

      for (const file of files) {
        // Upload to Supabase Storage
        const filePath = `${session.user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('content-uploads')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('content-uploads')
          .getPublicUrl(filePath);

        // Determine file type
        const fileType = ACCEPTED_IMAGE_TYPES.includes(file.type) ? 'photo' : 'video';

        // Insert content record
        const { error: dbError } = await supabase
          .from('content')
          .insert({
            creator_id: session.user.id,
            file_url: publicUrl,
            file_type: fileType,
            categories: selectedCategories,
          });

        if (dbError) {
          // Rollback: Delete uploaded file
          await supabase.storage.from('content-uploads').remove([filePath]);
          throw dbError;
        }

        uploadedFiles++;
        setUploadProgress(Math.round((uploadedFiles / totalFiles) * 100));
      }

      // Success - redirect to gallery
      router.push('/my-content');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = () => {
    setError('');
    setUploadProgress(0);
    handleSubmit(new Event('submit') as any);
  };

  // Show loading while checking eligibility
  if (userRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Upload Content</h1>
          <p className="text-gray-600 mt-1">Share your photos and videos with your audience</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Photos or Videos
            </label>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.mp4,.mov"
              onChange={handleFileChange}
              disabled={uploading}
              className="w-full border border-gray-300 rounded-md p-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max 10 files, 50MB each. Supported: JPEG, PNG, WebP, MP4, MOV
            </p>

            {files.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium text-gray-700">{files.length} file(s) selected:</p>
                {files.map((file, idx) => (
                  <div key={idx} className="text-xs text-gray-600 flex items-center">
                    <span className="mr-2">
                      {file.type.startsWith('image/') ? '📷' : '🎥'}
                    </span>
                    <span>{file.name}</span>
                    <span className="ml-2 text-gray-400">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Categories (1-5 tags)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  disabled={uploading || (!selectedCategories.includes(category) && selectedCategories.length >= 5)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategories.includes(category)
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {category}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {selectedCategories.length}/5 categories selected
              {selectedCategories.length > 0 && (
                <span className="ml-2">
                  ({selectedCategories.join(', ')})
                </span>
              )}
            </p>
          </div>

          {/* Upload Progress */}
          {uploading && uploadProgress > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="ml-4 text-red-600 hover:text-red-700 font-medium underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || files.length === 0 || selectedCategories.length === 0}
            className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {uploading
              ? `Uploading ${files.length} file(s)...`
              : `Upload ${files.length > 0 ? files.length : ''} file${files.length !== 1 ? 's' : ''}`
            }
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Great Content</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Use good lighting for clear, appealing photos</li>
            <li>• Select relevant categories to help people discover your content</li>
            <li>• Mix different styles and settings for variety</li>
            <li>• Keep videos under 50MB for faster uploads</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
