'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
}

interface User {
  id: string;
  nickname: string;
}

interface Conversation {
  id: string;
  creator_id: string;
  consumer_id: string;
  updated_at: string;
  creator?: User | User[];
  consumer?: User | User[];
  messages?: Message[];
  lastMessage?: Message;
  otherUser?: User;
  unreadCount?: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
    setupRealtimeSubscription();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/messages');
        return;
      }

      setCurrentUserId(session.user.id);

      // Fetch conversations with creator and consumer info
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          creator_id,
          consumer_id,
          updated_at,
          creator:users!creator_id(id, nickname),
          consumer:users!consumer_id(id, nickname)
        `)
        .or(`creator_id.eq.${session.user.id},consumer_id.eq.${session.user.id}`)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      if (!convData || convData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Fetch last message and unread count for each conversation
      const conversationsWithMessages = await Promise.all(
        convData.map(async (conv) => {
          // Map creator/consumer from array to object
          const creator = Array.isArray(conv.creator) ? conv.creator[0] : conv.creator;
          const consumer = Array.isArray(conv.consumer) ? conv.consumer[0] : conv.consumer;

          // Determine the other user
          const otherUser = conv.creator_id === session.user.id ? consumer : creator;

          // Fetch last message
          const { data: lastMessages } = await supabase
            .from('messages')
            .select('id, content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const lastMessage = lastMessages && lastMessages.length > 0 ? lastMessages[0] : undefined;

          // Count unread messages (messages from other user with no read_at)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('sender_id', otherUser.id)
            .is('read_at', null);

          return {
            ...conv,
            creator,
            consumer,
            otherUser,
            lastMessage,
            unreadCount: unreadCount || 0,
          };
        })
      );

      // Sort by last message timestamp or updated_at
      conversationsWithMessages.sort((a, b) => {
        const aTime = a.lastMessage?.created_at || a.updated_at;
        const bTime = b.lastMessage?.created_at || b.updated_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setConversations(conversationsWithMessages);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Subscribe to new messages in all user's conversations
    const channel = supabase
      .channel('inbox-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (_payload) => {
          // Reload conversations when new message arrives
          await loadConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        async (_payload) => {
          // Reload when conversation is updated
          await loadConversations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const handleConversationClick = (conversation: Conversation) => {
    router.push(`/messages/${conversation.id}`);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-gray-600 mt-1">Your conversations</p>
        </div>

        {/* Empty State */}
        {conversations.length === 0 ? (
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h2>
            <p className="text-gray-600 mb-6">Start a conversation with a creator!</p>
            <button
              onClick={() => router.push('/feed')}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Browse Creators
            </button>
          </div>
        ) : (
          /* Conversations List */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation)}
                className="flex items-center p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-4 flex-shrink-0">
                  {(conversation.otherUser?.nickname || 'U')[0].toUpperCase()}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conversation.otherUser?.nickname || 'Unknown'}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {conversation.lastMessage
                        ? formatTimestamp(conversation.lastMessage.created_at)
                        : formatTimestamp(conversation.updated_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage ? (
                        <>
                          {conversation.lastMessage.sender_id === currentUserId && (
                            <span className="text-gray-500">You: </span>
                          )}
                          {truncateMessage(conversation.lastMessage.content)}
                        </>
                      ) : (
                        <span className="text-gray-400 italic">No messages yet</span>
                      )}
                    </p>

                    {/* Unread Badge */}
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <div className="ml-2 bg-primary text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hint */}
        {conversations.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            💡 Messages disappear after 24 hours
          </div>
        )}
      </div>
    </div>
  );
}
