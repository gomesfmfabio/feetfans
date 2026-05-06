# PROJETO: Recuperação Automática - Cartão Recusado (Hotmart → WhatsApp + IA)

## CONTEXTO

**Objetivo:** Sistema automatizado que detecta cartão recusado na Hotmart e inicia conversa de recuperação via WhatsApp usando IA.

**Produto:** Vendido nos EUA
**Idioma:** Inglês
**Público:** Números de telefone dos EUA (+1...)

**Fases:**
- **Fase 1 (AGORA):** Cartão recusado → WhatsApp com novo link → Se não conseguir, enviar dados bancários
- **Fase 2 (DEPOIS):** Carrinho abandonado → IA escolhe argumentos de venda por contexto

---

## INFRAESTRUTURA EXISTENTE

✅ **VPS Hostinger** (já ativa)
→ Credenciais: [Fábio vai fornecer]

---

## TAREFAS — ORDEM DE EXECUÇÃO

### **BLOCO 1 — PARALELO (pode fazer ao mesmo tempo)**

#### **Task 1.1 — Setup Docker na VPS**
```bash
# Conectar na VPS via SSH
ssh user@vps-ip

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

#### **Task 1.2 — Obter credenciais Hotmart**
→ [Fábio fornece]:
- URL do webhook Hotmart
- Secret/Token (se tiver)
- Acesso ao painel Hotmart para configurar webhook

---

### **BLOCO 2 — SEQUENCIAL (depois do Bloco 1)**

#### **Task 2.1 — Subir N8N + Evolution API (Docker Compose)**

Criar arquivo `docker-compose.yml` na VPS:

```yaml
version: '3.8'

services:
  # N8N - Automação
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=SenhaSegura123  # ← Trocar
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://SEU-DOMINIO.com  # ← Configurar domínio
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - automation

  # Evolution API - WhatsApp
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-api
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=https://SEU-DOMINIO.com  # ← Configurar domínio
      - AUTHENTICATION_API_KEY=SuaChaveAPISegura123  # ← Trocar
    volumes:
      - evolution_data:/evolution/instances
    networks:
      - automation

volumes:
  n8n_data:
  evolution_data:

networks:
  automation:
    driver: bridge
```

**Subir containers:**
```bash
docker-compose up -d

# Verificar se estão rodando
docker ps
```

**Acessos:**
- N8N: `http://VPS-IP:5678` (depois configurar domínio + SSL)
- Evolution API: `http://VPS-IP:8080`

---

#### **Task 2.2 — Configurar domínio + SSL (Nginx + Certbot)**

**Se não tiver domínio configurado:**

```bash
# Instalar Nginx
sudo apt install nginx -y

# Instalar Certbot (SSL grátis)
sudo apt install certbot python3-certbot-nginx -y

# Configurar Nginx para N8N
sudo nano /etc/nginx/sites-available/n8n

# Colar config:
server {
    listen 80;
    server_name n8n.SEU-DOMINIO.com;  # ← Trocar

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Ativar config
sudo ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Gerar SSL
sudo certbot --nginx -d n8n.SEU-DOMINIO.com

# Repetir para Evolution API (evolution.SEU-DOMINIO.com)
```

---

#### **Task 2.3 — Conectar WhatsApp na Evolution API**

```bash
# Gerar QR Code
curl -X POST https://evolution.SEU-DOMINIO.com/instance/create \
  -H "apikey: SuaChaveAPISegura123" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "recuperacao-vendas",
    "qrcode": true
  }'

# Escanear QR Code com WhatsApp Business
# Verificar conexão
curl -X GET https://evolution.SEU-DOMINIO.com/instance/connectionState/recuperacao-vendas \
  -H "apikey: SuaChaveAPISegura123"
```

---

### **BLOCO 3 — CRIAR WORKFLOW N8N (lógica de negócio)**

#### **Task 3.1 — Configurar Webhook Hotmart no N8N**

1. Acessar N8N: `https://n8n.SEU-DOMINIO.com`
2. Criar novo workflow: "Hotmart - Cartão Recusado"
3. Adicionar node **"Webhook"**:
   - HTTP Method: `POST`
   - Path: `hotmart-declined`
   - Response Mode: `On Received`

