# ✅ WORKFLOW V3 CRIADO - COM FAQ APÓS 2 HORAS

## 📁 Arquivo
`n8n-workflow-purchase-complete-v3-com-faq.json`

---

## 🔄 Fluxo Completo

```
Webhook Hotmart Purchase
        ↓
Extract Data
        ↓
Send Welcome Message (imediato)
        ↓
Wait 2 Hours ⏰
        ↓
Send FAQ Message
```

---

## 📝 Mensagens Configuradas

### Mensagem 1 - Imediata (Boas-vindas):
```
🇺🇸 Congratulations, your FeetFans purchase is almost complete! After watching the video that appeared, open your email and look for "Hotmart". Open only the most recent email. Then, just follow the instructions in that email to access the members area 😃

🇪🇸 ¡Felicidades! Tu compra en FeetFans está casi completa. Después de ver el video, abre tu correo electrónico y busca "Hotmart". Abre solo el correo más reciente. Luego, sigue las instrucciones para acceder al área de miembros 😃
```

### Mensagem 2 - Após 2 Horas (FAQ):
```
🇺🇸 Just a quick note: I created a website where I show step-by-step how to access the FeetFans Platform and all its content. Just save my contact here and click the link: feetfans.com.br/help

🇪🇸 Solo una breve nota: he creado un sitio web donde muestro paso a paso cómo acceder a la plataforma FeetFans y a todo su contenido. Simplemente guarda mi contacto aquí y haz clic en el enlace: feetfans.com.br/ayuda
```

---

## 🚀 IMPORTAR NO N8N

### Opção 1 - Substituir Workflow Atual (Recomendado):
1. **Deletar** o workflow "Hotmart - Purchase Complete (FeetFans)" atual
2. **Import from File** → selecionar `n8n-workflow-purchase-complete-v3-com-faq.json`
3. Configurar credencial **WAHA API Key** (se ainda não tiver)
4. **Ativar** workflow

### Opção 2 - Manter Ambos:
1. **Import from File** → `n8n-workflow-purchase-complete-v3-com-faq.json`
2. Terá 2 workflows (pode desativar o antigo)
3. Configurar credencial
4. Ativar novo workflow

---

## ⚙️ Credencial WAHA

Se não tiver criado ainda:
- **Name:** WAHA API Key
- **Type:** HTTP Header Auth
- **Header Name:** X-Api-Key
- **Header Value:** E1g9m8d9ue!

---

## ✅ Webhook URL (Mesma)

A URL do webhook continua igual:
```
https://n8n.feetstars.online/webhook/hotmart-purchase-complete
```

**Não precisa alterar nada na Hotmart.**

---

## 🧪 Teste

Após ativar:
1. Fazer compra de teste
2. Verificar mensagem 1 (imediata)
3. Aguardar 2 horas
4. Verificar mensagem 2 (FAQ)

Ou usar a ferramenta de teste da Hotmart.

---

**Criado em:** 2026-04-10
**Por:** @aiox-master (Orion)
