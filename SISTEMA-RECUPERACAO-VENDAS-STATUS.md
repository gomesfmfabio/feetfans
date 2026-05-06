# Sistema de Recuperação de Vendas - FeetStars
**Status: OPERACIONAL ✅**
**Última atualização: 2026-04-10** (mensagem atualizada para "Lilian")

---

## 🎯 Sistema Atual (Funcionando)

### Infraestrutura
- **VPS:** Hostinger - 154.56.55.202
- **SSH Key:** ~/.ssh/id_ed25519
- **N8N:** https://n8n.feetstars.online
  - User: admin
  - Pass: E1g9m8d9un!
  - Email: admin@feetstars.com
- **WAHA:** https://waha.feetstars.online
  - API Key: E1g9m8d9ue!
  - Dashboard: (autenticação HTTP - pendente configurar senha)

### WhatsApp Conectado
- **Número Comercial:** +1 469 207 9358
- **Push Name:** "Comercial"
- **Status:** WORKING ✅
- **Como obter QR code:** `https://waha.feetstars.online/api/screenshot?session=default`

### Webhook Hotmart
- **URL:** https://n8n.feetstars.online/webhook/hotmart-declined
- **Evento:** PURCHASE_DELAYED
- **Status:** Configurado e testado ✅

---

## 📋 Workflow Atual

### Fluxo Básico (Funcionando)
```
Hotmart PURCHASE_DELAYED
  ↓
Webhook N8N recebe
  ↓
Extract Data (JavaScript)
  ↓
Send WhatsApp (WAHA API)
  ↓
Cliente recebe mensagem
```

### Mensagem Atual Enviada
```
Hello! I'm Lilian from FeetFans. I noticed you just tried to purchase but had some issues with your card. Please try again with a different credit card, or ask me for a new payment link 😃
```

**Última atualização da mensagem:** 2026-04-10 (alterado de "Fabio" para "Lilian" + ajuste no texto)

### Node "Extract Data" - Código Atual
```javascript
const input = items[0].json;
const payload = input.body;

// Garantir que checkout_phone existe
const phone = payload.data.buyer.checkout_phone || '';

return [{
  json: {
    name: payload.data.buyer.name || 'Customer',
    email: payload.data.buyer.email || '',
    phone: phone.replace(/\D/g, '') + '@c.us',
    product: payload.data.product.name || 'Product',
    price: payload.data.purchase.price.value || 0,
    payment_link: payload.data.purchase.sckPaymentLink || ''
  }
}];
```

### Node "Send WhatsApp" - Configuração
- **Method:** POST
- **URL:** https://waha.feetstars.online/api/sendText
- **Authentication:** Header Auth (X-Api-Key: E1g9m8d9ue!)
- **Body Content Type:** Using Fields Below
- **Body Parameters:**
  - session: `default`
  - chatId: `{{ $json.phone }}`
  - text: `{{ "Hello! I'm Lilian from FeetFans. I noticed you just tried to purchase but had some issues with your card. Please try again with a different credit card, or ask me for a new payment link 😃" }}`

---

## 🔄 Estrutura de Payload do Hotmart

### Payload Real Recebido
```json
{
  "body": {
    "event": "PURCHASE_DELAYED",
    "data": {
      "buyer": {
        "name": "Nome Completo",
        "email": "email@example.com",
        "checkout_phone": "5541985008090",  // BR sem +
        "checkout_phone_code": "999999999"
      },
      "product": {
        "name": "Nome do Produto"
      },
      "purchase": {
        "price": {
          "value": 1500  // Número, não string
        },
        "sckPaymentLink": "linkDoHotmart",
        "status": "DELAYED"
      }
    }
  }
}
```

### Campos Importantes
- ✅ `buyer.checkout_phone` - Telefone do comprador
- ✅ `buyer.name` - Nome completo
- ✅ `buyer.email` - Email
- ✅ `product.name` - Nome do produto
- ✅ `purchase.price.value` - Valor (número)
- ✅ `purchase.sckPaymentLink` - Link de pagamento

---

## 🚀 Como Testar o Sistema

