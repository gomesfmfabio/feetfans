# Instruções para Importar Workflow N8N - Purchase Complete

## 📁 Arquivo do Workflow
**Arquivo:** `n8n-workflow-purchase-complete.json`

---

## 🚀 Passo a Passo (RÁPIDO)

### 1. Acessar N8N
```
URL: https://n8n.feetstars.online
User: admin
Pass: E1g9m8d9un!
```

### 2. Importar Workflow
1. Clicar no menu superior direito (três linhas)
2. Clicar em **"Import from File"** ou **"Import Workflow"**
3. Selecionar o arquivo: `n8n-workflow-purchase-complete.json`
4. Clicar em **"Import"**

### 3. Configurar Credencial WAHA (SE NÃO EXISTIR)
1. No workflow importado, clicar no node **"Send WhatsApp Message"**
2. Em **"Credentials"**, criar nova credencial:
   - **Credential Type:** HTTP Header Auth
   - **Name:** `WAHA API Key`
   - **Header Name:** `X-Api-Key`
   - **Header Value:** `E1g9m8d9ue!`
3. Salvar credencial

### 4. Ativar Workflow
1. Clicar no toggle **"Active"** no canto superior direito
2. Workflow fica ativo e pronto para receber webhooks

### 5. Copiar URL do Webhook
1. Clicar no node **"Webhook Hotmart Purchase"**
2. Copiar a URL gerada (será algo como):
   ```
   https://n8n.feetstars.online/webhook/hotmart-purchase-complete
   ```

### 6. Configurar na Hotmart
1. Acessar painel Hotmart
2. Ir em **Ferramentas → Webhook/Postback**
3. Adicionar nova URL:
   - **URL:** `https://n8n.feetstars.online/webhook/hotmart-purchase-complete`
   - **Evento:** `PURCHASE_COMPLETE` ou `PURCHASE_APPROVED`
4. Salvar

---

## ✅ Teste

Após configurar, fazer uma compra de teste ou usar a ferramenta de teste da Hotmart para simular o evento PURCHASE_COMPLETE.

Verificar em **Executions** do N8N se o workflow foi executado com sucesso.

---

## 📝 Mensagem Configurada

```
🇺🇸 Congratulations, your FeetFans purchase is almost complete! After watching the video that appeared, open your email and look for "Hotmart". Open only the most recent email. Then, just follow the instructions in that email to access the members area 😃

🇪🇸 ¡Felicidades! Tu compra en FeetFans está casi completa. Después de ver el video, abre tu correo electrónico y busca "Hotmart". Abre solo el correo más reciente. Luego, sigue las instrucciones para acceder al área de miembros 😃
```

---

## 🔧 Estrutura do Workflow

```
Webhook Hotmart (PURCHASE_COMPLETE)
        ↓
Extract Data (nome, telefone, produto)
        ↓
Check if FeetFans (condicional)
        ↓ (se TRUE)
Send WhatsApp Message (WAHA API)
```

---

**Criado em:** 2026-04-10
**Por:** @aiox-master (Orion)
