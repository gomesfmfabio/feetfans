/**
 * Test script for FAQ Semantic Search
 *
 * Testa a lógica de busca semântica localmente antes de integrar no N8N
 */

const fs = require('fs');

// Load FAQ database
const faqDatabase = JSON.parse(fs.readFileSync('./tmp/faq-multilingual.json', 'utf8'));

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyC1HB4x_31p7Q6rQx_4_KNq5HrEJQ2hHDA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Thresholds
const THRESHOLD_EXACT = 80;
const THRESHOLD_AI = 50;

/**
 * Call Gemini API to calculate similarity
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
 * Find best FAQ match
 */
async function findBestMatch(emailSubject, emailBody, language = 'pt') {
  const emailText = `${emailSubject}\n\n${emailBody}`;
  const results = [];

  console.log(`\n🔍 Searching FAQ for: "${emailSubject}"`);
  console.log(`Language: ${language}\n`);

  // Calculate similarity for each FAQ entry
  for (const faq of faqDatabase.faqs) {
    const score = await calculateSimilarity(emailText, faq, language);

    results.push({
      faq_id: faq.id,
      category: faq.category,
      score: score,
      response: faq.responses[language]
    });

    console.log(`  ${faq.id} (${faq.category}): ${score}%`);
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  const bestMatch = results[0];

  // Determine threshold level
  let thresholdLevel;
  let action;

  if (bestMatch.score >= THRESHOLD_EXACT) {
    thresholdLevel = 'EXACT';
    action = '✅ Send exact FAQ response';
  } else if (bestMatch.score >= THRESHOLD_AI) {
    thresholdLevel = 'AI_ADAPT';
    action = '🤖 AI will adapt response';
  } else {
    thresholdLevel = 'GENERIC';
    action = '⚠️  Generic response + notify human';
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎯 Best Match: ${bestMatch.faq_id} (${bestMatch.category})`);
  console.log(`📊 Score: ${bestMatch.score}%`);
  console.log(`🚦 Threshold: ${thresholdLevel}`);
  console.log(`⚡ Action: ${action}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (bestMatch.score >= THRESHOLD_AI) {
    console.log(`📝 Response Preview:\n${bestMatch.response.substring(0, 200)}...\n`);
  }

  return {
    matched: bestMatch.score >= THRESHOLD_AI,
    confidence: bestMatch.score,
    faq_id: bestMatch.faq_id,
    threshold_level: thresholdLevel,
    response: bestMatch.response
  };
}

// Test cases
const testCases = [
  {
    subject: 'Preciso de acesso ao curso',
    body: 'Olá, comprei o FeetFans mas não recebi o login. Pode ajudar?',
    language: 'pt'
  },
  {
    subject: 'How do I start?',
    body: 'I bought the course but I don\'t know where to begin. Help please!',
    language: 'en'
  },
  {
    subject: 'Is this real?',
    body: 'I saw many testimonials but I want to know if this really works before starting.',
    language: 'en'
  },
  {
    subject: 'Ayuda',
    body: 'Estoy confundida, no sé qué hacer. Necesito ayuda.',
    language: 'es'
  },
  {
    subject: 'Partnership proposal',
    body: 'Hi, I would like to discuss a business partnership with your company.',
    language: 'en'
  }
];

// Run tests
async function runTests() {
  console.log('🧪 Testing FAQ Semantic Search\n');
  console.log('=' .repeat(60));

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`\nTest Case ${i + 1}/${testCases.length}`);

    await findBestMatch(test.subject, test.body, test.language);

    // Wait 1 second between requests (Gemini rate limit: 15 req/min)
    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n✅ All tests completed!');
}

// Execute
runTests().catch(console.error);
