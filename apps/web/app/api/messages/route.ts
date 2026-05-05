import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from request cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=');
        return [key, v.join('=')];
      })
    );

    // Create Supabase client with user's session
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { conversation_id, recipient_id, content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Get or create conversation
    let conversationId = conversation_id;

    if (!conversationId && recipient_id) {
      // Get current user info to determine if they're creator or consumer
      const { data: currentUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      const { data: recipientUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', recipient_id)
        .single();

      if (!currentUser || !recipientUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Determine creator and consumer
      const creatorId = currentUser.role === 'creator' ? session.user.id : recipient_id;
      const consumerId = currentUser.role === 'consumer' ? session.user.id : recipient_id;

      // Try to get existing conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('creator_id', creatorId)
        .eq('consumer_id', consumerId)
        .single();

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            creator_id: creatorId,
            consumer_id: consumerId,
          })
          .select('id')
          .single();

        if (convError) {
          console.error('Failed to create conversation:', convError);
          return NextResponse.json(
            { error: 'Failed to create conversation' },
            { status: 500 }
          );
        }

        conversationId = newConv.id;
      }
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID or recipient ID is required' },
        { status: 400 }
      );
    }

    // Verify user is part of the conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('creator_id, consumer_id')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (conversation.creator_id !== session.user.id && conversation.consumer_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to send message in this conversation' },
        { status: 403 }
      );
    }

    // Create message with 24-hour expiration
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: session.user.id,
        content: content.trim(),
        expires_at: expiresAt.toISOString(),
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        expires_at,
        read_at
      `)
      .single();

    if (messageError) {
      console.error('Failed to create message:', messageError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: now.toISOString() })
      .eq('id', conversationId);

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user from request cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=');
        return [key, v.join('=')];
      })
    );

    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get messages (RLS will handle authorization)
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        expires_at,
        read_at
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messages: messages || [],
    });
  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
