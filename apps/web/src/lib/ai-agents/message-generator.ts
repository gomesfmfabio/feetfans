import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Rate limiting: track message generation timestamps
const messageTimestamps: number[] = [];
const MAX_MESSAGES_PER_MINUTE = 10;

/**
 * Generate AI agent message using Claude Haiku
 *
 * @param agentId - UUID of the AI agent
 * @param creatorId - UUID of the creator to message
 * @param conversationId - UUID of the conversation
 * @returns Generated message text
 */
export async function generateAgentMessage(
  agentId: string,
  creatorId: string,
  conversationId: string
): Promise<string> {
  // Rate limiting check
  checkRateLimit();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let retries = 0;
  const MAX_RETRIES = 3;

  while (retries < MAX_RETRIES) {
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

      // Fetch creator's recent content (categories)
      const { data: content, error: contentError } = await supabase
        .from('content')
        .select('categories, description')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (contentError) {
        throw new Error(`Failed to fetch content: ${contentError.message}`);
      }

      // Extract unique categories
      const categories = Array.from(
        new Set(content?.flatMap((c) => c.categories || []) || [])
      ).join(', ');

      const hasContent = categories.length > 0;

      // Construct prompt
      const prompt = hasContent
        ? `${agent.personality_prompt}\n\nThe creator has posted content in these categories: ${categories}.\n\nWrite a brief, friendly opening message (max 50 words) expressing interest in their content. Do not reveal you are AI. Be casual and natural.`
        : `${agent.personality_prompt}\n\nThis is a new creator who hasn't posted content yet.\n\nWrite a brief, friendly opening message (max 50 words) introducing yourself and expressing interest in their future content. Do not reveal you are AI. Be casual and natural.`;

      // Call Gemini 2.0 Flash API
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.8, // Add variety to responses
        },
      });

      const response = result.response;
      const messageText = response.text();

      if (!messageText) {
        throw new Error('Empty response from Gemini API');
      }

      // Log token usage for cost tracking
      const usage = response.usageMetadata;
      const totalTokens = (usage?.totalTokenCount || 0);
      console.log(
        `[AI Agent Message] Agent: ${agent.nickname}, Tokens: ${totalTokens}, Input: ${usage?.promptTokenCount || 0}, Output: ${usage?.candidatesTokenCount || 0}`
      );

      // Validate token usage target (<500 tokens)
      if (totalTokens > 500) {
        console.warn(
          `[AI Agent Message] Token usage exceeded target: ${totalTokens} > 500`
        );
      }

      // Save message to database
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h expiration

      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: agentId,
          content: messageText,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (messageError) {
        throw new Error(`Failed to save message: ${messageError.message}`);
      }

      // Update rate limiting tracker
      messageTimestamps.push(Date.now());

      console.log(
        `[AI Agent Message] Success: Agent ${agent.nickname} → Creator ${creatorId}`
      );

      return messageText;
    } catch (error: any) {
      retries++;
      console.error(
        `[AI Agent Message] Attempt ${retries}/${MAX_RETRIES} failed:`,
        error.message
      );

      if (retries >= MAX_RETRIES) {
        throw new Error(
          `Failed to generate agent message after ${MAX_RETRIES} retries: ${error.message}`
        );
      }

      // Exponential backoff: 1s, 2s, 4s
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, retries) * 1000)
      );
    }
  }

  throw new Error('Unexpected error in generateAgentMessage');
}

/**
 * Check rate limiting (max 10 messages per minute)
 * Throws error if rate limit exceeded
 */
function checkRateLimit(): void {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;

  // Remove timestamps older than 1 minute
  while (
    messageTimestamps.length > 0 &&
    messageTimestamps[0] < oneMinuteAgo
  ) {
    messageTimestamps.shift();
  }

  // Check if limit exceeded
  if (messageTimestamps.length >= MAX_MESSAGES_PER_MINUTE) {
    throw new Error(
      `Rate limit exceeded: Maximum ${MAX_MESSAGES_PER_MINUTE} messages per minute`
    );
  }
}

/**
 * Get current rate limiting status
 * @returns Number of messages sent in the last minute
 */
export function getRateLimitStatus(): {
  messagesInLastMinute: number;
  remaining: number;
} {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;

  // Count messages in last minute
  const messagesInLastMinute = messageTimestamps.filter(
    (ts) => ts >= oneMinuteAgo
  ).length;

  return {
    messagesInLastMinute,
    remaining: Math.max(0, MAX_MESSAGES_PER_MINUTE - messagesInLastMinute),
  };
}
