#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  📋 HELPER - Copiar Código para N8N                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

while true; do
  echo "Qual node você quer copiar?"
  echo ""
  echo "1. Load FAQ Database"
  echo "2. FAQ Semantic Search"
  echo "3. AI Response Adapter"
  echo "4. Prepare Notification"
  echo "5. Auto-Learning Detector"
  echo "6. Save Updated FAQ"
  echo "0. Sair"
  echo ""
  read -p "Escolha (0-6): " choice
  echo ""

  case $choice in
    1)
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "📄 Node 1: Load FAQ Database"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      cat n8n-load-faq-database.js
      echo ""
      echo "✅ Código acima copiado para clipboard (se pbcopy disponível)"
      cat n8n-load-faq-database.js | pbcopy 2>/dev/null || true
      ;;
    2)
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "📄 Node 2: FAQ Semantic Search"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      cat n8n-faq-semantic-search.js
      echo ""
      echo "✅ Código acima copiado para clipboard (se pbcopy disponível)"
      cat n8n-faq-semantic-search.js | pbcopy 2>/dev/null || true
      ;;
    3)
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "📄 Node 3: AI Response Adapter"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      cat n8n-ai-response-adapter.js
      echo ""
      echo "✅ Código acima copiado para clipboard (se pbcopy disponível)"
      cat n8n-ai-response-adapter.js | pbcopy 2>/dev/null || true
      ;;
    4)
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "📄 Node 4: Prepare Notification"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      cat n8n-notification-low-confidence.js
      echo ""
      echo "✅ Código acima copiado para clipboard (se pbcopy disponível)"
      cat n8n-notification-low-confidence.js | pbcopy 2>/dev/null || true
      ;;
    5)
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "📄 Node 5: Auto-Learning Detector"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      cat n8n-auto-learning.js
      echo ""
      echo "✅ Código acima copiado para clipboard (se pbcopy disponível)"
      cat n8n-auto-learning.js | pbcopy 2>/dev/null || true
      ;;
    6)
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "📄 Node 6: Save Updated FAQ"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      cat n8n-save-updated-faq.js
      echo ""
      echo "✅ Código acima copiado para clipboard (se pbcopy disponível)"
      cat n8n-save-updated-faq.js | pbcopy 2>/dev/null || true
      ;;
    0)
      echo "👋 Tchau!"
      exit 0
      ;;
    *)
      echo "❌ Opção inválida"
      ;;
  esac
  
  echo ""
  read -p "Pressione ENTER para continuar..."
  clear
done
