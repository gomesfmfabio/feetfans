#!/bin/bash

##############################################################################
# Deploy Automatizado para N8N
#
# Este script:
# 1. Faz login no N8N
# 2. Cria o workflow via API
# 3. Configura todos os nodes
# 4. Ativa o workflow
#
# Uso: bash deploy-to-n8n.sh
##############################################################################

set -e  # Exit on error

# Configurações
N8N_URL="https://n8n.feetstars.online"
N8N_EMAIL="admin@feetstars.com"
N8N_PASSWORD="E1g9m8d9un!"

echo "🚀 Deploy Automatizado - FeetFans Gmail Auto-Responder v2.0"
echo "============================================================"
echo ""

# Step 1: Login
echo "📝 Step 1: Fazendo login no N8N..."

LOGIN_RESPONSE=$(curl -s -X POST "${N8N_URL}/rest/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${N8N_EMAIL}\",\"password\":\"${N8N_PASSWORD}\"}")

# Extract cookie (session token)
SESSION_COOKIE=$(echo "$LOGIN_RESPONSE" | grep -o 'n8n-auth=[^;]*' | head -1)

if [ -z "$SESSION_COOKIE" ]; then
  echo "❌ Erro: Falha no login. Verificar credenciais."
  exit 1
fi

echo "✅ Login bem-sucedido!"
echo ""

# Step 2: Check if workflow already exists
echo "📝 Step 2: Verificando workflows existentes..."

EXISTING_WORKFLOWS=$(curl -s -X GET "${N8N_URL}/rest/workflows" \
  -H "Cookie: ${SESSION_COOKIE}")

WORKFLOW_ID=$(echo "$EXISTING_WORKFLOWS" | jq -r '.data[] | select(.name == "FeetFans Gmail Auto-Responder v2.0 (Complete)") | .id' | head -1)

if [ ! -z "$WORKFLOW_ID" ]; then
  echo "⚠️  Workflow já existe (ID: ${WORKFLOW_ID})"
  echo "   Para substituir, delete o workflow existente no N8N UI primeiro."
  echo ""
  echo "   Ou use:"
  echo "   curl -X DELETE \"${N8N_URL}/rest/workflows/${WORKFLOW_ID}\" -H \"Cookie: ${SESSION_COOKIE}\""
  echo ""
  read -p "Deletar workflow existente e continuar? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    curl -s -X DELETE "${N8N_URL}/rest/workflows/${WORKFLOW_ID}" \
      -H "Cookie: ${SESSION_COOKIE}"
    echo "✅ Workflow deletado!"
  else
    echo "❌ Deploy cancelado."
    exit 0
  fi
fi

echo "✅ Pronto para criar workflow"
echo ""

# Step 3: Create workflow
echo "📝 Step 3: Criando workflow..."

WORKFLOW_JSON=$(cat n8n-workflow-COMPLETE-v2.json)

CREATE_RESPONSE=$(curl -s -X POST "${N8N_URL}/rest/workflows" \
  -H "Content-Type: application/json" \
  -H "Cookie: ${SESSION_COOKIE}" \
  -d "$WORKFLOW_JSON")

NEW_WORKFLOW_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')

if [ -z "$NEW_WORKFLOW_ID" ] || [ "$NEW_WORKFLOW_ID" == "null" ]; then
  echo "❌ Erro ao criar workflow."
  echo "Response: $CREATE_RESPONSE"
  exit 1
fi

echo "✅ Workflow criado! ID: ${NEW_WORKFLOW_ID}"
echo ""

# Step 4: Update nodes with code
echo "📝 Step 4: Atualizando nodes com código..."
echo ""
echo "⚠️  ATENÇÃO: Os nodes precisam ser atualizados MANUALMENTE via UI."
echo ""
echo "   Nodes que precisam de código:"
echo "   1. Load FAQ Database → n8n-load-faq-database.js"
echo "   2. FAQ Semantic Search → n8n-faq-semantic-search.js"
echo "   3. AI Response Adapter → n8n-ai-response-adapter.js"
echo "   4. Prepare Notification → n8n-notification-low-confidence.js"
echo "   5. Auto-Learning Detector → n8n-auto-learning.js"
echo "   6. Save Updated FAQ → n8n-save-updated-faq.js"
echo ""
echo "   Acesse: ${N8N_URL}/workflow/${NEW_WORKFLOW_ID}"
echo ""

read -p "Pressione ENTER após configurar os nodes..."

# Step 5: Activate workflow
echo ""
echo "📝 Step 5: Ativando workflow..."

ACTIVATE_RESPONSE=$(curl -s -X PATCH "${N8N_URL}/rest/workflows/${NEW_WORKFLOW_ID}" \
  -H "Content-Type: application/json" \
  -H "Cookie: ${SESSION_COOKIE}" \
  -d "{\"active\":true}")

ACTIVE_STATUS=$(echo "$ACTIVATE_RESPONSE" | jq -r '.active')

if [ "$ACTIVE_STATUS" == "true" ]; then
  echo "✅ Workflow ativado com sucesso!"
else
  echo "⚠️  Workflow criado mas não ativado automaticamente."
  echo "   Ative manualmente via UI: ${N8N_URL}/workflow/${NEW_WORKFLOW_ID}"
fi

echo ""
echo "============================================================"
echo "✅ Deploy Completo!"
echo "============================================================"
echo ""
echo "📊 Informações:"
echo "   Workflow ID: ${NEW_WORKFLOW_ID}"
echo "   URL: ${N8N_URL}/workflow/${NEW_WORKFLOW_ID}"
echo "   Status: $([ "$ACTIVE_STATUS" == "true" ] && echo "ATIVO ✅" || echo "INATIVO ⚠️")"
echo ""
echo "🧪 Próximos Passos:"
echo "   1. Enviar email de teste para feetfansoficial@gmail.com"
echo "   2. Aguardar 5 minutos"
echo "   3. Verificar resposta automática"
echo "   4. Verificar logs: ${N8N_URL}/workflow/${NEW_WORKFLOW_ID}/executions"
echo ""
echo "📚 Documentação completa: DEPLOY-FINAL.md"
echo ""
