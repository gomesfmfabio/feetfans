# Deploy Guide - FeetFans PWA

## Pre-requisitos

- Node.js 18+
- pnpm instalado
- Conta Vercel
- Conta Supabase
- Anthropic API key

## 1. Supabase Production Setup

```bash
# 1. Criar projeto production no Supabase dashboard
# 2. Anotar credenciais:
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# 3. Conectar local ao prod
supabase link --project-ref <seu-project-ref>

# 4. Rodar migrations
supabase db push

# 5. Verificar tabelas criadas no dashboard
```

## 2. Vercel Deploy

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link projeto
vercel link

# 4. Configurar env vars (via dashboard ou CLI)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add CRON_SECRET
vercel env add NEXT_PUBLIC_APP_URL

# 5. Deploy
vercel --prod
```

## 3. Configuração Pós-Deploy

### Supabase Storage
```bash
# No Supabase dashboard:
# Storage > Create bucket: "content"
# Policies > Make bucket public for SELECT
```

### Cron Jobs
```bash
# Vercel Pro: Automático via vercel.json
# Vercel Hobby: Usar cron-job.org apontando para:
# - https://seu-app.vercel.app/api/cron/expire-trials
# - https://seu-app.vercel.app/api/cron/expire-featured
# - https://seu-app.vercel.app/api/ai-agents/cron/process-assignments
# Header: Authorization: Bearer <CRON_SECRET>
```

### Monitoring
```bash
# UptimeRobot (grátis)
# Monitor: https://seu-app.vercel.app/api/health
# Interval: 5 minutos
# Alert: Email on down
```

## 4. Testing Checklist

```bash
□ Signup flow completo
□ Age verification
□ Upload content
□ Feed carrega
□ Chat funciona
□ AI agent responde
□ Upgrade simula corretamente
□ Mobile responsive
□ PWA install prompt
```

## 5. Rollback

```bash
# Vercel mantém deploys anteriores
vercel rollback <deployment-url>
```

## Troubleshooting

**Build fail:**
- Check Node version (18+)
- Check pnpm-lock.yaml committed
- Check TypeScript errors: `pnpm typecheck`

**Database errors:**
- Verify migrations rodaram: Supabase dashboard > SQL Editor
- Check RLS policies ativas
- Verify service role key correta

**SSE not connecting:**
- Check CORS headers (vercel.json)
- Verify Supabase Realtime ativo

**Images not loading:**
- Check storage bucket público
- Verify CORS config no bucket
