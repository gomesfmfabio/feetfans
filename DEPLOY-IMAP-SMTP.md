# 🚀 DEPLOY RÁPIDO - IMAP/SMTP

## ✅ PRÉ-REQUISITOS (JÁ FEITO)

- [x] Credencial IMAP criada (`Gmail IMAP - feetfansoficial`)
- [x] Credencial SMTP criada (`Gmail SMTP - feetfansoficial`)
- [x] App Password configurada (16 caracteres)

---

## 📥 PASSO 1: IMPORTAR WORKFLOW

1. **No N8N, vá em:** Workflows → Add Workflow → **Import from File**

2. **Selecione o arquivo:** `n8n-workflow-IMAP-SMTP.json`

3. **Click em "Import"**

---

## 🔧 PASSO 2: CONFIGURAR CREDENCIAIS NOS NODES

O workflow tem **2 nodes** que precisam de credenciais:

### Node 1: **IMAP Email Trigger**

1. Click no node "IMAP Email Trigger"
2. No campo **"Credential to connect with"**, selecione: `Gmail IMAP - feetfansoficial`
3. Deixe os outros campos como estão:
   - Mailbox: `INBOX`
   - Poll Times: Cada 5 minutos

### Node 2: **Send Reply**

1. Click no node "Send Reply"
2. No campo **"Credential to connect with"**, selecione: `Gmail SMTP - feetfansoficial`
3. Deixe os outros campos como estão

---

## ✅ PASSO 3: SALVAR E ATIVAR

1. Click em **"Save"** (canto superior direito)

2. Click em **"Active"** para ativar o workflow

3. O workflow agora vai:
   - ✅ Verificar emails novos a cada 5 minutos
   - ✅ Detectar idioma automaticamente (PT/EN/ES)
   - ✅ Buscar no FAQ com Gemini
   - ✅ Adaptar resposta se necessário
   - ✅ Responder automaticamente

---

## 🧪 PASSO 4: TESTAR

Envie um email de teste para: **feetfansoficial@gmail.com**

**Exemplos de teste:**

```
Assunto: Não consigo acessar
Corpo: Comprei o curso mas não estou conseguindo acessar
```

**Aguarde 5 minutos** (tempo do poll) e verifique se recebeu a resposta automática.

---

## 📊 ESTRUTURA DO WORKFLOW

```
IMAP Email Trigger (a cada 5 min)
    ↓
Detect Language (PT/EN/ES)
    ↓
Load FAQ (20 FAQs multilíngues)
    ↓
Search FAQ (Gemini semantic search)
    ↓
Adapt Response (se 50-79% confidence)
    ↓
Send Reply (via SMTP)
```

---

## ⚠️ TROUBLESHOOTING

### Se o workflow não ativar:
- Verifique se as credenciais IMAP e SMTP estão selecionadas corretamente
- Teste as credenciais: Settings → Credentials → Test

### Se não receber emails:
- Verifique se há emails na caixa de entrada
- O workflow só pega emails **novos** (não lê emails antigos)
- Espere 5 minutos entre cada verificação

### Se não enviar respostas:
- Verifique a credencial SMTP
- Verifique se a senha de app está correta
- Teste enviando manualmente pelo N8N

---

## 📋 PRÓXIMOS PASSOS (OPCIONAL)

Depois de testar e confirmar que está funcionando, podemos adicionar:

- [ ] Node de notificação (quando confidence < 50%)
- [ ] Node de auto-learning (detecta respostas manuais)
- [ ] Node de save FAQ atualizado
- [ ] Integração com Google Drive

---

**Pronto! Sistema rodando 24/7 automaticamente.**
