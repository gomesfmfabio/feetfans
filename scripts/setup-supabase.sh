#!/bin/bash
# FeetFans - Supabase Setup Script
# Este script aplica toda a configuração do Supabase instantaneamente

set -e  # Exit on error

echo "🚀 FeetFans - Supabase Setup"
echo "=============================="
echo ""

# Check if .env has credentials
if grep -q "xxxxx.supabase.co" .env; then
  echo "❌ ERRO: Credenciais do Supabase não configuradas no .env"
  echo ""
  echo "📋 FAÇA ISSO PRIMEIRO:"
  echo "1. Acesse: https://supabase.com/dashboard"
  echo "2. Login: feetfansoficial@gmail.com"
  echo "3. Projeto: feetfans-app → Settings → API"
  echo "4. Copie as 3 credenciais para o arquivo .env:"
  echo "   - SUPABASE_URL"
  echo "   - SUPABASE_ANON_KEY"
  echo "   - SUPABASE_SERVICE_ROLE_KEY"
  echo ""
  echo "Depois rode este script novamente."
  exit 1
fi

echo "✅ Credenciais encontradas no .env"
echo ""

# Source .env
export $(cat .env | grep -v '^#' | xargs)

echo "📊 Aplicando migrations..."
cd /Users/martinez/pegasus
supabase db push

echo ""
echo "🪣 Criando storage bucket 'creator-photos'..."
# Note: Bucket creation via CLI requires additional setup
# For now, this needs to be done manually in Dashboard
echo "⚠️  AÇÃO MANUAL NECESSÁRIA:"
echo "   1. Vá para: https://supabase.com/dashboard"
echo "   2. Projeto: feetfans-app → Storage"
echo "   3. Click 'New Bucket'"
echo "   4. Nome: creator-photos"
echo "   5. Public bucket: YES"
echo "   6. Click 'Create bucket'"
echo ""

echo "✅ Setup completo!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Criar bucket 'creator-photos' manualmente (acima)"
echo "2. Ativar @dev para Story 1.4 (Authentication)"
echo "3. Começar implementação do frontend"
echo ""
echo "🎯 TUDO PRONTO PARA DESENVOLVIMENTO!"
