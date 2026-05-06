# FeetFans Architecture - Quick Reference

**Version:** 1.0  
**Date:** 2026-04-30  
**Full Document:** [architecture.md](./architecture.md)

---

## 🎯 Core Principles

1. **Simplicity First** - Choose the simplest solution that works
2. **Cost Efficiency** - Target <$0.50/user/month infrastructure cost
3. **Developer Velocity** - Optimize for solo dev + AI agents
4. **Serverless-First** - Minimize infrastructure management

---

## 🏗️ Technology Stack (Definitive)

| Category | Technology | Version | Why |
|----------|-----------|---------|-----|
| **Platform** | Vercel + Supabase | Latest | Zero-config, $25/mo base, all-in-one |
| **Monorepo** | Turborepo | 1.13+ | Simpler than Nx |
| **Frontend** | Next.js App Router | 14.2+ | SSR/ISR, PWA, Vercel-optimized |
| **Backend** | Next.js API Routes | 14.2+ | Unified deployment |
| **Database** | PostgreSQL (Supabase) | 15+ | RLS, Auth, Storage included |
| **ORM** | Supabase JS Client | v2 | Simpler than Prisma |
| **Real-time** | SSE (Server-Sent Events) | Native | Simpler than WebSocket |
| **Job Queue** | node-cron + Vercel Cron | 3.0+ | No external dependencies |
| **AI** | Claude Haiku | 3.5 | $0.25/1M tokens |
| **Age Verify** | Onfido | v3 | $0.99/check (cheapest) |
| **Moderation** | Sightengine | v1.0 | $0.80/1000 (cheapest + simplest) |
| **Payments** | Stripe | Latest | Industry standard |

---

## 💰 Cost Breakdown (1000 MAU)

| Service | Monthly Cost |
|---------|-------------|
| Vercel | Free |
| Supabase Pro | $25 |
| Onfido (100 verifications) | $99 |
| Claude Haiku (250M tokens) | $62.50 |
| Sightengine (5000 images) | $4.00 |
| Stripe fees | $71.55 |
| Sentry | $26 |
| **Total** | **$288.05** |
| **Per paying creator** | **$0.576** |

**Revenue:** $4,850/month  
**Profit Margin:** 94%

---

## 🔐 Security Stack

- **Transport:** TLS 1.3 (automatic)
- **Auth:** Supabase Auth (JWT)
- **Authorization:** Row Level Security (RLS)
- **Rate Limiting:** Vercel Edge (IP-based)
- **Content Moderation:** Sightengine API
- **Age Verification:** Onfido (18+ enforcement)

---

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| Page Load (4G) | <2s |
| Chat Latency (p95) | <500ms |
| API Response (p95) | <500ms |
| Concurrent Users | 100s |
| Monthly Active Users | 1000s |

---

## 🚀 Deployment

**Frontend:** Vercel (automatic on git push to main)  
**Backend:** Vercel Serverless Functions  
**Database:** Supabase US-East  
**CDN:** Vercel Edge Network (global)

**Environments:**
- Development: localhost:3000
- Preview: *.vercel.app (PR deploys)
- Staging: staging.feetfans.com
- Production: feetfans.com

---

## 📦 Project Structure

```
feetfans/
├── apps/
│   └── web/                # Next.js 14+ PWA
│       ├── src/
│       │   ├── app/        # App Router (routes + API)
│       │   ├── components/ # React components
│       │   ├── hooks/      # Custom hooks (useAuth, useSSE)
│       │   ├── lib/        # Supabase client, utilities
│       │   └── stores/     # Zustand state
│       └── public/         # Static assets, PWA manifest
├── packages/
│   ├── shared/             # TypeScript types, Zod schemas
│   ├── database/           # Supabase client, migrations
│   └── ai-agents/          # AI agent logic
└── docs/
    ├── prd.md
    ├── architecture.md     # This document
    └── architecture-summary.md
```

---

## 🤖 AI Agent System

- **15 AI agents** with unique personalities
- **Randomized scheduling** over 7-day trial (3 day 1, 2 day 2, etc.)
- **Cost control:** <500 tokens/message, rate limiting
- **Trigger:** node-cron every 10 minutes
- **Engine:** Claude Haiku API
- **Estimated cost:** ~$0.0048 per creator (~$4.80/month for 1000 creators)

---

## 🗄️ Core Data Models

1. **users** - Creators & consumers, role, subscription status, trial tracking
2. **content** - Uploaded photos/videos, categories, moderation status
3. **conversations** - Chat threads between creators/consumers/AI
4. **messages** - Individual messages (24h TTL)
5. **ai_agents** - 15 agent personas with personalities
6. **agent_assignments** - Scheduled AI engagement with creators
7. **featured_placements** - Paid visibility upgrades
8. **subscriptions** - $9/month creator subscriptions
9. **content_reports** - User-reported violations
10. **analytics_events** - Optional event tracking

---

## 📱 Key Features

### MVP (8 weeks)
- ✅ PWA (installable, offline fallback)
- ✅ Age verification (Onfido 18+)
- ✅ Content upload (photos/videos + categories)
- ✅ Feed & Discovery (infinite scroll, swipe)
- ✅ Real-time messaging (SSE)
- ✅ 15 AI roleplay agents (trial engagement)
- ✅ 7-day trial → $9/month subscription
- ✅ Featured Placement ($19-$59)
- ✅ Content moderation (Sightengine)

### Phase 2 (Future)
- 🔄 In-app payments (Stripe Connect)
- 🔄 Creator payouts
- 🔄 Brazilian payment methods (Pix, Boleto)
- 🔄 Advanced analytics

---

## 🔑 Critical Coding Standards

1. **Types:** Always define in `packages/shared/src/types`, import everywhere
2. **API Calls:** Use API client wrapper (`lib/api-client.ts`), never raw `fetch()`
3. **Env Vars:** Access via config objects, never `process.env` directly
4. **Validation:** Use Zod schemas (shared package) on frontend AND backend
5. **Database:** Always use Supabase client with RLS, never bypass policies
6. **File Uploads:** Validate client + server, use Supabase Storage with RLS

---

## 📈 Scaling Strategy

**1,000 → 10,000 MAU:**
- Supabase Pro → Team tier ($100/mo)
- Vercel Free → Pro tier ($20/mo)
- All other services scale pay-per-use
- **Total cost: $2,301/month ($0.52/paying creator)**
- **Revenue: $36,500/month (93.6% margin)**

**Database optimization:**
- Indexes already configured (see architecture.md)
- Partitioning if messages table >10M rows
- Connection pooling (Supabase built-in)

---

## 🚨 Migration Path (External → In-App Payments)

**Current (MVP):** Creators share external payment links (WhatsApp Pay, Pix, PayPal)

**Phase 2:** In-app Stripe payments + Stripe Connect payouts

**Backward compatibility:** External links remain supported forever (optional upgrade)

---

## 📞 Support & References

- **Full Architecture:** [architecture.md](./architecture.md)
- **PRD:** [prd.md](./prd.md)
- **Technology Decision Matrix:** See Appendix in architecture.md
- **Cost Calculator:** See Section 11 in architecture.md

---

**Last Updated:** 2026-04-30  
**Document Owner:** Claude (Architecture Task)
