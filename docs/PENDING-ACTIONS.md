# FeetFans - Ações Pendentes & Setup Required

**Data:** 2026-05-03
**Responsável:** Fábio
**Status:** 🔴 AGUARDANDO AÇÕES

---

## 🎯 RESUMO EXECUTIVO

**Tempo total estimado:** 2-3 horas
**Ações críticas:** 5 contas + 7 decisões
**Bloqueadores:** Stories 1.3, 1.5, 3.6, 4.3, 6.1

---

## ⏰ AÇÕES IMEDIATAS (Próximas 48h)

### 1. Criar Conta Supabase ⭐ CRÍTICO

**Bloqueio:** Story 1.3 (Supabase Backend Setup)

**Passos:**
1. Acessar https://app.supabase.com
2. Criar conta (GitHub ou email)
3. Criar projeto DEV: `feetfans-dev`
   - Region: US East (ou mais próximo)
   - Database Password: (gerar senha forte)
4. Copiar credenciais:
   ```
   Project URL: https://<project-ref>.supabase.co
   Anon Key: eyJhb...
   Service Role Key: eyJhb...
   ```
5. Adicionar em `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```

**Tempo estimado:** 15 minutos
**Custo:** $0 (Free Tier)

---

### 2. Criar Conta Stripe ⭐ CRÍTICO

**Bloqueio:** Story 4.3 (Trial-to-Paid Checkout)

**Passos:**
1. Acessar https://stripe.com
2. Criar conta (preencher dados básicos)
3. Ativar modo teste (Test Mode)
4. Ir em Developers > API Keys
5. Copiar:
   ```
   Publishable key: pk_test_...
   Secret key: sk_test_...
   ```
6. Configurar webhook:
   - Endpoint URL: `https://seu-dominio.vercel.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copiar Webhook Secret: `whsec_...`
7. Adicionar em `.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

**Tempo estimado:** 20 minutos
**Custo:** $0 (Test Mode free)

**Nota:** Para produção, precisará completar onboarding do Stripe (documentos, conta bancária)

---

### 3. Criar Conta Anthropic Claude ⭐ CRÍTICO

**Bloqueio:** Story 3.6 (AI Agent Message Generation)

