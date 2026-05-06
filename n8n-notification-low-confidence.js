/**
 * N8N Node: Low Confidence Notification
 *
 * Envia email para gomesfm@gmail.com quando confidence < 50%
 *
 * INPUT (from Semantic Search node):
 *   - notify_human: boolean
 *   - confidence: number
 *   - original_email: string
 *   - subject: string
 *   - from: string
 *   - language: string
 *   - category: string
 *
 * OUTPUT:
 *   - notification_sent: boolean
 *   - notification_to: string
 *   - notification_subject: string
 *   - notification_body: string
 */

const searchResult = $input.first().json;

// Only notify if confidence < 50%
if (!searchResult.notify_human || searchResult.confidence >= 50) {
  return {
    notification_sent: false,
    reason: 'Confidence above threshold, no notification needed'
  };
}

// Extract email metadata
const customerEmail = searchResult.from || 'Unknown';
const emailSubject = searchResult.subject || 'No subject';
const emailBody = searchResult.original_email || '';
const confidence = searchResult.confidence || 0;
const language = searchResult.language || 'unknown';
const detectedCategory = searchResult.category || 'UNKNOWN';

// Language names
const languageNames = {
  'pt': 'Português',
  'en': 'English',
  'es': 'Español'
};

// Build notification email
const notificationSubject = `[FeetFans] Email de baixa confiança (${confidence}%)`;

const notificationBody = `Olá Fábio,

Um email foi recebido mas a IA não encontrou uma resposta adequada no FAQ.

═══════════════════════════════════════════════════════
DETALHES DO EMAIL
═══════════════════════════════════════════════════════

De: ${customerEmail}
Assunto: ${emailSubject}
Idioma detectado: ${languageNames[language] || language}
Categoria estimada: ${detectedCategory}

Confiança da IA: ${confidence}% (threshold mínimo: 50%)

═══════════════════════════════════════════════════════
CONTEÚDO DO EMAIL
═══════════════════════════════════════════════════════

${emailBody}

═══════════════════════════════════════════════════════
O QUE FOI FEITO
═══════════════════════════════════════════════════════

✅ O cliente recebeu uma resposta genérica automaticamente
✅ A resposta foi enviada no idioma correto (${languageNames[language]})
⚠️  A resposta pode não ter sido específica o suficiente

═══════════════════════════════════════════════════════
O QUE VOCÊ PRECISA FAZER
═══════════════════════════════════════════════════════

1. Responda DIRETAMENTE ao email do cliente (${customerEmail})
2. Sua resposta será AUTOMATICAMENTE aprendida pelo sistema
3. A próxima vez que recebermos email similar, a IA usará sua resposta

IMPORTANTE: Não precisa fazer nada no N8N ou no sistema.
Apenas responda o cliente normalmente que o sistema aprende sozinho.

═══════════════════════════════════════════════════════

Este é um email automático do sistema FeetFans Auto-Responder.
Configurado para notificar quando confidence < 50%.

--
Sistema FeetFans Auto-Learning v1.0
VPS: 154.56.55.202 (n8n.feetstars.online)
`;

return {
  json: {
    notification_sent: true,
    notification_to: 'gomesfm@gmail.com',
    notification_subject: notificationSubject,
    notification_body: notificationBody,
    customer_email: customerEmail,
    confidence: confidence,
    language: language
  }
};
