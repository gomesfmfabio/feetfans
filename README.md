# FeetFans Marketplace PWA

Marketplace PWA para creators monetizarem conteúdo de foot photography de forma anônima.

## Status do Projeto

**Versão:** 1.0.0-beta  
**Última atualização:** 2026-05-05

### Epics Implementados

- ✅ **Epic 1:** Authentication & Setup (6 stories)
- ✅ **Epic 2:** Content Management & Feed (6 stories)
- ✅ **Epic 3:** Real-Time Messaging & AI Agents (8 stories)
- ✅ **Epic 4:** Trial & Subscription Management (4 stories core)
- ✅ **Epic 5:** Featured Placement (core)
- ✅ **Epic 6:** Moderation & Production (MVP)

**Total:** 30+ stories implementadas

## Tech Stack

- **Frontend:** Next.js 15, React, Tailwind CSS, PWA
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL (Supabase)
- **Real-time:** Server-Sent Events (SSE)
- **AI:** Claude Haiku (Anthropic)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Deployment:** Vercel (ready)

## Funcionalidades Principais

### Autenticação & Usuários
- Signup/Login com email
- Age verification (18+)
- Roles: creator, consumer
- Trial: 7 dias grátis para creators
- Subscription: $9/mês ou curso FeetFans (grátis)

### Content & Feed
- Upload de fotos/vídeos
- Categorias (heels, barefoot, yoga, beach, etc.)
- Feed público
- Swipe discovery (Tinder-style)
- Creator profiles
- Favorites

### Messaging & AI
- Real-time chat via SSE
- Mensagens efêmeras (24h Snapchat-style)
- 15 AI agents com personalidades únicas
- Auto-assignment randomizado (0-10 dias)
- Respostas automáticas com Claude Haiku
- Trial users: apenas AI agents
- Paid users: mensagens com buyers reais

### Subscription & Monetization
- Trial tracking (7 dias)
- Feature gating (trial vs paid)
- Upgrade flow ($9/mês)
- Course integration (free_feetfans)
- Featured placement ($19-$59)

### Moderation & Compliance
- Content reporting
- Moderation queue
- Audit log
- Health monitoring

## Setup

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Preencher variáveis no .env.local

# Run migrations
supabase db push

# Start dev server
pnpm dev
```

## Environment Variables

Veja `.env.example` para lista completa.

Essenciais:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `CRON_SECRET`

## Cron Jobs

Configure em Vercel/Railway:

- `/api/cron/expire-trials` - Diário (00:00)
- `/api/cron/expire-featured` - Diário (00:00)
- `/api/ai-agents/cron/process-assignments` - Hourly

## Roadmap

### Próximos Passos
- [ ] Integração completa Stripe (webhooks, portal)
- [ ] Admin dashboard (moderation UI)
- [ ] AI content moderation
- [ ] Performance optimization (caching, CDN)
- [ ] Analytics dashboard
- [ ] Mobile apps (React Native)

### Future Enhancements
- Video streaming
- Live chat
- Subscription bundles
- Referral program
- Creator analytics
- Advanced search

## Arquitetura

```
apps/
  web/              # Next.js PWA
    app/
      api/          # API routes
      (auth)/       # Auth pages
      feed/         # Feed & discovery
      messages/     # Chat
      checkout/     # Subscription
    components/     # React components
    lib/            # Utils & middleware

supabase/
  migrations/       # Database migrations

lib/
  ai-agents/        # AI message generation
  middleware/       # Feature gating
  utils/            # Helpers
```

## Database Schema

### Core Tables
- `users` - User accounts (creators, consumers, AI agents)
- `content` - Photos/videos
- `conversations` - Chat conversations
- `messages` - Chat messages (24h TTL)
- `ai_agents` - AI bot personas
- `agent_assignments` - AI scheduling
- `featured_placements` - Paid promotions
- `favorites` - User favorites
- `content_reports` - Moderation
- `moderation_queue` - Review queue
- `audit_log` - Compliance tracking

## Deployment

```bash
# Build for production
pnpm build

# Deploy to Vercel
vercel --prod
```

## License

Proprietary - FeetFans © 2026

## Support

Para suporte: [seu-email]
