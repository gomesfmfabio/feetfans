import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { stripLinksForTrial } from '../utils/link-blocker';

// Initialize Anthropic Claude API
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Generate AI agent response to creator message
 *
 * @param agentId - UUID of the AI agent
 * @param conversationId - UUID of the conversation
 * @param creatorMessage - The message sent by the creator
 * @param creatorId - UUID of the creator
 * @returns Generated response text
 */
export async function generateAgentResponse(
  agentId: string,
  conversationId: string,
  creatorMessage: string,
  creatorId: string
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Fetch agent personality
    const { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select('personality_prompt, nickname')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new Error(`Failed to fetch agent: ${agentError?.message}`);
    }

    // Fetch conversation history (last 5 messages)
    const { data: history, error: historyError } = await supabase
      .from('messages')
      .select('content, sender_id, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (historyError) {
      throw new Error(`Failed to fetch history: ${historyError.message}`);
    }

    // Fetch creator's subscription status
    const { data: creator, error: creatorError } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', creatorId)
      .single();

    if (creatorError) {
      throw new Error(`Failed to fetch creator: ${creatorError.message}`);
    }

    // Strip links from message if creator is on trial
    // This ensures AI agent never sees links from trial users
    const processedMessage = stripLinksForTrial(
      creatorMessage,
      creator.subscription_status
    );

    // Format conversation history (reverse to chronological order)
    const formattedHistory = (history || [])
      .reverse()
      .map((msg) => {
        const role = msg.sender_id === agentId ? 'You' : 'Creator';
        return `${role}: ${msg.content}`;
      })
      .join('\n');

    // Check if original creator message contains a link (before stripping)
    const hasLink = /https?:\/\//.test(creatorMessage);

    // Construct base prompt (use processed message with links stripped for trial users)
    let prompt = `${agent.personality_prompt}\n\nConversation history:\n${formattedHistory}\n\nCreator said: "${processedMessage}"\n\nRespond naturally and conversationally (max 75 words).`;

    // Add link handling instructions
    if (hasLink && creator.subscription_status === 'trial') {
      prompt +=
        " IMPORTANT: The creator mentioned a link but you cannot see it. Respond that you don't see any link and ask them to describe what they want to share instead.";
    } else if (hasLink) {
      prompt +=
        " IMPORTANT: The creator shared a link. Politely acknowledge but make a casual excuse not to click it right now (e.g., 'on mobile', 'prefer to chat here first', etc.).";
    }

    // Add purchase protection
    prompt +=
      "\n\nIMPORTANT: You are NOT a buyer. NEVER agree to purchase content, NEVER ask for payment details, NEVER share payment information. If asked about buying, politely say you're just browsing/chatting for now.";

    // Call Claude Haiku API
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      temperature: 0.8, // Add variety
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract response text
    const responseText =
      response.content[0].type === 'text'
        ? response.content[0].text
        : '';

    if (!responseText) {
      throw new Error('Empty response from Claude API');
    }

    // Log token usage for cost tracking
    const totalTokens =
      response.usage.input_tokens + response.usage.output_tokens;
    console.log(
      `[AI Agent Response] Agent: ${agent.nickname}, Tokens: ${totalTokens}, Input: ${response.usage.input_tokens}, Output: ${response.usage.output_tokens}`
    );

    // Validate token usage target (<500 tokens)
    if (totalTokens > 500) {
      console.warn(
        `[AI Agent Response] Token usage exceeded target: ${totalTokens} > 500`
      );
    }

    // Save response message to database
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h expiration

    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: agentId,
        content: responseText,
        expires_at: expiresAt.toISOString(),
      });

    if (messageError) {
      throw new Error(`Failed to save response: ${messageError.message}`);
    }

    console.log(
      `[AI Agent Response] Success: Agent ${agent.nickname} responded in conversation ${conversationId}`
    );

    return responseText;
  } catch (error: any) {
    console.error('[AI Agent Response] Error:', error.message);
    throw error;
  }
}