4. **URL do webhook gerada:** `https://n8n.SEU-DOMINIO.com/webhook/hotmart-declined`

5. Configurar no painel Hotmart:
   - Event: `PURCHASE_DELAYED` ou `PURCHASE_REFUSED`
   - Webhook URL: colar URL do N8N
   - Salvar

6. **Testar webhook:** Hotmart tem ferramenta de teste no painel → disparar evento fake → verificar se chegou no N8N

---

#### **Task 3.2 — Extrair dados do webhook**

**Adicionar node "Code" (JavaScript):**

```javascript
// Extrair dados do payload Hotmart
const payload = items[0].json;

// Dados do comprador
const buyerName = payload.data.buyer.name;
const buyerEmail = payload.data.buyer.email;
let buyerPhone = payload.data.buyer.phone;

// Dados do produto
const productName = payload.data.product.name;
const productPrice = payload.data.purchase.price;
const paymentLink = payload.data.purchase.payment.checkout_url || payload.data.purchase.payment_link;

// ===== TRATAR TELEFONE (FORMATO DOS EUA) =====
// Remove tudo que não é número
buyerPhone = buyerPhone.replace(/\D/g, '');

// Se não começa com 1 (código dos EUA), adiciona
if (!buyerPhone.startsWith('1')) {
  buyerPhone = '1' + buyerPhone;
}

// Formato final: +15551234567
buyerPhone = '+' + buyerPhone;

// Retornar dados tratados
return [{
  json: {
    name: buyerName,
    email: buyerEmail,
    phone: buyerPhone,
    product: productName,
    price: productPrice,
    payment_link: paymentLink
  }
}];
```

---

#### **Task 3.3 — Enviar mensagem inicial (WhatsApp)**

**Adicionar node "HTTP Request":**

- **Method:** `POST`
- **URL:** `https://evolution.SEU-DOMINIO.com/message/sendText/recuperacao-vendas`
- **Authentication:** Header Auth
  - Name: `apikey`
  - Value: `SuaChaveAPISegura123`
- **Body (JSON):**

```json
{
  "number": "{{ $json.phone }}",
  "text": "Hi {{ $json.name }}! 👋\n\nWe noticed there was an issue processing your payment for {{ $json.product }}.\n\nNo worries! Here's a new payment link:\n{{ $json.payment_link }}\n\nLet me know if you need any help!"
}
```

---

#### **Task 3.4 — Detectar resposta do cliente (webhook Evolution)**

**Configurar webhook na Evolution API:**

```bash
curl -X POST https://evolution.SEU-DOMINIO.com/webhook/set/recuperacao-vendas \
  -H "apikey: SuaChaveAPISegura123" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://n8n.SEU-DOMINIO.com/webhook/whatsapp-reply",
    "webhook_by_events": true,
    "events": ["messages.upsert"]
  }'
```

**No N8N, criar segundo workflow: "WhatsApp - Resposta Cliente"**

1. Node **Webhook**:
   - Path: `whatsapp-reply`

2. Node **Code** (detectar mensagem do cliente):

```javascript
const message = items[0].json;

// Verificar se é mensagem recebida (não enviada por nós)
if (message.data.key.fromMe === true) {
  return []; // Ignora mensagens que enviamos
}

// Extrair texto da mensagem
const messageText = message.data.message?.conversation ||
                    message.data.message?.extendedTextMessage?.text ||
                    '';

const phoneNumber = message.data.key.remoteJid.replace('@s.whatsapp.net', '');

return [{
  json: {
    phone: phoneNumber,
    message: messageText.toLowerCase()
  }
}];
```

3. Node **IF** (condicional):
   - Condition: `{{ $json.message }}` contains `can't` OR `unable` OR `won't work` OR `doesn't work`

---

#### **Task 3.5 — Resposta condicional (dados bancários)**

**Se cliente diz que não consegue pagar:**

Node **HTTP Request** (enviar dados bancários):

```json
{
  "number": "{{ $json.phone }}",
  "text": "No problem! You can also pay via:\n\n💳 **Bank Transfer/Zelle:**\nEmail: payments@yourcompany.com\nName: Your Company LLC\n\n📧 Once done, reply with 'PAID' and I'll activate your access immediately!"
}
```

