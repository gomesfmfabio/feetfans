/**
 * N8N Node: Save Updated FAQ Database
 *
 * Salva o FAQ database atualizado após auto-learning
 *
 * OPÇÕES DE STORAGE:
 * 1. Google Drive (recomendado - sincroniza automaticamente)
 * 2. N8N Binary Storage
 * 3. Dropbox
 * 4. HTTP POST para API externa
 *
 * Este exemplo usa Google Drive
 */

const updatedFAQ = $input.first().json.faq_database_updated;

if (!updatedFAQ) {
  return {
    saved: false,
    error: 'No updated FAQ database provided'
  };
}

// Convert to JSON string with pretty formatting
const faqJSON = JSON.stringify(updatedFAQ, null, 2);

// Prepare for Google Drive upload
return {
  json: {
    saved: true,
    file_name: 'faq-multilingual.json',
    file_content: faqJSON,
    total_faqs: updatedFAQ.faqs.length,
    last_updated: updatedFAQ.last_updated
  },
  binary: {
    data: Buffer.from(faqJSON, 'utf-8')
  }
};

// NOTA: Após este node, adicionar node "Google Drive" ou "Write Binary File"
// para salvar o arquivo atualizado