**Passos:**
1. Acessar https://console.anthropic.com
2. Criar conta
3. Ir em API Keys
4. Criar nova API key
5. Copiar: `sk-ant-api03-...`
6. Configurar billing (cartão de crédito - pay-as-you-go)
7. Adicionar em `.env.local`:
   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   ```

**Tempo estimado:** 10 minutos
**Custo inicial:** $0 (pay-as-you-go, ~$5-10/mês em desenvolvimento)

**Modelo sugerido:** `claude-3-haiku-20240307` (mais econômico)

---

### 4. Criar Conta Age Verification 🟡 IMPORTANTE

**Bloqueio:** Story 1.5 (Age Verification)

**Opções (escolher 1):**

#### Opção A: Persona (Recomendado)
- **Custo:** $0.50-1 por verificação
- **Link:** https://withpersona.com
- **Passos:**
  1. Criar conta
  2. Obter API Key (sandbox mode)
  3. Adicionar em `.env.local`:
     ```env
     PERSONA_API_KEY=...
     PERSONA_TEMPLATE_ID=...
     ```

#### Opção B: Onfido
- **Custo:** $1-3 por verificação
- **Link:** https://onfido.com
- **Passos:**
  1. Criar conta
  2. Obter API Token (sandbox mode)
  3. Adicionar em `.env.local`:
     ```env
     ONFIDO_API_TOKEN=...
     ONFIDO_WEBHOOK_TOKEN=...
     ```

**Tempo estimado:** 15 minutos
**Custo:** $0 (sandbox mode free para desenvolvimento)

**Decisão necessária:** Escolher entre Persona (mais barato) ou Onfido (mais robusto)

---

### 5. Criar Conta Content Moderation 🟡 IMPORTANTE

**Bloqueio:** Story 6.1 (Content Moderation)

**Opções (escolher 1):**

#### Opção A: Sightengine (Recomendado)
- **Custo:** $0.80 per 1000 images
- **Link:** https://sightengine.com
- **Passos:**
  1. Criar conta
  2. Obter API User + API Secret
  3. Adicionar em `.env.local`:
     ```env
     SIGHTENGINE_API_USER=...
     SIGHTENGINE_API_SECRET=...
     ```

#### Opção B: AWS Rekognition
- **Custo:** $1.00 per 1000 images
- **Link:** https://aws.amazon.com/rekognition
- **Requer:** Conta AWS configurada

**Tempo estimado:** 15 minutos
**Custo:** Free trial ou pay-as-you-go

**Decisão necessária:** Escolher entre Sightengine (mais simples) ou AWS (mais robusto)

---

## 📋 DECISÕES DE NEGÓCIO

### 6. Featured Placement - Confirmar Pricing

**Contexto:** PRD sugere:
- Standard Featured (7 dias): $19 one-time
- Premium Featured (30 dias): $59 one-time OR $49/month recurring

**Pergunta:**
- ✅ Manter esses valores?
- ❓ Ou ajustar (ex: $15/49/39)?

**Impacto:** Código da Story 5.1

**Prazo:** Antes de implementar Epic 5

---

### 7. FeetFans Course - Método de Validação

**Contexto:** Graduadas do curso FeetFans devem ter acesso grátis ao marketplace

**Pergunta:**
Como validar que uma usuária completou o curso?

**Opções:**
1. **API Hotmart:** Webhook quando aluna completa curso
   - Prós: Automático, preciso
   - Contras: Requer integração com Hotmart

2. **Lista Manual:** Admin adiciona emails manualmente no banco
   - Prós: Simples para MVP
   - Contras: Não escala, manual

3. **Código Promocional:** Cada aluna recebe código único
   - Prós: Simples, rastreável
   - Contras: Pode vazar códigos

**Recomendação:** Opção 2 para MVP (mais simples), migrar para Opção 1 depois

**Ação necessária:** Decidir método + fornecer dados (se Opção 1: API endpoint Hotmart, se Opção 2: lista inicial de emails)

**Prazo:** Antes de implementar Story 4.4

---

### 8. Categorias de Conteúdo - Definir Lista

**Contexto:** Creators podem adicionar categorias ao conteúdo (Story 2.1)

**Sugestões do PRD:**
- "Barefoot"
- "Heels"
- "Socks"
- "Nail Polish"
- "Jewelry"
- "Outdoors"

**Ação necessária:** Definir lista completa (10-15 categorias)

**Pergunta:** Confirmar as 6 acima + adicionar mais 4-9?

**Prazo:** Antes de implementar Story 2.1

---

### 9. AI Agents - Personalidades

**Contexto:** 15 AI agents com personalidades diversas

**Ação necessária:** Revisar/aprovar personalidades quando Story 3.4 for implementada

**Sugestão:** Será apresentado lista para aprovação durante implementação

**Prazo:** Antes de implementar Story 3.4

---

### 10. Real-Time Chat - WebSocket vs SSE

**Contexto:** Architecture doc sugere SSE (mais simples)

**Pergunta:** Confirmar SSE ou usar WebSocket?

**Recomendação:** SSE para MVP (mais simples, unidirecional suficiente)

**Impacto:** Story 3.1

**Prazo:** Antes de implementar Story 3.1

---

### 11. Job Queue - node-cron vs BullMQ

**Contexto:** Para agendar AI agents e expirar trials

**Opções:**
- **node-cron:** Zero dependencies, roda no Next.js
- **BullMQ:** Redis-backed, mais robusto, requer infra

**Recomendação:** node-cron para MVP

**Impacto:** Stories 3.5, 4.1

**Prazo:** Antes de implementar Story 3.5

---

### 12. Brazilian Payment Methods

**Contexto:** MVP targets US/international (Stripe credit cards)

**Pergunta:** Adicionar Pix/Boleto no MVP ou defer para Phase 2?

**Recomendação:** Defer para Phase 2 (PRD já documenta isso)

**Confirmação necessária:** OK diferir para depois?

**Prazo:** Antes de implementar Story 5.1

---

## ✅ CHECKLIST DE SETUP COMPLETO

Copie e marque conforme completar:

```
Contas Criadas:
[ ] Supabase (feetfans-dev project)
[ ] Stripe (test mode)
[ ] Anthropic Claude (API key)
[ ] Age Verification (Persona OU Onfido)
[ ] Content Moderation (Sightengine OU AWS)

