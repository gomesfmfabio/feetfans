# ⚡ QUICKSTART - Deploy em 5 Passos

## 1. Acesse N8N

```
URL: https://n8n.feetstars.online
Login: admin@feetstars.com
Senha: E1g9m8d9un!
```

## 2. Importe Workflow

```
Click: "Add Workflow" → "Import from File"
Arquivo: n8n-workflow-COMPLETE-v2.json
```

## 3. Cole Códigos (6 nodes)

| Node | Arquivo |
|------|---------|
| Load FAQ Database | `n8n-load-faq-database.js` |
| FAQ Semantic Search | `n8n-faq-semantic-search.js` |
| AI Response Adapter | `n8n-ai-response-adapter.js` |
| Prepare Notification | `n8n-notification-low-confidence.js` |
| Auto-Learning Detector | `n8n-auto-learning.js` |
| Save Updated FAQ | `n8n-save-updated-faq.js` |

**Dica:** Use `bash DEPLOY-HELPER.sh` para copiar fácil

## 4. Ative

```
Click: "Active" (canto superior direito)
```

## 5. Teste

**Email 1:**
```
Para: feetfansoficial@gmail.com
Assunto: Preciso de acesso
Corpo: Não recebi o login
```

**Email 2:**
```
Para: feetfansoficial@gmail.com
Assunto: Partnership
Corpo: Business proposal
```

Aguardar 5 minutos e verificar respostas.

---

## ✅ Pronto!

Sistema rodando 24/7 automaticamente.

**Mais detalhes:** `DEPLOY-FINAL.md`
