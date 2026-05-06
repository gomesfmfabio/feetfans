# FeetFans MVP Roadmap — 3-4 Semanas para Lançamento

**Objetivo:** Lançar marketplace funcional com chat + 3 AI agents simulando compradores
**Timeline:** 3-4 semanas (57-62h estimadas, 6h/dia)
**Data início:** 05 Mai 2026
**Data lançamento:** ~30 Mai - 02 Jun 2026

---

## 🎯 Escopo MVP

### ✅ Features Incluídas

**Core Marketplace:**
- [x] PWA instalável (web + mobile) — **JÁ COMPLETO** (Story 1.2)
- [ ] Auth: Signup/Login (email/password)
- [ ] Role selection: Creator ou Consumer
- [ ] Checkbox "I am 18+" (compliance básica)
- [ ] Upload de fotos (creators pagos apenas)
- [ ] 7-10 categorias de conteúdo
- [ ] Feed público grátis (grid de fotos)
- [ ] Category filtering
- [ ] Creator profiles públicos

**Monetização:**
- [ ] Creator Subscription: $9/mês via Stripe
- [ ] Feature gating: Upload apenas para creators com subscription ativa
- [ ] Consumers veem tudo grátis

**Chat + AI Agents:**
- [ ] Chat infrastructure (SSE real-time)
- [ ] Inbox de conversas
- [ ] Chat screen 1:1
- [ ] **3 AI Agent personas** (não 15):
  - Agent 1: "Casual Collector" (curioso, faz perguntas)
  - Agent 2: "Regular Buyer" (interessado, pede custom content)
  - Agent 3: "Premium Enthusiast" (elogia, engaja bastante)
- [ ] AI trigger: 1 agente por dia durante primeira semana de creator
- [ ] AI message generation via Claude Haiku
- [ ] Respostas contextualizadas (baseadas no conteúdo do creator)

**Safety + Compliance:**
- [ ] Moderação automática (Sightengine)
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Footer com links legais

---

### ❌ Features Adiadas (v2 - Pós-Lançamento)

**AI Agents Avançado:**
- ❌ 15 AI personas (começar com 3)
- ❌ AI agent response avançado (sentiment analysis)
- ❌ Trial link blocking (não tem trial no MVP)

**Features Premium:**
- ❌ Featured Placement ($19-59 destaque)
- ❌ Swipe Discovery (Tinder-style)
- ❌ Admin Dashboard completo
- ❌ Analytics avançado

**Compliance Avançado:**
- ❌ Onfido/Persona age verification (usar checkbox)
- ❌ Vídeos (apenas fotos no MVP)
- ❌ User reporting system
- ❌ Message TTL 24h (implementar depois)

**Performance:**
- ❌ Infinite scroll (usar pagination)
- ❌ Redis caching
- ❌ Load testing
- ❌ Advanced monitoring (Sentry)

---

## 📅 Cronograma Detalhado (4 Semanas)

### **SEMANA 1 (05-11 Mai): Database + Auth + Upload**

#### **Segunda-feira (5-6h)**
**PENDING-ACTIONS:**
- [ ] Criar conta Supabase (free tier)
- [ ] Criar conta Stripe (test mode)
- [ ] Criar conta Sightengine (2K requests grátis/mês)
- [ ] Criar conta Anthropic Claude API ($5 crédito inicial)
- [ ] Configurar `.env.local` (template abaixo)

**Story 1.3 - Supabase Setup (Parte 1):**
- [ ] Criar projeto Supabase
- [ ] Schema: users table
- [ ] Schema: creator_subscriptions table
- [ ] Schema: content table
- [ ] RLS policies básicas (users, content)

**SQL Schema:**
```sql
-- Users (creators + consumers)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('creator', 'consumer')),
  nickname TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Creator subscriptions
CREATE TABLE creator_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Content (photos only for MVP)
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected'))
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users: all authenticated users can read profiles
CREATE POLICY "Public profiles are viewable by all authenticated users"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users: users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Content: approved content is viewable by all
CREATE POLICY "Approved content is viewable by all"
  ON content FOR SELECT
  USING (moderation_status = 'approved');

-- Content: creators can insert their own content
CREATE POLICY "Creators can insert own content"
  ON content FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Content: creators can delete their own content
CREATE POLICY "Creators can delete own content"
  ON content FOR DELETE
  USING (auth.uid() = creator_id);
```