### Teste Manual via cURL
```bash
curl -X POST https://n8n.feetstars.online/webhook/hotmart-declined \
  -H "Content-Type: application/json" \
  -d '{
  "data": {
    "buyer": {
      "name": "Fabio Test",
      "email": "fabio@test.com",
      "checkout_phone": "5541985008090"
    },
    "product": {
      "name": "FeetStars Premium Course"
    },
    "purchase": {
      "price": {
        "value": 59
      },
      "sckPaymentLink": "https://pay.hotmart.com/test-12345"
    }
  },
  "event": "PURCHASE_DELAYED"
}'
```

### Verificar Status
1. **WAHA Status:** `curl -H "X-Api-Key: E1g9m8d9ue!" https://waha.feetstars.online/api/sessions/default`
2. **N8N Executions:** https://n8n.feetstars.online → Executions
3. **WhatsApp:** Verificar se mensagem chegou

---

## ⚠️ Problemas Conhecidos e Soluções

### 1. WhatsApp Desconectado (Status: STOPPED)
**Problema:** Sessão parou de funcionar
**Solução:**
```bash
# 1. Parar sessão
curl -X POST -H "X-Api-Key: E1g9m8d9ue!" https://waha.feetstars.online/api/sessions/default/stop

# 2. Iniciar sessão
curl -X POST -H "X-Api-Key: E1g9m8d9ue!" https://waha.feetstars.online/api/sessions/default/start

# 3. Aguardar 30s e obter QR code
curl -H "X-Api-Key: E1g9m8d9ue!" https://waha.feetstars.online/api/screenshot?session=default > qr-code.png

# 4. Abrir imagem e escanear com WhatsApp
open qr-code.png
```

### 2. Erro "Cannot read properties of undefined"
**Problema:** Estrutura do payload diferente
**Solução:** Verificar Output do node "Webhook Hotmart" nas Executions e ajustar código do "Extract Data"

