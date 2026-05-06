const fs = require('fs');

// Load test cases
const testData = JSON.parse(fs.readFileSync('./test-emails-classification.json', 'utf8'));

// Classification logic (same as N8N workflow)
function classifyEmail(subject, body) {
  const text = `${subject}\n\n${body}`;

  // Detect language (check for distinctive words)
  let language = 'en';
  if (/\b(olá|obrigad|preciso|ajuda|produto|acesso|dúvida|cartão|quero|meu|volta|dinheiro)\b/i.test(text)) {
    language = 'pt';
  } else if (/\b(hola|gracias|necesito|producto|duda|tarjeta|crédito|devolución|quiero|mi)\b/i.test(text)) {
    language = 'es';
  }

  // Classify category
  let category = 'IGNORE';

  // Check for refund + threat keywords
  const threatKeywords = [
    'chargeback', 'dispute', 'disputa', 'denunciar', 'report',
    'banco', 'bank', 'cartão de crédito', 'credit card', 'tarjeta',
    'fraude', 'fraud', 'reclamar', 'complain', 'queja'
  ];
  const hasRefund = /\b(reembolso|refund|devolución|devolver|dinheiro de volta|money back)\b/i.test(text);
  const hasThreat = threatKeywords.some(kw => text.toLowerCase().includes(kw.toLowerCase()));

  if (hasRefund && hasThreat) {
    category = 'REFUND_THREAT';
  } else if (hasRefund) {
    category = 'REFUND_IGNORE';
  } else if (/\b(acesso|login|senha|password|access|acceso|contraseña|cadastro|registro|register)\b/i.test(text)) {
    category = 'ACCESS_REQUEST';
  } else if (/\b(dúvida|duvida|ajuda|help|problema|error|erro|ayuda|no funciona|não funciona|doesn't work)\b/i.test(text)) {
    category = 'TECHNICAL_SUPPORT';
  }

  return { category, language };
}

// Run tests
console.log('🧪 Testing Email Classification Logic\n');
console.log('=' .repeat(80));

let passed = 0;
let failed = 0;

testData.test_cases.forEach(test => {
  const result = classifyEmail(test.subject, test.body);
  const categoryMatch = result.category === test.category_expected;
  const languageMatch = result.language === test.language_expected;
  const status = (categoryMatch && languageMatch) ? '✅ PASS' : '❌ FAIL';

  if (categoryMatch && languageMatch) {
    passed++;
  } else {
    failed++;
  }

  console.log(`\nTest #${test.id}: ${status}`);
  console.log(`Subject: "${test.subject}"`);
  console.log(`Body: "${test.body.substring(0, 60)}..."`);
  console.log(`Expected: ${test.category_expected} (${test.language_expected})`);
  console.log(`Got:      ${result.category} (${result.language})`);

  if (!categoryMatch) {
    console.log(`  ⚠️  Category mismatch!`);
  }
  if (!languageMatch) {
    console.log(`  ⚠️  Language mismatch!`);
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed (${Math.round(passed / (passed + failed) * 100)}% accuracy)`);

if (failed === 0) {
  console.log('\n✅ All tests passed! Classification logic is working correctly.');
} else {
  console.log('\n❌ Some tests failed. Review the logic and keywords.');
}