Decisões Tomadas:
[ ] Featured Placement pricing confirmado
[ ] Método validação curso FeetFans definido
[ ] Lista de categorias de conteúdo aprovada
[ ] WebSocket vs SSE confirmado
[ ] node-cron vs BullMQ confirmado
[ ] Brazilian payments strategy confirmada

Ambiente Local:
[ ] .env.local criado com todas as keys
[ ] Variáveis testadas (basic health check)

Pronto para Implementação:
[ ] Epic 1 pode começar (Stories 1.3-1.6)
```

---

## 📁 TEMPLATE `.env.local`

Crie o arquivo `/Users/martinez/pegasus/.env.local` com:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Stripe
STRIPE_SECRET_KEY=sk_test_<your-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<your-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-secret>

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-api03-<your-key>

# Age Verification (escolher 1)
# Persona:
PERSONA_API_KEY=<your-key>
PERSONA_TEMPLATE_ID=<your-template>
# OU Onfido:
# ONFIDO_API_TOKEN=<your-token>
# ONFIDO_WEBHOOK_TOKEN=<your-webhook-token>

# Content Moderation (escolher 1)
# Sightengine:
SIGHTENGINE_API_USER=<your-user>
SIGHTENGINE_API_SECRET=<your-secret>
# OU AWS Rekognition:
# AWS_ACCESS_KEY_ID=<your-key>
# AWS_SECRET_ACCESS_KEY=<your-secret>
# AWS_REGION=us-east-1
```

---

## 💰 CUSTO TOTAL ESTIMADO (Desenvolvimento)

| Serviço | Custo/Mês (Dev) | Custo/Mês (Prod - 100 users) |
|---------|-----------------|------------------------------|
| Supabase Free Tier | $0 | $25 (Pro tier) |
| Stripe Test Mode | $0 | $0 (comissão por transação) |
| Anthropic Claude | $5-10 | $20-50 (depends on usage) |
| Age Verification | $0 (sandbox) | $50-150 (100 verificações) |
| Content Moderation | $0 (free trial) | $10-30 (1000 uploads) |
| **TOTAL** | **$5-10/mês** | **$105-255/mês** |

---

## 🚀 APÓS COMPLETAR SETUP

**Você estará pronto para:**
1. ✅ Implementar Story 1.3 (Supabase Backend)
2. ✅ Implementar Story 1.4 (Authentication)
3. ✅ Implementar Story 1.5 (Age Verification)
4. ✅ Continuar com Epic 1 completo

**Próximo milestone:** Epic 1 completado em ~7-10 dias

---

## 📞 SUPORTE

Se tiver problemas durante setup, documentação disponível em:
- **Supabase:** https://supabase.com/docs
- **Stripe:** https://stripe.com/docs
- **Anthropic:** https://docs.anthropic.com
- **Persona:** https://docs.withpersona.com
- **Sightengine:** https://sightengine.com/docs

---

**Criado em:** 2026-05-03
**Por:** Claude (@aiox-master)
**Status:** 🔴 AGUARDANDO AÇÕES DO FÁBIO