---

#### **Task 3.6 — Detectar confirmação de pagamento**

Node **IF** (segunda condicional):
- Condition: `{{ $json.message }}` contains `paid` OR `done` OR `sent` OR `transferred`

**Se confirmou pagamento:**

Node **HTTP Request** (notificar você):

```json
{
  "number": "SEU_NUMERO_WHATSAPP",  // ← Teu número
  "text": "🚨 Cliente confirmou pagamento manual:\n\nPhone: {{ $json.phone }}\n\n👉 Verificar e liberar acesso."
}
```

---

### **BLOCO 4 — TESTES E VALIDAÇÃO**

#### **Task 4.1 — Testar fluxo completo**

1. Simular cartão recusado no sandbox Hotmart
2. Verificar se:
   - ✅ Webhook chegou no N8N
   - ✅ Dados foram extraídos corretamente
   - ✅ Telefone foi formatado (+1...)
   - ✅ Mensagem foi enviada no WhatsApp

3. Responder ao WhatsApp com "can't pay"
4. Verificar se:
   - ✅ N8N detectou resposta
   - ✅ Enviou dados bancários

5. Responder "paid"
6. Verificar se:
   - ✅ Notificação chegou no teu WhatsApp

---

### **BLOCO 5 — PREPARAÇÃO FASE 2 (opcional agora)**

Documentar estrutura para quando adicionar IA:

**Componentes futuros:**
- OpenAI API Key (GPT-3.5-turbo)
- Argumentos de venda em JSON/arquivo
- Node "OpenAI" no N8N para respostas contextuais

---

## OUTPUTS ESPERADOS

Quando terminar, você deve ter:

✅ N8N rodando em `https://n8n.SEU-DOMINIO.com`
✅ Evolution API rodando em `https://evolution.SEU-DOMINIO.com`
✅ WhatsApp conectado via QR Code
✅ Webhook Hotmart configurado e testado
✅ Fluxo funcional:
   - Cartão recusado → Mensagem automática (inglês)
   - Cliente responde → Detecta e envia dados bancários
   - Cliente confirma → Notifica Fábio

---

## CREDENCIAIS NECESSÁRIAS (Fábio fornece)

- [ ] Acesso SSH da VPS Hostinger (IP, user, senha/chave)
- [ ] Domínio para N8N e Evolution API (ou subdomínio)
- [ ] Acesso ao painel Hotmart (configurar webhook)
- [ ] Número WhatsApp Business (escanear QR Code)
- [ ] Teu número WhatsApp (receber notificações)

---

## STACK TÉCNICA

| Componente | Ferramenta | Custo |
|------------|-----------|-------|
| Automação | N8N self-hosted | Incluso VPS |
| WhatsApp | Evolution API | Incluso VPS |
| Hospedagem | VPS Hostinger (já tem) | R$ 0 adicional |
| IA Fase 2 | GPT-3.5-turbo | ~R$20-50/mês (depois) |

---

## PRÓXIMOS PASSOS

1. **Fábio:** Fornece credenciais acima pro @devops
2. **@devops:** Executa BLOCO 1 → 2 → 3 → 4
3. **@devops:** Reporta quando cada bloco terminar
4. **Fábio:** Testa sistema e ajusta textos das mensagens se necessário

**Estimativa de tempo:** 2-4 horas (depende de configuração de domínio/SSL).

---

## CONTEXTO DA CONVERSA

**Produto vendido:** Nos EUA (números +1, mensagens em inglês)

**Fase 1 (implementar agora):**
- Fluxo simples de recuperação de cartão recusado
- Lógica condicional básica (sem IA complexa)
- Custo: R$ 0 adicional (usa VPS existente)

**Fase 2 (futuro):**
- Carrinho abandonado
- IA argumentativa (escolhe melhor argumento por contexto)
- Argumentos de venda já documentados
- GPT-3.5-turbo + RAG simples
- Custo adicional: ~R$20-50/mês

---

**Criado em:** 2026-03-17
**Por:** José Amorim (Clone Cognitivo) + Fábio
