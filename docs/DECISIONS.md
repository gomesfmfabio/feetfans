# FeetFans - Decisões Críticas de Produto

**Data:** 2026-04-30
**Responsável:** Fábio (Founder) + PM (Morgan)
**Status:** ✅ Aprovado para desenvolvimento

---

## 🎯 Contexto

Este documento registra **decisões críticas de produto** tomadas após análise do documento complementar do concorrente (FeetFinder) e benchmarking de mercado. Estas decisões complementam o PRD original e devem ser incorporadas incrementalmente durante o desenvolvimento dos Epics 2-6.

**Epic 1 (Foundation)** será executado conforme planejado originalmente. Ajustes serão aplicados a partir do Epic 2.

---

## ✅ 5 Decisões Críticas Finalizadas

### 1️⃣ Quando o Trial de 7 Dias Começa?

**Decisão:** **No Cadastro (signup)**

**Implicação:**
- `trial_started_at = signup_timestamp`
- `trial_ends_at = signup_timestamp + 7 dias`
- Clock inicia IMEDIATAMENTE após criar conta
- Creator pode "perder" dias se não postar nada, mas cria URGÊNCIA máxima

**Implementação:**
- Epic 4, Story 4.1 (Trial Period Tracking)
- Backend: Set `trial_started_at` no hook pós-signup

---

### 2️⃣ Ciclo de IA (10 Dias) vs Trial (7 Dias) - O Que Acontece?

**Decisão:** **IA continua até dia 10 (mesmo com trial expirado)**

**Implicação:**
- Agentes de IA conversam por 10 dias COMPLETOS
- Se trial expira no dia 7, IA continua do dia 8 ao 10
- Creator VÊ mensagens chegando mas não pode responder (bloqueio total)
- Demonstra valor contínuo e cria motivação para upgrade

**Implementação:**
- Epic 3, Story 3.5 (AI Agent Engagement Trigger)
- AI Scheduler: `agent_cycle_duration = 10 days` (independente de `trial_status`)

---

### 3️⃣ Creator Pode Conversar com IA Após Trial Expirar?

**Decisão:** **NÃO - Bloqueio total de chat**

**Implicação:**
- Após trial expirar (`trial_ends_at < NOW()`), chat BLOQUEADO (IA + consumers reais)
- Simplicidade técnica: `if trial_expired → block_all_chat`
- Urgência máxima para conversão (não pode nem responder simulações)
- UX: Banner "Seu trial expirou. Atualize para continuar conversando."

**Implementação:**
- Epic 4, Story 4.2 (Feature Gating)
- Chat middleware: Check `subscription_status !== 'expired'` antes de permitir envio

---

### 4️⃣ Mensagens Expiradas - Retenção no Backend?

**Decisão:** **7 dias após expiração visual**

**Implicação:**
- Mensagens somem da UI em 24h (`visible_until = created_at + 24h`)
- Logs retidos no backend por 7 dias adicionais (`hard_delete_at = visible_until + 7d`)
- Total: 8 dias de retenção (1 dia visual + 7 dias auditoria)
- Cobre denúncias imediatas, minimiza storage

**Implementação:**
- Epic 3, Story 3.1 (Real-Time Chat Infrastructure)
- Cron job: Soft delete após 24h, hard delete após 24h + 7d
- Auditoria: Admin pode acessar logs de mensagens "expiradas" para denúncias

---

### 5️⃣ Transparência sobre Agentes de IA - Como Indicar?

**Decisão:** **Disclaimer nos Termos de Uso (sem badge visual)**

**Implicação:**
- Termos de Uso incluem seção: "Conversas Automatizadas de Treinamento"
- Texto: "Durante os primeiros 10 dias, você receberá conversas automatizadas para treinamento e ativação."
- SEM badge "Bot" no chat (mantém ilusão, maximiza engajamento)
- Compliance: Informação está documentada (AI Act, GDPR)
- Risco: Pode ser considerado insuficiente em mercados rigorosos (Europa)