#### **Terça-feira (6h)**
**Story 1.3 - Supabase Setup (Parte 2):**
- [ ] Storage bucket: `creator-photos` (public read, creators-only write)
- [ ] Storage policies (RLS)
- [ ] Testar upload manual via Supabase Dashboard

**Story 1.4 - Authentication (Parte 1):**
- [ ] Signup page (`/signup`)
  - Email/password form
  - Role selection (radio: Creator / Consumer)
  - Checkbox "I confirm I am 18 years old"
  - Link para Terms
- [ ] Integrar Supabase Auth (signUp)
- [ ] Redirect após signup: `/profile-setup`

#### **Quarta-feira (6h)**
**Story 1.4 - Authentication (Parte 2):**
- [ ] Login page (`/login`)
- [ ] Integrar Supabase Auth (signIn)
- [ ] Session management (middleware)
- [ ] Protected routes (redirect to /login se não autenticado)
- [ ] Profile setup page (`/profile-setup`)
  - Nickname
  - Bio (opcional)
  - Avatar upload (opcional)

**Testar:**
- [ ] Signup → profile setup → redirect to dashboard
- [ ] Login → redirect to dashboard
- [ ] Logout

#### **Quinta-feira (6h)**
**Decidir categorias finais (7-10 options):**
- [ ] Decidir lista final de categorias (sugestões abaixo)
- [ ] Adicionar ENUM ou constraints no schema

**Sugestões de categorias:**
1. Barefoot
2. Painted Toes
3. Socks
4. Stockings/Pantyhose
5. Heels
6. Sneakers
7. Sandals
8. Foot Jewelry
9. Artistic/Creative
10. Seasonal

