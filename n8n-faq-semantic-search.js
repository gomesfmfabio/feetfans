/**
 * N8N Node: FAQ Semantic Search with Gemini
 *
 * Compara o email recebido com o banco de FAQs usando Google Gemini
 * Retorna a melhor correspondência e score de similaridade
 *
 * INPUT (from previous node):
 *   - subject: string
 *   - body: string
 *   - language: 'pt' | 'en' | 'es'
 *
 * OUTPUT:
 *   - matched: boolean
 *   - confidence: number (0-100)
 *   - faq_id: string | null
 *   - response: string | null
 *   - requires_followup: boolean
 *   - threshold_level: 'EXACT' | 'AI_ADAPT' | 'GENERIC'
 */

const GEMINI_API_KEY = 'AIzaSyC1HB4x_31p7Q6rQx_4_KNq5HrEJQ2hHDA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Thresholds
const THRESHOLD_EXACT = 80;
const THRESHOLD_AI = 50;

// Load FAQ database
const FAQ_DATABASE = $input.first().json.faq_database; // Passed from previous node

// Get input email
const emailSubject = $input.first().json.subject || '';
const emailBody = $input.first().json.body || '';
const detectedLanguage = $input.first().json.language || 'pt';

// Combine subject + body for analysis
const emailText = `${emailSubject}\n\n${emailBody}`;

/**
 * Call Gemini API to calculate similarity between email and FAQ
 */
async function calculateSimilarity(emailText, faqEntry, language) {
  const prompt = `You are a semantic similarity analyzer for customer support emails.

TASK: Compare the customer's email with a FAQ entry and return ONLY a similarity score from 0 to 100.

CUSTOMER EMAIL:
${emailText}

FAQ ENTRY:
Category: ${faqEntry.category}
Keywords: ${faqEntry.keywords_multilingual.join(', ')}
Question Context: ${faqEntry.responses[language].substring(0, 200)}

INSTRUCTIONS:
- Return ONLY a number from 0 to 100
- 100 = Perfect match (customer asking exactly this question)
- 80-99 = Very similar (same topic, slightly different wording)
- 50-79 = Related (same general area, needs adaptation)
- 0-49 = Different topic

RESPOND WITH ONLY THE NUMBER:`;

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
          temperature: 0.1,
          maxOutputTokens: 10,
        }
      })
    });

    const data = await response.json();
    const scoreText = data.candidates[0].content.parts[0].text.trim();
    const score = parseInt(scoreText.replace(/[^0-9]/g, ''));

    return isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 0;
  }
}

/**
 * Main execution
 */
async function findBestFAQMatch() {
  const results = [];

  // Calculate similarity for each FAQ entry
  for (const faq of FAQ_DATABASE.faqs) {
    const score = await calculateSimilarity(emailText, faq, detectedLanguage);

    results.push({
      faq_id: faq.id,
      category: faq.category,
      score: score,
      response: faq.responses[detectedLanguage],
      requires_followup: faq.requires_followup || false,
      followup_response: faq.followup ? faq.followup[detectedLanguage] : null
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Get best match
  const bestMatch = results[0];

  // Determine threshold level
  let thresholdLevel;
  let matched;
  let finalResponse;

  if (bestMatch.score >= THRESHOLD_EXACT) {
    // ≥80% - Use exact FAQ response
    thresholdLevel = 'EXACT';
    matched = true;
    finalResponse = bestMatch.response;
  } else if (bestMatch.score >= THRESHOLD_AI) {
    // 50-79% - AI will adapt the response
    thresholdLevel = 'AI_ADAPT';
    matched = true;
    finalResponse = bestMatch.response; // Base response for AI to adapt
  } else {
    // <50% - Generic response + notify user
    thresholdLevel = 'GENERIC';
    matched = false;
    finalResponse = FAQ_DATABASE.generic_response_low_match[detectedLanguage];
  }

  return {
    matched: matched,
    confidence: bestMatch.score,
    faq_id: matched ? bestMatch.faq_id : null,
    category: matched ? bestMatch.category : 'UNKNOWN',
    response: finalResponse,
    requires_followup: matched ? bestMatch.requires_followup : false,
    followup_response: matched ? bestMatch.followup_response : null,
    threshold_level: thresholdLevel,
    all_scores: results.slice(0, 3), // Top 3 matches for debugging
    language: detectedLanguage,
    original_email: emailText,
    notify_human: !matched // Notify if confidence < 50%
  };
}

// Execute and return
return await findBestFAQMatch();