**Implementação:**
- Epic 1, Nova Story 1.7 (Termos de Uso)
- Adicionar seção específica sobre IA nos Termos
- Checkbox "Aceito os Termos" no signup

**Nota Legal:** Se operar na Europa, revisar para adicionar transparência upfront (onboarding) além dos Termos.

---

## 🚨 Principais Gaps Identificados (vs PRD Original)

### ❌ Não Estava no PRD Original

| Gap | Impacto | Epic de Implementação |
|-----|---------|----------------------|
| **Navegação anônima com age checkbox** | 🔴 ALTO | Epic 1 (Nova Story 1.0) |
| **Verificação de identidade APENAS para transação** | 🔴 ALTO | Epic 1 (Mover Story 1.5 para Epic 2/3) |
| **Acesso alunas: 12 meses (não vitalício)** | 🟡 MÉDIO | Epic 4 (Story 4.4 ajustar) |
| **Links externos SEMPRE permitidos no MVP** | 🟡 MÉDIO | Epic 3 (Remover bloqueio de links) |
| **Integração Hotmart para validar alunas** | 🟡 MÉDIO | Epic 4 (Nova Story 4.7) |
| **Categorias múltiplas por creator** | 🟡 MÉDIO | Epic 2 (Story 2.1 expandir) |
| **Compactação de imagens + remoção EXIF** | 🟡 MÉDIO | Epic 2 (Story 2.1 adicionar) |
| **Geo-blocking por país/região** | 🟢 BAIXO | Epic 6 (Nova Story 6.8) |
| **Agentes informam limitação do plano** | 🟢 BAIXO | Epic 3 (Story 3.7 ajustar copywriting) |
| **Copy agressiva "renda extra fácil"** | 🟢 BAIXO | Landing page (Marketing) |

### 🔧 Ajustes Necessários por Epic

#### Epic 1: Foundation & Core Infrastructure
- ➕ **Nova Story 1.0:** Age Checkbox para Visitantes Anônimos
- 🔧 **Story 1.4 (Auth):** Adicionar age checkbox flow
- 🔄 **Story 1.5 (Age Verification):** MOVER para Epic 2 ou 3
- ➕ **Nova Story 1.7:** Termos de Uso (incluindo disclaimer IA)

#### Epic 2: Content Management & Feed
- 🔧 **Story 2.1 (Upload):** Adicionar categorias múltiplas, compactação, remoção EXIF

#### Epic 3: Real-Time Messaging & AI Agents
- 🔧 **Story 3.1 (Chat):** TTL visual 24h, retenção backend 7d
- 🔧 **Story 3.5 (AI Engagement):** Ciclo de 10 dias (não 7)
- 🔧 **Story 3.7 (AI Responses):** Copywriting sobre limitação de plano
- ➕ **Nova Story 3.9:** Bloqueio de chat pós-trial (IA + real)

#### Epic 4: Trial & Subscription Management
- 🔧 **Story 4.1 (Trial Tracking):** Trial inicia no signup (não profile creation)
- 🔧 **Story 4.2 (Feature Gating):** Bloquear chat após trial (não só consumers reais)
- 🔧 **Story 4.4 (FeetFans Integration):** Acesso 12 meses (não vitalício)
- ➕ **Nova Story 4.7:** Integração Hotmart (webhook + email matching)

#### Epic 5: Featured Placement & Monetization
- Sem ajustes (mantém como planejado)

#### Epic 6: Safety, Compliance & Launch Readiness
- ➕ **Nova Story 6.8:** Geo-blocking por País/Região

---

## 📊 Modelo de Negócio Refinado

### Acesso de Creators

| Tipo de Creator | Acesso | Duração | Custo |
|----------------|--------|---------|-------|
| **Externa (trial)** | Trial gratuito | 7 dias | $0 |
| **Externa (paga)** | Assinatura | Mensal | $9/mês |
| **Aluna FeetFans** | Acesso incluído | **12 meses** | $0 (já pagou curso) |
| **Admin grant** | Acesso vitalício | Ilimitado | $0 (override manual) |