**Story 2.1 - Content Upload (Parte 1):**
- [ ] Upload page (`/upload`) - creators only
- [ ] File input (accept: image/*)
- [ ] Category dropdown (7-10 options)
- [ ] Preview antes de upload
- [ ] Upload para Supabase Storage

#### **Sexta-feira (6h)**
**Story 2.1 - Content Upload (Parte 2):**
- [ ] Salvar metadata em `content` table
- [ ] Moderação inline (Sightengine) antes de salvar
  - `moderation_status = 'pending'` se nudity score 0.5-0.8
  - `moderation_status = 'approved'` se score < 0.5
  - Rejeitar upload se score > 0.8
- [ ] Success message + redirect to `/my-content`

**Story 2.2 - Creator Gallery:**
- [ ] Página "My Content" (`/my-content`)
- [ ] Fetch fotos do creator (WHERE creator_id = current_user)
- [ ] Grid responsivo (3 colunas mobile, 4-5 desktop)
- [ ] Delete button (soft delete ou hard delete)

**Checkpoint Semana 1:**
- ✅ Database + Auth + Upload funcionando
- ✅ Creators podem postar fotos (com moderação)

---

### **SEMANA 2 (12-18 Mai): Feed + Profiles + Payments**

#### **Segunda-feira (6h)**
**Story 2.3 - Feed Público (Parte 1):**
- [ ] Feed page (`/` ou `/feed`) - route principal
- [ ] Fetch fotos (WHERE moderation_status = 'approved' ORDER BY created_at DESC LIMIT 50)
- [ ] Grid responsivo mobile-first
- [ ] Mostrar: foto, creator nickname, categoria, data
- [ ] Lightbox para ver foto full-size (biblioteca: `react-image-lightbox` ou similar)

#### **Terça-feira (6h)**
**Story 2.4 - Category Filtering:**
- [ ] Dropdown de categorias no topo do feed
- [ ] Option "All Categories" (default)
- [ ] Filter query: WHERE category = ? (se categoria selecionada)
- [ ] URL state: `?category=barefoot`
- [ ] Testar todas as categorias

**Story 2.3 - Feed Público (Parte 2):**
- [ ] Pagination (botões "Load More" ou "Next/Previous")
- [ ] Mobile: infinite scroll (opcional, se tiver tempo)

#### **Quarta-feira (6h)**
**Story 2.5 - Creator Profile:**
- [ ] Profile page (`/creators/[id]`)
- [ ] Fetch creator info (nickname, bio, avatar, join date)
- [ ] Grid de fotos do creator (WHERE creator_id = :id AND moderation_status = 'approved')
- [ ] Photo count, join date
- [ ] Link de volta para feed

**Testar:**
- [ ] Click em foto no feed → lightbox
- [ ] Click em creator nickname → vai para profile
- [ ] Filtrar categorias → atualiza feed

#### **Quinta-feira (6h)**
**Story 4.3 - Stripe Checkout (Parte 1):**
- [ ] Criar produto no Stripe Dashboard: "Creator Subscription" ($9/mês)
- [ ] Stripe Checkout Session API (backend route: `/api/stripe/create-checkout`)
- [ ] Página `/subscribe-creator` (creators only)
  - Texto explicativo: "Subscribe to upload content"
  - Botão "Subscribe Now ($9/month)"
  - Redirect para Stripe Checkout

**Backend:**
```typescript
// app/api/stripe/create-checkout/route.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { userId, email } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID_CREATOR_PLAN!, // $9/mês
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/subscribe-creator?canceled=true`,
    metadata: { userId },
  });

  return Response.json({ url: session.url });
}
```

#### **Sexta-feira (6h)**
**Story 4.3 - Stripe Webhooks + Feature Gating:**
- [ ] Webhook endpoint (`/api/stripe/webhook`)
  - Event: `checkout.session.completed`
  - Salvar subscription em `creator_subscriptions` table
  - Atualizar status: 'active'
- [ ] Feature gating: `/upload` page
  - Check if creator has active subscription
  - Se não tiver → redirect to `/subscribe-creator`
- [ ] Testar flow completo:
  1. Signup creator → redirect to subscribe
  2. Subscribe via Stripe → webhook salva subscription
  3. Redirect to dashboard → pode acessar /upload

**Checkpoint Semana 2:**
- ✅ Feed público funcionando
- ✅ Category filtering
- ✅ Creator profiles
- ✅ Creators pagam $9/mês para postar

---

### **SEMANA 3 (19-25 Mai): Chat + 3 AI Agents**

#### **Segunda-feira (6h)**
**Story 3.1 - Chat Infrastructure (Parte 1 - Database):**
- [ ] Schema: `conversations` table
- [ ] Schema: `messages` table
- [ ] RLS policies para chat

**SQL Schema:**
```sql
-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_id, consumer_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations: users can see their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = creator_id OR auth.uid() = consumer_id);

-- Messages: users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE creator_id = auth.uid() OR consumer_id = auth.uid()
    )
  );

-- Messages: users can insert messages in their conversations
CREATE POLICY "Users can insert messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations
      WHERE creator_id = auth.uid() OR consumer_id = auth.uid()
    )
  );
```

#### **Terça-feira (6h)**
**Story 3.1 - Chat Infrastructure (Parte 2 - SSE):**
- [ ] Backend: SSE endpoint (`/api/chat/stream/[conversationId]`)
- [ ] Realtime subscription via Supabase Realtime
- [ ] Broadcast new messages via SSE

**Story 3.2 - Inbox:**
- [ ] Inbox page (`/inbox`)
- [ ] Fetch conversas do usuário (JOIN com users para pegar info do outro participante)
- [ ] Mostrar: avatar, nickname, última mensagem, timestamp
- [ ] Click em conversa → vai para `/chat/[conversationId]`

#### **Quarta-feira (6h)**
**Story 3.3 - Chat Screen:**
- [ ] Chat page (`/chat/[conversationId]`)
- [ ] Fetch messages (ORDER BY created_at ASC)
- [ ] UI: mensagens do sender à direita, do receiver à esquerda
- [ ] Input de texto + botão "Send"
- [ ] Auto-scroll para última mensagem
- [ ] SSE connection para receber novas mensagens em real-time

**Testar:**
- [ ] Creator envia mensagem → consumer recebe em tempo real
- [ ] Consumer responde → creator recebe

#### **Quinta-feira (6h)**
**Story 3.4 - AI Agent Personas (3 apenas):**
- [ ] Criar 3 "AI users" no banco (role = 'consumer', is_ai = true)
- [ ] Schema: adicionar coluna `is_ai BOOLEAN DEFAULT false` em `users`
- [ ] Criar `ai_personas` table com prompts

**SQL Schema:**
```sql
ALTER TABLE users ADD COLUMN is_ai BOOLEAN DEFAULT false;

CREATE TABLE ai_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  persona_name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  personality_traits TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**3 AI Personas:**
1. **Casual Collector**
   - Name: "Mike"
   - Prompt: "You are a casual foot content enthusiast. You're curious and ask questions about the content. Keep messages short (1-2 sentences)."
   - Traits: ["curious", "friendly", "asks questions"]

2. **Regular Buyer**
   - Name: "David"
   - Prompt: "You are an active buyer of custom content. You show interest and sometimes request specific types of shots. Be polite and specific."
   - Traits: ["interested", "specific", "polite"]

3. **Premium Enthusiast**
   - Name: "Alex"
   - Prompt: "You are an enthusiastic fan who appreciates the artistry. You give compliments and engage frequently. Be supportive and positive."
   - Traits: ["enthusiastic", "supportive", "complimentary"]

#### **Sexta-feira (6h)**
**Story 3.5 - AI Agent Trigger (Simplificado):**
- [ ] Cron job (node-cron): 1x por dia às 10am
- [ ] Lógica: Para cada creator novo (created_at < 7 dias):
  - Pick 1 random AI agent
  - Se já conversou com todos 3 → skip
  - Criar conversation (AI + creator)
  - Enviar primeira mensagem do AI

**Story 3.6 - AI Message Generation:**
- [ ] Backend route: `/api/ai/generate-message`
- [ ] Input: conversationId, creatorId
- [ ] Fetch: creator content (últimas 3 fotos + categorias)
- [ ] Prompt para Claude Haiku:
  - System: [persona system_prompt]
  - User: "You're chatting with a creator who posts [categories]. Their recent content: [photo descriptions]. Start a conversation."
- [ ] Claude Haiku API call (max_tokens: 100)
- [ ] Salvar mensagem em `messages` table

**Checkpoint Semana 3:**
- ✅ Chat 1:1 funcionando em real-time
- ✅ 3 AI agents conversando com creators
- ✅ AI trigger automático (1 agent por dia)

---

### **SEMANA 4 (26 Mai - 02 Jun): Moderation + Compliance + Launch**

#### **Segunda-feira (6h)**
**Story 6.1 - Content Moderation (Sightengine):**
- [ ] Integrar Sightengine API
- [ ] Moderar fotos durante upload (antes de salvar)
- [ ] Lógica:
  - Nudity score > 0.8 → rejeitar upload
  - Nudity score 0.5-0.8 → `moderation_status = 'pending'` (review manual depois)
  - Nudity score < 0.5 → `moderation_status = 'approved'` (publicar imediatamente)
- [ ] Mensagem de erro se foto rejeitada

**Sightengine API:**
```typescript
// lib/moderation.ts
import axios from 'axios';

export async function moderateImage(imageUrl: string) {
  const response = await axios.get('https://api.sightengine.com/1.0/check.json', {
    params: {
      url: imageUrl,
      models: 'nudity-2.0',
      api_user: process.env.SIGHTENGINE_API_USER,
      api_secret: process.env.SIGHTENGINE_API_SECRET,
    },
  });

  const nudityScore = response.data.nudity.sexual_display;

  if (nudityScore > 0.8) return 'rejected';
  if (nudityScore > 0.5) return 'pending';
  return 'approved';
}
```

#### **Terça-feira (5-6h)**
**Story 6.3 - Compliance (Privacy + Terms):**
- [ ] Privacy Policy page (`/privacy`)
  - Texto básico (template legal, ajustar depois)
  - Seções: Data collection, Age requirements, GDPR (se aplicável)
- [ ] Terms of Service page (`/terms`)
  - Texto básico (template legal)
  - Seções: User agreements, Creator responsibilities, Payment terms
- [ ] Footer component com links para Privacy/Terms
- [ ] Checkbox no signup: "I agree to Terms of Service"

**Testar:**
- [ ] Links funcionam
- [ ] Signup bloqueia se checkbox não marcado

#### **Quarta-feira (6h)**
**POLISH - UI/UX:**
- [ ] Landing page melhorada (`/`)
  - Hero section: "Marketplace for Foot Content Creators"
  - CTA: "Sign Up as Creator" / "Browse Content"
  - Screenshots (opcional)
  - Logo FeetFans
- [ ] Navigation:
  - Desktop: top nav (Home, Feed, Upload, Inbox, Profile)
  - Mobile: bottom nav (5 icons)
- [ ] Cores, botões, spacing refinados
- [ ] Mobile-first responsiveness check

#### **Quinta-feira (6h)**
**TESTING COMPLETO:**
- [ ] **Consumer flow:**
  1. Signup → ver feed → filtrar categoria → ver creator profile → OK
- [ ] **Creator flow (free - sem subscription):**
  1. Signup → redireciona para /subscribe-creator → OK
- [ ] **Creator flow (paid):**
  1. Signup → subscribe ($9/mês via Stripe test) → upload foto → foto aparece no feed → OK
- [ ] **AI Agent flow:**
  1. Creator cria conta → aguardar 24h (ou forçar trigger manual) → AI inicia conversa → creator responde → OK
- [ ] **Moderation:**
  1. Upload foto inapropriada → rejeitada → OK
  2. Upload foto limpa → aprovada → aparece no feed → OK

**Testar em:**
- [ ] Desktop Chrome
- [ ] Mobile iOS Safari
- [ ] Mobile Android Chrome
- [ ] PWA instalada (testar install prompt)

#### **Sexta-feira (6h)**
**DEPLOYMENT:**
- [ ] Deploy frontend para Vercel (production)
  - Conectar repo GitHub
  - Configurar env vars (Supabase, Stripe, Anthropic, Sightengine)
  - Deploy
- [ ] Aplicar migrations no Supabase prod
  - Criar projeto prod
  - Rodar migrations
  - Configurar RLS policies
  - Criar storage bucket prod
- [ ] Stripe: mudar para prod keys
  - Criar produto real ($9/mês)
  - Configurar webhook prod
- [ ] Sightengine: usar API key prod
- [ ] Anthropic Claude: prod key

**Smoke test em produção:**
- [ ] Signup funciona
- [ ] Upload funciona
- [ ] Feed carrega
- [ ] Stripe checkout funciona (testar com cartão teste)
- [ ] AI agent envia mensagem

#### **Sábado/Domingo (opcional 4-6h)**
**LAUNCH PREP:**
- [ ] Melhorar copy da landing page
- [ ] Adicionar screenshots do app
- [ ] Preparar anúncio de lançamento
- [ ] Convidar primeiros 5-10 creators (beta)
  - Enviar email com link de signup
  - Oferecer 1º mês grátis (discount code no Stripe)
- [ ] Criar conta admin para monitorar uploads/moderação

**🚀 LANÇAMENTO: ~30 Mai - 02 Jun 2026**

---

## 🛠️ Stack Técnico (MVP)

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 14 App Router + TypeScript + Tailwind CSS |
| **PWA** | next-pwa (service worker + manifest) |
| **Backend** | Next.js API Routes (serverless) |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth |
| **Storage** | Supabase Storage |
| **Realtime** | Supabase Realtime + SSE |
| **Payments** | Stripe Checkout + Webhooks |
| **AI** | Anthropic Claude Haiku API |
| **Moderation** | Sightengine API |
| **Hosting** | Vercel (frontend) + Supabase (backend) |
| **Scheduler** | node-cron (AI agent trigger) |

---

## 📋 Environment Variables (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_CREATOR_PLAN=price_xxx

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-xxx

# Sightengine
SIGHTENGINE_API_USER=xxx
SIGHTENGINE_API_SECRET=xxx

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

---

## 💰 Custos Estimados (MVP)

### **Desenvolvimento (mensal):**
- Supabase Free tier: $0
- Vercel Hobby: $0
- Sightengine: $0 (2K requests grátis)
- Anthropic Claude (teste): ~$5-10
- Stripe: $0 (test mode)
- **TOTAL DEV: $5-10/mês**

### **Produção (mensal - estimativa 100 creators):**
- Supabase Pro: $25
- Vercel Pro (se necessário): $20
- Sightengine: ~$60 (10K requests/mês)
- Anthropic Claude: ~$20-30 (3 agents × 100 creators × 7 dias = ~2100 mensagens/mês)
- Stripe: 2.9% + $0.30 por transação (~$900 revenue = ~$30 fees)
- **TOTAL PROD: $105-165/mês (até 100 creators)**

---

## 🎯 Success Metrics (Pós-Lançamento)

**Semana 1:**
- [ ] 10-20 creators cadastrados
- [ ] 5+ creators pagantes ($9/mês)
- [ ] 50+ consumers
- [ ] 100+ fotos publicadas

**Semana 2-4:**
- [ ] 50+ creators
- [ ] 20+ creators pagantes ($180/mês MRR)
- [ ] 200+ consumers
- [ ] 500+ fotos
- [ ] 50+ conversas (creators ↔ AI agents)

**Mês 2:**
- [ ] Adicionar features v2 (mais AI agents, Featured Placement, etc.)
- [ ] Escalar marketing

---

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Sightengine rejeitar fotos válidas | Média | Médio | Permitir review manual, ajustar threshold |
| AI agents gerarem mensagens inapropriadas | Baixa | Alto | Testar prompts extensivamente, adicionar filtros |
| Creators não pagarem $9/mês | Alta | Alto | Oferecer trial 7 dias (adicionar depois), melhorar onboarding |
| Stripe webhook falhar | Baixa | Alto | Logging robusto, retry mechanism |
| Supabase RLS vazamento de dados | Baixa | Crítico | Testar policies extensivamente, code review |

---

## 📞 Suporte Pós-Lançamento

**Primeiras 2 semanas:**
- Monitorar Supabase logs diariamente
- Checar Stripe dashboard (pagamentos)
- Revisar uploads pendentes (moderation_status = 'pending')
- Responder creators (email de suporte ou chat admin)

**Ferramentas:**
- Supabase Dashboard (database + storage)
- Stripe Dashboard (pagamentos + webhooks)
- Vercel Dashboard (deployment + logs)
- Sightengine Dashboard (moderação)
- Anthropic Console (API usage)

---

## 🔄 Roadmap v2 (Pós-MVP)

**Features prioritárias após lançamento:**
1. **15 AI Agents** (expandir de 3 para 15 personas)
2. **Featured Placement** (monetização adicional $19-59)
3. **Onfido Age Verification** (compliance mais robusto)
4. **Vídeos** (upload + player + thumbnails)
5. **Swipe Discovery** (Tinder-style UX)
6. **Admin Dashboard** (moderation queue, analytics)
7. **Message TTL 24h** (auto-delete mensagens antigas)
8. **User Reporting** (flagging conteúdo inapropriado)
9. **Trial 7 dias** (testar conversão)
10. **Performance** (infinite scroll, Redis caching, CDN)

---

## ✅ Checklist de Lançamento

**Pré-Lançamento:**
- [ ] Todos os acceptance criteria do MVP completos
- [ ] Smoke test em produção passou
- [ ] Privacy/Terms publicados
- [ ] Landing page finalizada
- [ ] 3 AI agents testados e funcionando
- [ ] Stripe configurado (prod keys, webhook ativo)
- [ ] Moderação automática funcionando
- [ ] PWA instalável (iOS + Android testados)

**Dia do Lançamento:**
- [ ] Anúncio preparado (email, social media)
- [ ] Primeiros creators convidados (beta users)
- [ ] Monitoring ativo (Supabase, Vercel, Stripe)
- [ ] Email de suporte configurado
- [ ] On-call: primeiras 48h monitorar ativamente

**Pós-Lançamento (Semana 1):**
- [ ] Daily check: uploads, moderação, pagamentos
- [ ] Coletar feedback de creators
- [ ] Iterar UX baseado em uso real
- [ ] Planejar features v2

---

**🚀 META: Marketplace funcional com chat + AI agents no ar em 3-4 semanas!**

---

*Última atualização: 03 Mai 2026*
