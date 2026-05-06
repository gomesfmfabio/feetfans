/**
 * N8N Node: Auto-Learning System
 *
 * Detecta quando você responde manualmente um email e adiciona automaticamente ao FAQ
 *
 * TRIGGER: Gmail Trigger (monitora "Sent" folder)
 *
 * LÓGICA:
 * 1. Detecta emails ENVIADOS (não recebidos)
 * 2. Verifica se é resposta manual (sem header X-Auto-Responder)
 * 3. Extrai pergunta original + sua resposta
 * 4. Traduz para PT/EN/ES usando Gemini
 * 5. Adiciona ao FAQ automaticamente
 * 6. Salva FAQ atualizado
 *
 * INPUT:
 *   - sent_email: objeto do email enviado
 *   - thread_history: histórico da conversa
 *
 * OUTPUT:
 *   - learned: boolean
 *   - new_faq_entry: object | null
 *   - faq_database_updated: boolean
 */

const GEMINI_API_KEY = 'AIzaSyC1HB4x_31p7Q6rQx_4_KNq5HrEJQ2hHDA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Get sent email data
const sentEmail = $input.first().json;

/**
 * Check if this is a manual response (not auto-responder)
 */
function isManualResponse(email) {
  // Se tem header X-Auto-Responder, foi automático
  if (email.headers && email.headers['X-Auto-Responder']) {
    return false;
  }

  // Se tem "In-Reply-To", é uma resposta
  if (!email.headers || !email.headers['In-Reply-To']) {
    return false;
  }

  return true;
}

/**
 * Extract original question from thread
 */
function extractOriginalQuestion(threadHistory) {
  // threadHistory = array de emails da thread, ordenados por data
  // [0] = email mais antigo (pergunta original do cliente)
  // [last] = email mais recente (sua resposta)

  if (!threadHistory || threadHistory.length < 2) {
    return null;
  }

  const originalEmail = threadHistory[0];
  return {
    subject: originalEmail.subject,
    body: originalEmail.body,
    from: originalEmail.from,
    date: originalEmail.date
  };
}

/**
 * Extract your manual response
 */
function extractYourResponse(sentEmail) {
  return {
    body: sentEmail.body,
    date: sentEmail.date
  };
}

/**
 * Use Gemini to translate response to all languages
 */
async function translateToAllLanguages(responseText, detectedLanguage) {
  const prompt = `You are a professional translator for customer support content.

TASK: Translate the following customer support response to Portuguese, English, and Spanish.

ORIGINAL RESPONSE (in ${detectedLanguage}):
${responseText}

INSTRUCTIONS:
1. Maintain the same helpful, friendly tone
2. Keep all URLs, prices, and specific instructions EXACTLY as they appear
3. Do NOT add emojis if they're not in the original
4. Preserve formatting (line breaks, etc.)

RESPOND IN THIS EXACT JSON FORMAT:
{
  "pt": "tradução em português",
  "en": "translation in english",
  "es": "traducción en español"
}`;

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
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      })
    });

    const data = await response.json();
    const jsonText = data.candidates[0].content.parts[0].text.trim();

    // Extract JSON from response (may have markdown code blocks)
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Translation error:', error);
    // Fallback: use original text for all languages
    return {
      pt: responseText,
      en: responseText,
      es: responseText
    };
  }
}

/**
 * Extract keywords from question using Gemini
 */
async function extractKeywords(questionText) {
  const prompt = `Extract 3-5 multilingual keywords from this customer support question.

QUESTION:
${questionText}

INSTRUCTIONS:
Return keywords in Portuguese, English, and Spanish that represent this question.
Include variations and synonyms that customers might use.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

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
          temperature: 0.3,
          maxOutputTokens: 200,
        }
      })
    });

    const data = await response.json();
    const jsonText = data.candidates[0].content.parts[0].text.trim();

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }

    const result = JSON.parse(jsonMatch[0]);
    return result.keywords || [];
  } catch (error) {
    console.error('Keyword extraction error:', error);
    return [];
  }
}

/**
 * Categorize the question using Gemini
 */
async function categorizeQuestion(questionText) {
  const categories = [
    'access',
    'technical_support',
    'how_to_start',
    'legitimacy',
    'subscription_cancel',
    'payment_problem',
    'generic_help',
    'other'
  ];

  const prompt = `Categorize this customer support question into one of these categories:
${categories.join(', ')}

QUESTION:
${questionText}

RESPOND WITH ONLY THE CATEGORY NAME (lowercase, with underscores):`;

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
          maxOutputTokens: 20,
        }
      })
    });

    const data = await response.json();
    const category = data.candidates[0].content.parts[0].text.trim().toLowerCase();

    return categories.includes(category) ? category : 'other';
  } catch (error) {
    console.error('Categorization error:', error);
    return 'other';
  }
}

/**
 * Main auto-learning execution
 */
async function executeAutoLearning() {
  // Check if this is a manual response
  if (!isManualResponse(sentEmail)) {
    return {
      learned: false,
      reason: 'Not a manual response (auto-responder detected)'
    };
  }

  // Get thread history (provided by Gmail Trigger node)
  const threadHistory = sentEmail.thread || [];

  // Extract original question
  const originalQuestion = extractOriginalQuestion(threadHistory);
  if (!originalQuestion) {
    return {
      learned: false,
      reason: 'Could not extract original question from thread'
    };
  }

  // Extract your manual response
  const yourResponse = extractYourResponse(sentEmail);

  // Detect language of your response
  const responseText = yourResponse.body;
  let detectedLanguage = 'pt';
  if (/\b(hello|thank|please|help|access)\b/i.test(responseText)) {
    detectedLanguage = 'en';
  } else if (/\b(hola|gracias|ayuda|acceso)\b/i.test(responseText)) {
    detectedLanguage = 'es';
  }

  console.log('Auto-Learning: Processing manual response');
  console.log('Original question:', originalQuestion.subject);
  console.log('Your response language:', detectedLanguage);

  // Translate to all languages
  const translations = await translateToAllLanguages(responseText, detectedLanguage);

  // Extract keywords
  const keywords = await extractKeywords(originalQuestion.subject + '\n' + originalQuestion.body);

  // Categorize
  const category = await categorizeQuestion(originalQuestion.subject + '\n' + originalQuestion.body);

  // Get current FAQ database (passed from previous node or loaded)
  const currentFAQ = $node["Load FAQ Database"].json.faq_database;

  // Generate new FAQ ID
  const maxId = Math.max(...currentFAQ.faqs.map(f => parseInt(f.id.replace('FAQ-', ''))));
  const newId = `FAQ-${String(maxId + 1).padStart(3, '0')}`;

  // Create new FAQ entry
  const newFAQEntry = {
    id: newId,
    category: category,
    keywords_multilingual: keywords,
    responses: translations,
    requires_followup: false,
    learned_from: {
      date: new Date().toISOString(),
      original_subject: originalQuestion.subject,
      customer_email: originalQuestion.from
    }
  };

  // Add to FAQ database
  currentFAQ.faqs.push(newFAQEntry);
  currentFAQ.last_updated = new Date().toISOString().split('T')[0];

  console.log('Auto-Learning: New FAQ entry created:', newId);
  console.log('Category:', category);
  console.log('Keywords:', keywords);

  return {
    learned: true,
    new_faq_entry: newFAQEntry,
    faq_database_updated: currentFAQ,
    stats: {
      total_faqs: currentFAQ.faqs.length,
      new_faq_id: newId,
      category: category,
      languages_translated: ['pt', 'en', 'es']
    }
  };
}

// Execute
return await executeAutoLearning();