### 3. Erro "chatId invalid" ou "Session status STOPPED"
**Problema:** WAHA desconectado ou formato de telefone errado
**Solução:** Reconectar WAHA (ver solução #1) e verificar formato: `5541985008090@c.us`

---

## 📝 Pendências para Implementar

### 1. Sistema de Delay + Verificação
**Problema:** Cliente pode tentar várias vezes e conseguir pagar. Não queremos enviar mensagem se já pagou.

**Opções:**
- **Opção A:** Delay fixo (2h/6h/24h?) + Consulta API Hotmart antes de enviar
- **Opção B:** Webhook duplo (PURCHASE_DELAYED + PURCHASE_APPROVED) com gerenciamento de estado

**Decisão:** Pendente - definir amanhã

### 2. Fluxo Conversacional Completo
**Atual:** Envia mensagem fixa pedindo para tentar novamente

**Desejado:**
1. **Mensagem inicial:** (IMPLEMENTADO ✅) Pede para tentar novamente
2. **Aguardar resposta:** Cliente responde no WhatsApp
3. **Webhook WAHA → N8N:** Detecta resposta do cliente
4. **Lógica condicional:**
   - Se cliente pedir novo link → Envia `purchase.sckPaymentLink`
   - Se cliente disser que não consegue → Envia dados bancários
5. **Dados bancários:** Banco/Conta/Zelle (pendente definir)

**Implementação pendente:**
- [ ] Webhook WAHA para receber respostas
- [ ] Node de decisão (IF/Switch) no N8N
- [ ] Armazenamento de estado (quem está em qual etapa)
- [ ] Mensagem com link de pagamento
- [ ] Mensagem com dados bancários

### 3. Tratamento de Números Internacionais
**Atual:** Remove dígitos não-numéricos e adiciona @c.us
**Pendente:** Verificar se números dos EUA (+1) precisam tratamento especial

### 4. Textos das Mensagens
**Pendente definir:**
- ✅ Mensagem inicial (IMPLEMENTADO)
- ❌ Mensagem com link de pagamento (texto em inglês)
- ❌ Mensagem com dados bancários (texto + dados reais)

---

## 🔐 Credenciais e Acessos

### VPS Hostinger
- **IP:** 154.56.55.202
- **User:** root
- **SSH Key:** ~/.ssh/id_ed25519
- **Senha root:** Pianoforte01?

### N8N
- **URL:** https://n8n.feetstars.online
- **User:** admin
- **Password:** E1g9m8d9un!
- **Email:** admin@feetstars.com
- **API Key:** n8n-api-E1g9m8d9un (não funcional)

### WAHA
- **URL:** https://waha.feetstars.online
- **API Key:** E1g9m8d9ue!
- **Session Name:** default
- **Dashboard:** Autenticação HTTP (senha não configurada)

### Hotmart
- **Webhook URL:** https://n8n.feetstars.online/webhook/hotmart-declined
- **Evento:** PURCHASE_DELAYED
- **Credenciais:** (usuário tem acesso)

### WhatsApp Business
- **Número:** +1 469 207 9358
- **Nome:** Comercial
- **Conectado via:** WAHA (sessão "default")

---

## 📂 Localização dos Arquivos

### No VPS (via SSH)
```bash
# Docker Compose
/root/recuperacao-vendas/docker-compose.yml

# Nginx configs
/etc/nginx/sites-available/n8n
/etc/nginx/sites-available/waha

# Logs Docker
docker logs n8n
docker logs waha
```

### No Local (Desktop)
```bash
# Workflow N8N (backup)
/Users/martinez/Desktop/hotmart-recovery-workflow.json
/tmp/hotmart-recovery-workflow.json

# Payloads de teste
/tmp/test-hotmart-payload.json
/tmp/waha-test.json

# QR codes WAHA
~/Desktop/qrcode-whatsapp.png
~/Desktop/waha-qr-novo.png
```

---

## 🐛 Troubleshooting Rápido

### Sistema não está enviando mensagens
```bash
# 1. Verificar status WAHA
curl -H "X-Api-Key: E1g9m8d9ue!" https://waha.feetstars.online/api/sessions/default

# Se status != "WORKING", reconectar (ver seção Problemas Conhecidos #1)

# 2. Verificar N8N Executions
# Abrir https://n8n.feetstars.online → Executions
# Procurar por erros vermelhos

# 3. Testar manualmente
curl -X POST https://n8n.feetstars.online/webhook/hotmart-declined \
  -H "Content-Type: application/json" \
  -d '{...payload de teste...}'
```

### Docker containers parados
```bash
# SSH no servidor
ssh -i ~/.ssh/id_ed25519 root@154.56.55.202

# Verificar status
cd /root/recuperacao-vendas
docker-compose ps

# Reiniciar se necessário
docker-compose restart

# Ver logs
docker-compose logs -f
```

---

## ✅ Checklist de Operação

### Diariamente
- [ ] Verificar status WAHA (deve estar WORKING)
- [ ] Verificar Executions do N8N (procurar erros)
- [ ] Testar envio manual se houve mudanças

### Semanalmente
- [ ] Backup do workflow N8N (Export JSON)
- [ ] Verificar logs do Docker para erros
- [ ] Atualizar esta documentação se houver mudanças

### Antes de Deploy de Mudanças
- [ ] Testar em ambiente de teste primeiro
- [ ] Verificar formato de payload do Hotmart
- [ ] Confirmar WAHA está conectado
- [ ] Fazer backup do workflow atual
- [ ] Testar com cURL após deploy

---

## 📞 Contatos e Suporte

### Suporte Técnico
- **WAHA Docs:** https://waha.devlike.pro/docs/
- **N8N Docs:** https://docs.n8n.io/
- **Hotmart API:** https://developers.hotmart.com/

### Status dos Serviços
- **Hostinger Status:** https://status.hostinger.com/
- **WAHA Health:** https://waha.feetstars.online/api/health (requer API key)
- **N8N Health:** https://n8n.feetstars.online/healthz

---

**Última validação:** Sistema testado e operacional em 2026-03-18 às 02:30 UTC
**Próximos passos:** Implementar delay + verificação de pagamento e fluxo conversacional completo
