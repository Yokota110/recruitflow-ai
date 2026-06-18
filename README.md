# RecruitFlow AI

Production-grade Applicant Tracking System (ATS) with AI-powered candidate intelligence, pipeline management, interview scheduling, and executive analytics. Built as a portfolio-quality monorepo demonstrating modern SaaS architecture patterns.

![RecruitFlow AI](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)

## Features

### AI Candidate Intelligence
- **Match Score (0–100)** with radial gauge visualization
- Score breakdown: skill overlap, experience, education, seniority
- AI-generated strengths, weaknesses, and hiring recommendation (Strong Hire → Reject)
- 5 personalized interview questions per application
- Deterministic intelligence engine (no external API required)

### Advanced Job Management
- Hiring manager, department, employment type, salary range, location type (Remote/Hybrid/Onsite)
- Job metrics: total applicants, active candidates, offers sent, hired count, conversion %
- 8-week pipeline trend chart (applied / advanced / hired)

### Pipeline Intelligence
- Kanban board with drag-and-drop stage transitions
- Candidate cards show match %, applied date, source, stage duration
- Color-coded match indicators (green / yellow / red)
- Stage history panel with recruiter attribution

### Interview Management
- Schedule interviews with candidate, job, stage, datetime, meeting URL, notes
- List and calendar views
- Structured feedback form: Communication, Technical Skills, Culture Fit, Recommendation (1–5)

### Recruiter Analytics
- Hiring funnel (Applied → Hired)
- Source performance (LinkedIn, Referral, Indeed, Careers Page, Agency)
- Time to hire, offer acceptance rate, recruiter performance, hiring velocity

### Executive Dashboard (V2)
- 6 KPI cards: Open Jobs, Active Candidates, Interviews This Week, Time to Hire, Offer Acceptance, Hiring Velocity
- Widgets: Hiring Funnel, Recent Applications, Upcoming Interviews, Top Recruiters, Top Sources

### Notification Center
- Real-time events: new application, interview scheduled, stage change, offer accepted/declined
- Bell icon with unread counter in header

## Architecture

```
RecruitFlow_AI/
├── apps/
│   ├── web/          # Next.js 15 frontend (App Router)
│   └── api/          # NestJS 10 REST API
├── packages/
│   └── shared/       # Shared enums, types, labels
├── docker-compose.yml
└── turbo.json
```

```mermaid
flowchart TB
  subgraph client [Frontend]
    Web[Next.js 15 + React 19]
  end

  subgraph server [Backend]
    API[NestJS API]
    AI[Intelligence Engine]
    Auth[JWT Auth]
  end

  subgraph data [Data Layer]
    PG[(PostgreSQL)]
    Prisma[Prisma ORM]
  end

  Web -->|REST + JWT| API
  API --> Prisma
  Prisma --> PG
  API --> AI
  API --> Auth
```

**Multi-tenant model:** Every resource is scoped to `organizationId`. JWT tokens carry user identity and organization context. Row-level isolation enforced at the service layer.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4, TanStack Query, Recharts, @dnd-kit |
| Backend | NestJS 10, Prisma, class-validator, JWT (passport-jwt) |
| Database | PostgreSQL 16 |
| Monorepo | pnpm workspaces, Turborepo |
| Shared | `@recruitflow/shared` package for enums and DTO types |

## Database Schema

Core models:

| Model | Purpose |
|-------|---------|
| `Organization` / `User` / `OrganizationMember` | Multi-tenant auth & roles |
| `Job` | Job postings with hiring manager, location type, salary |
| `Candidate` | Profiles with skills, experience, education |
| `Application` | Job-candidate link with pipeline stage & match score |
| `ApplicationStageHistory` | Pipeline drag-drop audit trail |
| `CandidateInsight` | AI match scores, strengths, weaknesses, recommendations |
| `Interview` / `InterviewFeedback` | Scheduling & structured evaluation |
| `Offer` | Offer tracking with acceptance status |
| `Notification` | In-app notification center |
| `AiAnalysis` | Legacy analysis records (backward compatible) |

```mermaid
erDiagram
  Organization ||--o{ Job : has
  Organization ||--o{ Candidate : has
  Job ||--o{ Application : receives
  Candidate ||--o{ Application : submits
  Application ||--o| CandidateInsight : analyzed_by
  Application ||--o{ ApplicationStageHistory : tracks
  Application ||--o{ Interview : schedules
  Interview ||--o| InterviewFeedback : evaluated_by
  Application ||--o| Offer : receives
  User ||--o{ Notification : receives
```

## Screenshots

> Run the app locally and capture screenshots for your portfolio. Key pages:
> - `/` — Executive Dashboard V2
> - `/candidates/[id]` — AI Intelligence panel with match gauge
> - `/jobs/[id]` — Job metrics & pipeline trend
> - `/pipeline` — Kanban with match color indicators
> - `/interviews` — Calendar view & feedback forms
> - `/analytics` — Executive analytics dashboards

## Installation

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL)

### 1. Clone & install

```bash
git clone https://github.com/your-org/recruitflow-ai.git
cd recruitflow-ai
pnpm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

PostgreSQL runs on port **5436** (mapped to avoid conflicts with local installations).

### 3. Configure environment

**`apps/api/.env`**
```env
DATABASE_URL=postgresql://recruitflow:recruitflow@localhost:5436/recruitflow
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Database setup

```bash
pnpm db:generate
pnpm db:migrate   # or: cd apps/api && npx prisma db push
pnpm db:seed
```

### 5. Run development servers

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Web app | http://localhost:3000 |
| API | http://localhost:3001 |

### Demo credentials

```
Email:    demo@recruitflow.ai
Password: demo1234
```

### Seed data

| Entity | Count |
|--------|-------|
| Jobs | 10 |
| Candidates | 100 |
| Applications | ~160 |
| AI Insights | ~60% of applications |
| Interviews | 65+ |
| Offers | 22 |
| Notifications | 15 |

## Scripts

```bash
pnpm dev          # Start web + api in dev mode
pnpm build        # Production build (all packages)
pnpm db:generate  # Regenerate Prisma client
pnpm db:migrate   # Run Prisma migrations
pnpm db:seed      # Seed demo data
pnpm db:studio    # Open Prisma Studio
```

## API Overview

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/login`, `GET /auth/me` |
| Jobs | CRUD, publish, pipeline, metrics |
| Candidates | CRUD, notes, skills |
| Applications | Create, move stage, history |
| AI | `POST /ai/analyze-resume`, `GET /ai/insights/:applicationId` |
| Interviews | CRUD, structured feedback |
| Analytics | Dashboard V2, funnel, sources, recruiters, velocity |
| Notifications | List, unread count, mark read |

## Design System

**Warm Obsidian** theme — dark sidebar (`#0F1419`), copper accent (`#E8653A`), linen background (`#EFEBE3`), Outfit + Source Sans 3 typography.

## Troubleshooting

### Login fails / "Cannot reach API server"

The frontend requires the NestJS API on **port 3001**. If `pnpm dev` crashed during hot-reload, restart:

```bash
# Stop existing processes, then:
docker compose up -d
pnpm db:seed          # if database was reset
pnpm dev
```

Verify API is up: open http://localhost:3001/api/v1/auth/login (should return 404 for GET, not connection refused).

Demo login: `demo@recruitflow.ai` / `demo1234`

### Next.js module errors (`Cannot find module './271.js'`)

```bash
rm -rf apps/web/.next
pnpm dev
```

## License

MIT — portfolio demonstration project.


