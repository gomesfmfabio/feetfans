'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface ContentItem {
  id: string;
  file_url: string;
  file_type: 'photo' | 'video';
  categories: string[];
  created_at: string;
}

interface Creator {
  id: string;
  nickname: string;
  created_at: string;
}

interface UserProfile {
  role: 'creator' | 'consumer';
  subscription_status: 'trial' | 'active' | 'cancelled';
}

export default function CreatorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const creatorId = params.id as string;

  const [creator, setCreator] = useState<Creator | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [contentCount, setContentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [lightboxItem, setLightboxItem] = useState<ContentItem | null>(null);
  const [showTrialTooltip, setShowTrialTooltip] = useState(false);

  useEffect(() => {
    loadCreatorProfile();
  }, [creatorId]);

  const loadCreatorProfile = async () => {
    try {
      setLoading(true);

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/creator/' + creatorId);
        return;
      }

      // Get current user profile
      const { data: userProfile } = await supabase
        .from('users')
        .select('role, subscription_status')
        .eq('id', session.user.id)
        .single();

      setCurrentUser(userProfile);

      // Fetch creator info
      const { data: creatorData, error: creatorError } = await supabase
        .from('users')
        .select('id, nickname, created_at')
        .eq('id', creatorId)
        .eq('role', 'creator')
        .single();

      if (creatorError || !creatorData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCreator(creatorData);

      // Fetch creator's content with count
      const { data: contentData, count, error: contentError } = await supabase
        .from('content')
        .select('*', { count: 'exact' })
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });

      if (contentError) throw contentError;

      setContent(contentData || []);
      setContentCount(count || 0);
    } catch (err) {
      console.error('Failed to load creator profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageCreator = () => {
    if (currentUser?.subscription_status === 'trial') {
      setShowTrialTooltip(true);
      setTimeout(() => setShowTrialTooltip(false), 3000);
      return;
    }

    // Navigate to chat (Epic 3 - to be implemented)
    router.push(`/messages?creator=${creatorId}`);
  };

  const openLightbox = (item: ContentItem) => {
    setLightboxItem(item);
  };

  const closeLightbox = () => {
    setLightboxItem(null);
  };

  const formatJoinDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-gray-600 mb-6">Creator not found</p>
          <button
            onClick={() => router.push('/feed')}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Creator Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              {/* Creator Avatar */}
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-semibold mr-4">
                {(creator?.nickname || 'U')[0].toUpperCase()}
              </div>

              {/* Creator Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{creator?.nickname}</h1>
                <p className="text-gray-600 mt-1">
                  Joined {formatJoinDate(creator?.created_at || '')}
                </p>
                <p className="text-gray-600">
                  {contentCount} {contentCount === 1 ? 'post' : 'posts'}
                </p>
              </div>
            </div>

            {/* Message Creator Button */}
            <div className="relative">
              <button
                onClick={handleMessageCreator}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Message Creator
              </button>

              {/* Trial Tooltip */}
              {showTrialTooltip && (
                <div className="absolute top-full mt-2 right-0 bg-gray-900 text-white text-sm px-4 py-2 rounded-md whitespace-nowrap z-10">
                  Upgrade to message real creators
                  <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
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
            <p className="text-gray-600">This creator hasn't posted any content yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer"
                onClick={() => openLightbox(item)}
              >
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

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Categories */}
                <div className="p-3">
                  <div className="flex flex-wrap gap-1">
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxItem && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Content */}
              <div className="max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
                {lightboxItem.file_type === 'photo' ? (
                  <img
                    src={lightboxItem.file_url}
                    alt="Content"
                    className="max-h-[90vh] max-w-full object-contain"
                  />
                ) : (
                  <video
                    src={lightboxItem.file_url}
                    controls
                    autoPlay
                    className="max-h-[90vh] max-w-full object-contain"
                  />
                )}

                {/* Categories */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {lightboxItem.categories.map(cat => (
                    <span
                      key={cat}
                      className="text-sm bg-white bg-opacity-20 text-white px-3 py-1 rounded-full"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
