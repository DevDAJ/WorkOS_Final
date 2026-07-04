# LivingCV – AI Career Intelligence Platform

## Stack

- **Framework:** SvelteKit 2 (runes mode)
- **Language:** TypeScript (strict)
- **CSS:** Tailwind CSS v4
- **Database:** PostgreSQL + Prisma ORM v7
- **Validation:** Zod
- **Auth:** Session-based (Session model in Prisma)
- **UI:** shadcn-svelte components (nova style)
- **Icons:** lucide-svelte

## Project Structure

```
src/
  features/         # Feature-based vertical slices
    auth/           # Authentication
    living-cv/      # Core profile (Living CV)
    projects/       # Structured projects
    skills/         # Skill evidence system
    portfolio/      # Portfolio generator
    resume/         # Resume generator
    jobs/           # Job matching
    applications/   # Dynamic applications
    recruiter/      # Recruiter dashboard
  generated/
    prisma/         # Prisma v7 generated client
  lib/
    server/         # Server-only code (Prisma, auth, etc.)
    components/     # Shared UI components
      ui/           # shadcn-svelte components
  hooks/            # SvelteKit hooks (auth session)
  routes/           # SvelteKit pages
    login/          # Login page
    register/       # Registration page
```

## Prisma Schema

Models: User, PersonalInfo, Education, WorkExperience, Project, Skill, SkillEvidence, Certification, Award, Language, Reference, SocialLink, Session

Relationships: All models belong to User via userId FK. SkillEvidence links skills to source entities (polymorphic via source/sourceId). Session is session-based auth with expiry.

## Auth Strategy

Session-based auth using Prisma Session model. Sessions tracked in DB with 30-day expiry. SHA-256 password hashing (ponytail: upgrade to bcrypt/argon2 before prod).

Hooks: `src/hooks.server.ts` validates session token from cookie on every request and sets `event.locals.user`.

Pages: `/login` and `/register` with form validation and redirect to `/living-cv`.

## Installed shadcn-svelte Components

- Button, Card, Input, Label, Badge, Dialog, DropdownMenu

## Design Principles

- Living CV is the single source of truth — no duplicated data
- Everything references IDs, not duplicated text
- Feature-based folder structure (not file-type based)
- Type-safe everywhere
- Minimal dependencies (ponytail mode)

## Active Feature

Auth scaffolding complete. Ready to implement Living CV feature.

## Next Steps

1. Implement Living CV feature:
   - CRUD API for PersonalInfo, Education, WorkExperience, Certifications, Awards, Languages, References, SocialLinks
   - Living CV dashboard page (section-based layout)
   - Inline editing with autosave
   - Skill management with evidence
2. Initialize shadcn-svelte form components
3. Set up project seeding/data
