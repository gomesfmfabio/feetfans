# Guia de Integração - Sistema FAQ Semântico no N8N

## 📋 Overview

Este guia mostra como integrar os 3 novos componentes no workflow N8N existente:

1. **FAQ Database Loader** - Carrega o banco de FAQs
2. **Semantic Search** - Busca semântica com Gemini
3. **AI Response Adapter** - Adapta resposta quando necessário

---

## 🏗️ Arquitetura do Workflow Atualizado

```
Gmail Trigger
    ↓
Extract Email Data (já existe)
    ↓
Detect Language (já existe)
    ↓
[NEW] Load FAQ Database
    ↓
[NEW] Semantic Search (Gemini)
    ↓
Switch by Threshold
    ├─ EXACT (≥80%) → Send Response
    ├─ AI_ADAPT (50-79%) → [NEW] AI Adapter → Send Response
    └─ GENERIC (<50%) → Generic Response + Notify Human
```

---

## 🔧 Passo a Passo de Integração

### Step 1: Upload FAQ Database para N8N

**Opção A - Via N8N UI:**
1. Acesse https://n8n.feetstars.online
2. Settings → Binary Data → Upload `faq-multilingual.json`

**Opção B - Hospedar em URL:**
1. Colocar `faq-multilingual.json` em servidor acessível
2. Usar HTTP Request node para baixar

**Opção C - Hardcode no workflow (mais simples):**
- Criar node "Set" com o JSON completo do FAQ

### Step 2: Criar Node "Load FAQ Database"

**Node Type:** `Code`
**Name:** `Load FAQ Database`

```javascript
// Opção C (hardcode) - Mais simples para começar
const FAQ_DATABASE = {
  "version": "1.0",
  "languages": ["pt", "en", "es"],
  "last_updated": "2026-05-05",
  "faqs": [
    // Cole aqui o conteúdo completo de faq-multilingual.json
  ],
  "generic_response_low_match": {
    "pt": "Olá! Recebemos sua mensagem...",
    "en": "Hello! We received your message...",
    "es": "¡Hola! Recibimos tu mensaje..."
  }
};

return {
  faq_database: FAQ_DATABASE,
  subject: $input.first().json.subject,
  body: $input.first().json.body,
  language: $input.first().json.language
};
```

### Step 3: Criar Node "Semantic Search"

**Node Type:** `Code`
**Name:** `FAQ Semantic Search`

Cole o código de `n8n-faq-semantic-search.js`

**IMPORTANTE:**
- Verificar que `GEMINI_API_KEY` está correto
- Ajustar thresholds se necessário (THRESHOLD_EXACT = 80, THRESHOLD_AI = 50)

### Step 4: Criar Node "Switch by Threshold"

**Node Type:** `Switch`
**Name:** `Route by Confidence`

**Rules:**
- Rule 1: `{{ $json.threshold_level }}` equals `EXACT` → Route 0
- Rule 2: `{{ $json.threshold_level }}` equals `AI_ADAPT` → Route 1
- Rule 3: `{{ $json.threshold_level }}` equals `GENERIC` → Route 2

### Step 5: Criar Node "AI Response Adapter"

**Node Type:** `Code`
**Name:** `AI Response Adapter`

Cole o código de `n8n-ai-response-adapter.js`

**Conectar:**
- Input: Route 1 do Switch (AI_ADAPT)
- Output: Merge com Route 0 (EXACT) antes de enviar email

### Step 6: Criar Node "Notify Human"

**Node Type:** `Gmail`
**Name:** `Notify Low Confidence`

**Configuração:**
- **To:** `gomesfm@gmail.com`
- **Subject:** `[FeetFans] Email de baixa confiança recebido`
- **Message:**
```
Um email foi recebido mas não encontrei resposta adequada no FAQ.

Detalhes:
- De: {{ $json.from }}
- Assunto: {{ $json.subject }}
- Confiança: {{ $json.confidence }}%
- Idioma: {{ $json.language }}

Email original:
{{ $json.original_email }}

O cliente recebeu resposta genérica automaticamente.
Você pode responder diretamente ao email do cliente.
```

### Step 7: Atualizar Node "Send Response"

