# N8N - Credenciais de Acesso Rápido

**Sistema de Recuperação de Vendas - FeetStars**

## 🔑 Acesso N8N

```
URL: https://n8n.feetstars.online

Usuário: admin
Senha: E1g9m8d9un!
Email: admin@feetstars.com
```

## 📝 Workflow Principal

**Nome:** "Hotmart - Cartão Recusado" (ou similar)

**Node de mensagem:** "Send WhatsApp" ou "HTTP Request"

**Mensagem atual (atualizada 2026-04-10):**
```
Hello! I'm Lilian from FeetFans. I noticed you just tried to purchase but had some issues with your card. Please try again with a different credit card, or ask me for a new payment link 😃
```

## 🔧 Como Editar

1. Login em https://n8n.feetstars.online
2. Abrir workflow "Hotmart - Cartão Recusado"
3. Clicar no node "Send WhatsApp"
4. Editar campo "text" nos parâmetros do Body
5. Salvar

## 📊 Outros Sistemas

**WAHA (WhatsApp API):**
- URL: https://waha.feetstars.online
- API Key: E1g9m8d9ue!

**VPS Hostinger:**
- IP: 154.56.55.202
- SSH Key: ~/.ssh/id_ed25519
- User: root
- Senha: Pianoforte01?

**WhatsApp Conectado:**
- Número: +1 469 207 9358
- Nome: "Comercial"
- Status: WORKING ✅

## 🚀 Workflows Ativos

### 1. Recuperação de Cartão Cancelado
- **Webhook:** https://n8n.feetstars.online/webhook/hotmart-declined
- **Evento:** PURCHASE_DELAYED
- **Workflow:** "Hotmart - Cartão Recusado"
- **Status:** ✅ Ativo

### 2. Pós-Compra + FAQ (2h)
- **Webhook:** https://n8n.feetstars.online/webhook/hotmart-purchase-complete
- **Evento:** PURCHASE_COMPLETE
- **Workflow:** "Hotmart - Purchase Complete + FAQ (2h)"
- **Mensagens:** Boas-vindas (imediato) + FAQ (2h depois)
- **Status:** ✅ Ativo

## 📄 Documentação Completa

- Recuperação de vendas: `SISTEMA-RECUPERACAO-VENDAS-STATUS.md`
- Pós-compra: `SISTEMA-POS-COMPRA-STATUS.md`

---
*Última atualização: 2026-04-10 (adicionado sistema pós-compra)*
*Atualizado por: @aiox-master (Orion)*
