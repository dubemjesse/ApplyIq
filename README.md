# ApplyIQ

**Search less. Land more.**

An AI-powered job search automation agent: it scrapes job listings, scores
them against your profile, generates tailored CVs and cover letters, tracks
applications through a Kanban pipeline, schedules follow-up emails, and can
run the whole workflow — scrape → match → generate → notify — on a schedule
or on demand via a master orchestration agent.

**Status: feature-complete.** Every phase of the original build order is
implemented and verified end-to-end (see [Build Order](#build-order)).
Deployment is documented in [`DEPLOY.md`](DEPLOY.md) but not carried out —
that needs your cloud account.

---

## Features

- **Authentication & profile** — JWT-based signup/login, skills/preferences/target-role
  profile builder, PDF resume upload with automatic parsing into structured data
- **Job scraping & aggregation** — Greenhouse and Lever scraped directly (public,
  ToS-clean APIs); LinkedIn/Indeed/Glassdoor sourced via a licensed RapidAPI
  aggregator; results deduplicated by URL
- **AI job matching** — each listing scored 0–100 against your profile with
  Claude, plus plain-language reasoning and a list of concrete skill gaps
- **AI document generation** — tailored, ATS-optimized CV and cover letter per
  job, exported as real PDF and DOCX files
- **Application tracker** — drag-and-drop Kanban board (Saved → Applied →
  Interview → Offer → Rejected) with notes and contact info per card
- **Follow-up scheduler** — AI-drafted follow-up emails, scheduled and sent
  asynchronously via a Redis-backed queue, independent of the API/cron cycle
- **Master orchestration agent** — one-click or scheduled run that chains
  scrape → match → surface top 10 → generate CVs for top 3 → email digest,
  with full run history and per-step logging
- **Insights dashboard** — application funnel, weekly activity trend, skills
  gap analysis, and top hiring companies, all charted with a validated,
  colorblind-safe palette
- **Admin panel** — user management (role promotion, deletion), cross-user
  agent run log, scraping health, and usage stats

## Design

- **Palette** — dark navy `#020B18` background, electric blue `#378ADD` and
  lime green `#97C459` accents; dashboard charts use a separately validated
  5-color categorical palette (see `client/src/utils/chartColors.js`)
- **Typeface** — Inter
- **Style** — dark-mode-only, minimal, dashboard-first, responsive down to
  mobile (collapsible drawer navigation below the `lg` breakpoint)

---

## Tech Stack

| Layer | Choices |
|---|---|
| Frontend | React 19 (Vite), Tailwind CSS v4, React Router, TanStack Query, React Hook Form, `@hello-pangea/dnd`, Recharts |
| Backend | Node.js, Express 5, PostgreSQL, Prisma ORM, Bull + Redis, Puppeteer, JWT |
| AI | Anthropic Claude (`claude-opus-4-8`) — job matching, CV/cover-letter generation, follow-up email drafting |
| Documents | PDFKit (PDF), `docx` (DOCX) |
| Email | Nodemailer (any SMTP provider, e.g. SendGrid) |
| DevOps | Docker Compose (5 services: postgres, redis, server, worker, client) |

> Job sourcing note: LinkedIn and Indeed prohibit scraping in their ToS and
> run aggressive bot-detection, so ApplyIQ sources those via **RapidAPI's
> JSearch** (a licensed aggregator) instead of scraping them directly.
> Greenhouse and Lever expose public, ToS-clean job-board APIs and are
> scraped directly. See `server/services/adapters/`.

---

## Project Structure

```
applyiq/
├── client/                    # React frontend (Vite + Tailwind)
│   └── src/
│       ├── components/        # JobCard, KanbanBoard, CVPreview, AgentStatus, Layout,
│       │                      # charts (StatusBreakdownChart, WeeklyTrendChart, RankedBarChart),
│       │                      # FollowUpsPanel, LoadingSpinner, ErrorBoundary, TagInput
│       ├── pages/              # Dashboard, Jobs, Applications, Profile, Settings, Admin, Login, Register
│       ├── hooks/               # useJobs, useApplications, useAgent, useInsights, useAdmin, ...
│       ├── context/             # AuthContext
│       └── utils/               # api.js (axios instance), chartColors.js (validated palette)
├── server/                    # Express backend
│   ├── controllers/            # one per resource (auth, user, job, application, document,
│   │                            # followup, agent, insights, admin)
│   ├── routes/
│   ├── middleware/               # auth.js (JWT + role check), errorHandler.js, upload.js
│   ├── config/                    # jobSources.js (Greenhouse/Lever board tokens)
│   ├── prisma/
│   │   └── schema.prisma
│   ├── services/                  # scraper, matcher, generator, followupWriter,
│   │                               # followupDispatcher, emailService, scheduler, agent
│   ├── queues/                     # jobQueue.js (Bull + Redis, `npm run worker`)
│   └── index.js
├── docker-compose.yml
├── render.yaml                 # Render Blueprint (see DEPLOY.md)
├── DEPLOY.md
└── README.md
```

---

## Prerequisites

- Node.js 20+
- Docker Desktop (for Postgres + Redis, or the full stack)

> **Port note:** `docker-compose.yml` maps Postgres/Redis/server to host
> ports 5433/6380/5001 instead of the defaults 5432/6379/5000, to avoid
> colliding with other local services. Change them back in
> `docker-compose.yml` and `server/.env` if your machine is clear.

## Getting Started

### 1. Start Postgres & Redis

```bash
docker compose up -d postgres redis
```

Or run your own local Postgres 16 and Redis 7 and point `server/.env` at them.

### 2. Backend

```bash
cd server
cp .env.example .env    # fill in JWT_SECRET at minimum; see Environment Variables below
npm install
npm run prisma:migrate   # creates tables from prisma/schema.prisma
npm run dev               # http://localhost:5001
```

### 3. Background worker (follow-up emails)

Runs separately from the API server so a slow/failing SMTP send never
blocks a request or the cron tick:

```bash
cd server
npm run worker
```

### 4. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev    # http://localhost:5173, proxies /api to :5001
```

Visit `http://localhost:5173`, register an account, and you're in.

### 5. (Optional) Everything via Docker Compose

```bash
docker compose up --build
```

Brings up all 5 services: postgres, redis, server, worker, client.

---

## Environment Variables

Full lists in `server/.env.example` / `client/.env.example`. The app is
designed to degrade gracefully — every optional integration below returns a
clear `503` (not a crash) until configured.

| Variable | Required? | Purpose |
|---|---|---|
| `JWT_SECRET` | **Yes** | Signs auth tokens — any long random string |
| `DATABASE_URL`, `REDIS_URL` | **Yes** | Already set correctly for the Docker Compose setup |
| `ADMIN_EMAILS` | No | Comma-separated emails that get the `ADMIN` role automatically on registration — see [Bootstrapping an admin account](#bootstrapping-an-admin-account) |
| `ANTHROPIC_API_KEY` | No | Powers job matching, CV/cover-letter generation, and follow-up email drafting (Claude) |
| `RAPIDAPI_KEY` | No | Powers LinkedIn/Indeed/Glassdoor sourcing via JSearch — Greenhouse/Lever scraping works without it |
| `GREENHOUSE_BOARDS`, `LEVER_BOARDS` | No | Comma-separated company board tokens to scrape (sensible defaults included) |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | No | Required to actually send follow-up emails |

## Bootstrapping an admin account

There's no UI path to create the first admin — add their email to
`ADMIN_EMAILS` in `server/.env` **before** they register; the account gets
the `ADMIN` role automatically on sign-up. Existing admins can
promote/demote other users afterward from the Admin page.

---

## Database Schema

Defined in `server/prisma/schema.prisma`:

- **User** — profile, skills, preferences, parsed resume, role (`JOBSEEKER`/`ADMIN`)
- **JobListing** — scraped/aggregated postings, deduplicated by URL
- **Application** — per-user Kanban pipeline entry (Saved → Applied → Interview → Offer → Rejected), match score/reasoning, skill gaps, notes
- **GeneratedDocument** — AI-generated CV/cover-letter content per job
- **AgentRun** — orchestration agent execution log (status, counts, per-step log, error)
- **FollowUp** — scheduled follow-up emails per application

## API Surface

All routes except `/api/health`, `/api/auth/register`, and `/api/auth/login`
require a `Bearer` JWT. Admin routes additionally require the `ADMIN` role.

| Resource | Routes |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Profile | `GET/PUT /api/users/me`, `POST /api/users/me/resume` (PDF upload + parse) |
| Jobs | `GET /api/jobs`, `POST /api/jobs/scrape`, `POST /api/jobs/:id/match` |
| Applications | `GET/POST /api/applications`, `PATCH/DELETE /api/applications/:id` |
| Follow-ups | `GET/POST /api/applications/:id/followups`, `POST .../:followUpId/send-now`, `DELETE .../:followUpId` |
| Documents | `POST /api/documents/generate`, `GET /api/documents`, `GET /api/documents/:id/download?format=pdf\|docx` |
| Agent | `POST /api/agent/run`, `GET /api/agent/runs` |
| Insights | `GET /api/insights` |
| Admin | `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`, `DELETE /api/admin/users/:id`, `GET /api/admin/agent-runs`, `GET /api/admin/stats` |

---

## Build Order

1. ✅ Project setup
2. ✅ Authentication & profile (JWT, CV upload/parse)
3. ✅ Job scraping & aggregation engine
4. ✅ AI job matching engine
5. ✅ AI CV & cover letter generator
6. ✅ Application tracker (Kanban)
7. ✅ Scheduler & follow-up agent
8. ✅ Master orchestration agent
9. ✅ Insights dashboard
10. ✅ Admin panel (users, agent run log, scraping health, usage stats)
11. ✅ Polish (responsive nav, loading states, error boundary) & deployment prep — see [`DEPLOY.md`](DEPLOY.md)

## Author

**Jesse Odoh**

## License

Private project — not licensed for redistribution.

© 2026 Jesse Odoh. All rights reserved.
