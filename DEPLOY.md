# Deploying ApplyIQ

ApplyIQ has five moving parts in production: the API server, a background
worker (Bull queue — follow-up emails), Postgres, Redis, and the static
frontend build. This guide covers both Render and Railway. **I can't deploy
this for you** — it needs your cloud account and billing — but everything
below is set up to make the actual deploy a short, mostly point-and-click
process.

## Before you deploy, decide

- **AI features** (`ANTHROPIC_API_KEY`), **email** (`SMTP_*`), and
  **LinkedIn/Indeed/Glassdoor sourcing** (`RAPIDAPI_KEY`) all degrade
  gracefully to a clear `503` when unset — you can deploy without them and
  add them later without breaking anything else.
- **First admin**: set `ADMIN_EMAILS` *before* that person registers on the
  deployed app (see the main README's "Bootstrapping an admin account").
- **Chicken-and-egg URLs**: the server needs the client's URL (for CORS,
  via `CLIENT_URL`) and the client needs the server's URL baked in at build
  time (`VITE_API_URL`, since Vite env vars are compile-time, not runtime).
  Deploy the server first, note its URL, deploy the client with that URL,
  then go back and set `CLIENT_URL` on the server and restart it.

---

## Option A: Render (blueprint — recommended, least manual setup)

1. Push this repo to GitHub (if you haven't already).
2. In the [Render dashboard](https://dashboard.render.com), click **New >
   Blueprint** and point it at the repo. Render reads [`render.yaml`](render.yaml)
   at the repo root and proposes 5 resources: `applyiq-postgres` (managed
   DB), `applyiq-redis`, `applyiq-server` (web service, Docker), `applyiq-worker`
   (background worker, same image, different command), and `applyiq-client`
   (static site).
3. Render will pause on every env var marked `sync: false` in `render.yaml`
   — fill in the ones you want (all optional except `CLIENT_URL` and
   `VITE_API_URL`, which you'll set in step 4-5 below since you don't have
   the URLs yet).
4. Deploy. Once `applyiq-server` is live, copy its URL (e.g.
   `https://applyiq-server.onrender.com`).
5. Set `applyiq-client`'s `VITE_API_URL` env var to that server URL, then
   trigger a redeploy of the static site (env var changes require a rebuild
   for static sites, since Vite bakes them in at build time).
6. Copy the client's URL and set it as `CLIENT_URL` on `applyiq-server`,
   then restart that service.
7. Run the initial migration once, from your machine, pointed at the
   production `DATABASE_URL` (copy it from the Render Postgres dashboard):
   ```bash
   cd server
   DATABASE_URL="<production-connection-string>" npx prisma migrate deploy
   ```
   (`migrate deploy`, not `migrate dev` — it doesn't prompt and doesn't
   create a shadow database, which is what you want against a live DB.)

Render's free tier works for a demo but free web services sleep after
inactivity — the first request after idle will be slow (cold start).

---

## Option B: Railway

Railway doesn't have as strict a one-file blueprint format as Render, so
this is dashboard-driven — still quick:

1. Push this repo to GitHub.
2. **New Project > Deploy from GitHub repo**, select this repo.
3. Railway will detect a Dockerfile at the repo root and fail to find one —
   that's expected, this repo has per-service Dockerfiles. Delete the
   auto-created service and instead add three separately:
   - **New > GitHub Repo** again, set **Root Directory** to `server`. This
     is `applyiq-server` — Railway will build `server/Dockerfile`
     automatically. Under **Settings > Networking**, generate a public
     domain and note it.
   - **New > GitHub Repo** again, same repo, **Root Directory** `server`,
     but override the **Start Command** to `npm run worker` under
     **Settings > Deploy**. This is `applyiq-worker` — no public domain
     needed, it doesn't serve HTTP.
   - **New > GitHub Repo** again, **Root Directory** `client`. Railway
     builds `client/Dockerfile`, which runs `vite --host` — fine for a
     demo; for a leaner static deploy, override the **Start Command** to
     `npm run build && npx serve -s dist -l $PORT` instead (add `serve` as
     a client devDependency first, or use `npx serve`, which works
     without installing it).
4. **New > Database > Add PostgreSQL** and **New > Database > Add Redis** —
   Railway provisions both and exposes `DATABASE_URL`/`REDIS_URL`-shaped
   variables you can reference in each service's env vars via Railway's
   variable-reference syntax (`${{Postgres.DATABASE_URL}}`, etc.).
5. On `applyiq-server` and `applyiq-worker`, set the same env vars listed
   in `server/.env.example`, pointing `DATABASE_URL`/`REDIS_URL` at the
   Railway-provisioned services via variable references. Set `PORT=5000`
   explicitly on the server (Railway sets its own `$PORT` — Express reads
   `process.env.PORT`, so either works, but be explicit to avoid surprises).
6. On `applyiq-client`, set `VITE_API_URL` to the server's public domain
   from step 3.
7. Once the server has a domain, set `CLIENT_URL` on the server to the
   client's public domain (from step 3) so CORS allows it.
8. Run the migration once against production, same as the Render
   instructions above:
   ```bash
   cd server
   DATABASE_URL="<railway-connection-string>" npx prisma migrate deploy
   ```

---

## Either platform: post-deploy checklist

- [ ] `npx prisma migrate deploy` run against the production database
- [ ] `CLIENT_URL` on the server matches the deployed client's real URL (CORS)
- [ ] `VITE_API_URL` baked into the client build matches the deployed server's real URL
- [ ] `JWT_SECRET` is a real random value, not the dev placeholder
- [ ] `ADMIN_EMAILS` set before the first admin registers
- [ ] Visit `/api/health` on the deployed server — should return `{"status":"ok",...}`
- [ ] Register an account on the deployed client and confirm login/dashboard load
- [ ] If you want AI features, email, or RapidAPI sourcing live: add
      `ANTHROPIC_API_KEY` / `SMTP_*` / `RAPIDAPI_KEY` to **both** the server
      and worker services (the worker needs `SMTP_*` and `ANTHROPIC_API_KEY`
      too, since it sends the actual follow-up emails)
