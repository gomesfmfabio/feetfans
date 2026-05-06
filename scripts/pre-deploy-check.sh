#!/bin/bash

echo "🔍 Pre-Deploy Check"
echo "==================="

ERRORS=0

# Check build
echo "📦 Checking build..."
cd apps/web
if pnpm build > /dev/null 2>&1; then
  echo "✓ Build passes"
else
  echo "❌ Build failed"
  ERRORS=$((ERRORS + 1))
fi

# Check TypeScript
echo "🔷 Checking TypeScript..."
if pnpm typecheck > /dev/null 2>&1; then
  echo "✓ TypeScript passes"
else
  echo "❌ TypeScript errors"
  ERRORS=$((ERRORS + 1))
fi

# Check env example is up to date
echo "📝 Checking .env.example..."
if [ -f "../../.env.example" ]; then
  echo "✓ .env.example exists"
else
  echo "❌ .env.example missing"
  ERRORS=$((ERRORS + 1))
fi

# Check critical files
echo "📄 Checking critical files..."
FILES=("vercel.json" "DEPLOY.md" "ROADMAP.md" "README.md")
for file in "${FILES[@]}"; do
  if [ -f "../../$file" ]; then
    echo "✓ $file exists"
  else
    echo "❌ $file missing"
    ERRORS=$((ERRORS + 1))
  fi
done

cd ../..

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✅ All checks passed! Ready to deploy."
  exit 0
else
  echo "❌ $ERRORS check(s) failed. Fix before deploying."
  exit 1
fi
