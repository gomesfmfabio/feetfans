'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSwipeable } from 'react-swipeable';
import { supabase } from '@/lib/supabase-browser';

const CATEGORIES = [
  'All',
  'Barefoot', 'Heels', 'Socks', 'Stockings', 'Nail Polish',
  'Jewelry', 'Outdoors', 'Beach', 'Gym', 'Yoga',
  'Artistic', 'Close-up', 'Action', 'Relaxing', 'Playful'
];

interface ContentItem {
  id: string;
  file_url: string;
  file_type: 'photo' | 'video';
}

interface Creator {
  id: string;
  nickname: string;
  created_at: string;
  content: ContentItem[];
}

export default function DiscoverPage() {
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    loadCreators();
    loadFavorites();
  }, [selectedCategory]);

  useEffect(() => {
    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleSwipeLeft();
      } else if (e.key === 'ArrowRight') {
        handleSwipeRight();
      } else if (e.key === 'ArrowUp') {
        handleViewProfile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, creators]);

  const loadCreators = async () => {
    try {
      setLoading(true);

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/discover');
        return;
      }

      // Build query
      let query = supabase
        .from('users')
        .select(`
          id,
          nickname,
          created_at,
          content (
            id,
            file_url,
            file_type,
            categories
          )
        `)
        .eq('role', 'creator')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Filter by category and limit to 5 most recent content per creator
      let filteredCreators = (data || []).map(creator => {
        let content = creator.content || [];

        // Filter by category if not "All"
        if (selectedCategory !== 'All') {
          content = content.filter((item: any) =>
            item.categories && item.categories.includes(selectedCategory)
          );
        }

        // Limit to 5 most recent
        content = content.slice(0, 5);

        return {
          ...creator,
          content
        };
      });

      // Only show creators with content
      filteredCreators = filteredCreators.filter(c => c.content.length > 0);

      setCreators(filteredCreators as Creator[]);
      setCurrentIndex(0);
      setCurrentCarouselIndex(0);
    } catch (err) {
      console.error('Failed to load creators:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('creator_id')
        .eq('consumer_id', session.user.id);

      if (error) throw error;

      setFavorites(new Set((data || []).map(f => f.creator_id)));
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  const handleSwipeLeft = useCallback(() => {
    if (creators.length === 0) return;

    setSwipeDirection('left');
    setTimeout(() => {
      setCurrentIndex(prev => Math.min(prev + 1, creators.length));
      setCurrentCarouselIndex(0);
      setSwipeDirection(null);
    }, 300);
  }, [creators.length]);

  const handleSwipeRight = useCallback(async () => {
    if (creators.length === 0 || currentIndex >= creators.length) return;

    const creator = creators[currentIndex];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Add to favorites
      const { error } = await supabase
        .from('favorites')
        .insert({
          consumer_id: session.user.id,
          creator_id: creator.id,
        });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }

      setFavorites(prev => new Set(prev).add(creator.id));
      setSwipeDirection('right');

      setTimeout(() => {
        setCurrentIndex(prev => Math.min(prev + 1, creators.length));
        setCurrentCarouselIndex(0);
        setSwipeDirection(null);
      }, 300);
    } catch (err) {
      console.error('Failed to add favorite:', err);
    }
  }, [creators, currentIndex]);

  const handleViewProfile = useCallback(() => {
    if (creators.length === 0 || currentIndex >= creators.length) return;
    const creator = creators[currentIndex];
    router.push(`/creator/${creator.id}`);
  }, [creators, currentIndex, router]);

  const handlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    onSwipedUp: handleViewProfile,
    trackMouse: true,
    delta: 50,
  });

  const formatJoinDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const nextCarouselImage = () => {
    if (creators.length === 0 || currentIndex >= creators.length) return;
    const creator = creators[currentIndex];
    setCurrentCarouselIndex(prev => (prev + 1) % creator.content.length);
  };

  const prevCarouselImage = () => {
    if (creators.length === 0 || currentIndex >= creators.length) return;
    const creator = creators[currentIndex];
    setCurrentCarouselIndex(prev => (prev - 1 + creator.content.length) % creator.content.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading creators...</div>
      </div>
    );
  }

  const currentCreator = currentIndex < creators.length ? creators[currentIndex] : null;
  const isLastCreator = currentIndex >= creators.length;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Discover Creators</h1>
          <p className="text-gray-600 mt-1">Swipe to find creators you love</p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Filter by category:</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Creator Card or Empty State */}
        {isLastCreator || !currentCreator ? (
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No more creators
            </h2>
            <p className="text-gray-600 mb-6">
              {selectedCategory === 'All'
                ? "You've seen all creators!"
                : `No more creators in ${selectedCategory} category`}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setCurrentIndex(0);
              }}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Start Over
            </button>
          </div>
        ) : (
          <div
            {...handlers}
            className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ${
              swipeDirection === 'left' ? '-translate-x-full opacity-0' : ''
            } ${swipeDirection === 'right' ? 'translate-x-full opacity-0' : ''}`}
          >
            {/* Creator Info */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-semibold mr-3">
                    {currentCreator.nickname[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {currentCreator.nickname}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Joined {formatJoinDate(currentCreator.created_at)}
                    </p>
                  </div>
                </div>
                {favorites.has(currentCreator.id) && (
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Content Carousel */}
            <div className="relative aspect-[3/4] bg-black">
              {currentCreator.content.length > 0 && (
                <>
                  {currentCreator.content[currentCarouselIndex].file_type === 'photo' ? (
                    <img
                      src={currentCreator.content[currentCarouselIndex].file_url}
                      alt="Content"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      src={currentCreator.content[currentCarouselIndex].file_url}
                      className="w-full h-full object-contain"
                      muted
                      loop
                      autoPlay
                    />
                  )}

                  {/* Carousel Navigation */}
                  {currentCreator.content.length > 1 && (
                    <>
                      <button
                        onClick={prevCarouselImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextCarouselImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {/* Carousel Indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {currentCreator.content.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2 h-2 rounded-full ${
                              idx === currentCarouselIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 flex justify-center gap-6">
              {/* Swipe Left / Dismiss */}
              <button
                onClick={handleSwipeLeft}
                className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                title="Pass (←)"
              >
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* View Profile */}
              <button
                onClick={handleViewProfile}
                className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors"
                title="View Profile (↑)"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Swipe Right / Favorite */}
              <button
                onClick={handleSwipeRight}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                title="Like (→)"
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Keyboard Hints */}
            <div className="px-6 pb-4 text-center text-xs text-gray-500">
              Use arrow keys: ← Pass • ↑ View Profile • → Like
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
