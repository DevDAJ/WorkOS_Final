# LivingCV

**AI-powered career intelligence platform.** LivingCV is a single source of truth for your professional profile, with AI-driven career path recommendations, skill gap analysis, learning quests, job matching, and tailored resume generation.

Built with SvelteKit 2 (runes mode), TypeScript, PostgreSQL (Neon), Prisma ORM v7, Tailwind CSS v4, and shadcn-svelte (nova style).

## Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit 2 (runes mode, Svelte 5) |
| Language | TypeScript (strict) |
| CSS | Tailwind CSS v4 |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma ORM v7 |
| Validation | Zod v4 |
| Auth | Session-based (Prisma Session model, SHA-256) |
| UI | shadcn-svelte (nova) + lucide-svelte icons |
| AI | OpenRouter API (configurable model) |
| Deployment | Netlify (`@sveltejs/adapter-netlify`) |

## Getting Started

### Prerequisites

- Node.js (engine-strict, check `.npmrc`)
- A PostgreSQL database (Neon recommended)
- An OpenRouter API key (for AI features)

### Setup

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and OPENROUTER_API_KEY

# Generate Prisma client and sync types
npx prisma generate
npm run prepare

# Push schema to database
npx prisma db push

# Seed demo data (5 demo users, 50+ jobs, career roles)
npm run prisma:seed
# or: tsx prisma/seed.ts

# Start dev server
npm run dev
```

### Demo Users

All use password `password123`:

| Email | Profile |
|---|---|
| aisyah@demo.com | Fresh CS grad, no work experience |
| benny@demo.com | Junior UI/UX Designer at Grab |
| carmen@demo.com | Mid Product Designer at Carsome |
| dinesh@demo.com | Junior Software Engineer at Shopee |
| elena@demo.com | Mid Fullstack Developer at Aerodyne |

## Features

### Living CV (`/living-cv`)
Single source of truth for your career profile. Sections: Personal Info, Education, Work Experience, Projects, Certifications, Awards, Languages, References, Social Links. All CRUD via SvelteKit form actions with Zod validation.

### Career Map (`/career-map`)
AI-generated career progression graph. Shows nodes at different seniority tiers (current, jump, next, stretch, long-term) with edges connecting roles. Falls back to seeded data when OpenRouter is unavailable. Results cached to `User.careerMapCache`.

### Career Quests (`/career-quest`)
AI-generated learning quests targeting skills you're missing for your desired role. Each quest contains tasks that can be marked complete. At 100% progress, your career match score is recalculated.

### Job Board (`/`)
Paginated job listing with filters (category, seniority, location, type, search). Each job shows your skill match score (color-coded: green >= 60%, yellow >= 40%, red < 40%).

### Job Detail & Apply (`/jobs/[id]`)
Full job description, skill match breakdown with strengths and gaps, and an application flow that lets you claim evidence from your work/projects for each required skill. Automatically generates a tailored resume on application.

### Applications (`/applications`)
Track all applications with status (Pending, Reviewing, Interviewed, Offered, Rejected, Withdrawn). View/download resumes as PDF.

### Resume Generator
Generates HTML resumes tailored to specific job postings. Two styles: "professional" (serif) and "creative" (sans-serif with purple accent). Content is prioritized by relevance to target job skills.

## Architecture

Feature-based vertical slices under `src/features/`:

```
src/
  features/
    auth/          Session management, login, register
    living-cv/     Profile CRUD + Zod schemas
    career-map/    Career graph + AI generation
    career-quest/  AI learning quests
    jobs/          Job board + seeding
    resume/        HTML resume generation
    applications/  Application tracking (in routes only)
  lib/
    server/        Prisma singleton, server-only utilities
    components/    shadcn-svelte UI + theme toggle
    ai/            OpenRouter client, career map, suggestions
    scoring/       Skill-to-role matching algorithm
    graph/         Career path graph + layout
  hooks/           Auth session validation on every request
  routes/          SvelteKit pages + API endpoints
```

### Key Patterns

- **Server-only code** in `src/lib/server/` is never exposed to the client.
- **Feature modules** export server-only functions from `server.ts`, imported by route handlers.
- **Polymorphic skill evidence** via `SkillEvidence.source` (string) + `sourceId` (string) linking skills to projects, work experience, etc.
- **Global Prisma singleton** via `globalThis.__prisma` to prevent connection proliferation during hot reload.

## Data Model (Prisma)

18 models across the schema:

- **User** + profile models: `PersonalInfo`, `Education`, `WorkExperience`, `Project`, `Skill`, `Certification`, `Award`, `Language`, `Reference`, `SocialLink`
- **Auth**: `Session` (token, userId, expiresAt)
- **Career**: `CareerRole`, `RoleSkillRequirement`, `CareerPathEdge`, `CareerMatch`, `CareerQuest`, `QuestTask`
- **Jobs**: `Job`, `Application`, `Resume`

All profile models belong to User via `userId` FK with cascade delete. Skills are unique per user by name. SkillEvidence links skills to source entities polymorphically.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | Svelte type-checking |
| `npx prisma studio` | Browse database |
| `npx prisma db push` | Push schema to database |
| `npx prisma generate` | Regenerate Prisma client |
| `tsx prisma/seed.ts` | Seed database with demo data |

## Environment Variables

```
DATABASE_URL            PostgreSQL connection string (Neon)
OPENROUTER_API_KEY      OpenRouter API key for AI features
OPENROUTER_MODEL        AI model override (default: google/gemma-4-2b-it:free)
```

## Technical Notes

- **Auth**: Session-based with DB-backed sessions (30-day expiry). In-memory session cache (5-min TTL) reduces DB lookups. Password hashing uses SHA-256 (dev-only; upgrade to bcrypt/argon2 before production).
- **AI**: OpenRouter client with 3-attempt retry, 45s timeout, JSON extraction from responses. Custom model via `OPENROUTER_MODEL` env var.
- **Skill scoring**: 4-component match score (0-100): skill overlap (45%), evidence strength (25%), recency (10%), project depth (20%).
- **Resume PDF**: Generated via a regeneration script (`scripts/regenerate-resumes.ts`).