**Notas:**
- Trial inicia NO CADASTRO (não após criar perfil)
- Após 7 dias, bloqueia TUDO (chat IA + consumers reais)
- Alunas FeetFans: 12 meses (não vitalício como estava no PRD)

### Ciclo de Agentes de IA

| Dia | Trial Status | AI Status | Creator Pode Responder? |
|-----|-------------|-----------|-------------------------|
| 1-7 | Ativo | Conversando | ✅ SIM |
| 8-10 | **Expirado** | **Conversando** | ❌ NÃO (bloqueio total) |
| 11+ | Expirado | Parado | ❌ NÃO |

**Estratégia:** Criar frustração positiva (mensagens chegando mas não pode responder) para motivar upgrade.

### Transparência de IA

**Método Escolhido:** Disclaimer nos Termos de Uso (sem badge visual)

**Texto sugerido para Termos:**
> **8. Conversas Automatizadas de Treinamento**
>
> Para ajudar novas creators a se familiarizarem com negociações e montarem seus perfis, o FeetFans pode enviar conversas automatizadas durante os primeiros 10 dias após o cadastro. Estas conversas são geradas por inteligência artificial com objetivo educacional e de ativação.
>
> Após este período, todas as conversas serão com compradores reais interessados em seu conteúdo.

---

## 🔐 Segurança e Compliance Adicionados

### Proteção de Uploads
- ✅ Compactação automática de imagens (reduz storage)
- ✅ Remoção de metadados EXIF (privacidade)
- ✅ Validação de formatos (jpg, jpeg, png, webp)
- ✅ Limite de tamanho por arquivo
- ✅ Renomeação no backend

### Retenção de Dados (LGPD)
- Mensagens: 24h visual + 7d backend = 8 dias total
- Logs de auditoria: Prazo a definir (30-90 dias)
- ID documents: Prazo a definir (mínimo legal)

### Geo-Blocking (Futuro)
- Bloquear países com age verification rigorosa (UK, Alemanha)
- Ou implementar age verification mais forte para esses mercados
- Implementar em Epic 6 (Launch Readiness)

---

## 🎯 Impacto no Timeline

| Epic | Timeline Original | Ajustes | Timeline Ajustado |
|------|------------------|---------|-------------------|
| Epic 1 | 1-2 semanas | +Story 1.0, +Story 1.7, -Story 1.5 | 1-2 semanas (sem mudança) |
| Epic 2 | 1 semana | +Categorias, +Compactação | 1-1.5 semanas |
| Epic 3 | 2 semanas | +Story 3.9 (bloqueio pós-trial) | 2-2.5 semanas |
| Epic 4 | 1 semana | +Story 4.7 (Hotmart) | 1.5 semanas |
| Epic 5 | 1 semana | Sem ajustes | 1 semana |
| Epic 6 | 1 semana | +Story 6.8 (geo-blocking) | 1-1.5 semanas |
| **Total** | **7-8 semanas** | — | **8-10 semanas** |

**Impacto:** +1-2 semanas devido a stories adicionais (Hotmart, geo-blocking, categorias múltiplas).

---

## 📝 Próximas Ações

1. ✅ **Executar Epic 1 como planejado** (6 stories originais)
2. 🔄 **Incorporar ajustes nos Epics 2-6** (stories novas + modificações)
3. 📋 **Revisar PRD e Arquitetura** após Epic 1 (opcional, pode ser incremental)

---

## 🔗 Referências

- **PRD Original:** `/docs/prd.md`
- **Arquitetura:** `/docs/architecture.md`
- **Epic 1 Execution Plan:** `/docs/epics/EPIC-1-EXECUTION.yaml`
- **Documento Complementar:** (benchmark FeetFinder + visão fundador)

---

**Última atualização:** 2026-04-30
**Aprovado por:** Fábio (Founder)
**Documentado por:** Morgan (PM)
