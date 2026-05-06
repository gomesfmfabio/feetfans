'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  expires_at: string;
  read_at: string | null;
}

interface User {
  id: string;
  nickname: string;
  role: 'creator' | 'consumer';
  subscription_status: 'trial' | 'active' | 'cancelled';
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sseRef = useRef<EventSource | null>(null);

  useEffect(() => {
    loadChatData();
    setupSSE();

    return () => {
      // Cleanup SSE connection
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, [conversationId]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Filter out expired messages every minute
    const interval = setInterval(() => {
      setMessages(prev =>
        prev.filter(msg => new Date(msg.expires_at) > new Date())
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const loadChatData = async () => {
    try {
      setLoading(true);

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/messages/' + conversationId);
        return;
      }

      // Get current user info
      const { data: userData } = await supabase
        .from('users')
        .select('id, nickname, role, subscription_status')
        .eq('id', session.user.id)
        .single();

      setCurrentUser(userData);

      // Get conversation info
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          creator_id,
          consumer_id,
          creator:users!creator_id(id, nickname, role, subscription_status),
          consumer:users!consumer_id(id, nickname, role, subscription_status)
        `)
        .eq('id', conversationId)
        .single();

      if (convError || !convData) {
        console.error('Conversation not found:', convError);
        router.push('/messages');
        return;
      }

      // Map creator/consumer from array to object
      const creator = Array.isArray(convData.creator) ? convData.creator[0] : convData.creator;
      const consumer = Array.isArray(convData.consumer) ? convData.consumer[0] : convData.consumer;

      const conv = {
        ...convData,
        creator,
        consumer,
      };

      // Determine other user
      const other = conv.creator_id === session.user.id ? conv.consumer : conv.creator;
      setOtherUser(other);

      // Load messages
      await loadMessages();
    } catch (err) {
      console.error('Failed to load chat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Filter out expired messages
      const validMessages = (data || []).filter(
        msg => new Date(msg.expires_at) > new Date()
      );

      setMessages(validMessages);

      // Mark messages as read
      await markMessagesAsRead();
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Mark all messages from other user as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', session.user.id)
        .is('read_at', null);
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  const setupSSE = () => {
    // Connect to SSE endpoint for real-time messages
    const eventSource = new EventSource(
      `/api/messages/stream?conversation_id=${conversationId}`,
      { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Check if message is update or insert
        if (message.type === 'update') {
          // Update existing message (e.g., read_at changed)
          setMessages(prev =>
            prev.map(msg => msg.id === message.id ? message : msg)
          );
        } else {
          // New message - add to list if not expired
          if (new Date(message.expires_at) > new Date()) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === message.id)) return prev;
              return [...prev, message];
            });

            // Mark as read if from other user
            markMessagesAsRead();
          }
        }
      } catch (err) {
        console.error('Failed to parse SSE message:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();

      // Retry connection after 5 seconds
      setTimeout(() => {
        setupSSE();
      }, 5000);
    };

    sseRef.current = eventSource;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || sending) return;

    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);

    try {
      // Send via API endpoint
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const { message } = await response.json();

      // Optimistic UI update
      setMessages(prev => {
        // Avoid duplicates (SSE might have already added it)
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
      setMessageInput(content); // Restore input
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatExpiresIn = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor(diffMs / 60000);

    if (diffHours >= 1) return `${diffHours}h`;
    if (diffMins >= 1) return `${diffMins}m`;
    return '<1m';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center">
        <button
          onClick={() => router.push('/messages')}
          className="mr-3 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
          {(otherUser?.nickname || 'U')[0].toUpperCase()}
        </div>

        <div className="flex-1">
          <h1 className="font-semibold text-gray-900">{otherUser?.nickname || 'Unknown'}</h1>
          <p className="text-xs text-gray-500">Messages expire in 24h</p>
        </div>
      </div>

      {/* Trial Banner */}
      {currentUser?.subscription_status === 'trial' && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center">
          <p className="text-sm text-yellow-800">
            ⚠️ Upgrade to share links and message real buyers
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUser?.id;

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isCurrentUser
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <div
                    className={`text-xs mt-1 flex items-center gap-2 ${
                      isCurrentUser ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    <span>{formatTimestamp(message.created_at)}</span>
                    <span>•</span>
                    <span title="Time until message expires">
                      {formatExpiresIn(message.expires_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-primary"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || sending}
            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
