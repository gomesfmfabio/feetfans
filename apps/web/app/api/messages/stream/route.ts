import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversation_id');

  if (!conversationId) {
    return new Response('Conversation ID is required', { status: 400 });
  }

  // Get authenticated user from request cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [key, ...v] = c.split('=');
      return [key, v.join('=')];
    })
  );

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key) => cookies[key] || null,
        setItem: () => {},
        removeItem: () => {},
      },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Verify user is part of the conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .select('creator_id, consumer_id')
    .eq('id', conversationId)
    .single();

  if (!conversation) {
    return new Response('Conversation not found', { status: 404 });
  }

  if (conversation.creator_id !== session.user.id && conversation.consumer_id !== session.user.id) {
    return new Response('Unauthorized', { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Subscribe to Supabase Realtime for new messages
      const channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const message = payload.new;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const message = payload.new;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'update', ...message })}\n\n`)
            );
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`[SSE] Subscribed to messages:${conversationId}`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`[SSE] Channel error for messages:${conversationId}`);
            controller.error(new Error('Channel subscription error'));
          } else if (status === 'TIMED_OUT') {
            console.error(`[SSE] Subscription timed out for messages:${conversationId}`);
            controller.error(new Error('Subscription timed out'));
          } else if (status === 'CLOSED') {
            console.log(`[SSE] Channel closed for messages:${conversationId}`);
            controller.close();
          }
        });

      // Keep-alive ping every 30 seconds
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch (error) {
          clearInterval(keepAliveInterval);
        }
      }, 30000);

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        console.log(`[SSE] Client disconnected from messages:${conversationId}`);
        clearInterval(keepAliveInterval);
        channel.unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    },
  });
}
