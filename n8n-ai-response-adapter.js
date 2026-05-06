/**
 * N8N Node: AI Response Adapter
 *
 * Quando o threshold é AI_ADAPT (50-79% similaridade),
 * usa Gemini para adaptar a resposta do FAQ ao contexto específico do email
 *
 * INPUT (from previous node):
 *   - threshold_level: string
 *   - faq_response: string
 *   - original_email: string
 *   - language: string
 *   - conversation_history: array (opcional, para followup)
 *
 * OUTPUT:
 *   - final_response: string (adapted response)
 */

const GEMINI_API_KEY = 'AIzaSyC1HB4x_31p7Q6rQx_4_KNq5HrEJQ2hHDA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Get input
const thresholdLevel = $input.first().json.threshold_level;
const faqResponse = $input.first().json.response;
const originalEmail = $input.first().json.original_email;
const language = $input.first().json.language;
const conversationHistory = $input.first().json.conversation_history || [];

// If EXACT threshold, no adaptation needed
if (thresholdLevel === 'EXACT' || thresholdLevel === 'GENERIC') {
  return {
    final_response: faqResponse,
    adapted: false
  };
}

/**
 * Adapt FAQ response using Gemini
 */
async function adaptResponse() {
  const languageNames = {
    'pt': 'Portuguese',
    'en': 'English',
    'es': 'Spanish'
  };

  let historyContext = '';
  if (conversationHistory.length > 0) {
    historyContext = `\n\nCONVERSATION HISTORY:\n${conversationHistory.map(msg =>
      `${msg.from}: ${msg.text}`
    ).join('\n')}`;
  }

  const prompt = `You are a customer support agent for FeetFans Platform.

TASK: Adapt the FAQ response below to specifically answer the customer's email. Maintain the same helpful tone and information, but personalize it to their specific question.

CUSTOMER EMAIL:
${originalEmail}
${historyContext}

FAQ BASE RESPONSE (to adapt):
${faqResponse}

INSTRUCTIONS:
1. Keep all URLs, prices, and specific instructions EXACTLY as they appear
2. Maintain the helpful, friendly tone
3. Address the customer's specific concern
4. Keep the response in ${languageNames[language]}
5. Do NOT add emojis if they're not in the original
6. Do NOT add information not present in the FAQ response
7. If this is a followup message, reference the conversation history naturally

RESPOND WITH THE ADAPTED MESSAGE:`;

  try {
    const response = await fetch(GEMINI_API_URL + `?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    const data = await response.json();
    const adaptedText = data.candidates[0].content.parts[0].text.trim();

    return {
      final_response: adaptedText,
      adapted: true,
      original_faq_response: faqResponse
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Fallback to original FAQ response
    return {
      final_response: faqResponse,
      adapted: false,
      error: error.message
    };
  }
}

// Execute and return
return await adaptResponse();
