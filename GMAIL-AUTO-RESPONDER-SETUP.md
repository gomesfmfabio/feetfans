# Gmail Auto Responder - Guia de Configuração

## ✅ Status Atual

- ✅ Workflow JSON criado: `n8n-workflow-gmail-auto-responder.json`
- ✅ Lógica de classificação implementada (PT/EN/ES)
- ✅ 4 categorias: ACCESS_REQUEST, TECHNICAL_SUPPORT, REFUND_THREAT, REFUND_IGNORE
- ⏳ Pendente: Importar no N8N + configurar credenciais Gmail + preencher templates

---

## 📋 Passo a Passo

### 1. Importar Workflow no N8N

1. Acesse: https://n8n.feetstars.online
2. Login: `admin` / `E1g9m8d9un!`
3. Clique em **"+"** (novo workflow) ou **"Import from File"**
4. Selecione o arquivo: `n8n-workflow-gmail-auto-responder.json`
5. Workflow será importado com nome: **"Gmail - Auto Responder FeetFans"**

---

### 2. Configurar Credencial Gmail OAuth2

#### 2.1. Google Cloud Console
1. Acesse: https://console.cloud.google.com/
2. Crie projeto: **"n8n-gmail-integration"** (ou use existente)
3. Ative **Gmail API**:
   - APIs & Services → Library → Procure "Gmail API" → Enable
4. Crie credenciais OAuth 2.0:
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: **Web application**
   - Name: `N8N Gmail Integration`
   - Authorized redirect URIs: `https://n8n.feetstars.online/rest/oauth2-credential/callback`
5. Copie: **Client ID** e **Client Secret**

#### 2.2. No N8N
1. No workflow, clique no node **"Gmail Trigger"**
2. Em "Credential to connect with", clique **"Create New"**
3. Preencha:
   - **Name:** `Gmail feetfansoficial@gmail.com`
   - **Client ID:** (cole do Google Cloud Console)
   - **Client Secret:** (cole do Google Cloud Console)
4. Clique **"Sign in with Google"**
5. Autorize a conta: **feetfansoficial@gmail.com**
6. Salve a credencial

---

### 3. Preencher Templates de Resposta

Os templates estão como **placeholders** nos nodes. Você precisa substituir:

#### Node: "Template Access Request"
**Localize as linhas:**
```javascript
const templates = {
  pt: '{{TEMPLATE_ACCESS_PT}}',
  en: '{{TEMPLATE_ACCESS_EN}}',
  es: '{{TEMPLATE_ACCESS_ES}}'
};
```

**Substitua por:** (escreva seus templates)
```javascript
const templates = {
  pt: 'SEU TEMPLATE EM PORTUGUÊS AQUI',
  en: 'YOUR ENGLISH TEMPLATE HERE',
  es: 'TU PLANTILLA EN ESPAÑOL AQUÍ'
};
```

#### Node: "Template Technical Support"
**Mesmo processo** - substitua os placeholders pelos templates reais.

#### Node: "Template Refund Threat"
**Mesmo processo** - template para quando cliente ameaça chargeback.

---

### 4. Testar Workflow

#### 4.1. Teste Manual (Recomendado)
1. No workflow, clique em **"Execute Workflow"**
2. Envie um email de teste para **feetfansoficial@gmail.com** com:
   - Assunto: "Preciso de acesso ao produto"
   - Corpo: "Olá, comprei mas não recebi o acesso"
3. Execute novamente o workflow
4. Verifique se:
   - Email foi lido ✅
   - Categoria: `ACCESS_REQUEST` ✅
   - Idioma: `pt` ✅
   - Resposta enviada ✅

#### 4.2. Ativar Workflow
1. Clique no toggle **"Inactive"** → **"Active"**
2. Workflow rodará automaticamente a cada 5 minutos

---

## 🔧 Como Funciona

```
A cada 5 minutos:
  ↓
1. Ler emails não lidos (UNREAD) do Gmail
  ↓
2. Extrair: from, subject, body
  ↓
3. Detectar idioma (PT/EN/ES) via keywords
  ↓
4. Classificar categoria:
   - ACCESS_REQUEST (acesso/login/senha)
   - TECHNICAL_SUPPORT (dúvida/ajuda/erro)
   - REFUND_THREAT (reembolso + chargeback/denúncia)
   - REFUND_IGNORE (reembolso sem ameaça)
  ↓
5. Switch por categoria:
   - ACCESS/TECHNICAL/REFUND_THREAT → Enviar template no idioma detectado
   - REFUND_IGNORE → Não fazer nada
  ↓
6. Marcar email como lido (automaticamente)
```

---

## 📊 Categorias e Keywords

### ACCESS_REQUEST
- **Keywords:** acesso, login, senha, password, access, acceso, contraseña, cadastro, registro, register

### TECHNICAL_SUPPORT
- **Keywords:** dúvida, ajuda, help, problema, error, erro, ayuda, no funciona, não funciona, doesn't work

### REFUND_THREAT
- **Condição:** Email contém "reembolso/refund/devolución" **E** uma das ameaças:
  - chargeback, dispute, disputa, denunciar, report
  - banco, bank, cartão de crédito, credit card, tarjeta
  - fraude, fraud, reclamar, complain, queja

### REFUND_IGNORE
- **Condição:** Email contém "reembolso/refund/devolución" mas SEM ameaças

---

## 🎯 Próximos Passos

1. **Você:** Importar workflow no N8N
2. **Você:** Configurar credencial Gmail OAuth2
3. **Você:** Escrever os 9 templates (3 categorias × 3 idiomas)
4. **Você:** Testar com emails reais
5. **Você:** Ativar workflow

---

## 📝 Templates a Escrever

### Template 1: ACCESS_REQUEST
- [ ] Versão PT
- [ ] Versão EN
- [ ] Versão ES

### Template 2: TECHNICAL_SUPPORT
- [ ] Versão PT
- [ ] Versão EN
- [ ] Versão ES

### Template 3: REFUND_THREAT
- [ ] Versão PT
- [ ] Versão EN
- [ ] Versão ES

---

## ⚠️ Importante

- Workflow começa **INATIVO** (active: false)
- Só ative após testar com emails reais
- Templates com `{{...}}` precisam ser substituídos
- Credencial Gmail precisa ser OAuth2 (não senha de app)

---

*Criado por: @aiox-master (Orion)*
*Data: 2026-05-04*
