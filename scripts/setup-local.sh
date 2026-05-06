#!/bin/bash

echo "🚀 FeetFans Local Setup"
echo "======================"

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current: $(node -v)"
  exit 1
fi
echo "✓ Node.js $(node -v)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm..."
  npm install -g pnpm
fi
echo "✓ pnpm installed"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy env example if not exists
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local..."
  cp .env.example .env.local
  echo "⚠️  IMPORTANT: Edit .env.local with your credentials!"
else
  echo "✓ .env.local exists"
fi

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
  echo "⚠️  Supabase CLI not installed"
  echo "Install: https://supabase.com/docs/guides/cli"
else
  echo "✓ Supabase CLI installed"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase credentials"
echo "2. Run migrations: supabase db push"
echo "3. Start dev server: pnpm dev"
