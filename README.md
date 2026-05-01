# FeetFans Marketplace

A progressive web application (PWA) marketplace for foot content creators to sell photos and videos anonymously.

## 🏗️ Architecture Overview

This project uses a **monorepo architecture** powered by Turborepo and pnpm workspaces:

```
feetfans-marketplace/
├── apps/
│   ├── web/          # Next.js 15+ PWA (frontend)
│   └── api/          # Express API (backend)
├── packages/
│   └── shared/       # Shared utilities and TypeScript types
├── docs/             # Project documentation, stories, epics
└── .aiox-core/       # AIOX framework (AI-orchestrated development)
```

### Technology Stack

- **Frontend:** Next.js 15+ (App Router), React 19, Tailwind CSS, PWA
- **Backend:** Node.js, Express, TypeScript
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Authentication:** Supabase Auth (email/password, OAuth)
- **Age Verification:** Onfido API (18+ enforcement)
- **Storage:** Supabase Storage (encrypted file storage)
- **Payment Processing:** Stripe (implemented in Epic 4)
- **CI/CD:** GitHub Actions
- **Package Manager:** pnpm
- **Monorepo Tool:** Turborepo

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **pnpm** 8.0.0 or higher
- **Git** ([Download](https://git-scm.com/))

Install pnpm globally if you haven't already:

```bash
npm install -g pnpm
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pegasus
```

### 2. Install Dependencies

Install all dependencies for the monorepo and workspaces:

```bash
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` and fill in your actual values:

- **Supabase credentials:** Create a project at [supabase.com](https://supabase.com)
- **Onfido API token:** Sign up at [onfido.com](https://onfido.com) for age verification
- **Stripe keys:** Get from [stripe.com](https://stripe.com) (needed for Epic 4)

### 4. Run Development Servers

Start all development servers (web + api):

```bash
pnpm dev
```

This will start:
- **Web app:** http://localhost:3000
- **API server:** http://localhost:3001

Or run workspaces individually:

```bash
# Web app only
pnpm --filter @feetfans/web dev

# API server only
pnpm --filter @feetfans/api dev
```

---

## 📦 Available Scripts

### Root Level (runs across all workspaces)

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all workspaces for production
- `pnpm lint` - Run ESLint across all workspaces
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run all tests
- `pnpm format` - Format code with Prettier

### Workspace-Specific

Run commands in specific workspaces:

```bash
# Example: Build only the web app
pnpm --filter @feetfans/web build

# Example: Run tests in API
pnpm --filter @feetfans/api test
```

---

## 🏃 Development Workflow

### Code Quality

This project enforces strict code quality standards:

- **Pre-commit hooks** (Husky + lint-staged) automatically run on `git commit`:
  - ESLint checks
  - Prettier formatting
  - TypeScript type checking

### CI/CD Pipeline

GitHub Actions automatically runs on every push to `main` and pull request:

- ✅ Lint checks
- ✅ Type checking
- ✅ Test suite

All checks must pass before merging.

### Branch Strategy

- `main` - Production-ready code
- `feat/*` - Feature branches (e.g., `feat/1.1-repository-setup`)
- `fix/*` - Bug fix branches
- `docs/*` - Documentation updates

---

## 📁 Project Structure

```
apps/
├── web/                    # Next.js PWA
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utility functions
│   │   └── styles/        # Global styles
│   ├── public/            # Static assets
│   └── package.json
│
├── api/                    # Express API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   └── index.ts       # Entry point
│   └── package.json
│
packages/
└── shared/                 # Shared code
    ├── src/
    │   ├── types/         # TypeScript types/interfaces
    │   ├── utils/         # Shared utilities
    │   └── index.ts
    └── package.json
```

---

## 🧪 Testing

Run tests across all workspaces:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm --filter @feetfans/web test -- --watch
```

---

## 🔒 Security

### Environment Variables

**NEVER commit `.env` files to version control.** The `.gitignore` file is configured to exclude:

- `.env`
- `.env.local`
- `.env.*.local`

### Sensitive Data

- Database credentials are stored in Supabase (encrypted at rest)
- ID verification documents use Supabase Storage with encryption
- Row Level Security (RLS) policies enforce data access rules
- JWT tokens use httpOnly cookies to prevent XSS attacks

---

## 📚 Documentation

- **PRD (Product Requirements Document):** `docs/prd.md`
- **Architecture:** `docs/architecture.md`
- **Stories:** `docs/stories/` (user stories for development)
- **Epics:** `docs/epics/` (epic execution plans)
- **Decisions:** `docs/DECISIONS.md` (architectural decision records)

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** `pnpm: command not found`
- **Solution:** Install pnpm globally: `npm install -g pnpm`

**Issue:** TypeScript errors in IDE
- **Solution:** Restart TypeScript server or run `pnpm typecheck`

**Issue:** Pre-commit hooks failing
- **Solution:** Run `pnpm lint` and `pnpm format` to fix issues manually

**Issue:** Port already in use
- **Solution:** Kill the process on port 3000/3001 or change `PORT` in `.env`

---

## 📝 License

Private project - All rights reserved.

---

## 👥 Contributors

- **Fábio Martinez** - Project Owner
- **AIOX Framework** - AI-orchestrated development system

---

## 🔗 Links

- [Supabase Dashboard](https://app.supabase.com/)
- [Onfido Documentation](https://documentation.onfido.com/)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Built with ❤️ using AIOX (AI-Orchestrated System for Full Stack Development)**
