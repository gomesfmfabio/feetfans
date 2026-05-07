'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

interface ContentItem {
  id: string;
  file_url: string;
  file_type: 'photo' | 'video';
  categories: string[];
  created_at: string;
}

export default function MyContentPage() {
  const router = useRouter();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; item: ContentItem | null }>({
    show: false,
    item: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/my-content');
        return;
      }

      // Check if user is creator
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (user?.role !== 'creator') {
        router.push('/feed');
        return;
      }

      // Fetch content
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('creator_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContent(data || []);
    } catch (err) {
      console.error('Failed to fetch content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.item) return;

    setDeleting(true);

    try {
      // Extract file path from URL
      const url = new URL(deleteModal.item.file_url);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/content-uploads\/(.+)/);
      const filePath = pathMatch ? pathMatch[1] : null;

      // Delete from database
      const { error: dbError } = await supabase
        .from('content')
        .delete()
        .eq('id', deleteModal.item.id);

      if (dbError) throw dbError;

      // Delete from storage
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('content-uploads')
          .remove([filePath]);

        if (storageError) {
          console.error('Failed to delete from storage:', storageError);
          // Continue anyway - database record is already deleted
        }
      }

      // Update local state
      setContent(content.filter(item => item.id !== deleteModal.item!.id));
      setDeleteModal({ show: false, item: null });
    } catch (err) {
      console.error('Failed to delete content:', err);
      alert('Failed to delete content. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Content</h1>
            <p className="text-gray-600 mt-1">{content.length} item{content.length !== 1 ? 's' : ''} uploaded</p>
          </div>
          <button
            onClick={() => router.push('/upload')}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Upload New
          </button>
        </div>

        {/* Empty State */}
        {content.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h2>
            <p className="text-gray-600 mb-6">Upload your first photo or video to get started</p>
            <button
              onClick={() => router.push('/upload')}
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Upload Content
            </button>
          </div>
        ) : (
          /* Content Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
                {/* Thumbnail */}
                <div className="aspect-square relative bg-gray-200">
                  {item.file_type === 'photo' ? (
                    <img
                      src={item.file_url}
                      alt="Content"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.file_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}

                  {/* Delete Button (appears on hover) */}
                  <button
                    onClick={() => setDeleteModal({ show: true, item })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Video Icon */}
                  {item.file_type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-3">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.categories.slice(0, 2).map(cat => (
                      <span
                        key={cat}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {cat}
                      </span>
                    ))}
                    {item.categories.length > 2 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        +{item.categories.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Upload Date */}
                  <p className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.show && deleteModal.item && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-2">Delete Content?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this {deleteModal.item.file_type}? This action cannot be undone.
              </p>

              {/* Preview */}
              <div className="mb-6 rounded-lg overflow-hidden">
                {deleteModal.item.file_type === 'photo' ? (
                  <img
                    src={deleteModal.item.file_url}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <video
                    src={deleteModal.item.file_url}
                    className="w-full h-48 object-cover"
                    muted
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, item: null })}
                  disabled={deleting}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 disabled:opacity-50 font-medium"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
