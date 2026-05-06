# ✅ Checklist de Ativação - Gmail Auto Responder

Use este checklist para ativar o sistema em ~15 minutos.

---

## 📋 PRÉ-REQUISITOS

- [ ] Acesso ao N8N: https://n8n.feetstars.online
- [ ] Login: `admin` / `E1g9m8d9un!`
- [ ] Conta Google com `feetfansoficial@gmail.com`

---

## 🚀 PASSO A PASSO

### 1️⃣ Importar Workflow (2 min)

- [ ] Abrir N8N: https://n8n.feetstars.online
- [ ] Fazer login
- [ ] Clicar em **"Workflows"** (menu lateral)
- [ ] Clicar em **"Import from File"** ou **"+"** → **"Import from File"**
- [ ] Selecionar arquivo: `n8n-workflow-gmail-auto-responder.json`
- [ ] Confirmar importação
- [ ] Workflow aparece com nome: **"Gmail - Auto Responder FeetFans"**

---

### 2️⃣ Configurar Gmail OAuth2 (10 min)

#### A. Google Cloud Console

- [ ] Acessar: https://console.cloud.google.com/
- [ ] Criar projeto novo OU usar existente
  - Nome sugerido: `n8n-gmail-integration`
- [ ] Ativar Gmail API:
  - **APIs & Services** → **Library**
  - Procurar: "Gmail API"
  - Clicar em **Enable**
- [ ] Criar credenciais OAuth2:
  - **APIs & Services** → **Credentials**
  - **Create Credentials** → **OAuth client ID**
  - Application type: **Web application**
  - Name: `N8N Gmail FeetFans`
  - Authorized redirect URIs: `https://n8n.feetstars.online/rest/oauth2-credential/callback`
  - Clicar **Create**
- [ ] Copiar: **Client ID** (guardar em lugar seguro)
- [ ] Copiar: **Client Secret** (guardar em lugar seguro)

#### B. No N8N

- [ ] No workflow, clicar no node **"Gmail Trigger"** (primeiro node)
- [ ] Em "Credential to connect with", clicar **"Create New"**
- [ ] Preencher:
  - **Name:** `Gmail feetfansoficial@gmail.com`
  - **Client ID:** (colar do Google Cloud Console)
  - **Client Secret:** (colar do Google Cloud Console)
- [ ] Clicar **"Sign in with Google"**
- [ ] Selecionar conta: **feetfansoficial@gmail.com**
- [ ] Autorizar acesso (aceitar permissões)
- [ ] Credencial salva ✅
- [ ] Repetir para o node **"Send Gmail Reply"** (selecionar mesma credencial)

---

### 3️⃣ Preencher Templates (3-30 min)

**Opção A: Usar templates de exemplo (3 min)**
- [ ] Abrir arquivo: `TEMPLATES-EXEMPLO.md`
- [ ] Copiar templates prontos
- [ ] Colar nos nodes (instruções abaixo)

**Opção B: Escrever seus próprios templates (30-60 min)**
- [ ] Escrever template ACCESS_REQUEST (PT/EN/ES)
- [ ] Escrever template TECHNICAL_SUPPORT (PT/EN/ES)
- [ ] Escrever template REFUND_THREAT (PT/EN/ES)

#### Onde Colar os Templates

**Node: "Template Access Request"**
- [ ] Clicar no node
- [ ] Localizar linha: `pt: '{{TEMPLATE_ACCESS_PT}}'`
- [ ] Substituir `{{TEMPLATE_ACCESS_PT}}` pelo texto real (manter aspas simples)
- [ ] Repetir para `en` e `es`
- [ ] **IMPORTANTE:** Use `\n` para quebras de linha dentro do texto

**Node: "Template Technical Support"**
- [ ] Mesmo processo acima

**Node: "Template Refund Threat"**
- [ ] Mesmo processo acima

**Exemplo de formatação:**
```javascript
const templates = {
  pt: 'Olá!\n\nObrigado por entrar em contato.\n\nAtenciosamente,\nEquipe FeetFans',
  en: 'Hello!\n\nThank you for contacting us.\n\nBest regards,\nFeetFans Team',
  es: '¡Hola!\n\nGracias por contactarnos.\n\nSaludos,\nEquipo FeetFans'
};
```

---

### 4️⃣ Testar com Email Real (5 min)

- [ ] Enviar email de teste para: **feetfansoficial@gmail.com**
  - Assunto: `Preciso de acesso ao produto`
  - Corpo: `Olá, comprei mas não recebi o login`
- [ ] No N8N, clicar em **"Execute Workflow"** (botão no canto superior direito)
- [ ] Aguardar execução
- [ ] Verificar output de cada node:
  - **Gmail Trigger:** Email foi lido ✅
  - **Extract Email Data:** Dados extraídos ✅
  - **Classify with Gemini:** Categoria = `ACCESS_REQUEST`, Language = `pt` ✅
  - **Switch by Category:** Rota correta ✅
  - **Template Access Request:** Template selecionado ✅
  - **Send Gmail Reply:** Email enviado ✅
- [ ] Verificar inbox: você recebeu a resposta automática? ✅

**Se algo falhar:**
- [ ] Ler mensagem de erro no node que falhou
- [ ] Corrigir (geralmente credencial ou template mal formatado)
- [ ] Executar novamente

---

### 5️⃣ Ativar Workflow (instantâneo)

- [ ] No topo do workflow, clicar no toggle **"Inactive"**
- [ ] Mudar para **"Active"**
- [ ] Confirmar que ficou verde ✅
- [ ] Sistema agora roda automaticamente a cada 5 minutos

---

## 🎯 Validação Final

- [ ] Workflow está **Active** ✅
- [ ] Credencial Gmail conectada ✅
- [ ] Templates preenchidos (9 textos) ✅
- [ ] Teste enviado e resposta recebida ✅

---

## 📊 Monitoramento

**Para ver execuções:**
- [ ] N8N → Menu lateral → **"Executions"**
- [ ] Ver histórico de todas as execuções
- [ ] Clicar em qualquer execução para ver detalhes

**Para editar depois:**
- [ ] Abrir workflow
- [ ] Editar nodes
- [ ] Salvar (workflow continua ativo)

---

## ⚠️ Troubleshooting

**Problema: "Gmail API not enabled"**
- [ ] Voltar ao Google Cloud Console
- [ ] Ativar Gmail API

**Problema: "Invalid credentials"**
- [ ] Recriar credencial OAuth2 no N8N
- [ ] Re-autorizar com Google

**Problema: "Template undefined"**
- [ ] Verificar se substituiu TODOS os `{{...}}` pelos textos reais
- [ ] Verificar se está usando aspas simples corretamente

**Problema: "Email not sent"**
- [ ] Verificar se credencial Gmail está no node "Send Gmail Reply"
- [ ] Testar conexão manualmente

---

## 🎉 Sistema Ativo!

Quando tudo estiver ✅, o sistema:
- Verificará emails a cada **5 minutos**
- Classificará automaticamente (PT/EN/ES)
- Responderá pedidos de acesso e dúvidas técnicas
- Responderá ameaças de chargeback
- Ignorará reembolsos normais

---

**Tempo total estimado:** 15-60 min (dependendo se usa templates prontos ou escreve do zero)

---

*Checklist by @aiox-master (Orion)*
*Data: 2026-05-04*