**Adicionar header anti-loop:**

```javascript
// No node Send Gmail Reply, adicionar:
headers: {
  'X-Auto-Responder': 'FeetFans-FAQ-v1'
}
```

---

## 🧪 Como Testar

### 1. Teste Local (antes de integrar)

```bash
# Instalar dependências
npm install node-fetch

# Rodar teste semântico
node test-semantic-search.js
```

**Resultado esperado:**
- 5 casos de teste executados
- Scores de similaridade exibidos
- Melhor match identificado
- Threshold level correto

### 2. Teste no N8N

1. Desativar workflow principal
2. Criar workflow de teste com:
   - Manual Trigger
   - Mesma estrutura dos novos nodes
   - Test data hardcoded
3. Execute manualmente
4. Verifique outputs de cada node

### 3. Teste Real (low volume)

1. Criar email de teste em outra conta
2. Enviar para feetfansoficial@gmail.com
3. Verificar:
   - Email foi lido (5 min)
   - Resposta recebida
   - Header X-Auto-Responder presente
   - Notificação enviada se confidence <50%

---

## 📊 Monitoramento

### Métricas para Acompanhar

1. **Taxa de Match:**
   - Quantos emails com confidence ≥80%
   - Quantos emails com confidence 50-79%
   - Quantos emails com confidence <50%

2. **Taxa de Notificação:**
   - Quantas notificações enviadas para gomesfm@gmail.com
   - Padrões de emails com baixa confiança

3. **Performance:**
   - Tempo de processamento por email
   - Rate limit do Gemini (15 req/min)

### Logs Úteis

Adicionar console.log nos nodes de Code:

```javascript
console.log('Semantic Search Result:', {
  faq_id: bestMatch.faq_id,
  score: bestMatch.score,
  threshold: thresholdLevel
});
```

Ver logs em N8N: Workflow → Executions → Click na execução → Ver logs

---

## ⚠️ Rate Limits e Custos

### Google Gemini Free Tier

- **Limite:** 15 requests/min
- **Quota:** 1,500 requests/day
- **Custo:** $0 (free tier)

### Cálculo de Uso

- **5 FAQs no database:** 5 requests por email
- **Max emails simultâneos:** 3/min (15 requests / 5 FAQs)
- **Max emails/dia:** 300 (1,500 requests / 5 FAQs)

**Se volume aumentar:**
- Implementar cache de similaridade
- Usar embeddings pre-computados
- Upgrade para Gemini Paid Tier

---

## 🔄 Próximos Passos (Tasks Pendentes)

- [ ] **Task #12:** Auto-learning system (detecta respostas manuais)
- [ ] **Task #13:** Configurar notificação de baixa confiança
- [ ] **Task #15:** Integração completa e deploy

---

## 🆘 Troubleshooting

### Erro: "Gemini API quota exceeded"

**Causa:** Mais de 15 requests/min ou 1,500/day
**Solução:** Implementar rate limiting no N8N ou aguardar reset

### Erro: "FAQ database undefined"

**Causa:** Node Load FAQ Database não executou
**Solução:** Verificar conexões entre nodes

### Score sempre 0

**Causa:** Gemini API key inválida
**Solução:** Verificar API key em `n8n-faq-semantic-search.js`

### Resposta sempre genérica

**Causa:** Todos os scores <50%
**Solução:**
1. Verificar se FAQ tem keywords adequados
2. Ajustar prompt do Gemini
3. Adicionar mais FAQs ao database

---

## 📝 Checklist de Integração

- [ ] FAQ database preparado (faq-multilingual.json)
- [ ] Node "Load FAQ Database" criado
- [ ] Node "Semantic Search" criado e testado
- [ ] Node "Switch by Threshold" configurado
- [ ] Node "AI Response Adapter" criado
- [ ] Node "Notify Human" configurado (gomesfm@gmail.com)
- [ ] Header X-Auto-Responder adicionado
- [ ] Teste local executado (test-semantic-search.js)
- [ ] Teste no N8N executado
- [ ] Workflow ativado
- [ ] Email de teste enviado
- [ ] Monitoramento configurado

---

**Última atualização:** 2026-05-06
**Versão:** 1.0
