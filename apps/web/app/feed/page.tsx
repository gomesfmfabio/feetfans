'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

interface ContentItem {
  id: string;
  file_url: string;
  file_type: 'photo' | 'video';
  categories: string[];
  created_at: string;
  creator_id: string;
  creator?: {
    nickname: string;
  };
}

const ITEMS_PER_PAGE = 20;

export default function FeedPage() {
  const router = useRouter();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuthAndLoadContent();
  }, []);

  const checkAuthAndLoadContent = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/feed');
        return;
      }

      await loadInitialContent();
    } catch (err) {
      console.error('Failed to check auth:', err);
      router.push('/login');
    }
  };

  const loadInitialContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select(`
          id,
          file_url,
          file_type,
          categories,
          created_at,
          creator_id,
          creator:users!creator_id(nickname)
        `)
        .order('created_at', { ascending: false })
        .range(0, ITEMS_PER_PAGE - 1);

      if (error) throw error;

      // Map creator from array to object (Supabase returns array for joins)
      const mappedData = (data || []).map(item => ({
        ...item,
        creator: Array.isArray(item.creator) ? item.creator[0] : item.creator
      }));

      setContent(mappedData);
      setHasMore((data || []).length === ITEMS_PER_PAGE);
      setPage(1);
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreContent = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('content')
        .select(`
          id,
          file_url,
          file_type,
          categories,
          created_at,
          creator_id,
          creator:users!creator_id(nickname)
        `)
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      if (data && data.length > 0) {
        // Map creator from array to object
        const mappedData = data.map(item => ({
          ...item,
          creator: Array.isArray(item.creator) ? item.creator[0] : item.creator
        }));

        setContent(prev => [...prev, ...mappedData]);
        setPage(prev => prev + 1);
        setHasMore(data.length === ITEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more content:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreContent();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loadMoreContent]);

  // Video autoplay on scroll
  useEffect(() => {
    const videos = document.querySelectorAll('video[data-autoplay]');

    const videoObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Autoplay failed, user needs to interact
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    videos.forEach(video => videoObserver.observe(video));

    return () => {
      videos.forEach(video => videoObserver.unobserve(video));
    };
  }, [content]);

  const handleItemClick = (item: ContentItem) => {
    // Navigate to creator profile (Story 2.5)
    router.push(`/creator/${item.creator_id}`);
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Discover</h1>
          <p className="text-gray-600 mt-1">Explore content from creators</p>
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h2>
            <p className="text-gray-600">Check back soon for new content from creators!</p>
          </div>
        ) : (
          /* Feed Items */
          <div className="space-y-4">
            {content.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleItemClick(item)}
              >
                {/* Creator Info */}
                <div className="p-4 flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {(item.creator?.nickname || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {item.creator?.nickname || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(item.created_at)}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="relative bg-black">
                  {item.file_type === 'photo' ? (
                    <img
                      src={item.file_url}
                      alt="Content"
                      className="w-full max-h-[600px] object-contain"
                    />
                  ) : (
                    <video
                      src={item.file_url}
                      data-autoplay
                      loop
                      muted
                      playsInline
                      className="w-full max-h-[600px] object-contain"
                    />
                  )}
                </div>

                {/* Categories and Info */}
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {item.categories.map(cat => (
                      <span
                        key={cat}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-600 mt-2">Loading more...</p>
          </div>
        )}

        {/* Intersection Observer Target */}
        <div ref={observerTarget} className="h-4" />

        {/* End of Feed */}
        {!hasMore && content.length > 0 && (
          <div className="py-8 text-center text-gray-500 text-sm">
            You've reached the end of the feed
          </div>
        )}
      </div>
    </div>
  );
}
