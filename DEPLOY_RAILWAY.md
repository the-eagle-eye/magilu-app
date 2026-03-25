# Railway Deployment Guide — Magilu App

---

## Before You Start — Understand the Problem

Your app has **two things that must survive container restarts and deploys**:

1. **SQLite database** → written to `/app/prisma/data/prod.db`
2. **Uploaded images** → written to `process.cwd()/public/uploads` (which becomes `/app/public/uploads` inside the container)

The upload path is **hardcoded in 5 files** and points inside the container's ephemeral filesystem. Every deploy wipes it. We must fix this before deploying.

Additionally, `docker-entrypoint.sh` only creates the DB directory, not the uploads directory.

---

## Phase 1 — Code Changes (Required Before Deploy)

### Step 1 — Add an `UPLOAD_DIR` environment variable helper

Create a new file `lib/upload-dir.ts`:

```typescript
import path from 'path'

export function getUploadDir(subdir?: string): string {
  const base = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'public', 'uploads')
  return subdir ? path.join(base, subdir) : base
}
```

This means:
- **Locally**: `UPLOAD_DIR` is not set → files go to `public/uploads` as before, nothing breaks
- **On Railway**: `UPLOAD_DIR=/app/data/uploads` → files go to the persistent volume

---

### Step 2 — Update the 5 files that use the upload path

**`app/uploads/[...path]/route.ts`** — serves files:

```typescript
// Replace line 19:
// const filePath = path.join(process.cwd(), 'public', 'uploads', ...segments)
// With:
import { getUploadDir } from '@/lib/upload-dir'
const filePath = path.join(getUploadDir(), ...segments)
```

**`app/api/zapatos/route.ts`** — line 57:

```typescript
// Replace:
// const uploadDir = path.join(process.cwd(), 'public', 'uploads')
// With:
import { getUploadDir } from '@/lib/upload-dir'
const uploadDir = getUploadDir()
```

**`app/api/zapatos/[id]/fotos/route.ts`** — line 11:

```typescript
// Same change as above
import { getUploadDir } from '@/lib/upload-dir'
const uploadDir = getUploadDir()
```

**`app/api/mantenimiento/marcas/route.ts`** — line 25:

```typescript
// Replace:
// const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'marcas')
// With:
import { getUploadDir } from '@/lib/upload-dir'
const uploadsDir = getUploadDir('marcas')
```

**`app/api/mantenimiento/marcas/[id]/route.ts`** — line 30:

```typescript
// Same change as above
import { getUploadDir } from '@/lib/upload-dir'
const uploadsDir = getUploadDir('marcas')
```

---

### Step 3 — Update `docker-entrypoint.sh`

```sh
#!/bin/sh
set -e

# Ensure DB directory exists (on the persistent volume)
mkdir -p /app/prisma/data

# Ensure uploads directory exists (on the persistent volume)
if [ -n "$UPLOAD_DIR" ]; then
  mkdir -p "$UPLOAD_DIR"
  mkdir -p "$UPLOAD_DIR/marcas"
fi

# Run migrations
echo "Running database migrations..."
node_modules/.bin/prisma migrate deploy

# Seed if DB is empty
SHOE_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.shoe.count().then(n => { console.log(n); prisma.\$disconnect(); });
" 2>/dev/null || echo "0")

if [ "$SHOE_COUNT" = "0" ]; then
  echo "Database is empty, ready for data."
fi

echo "Starting server..."
exec node server.js
```

---

### Step 4 — Create `railway.toml`

Create this file at the project root:

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "./docker-entrypoint.sh"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[[deploy.healthcheck]]
type = "http"
path = "/"
initialDelaySeconds = 30
periodSeconds = 10
timeoutSeconds = 5
failureThreshold = 3
```

---

### Step 5 — Add entries to `.gitignore`

Make sure these are present:

```
# Local DB data (never commit the SQLite file)
prisma/data/
data/

# Railway
.railway/
```

---

### Step 6 — Commit everything

```bash
git add lib/upload-dir.ts railway.toml docker-entrypoint.sh
git add app/uploads/ app/api/zapatos/ app/api/mantenimiento/
git commit -m "feat: prepare app for Railway deployment with persistent volume support"
git push origin main
```

---

## Phase 2 — Railway Account Setup

### Step 7 — Create a Railway account

Go to [railway.app](https://railway.app) and sign up with your **GitHub account**.

Select the **Hobby plan ($5/mo)**. You must be on Hobby or higher to use persistent volumes.

---

### Step 8 — Create a new Project

1. Dashboard → **New Project**
2. Select **Deploy from GitHub repo**
3. Authorize Railway to access your GitHub account if prompted
4. Find and select the `magilu-app` repository
5. Railway detects your `Dockerfile` automatically
6. **Do not click Deploy yet** — configure the volume and env vars first

---

## Phase 3 — Volume Setup

### Step 9 — Create the persistent volume

This is the most critical step. The volume keeps your data alive across deploys.

1. Click on your **service** in the Railway project
2. Go to the **Volumes** tab
3. Click **Add Volume**
4. Set **Mount Path** to: `/app/data`
5. Set size to **5 GB** (~$1.25/mo)
6. Click **Create**

Your data layout on the volume will be:

```
/app/data/
  ├── db/
  │    └── prod.db         ← SQLite database
  └── uploads/
       ├── (shoe photos)
       └── marcas/
            └── (brand logos)
```

---

## Phase 4 — Environment Variables

### Step 10 — Set all environment variables

Go to your service → **Variables** tab and add:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `file:/app/data/db/prod.db` | Points SQLite to the volume |
| `UPLOAD_DIR` | `/app/data/uploads` | Points uploads to the volume |
| `NEXTAUTH_SECRET` | *(generate one — see below)* | Auth signing secret |
| `NEXTAUTH_URL` | `https://your-app.up.railway.app` | Update after Step 13 |
| `ADMIN_EMAIL` | `admin@magilu.com` | Your admin email |
| `ADMIN_PASSWORD_HASH` | *(your bcrypt hash)* | Same as your local setup |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Your Anthropic API key |
| `DOCKER_BUILD` | `1` | Enables standalone Next.js output |
| `NODE_ENV` | `production` | |

**Generate `NEXTAUTH_SECRET`:**
```bash
openssl rand -base64 32
```

> `NEXTAUTH_URL` will be updated in Step 13 once Railway gives you a subdomain.
> Put a placeholder for now so the deploy does not fail on startup.

---

## Phase 5 — First Deploy

### Step 11 — Trigger the first deploy

1. Go to **Deployments** tab → click **Deploy**
   (or push a commit to `main` — Railway auto-deploys on every push)
2. Click the deployment to watch **build logs**

**What happens during build:**
```
FROM node:20.20.1-bookworm-slim
installing python, make, g++ for native deps...
npm ci
npx prisma generate
npm run build  ← Next.js standalone build
```

**What happens on startup:**
```
mkdir -p /app/data/uploads
mkdir -p /app/data/uploads/marcas
Running database migrations...   ← prisma migrate deploy
Starting server...                ← node server.js
```

> The first build takes **5–10 minutes** due to heavy native dependencies
> (`@imgly/background-removal-node`, `sharp`). Subsequent deploys are faster
> because Railway caches Docker layers.

---

### Step 12 — Common first-deploy errors

| Error | Fix |
|---|---|
| `DATABASE_URL` not set or wrong path | Check Variables tab, verify volume is mounted at `/app/data` |
| `NEXTAUTH_SECRET` missing | Add it in Variables tab |
| Prisma migration fails | Go to Volumes tab, verify mount path is `/app/data` exactly |
| Build fails on `@imgly` | Check that `apt-get install python3 make g++` ran in build logs |

---

## Phase 6 — Post-Deploy Configuration

### Step 13 — Get your Railway URL

1. Service → **Settings** tab → **Networking** section
2. Click **Generate Domain**
3. Copy the URL: `https://magilu-app-production.up.railway.app`
4. Go to **Variables** tab → update `NEXTAUTH_URL` with this URL
5. Railway redeploys automatically with the new variable

This URL is permanent and fully functional. You do not need a custom domain.

---

### Step 14 — Seed the database (if needed)

Install the Railway CLI and run the seed script:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project (run from the project root)
railway link

# Run seed
railway run npm run seed
```

---

### Step 15 — Verify everything works

Test in this order:

1. **App loads** — visit your Railway URL, login page appears
2. **Login works** — sign in with admin credentials
3. **View shoes** — inventory list loads from SQLite
4. **Upload a photo** — add a shoe with a photo, verify it displays
5. **AI label scan** — test the Anthropic-powered label scanner
6. **Reload the page** — photos still there (proves volume is working)
7. **Trigger a redeploy** — Railway → Deployments → Redeploy. After it finishes, verify data is still there (proves volume survives deploys)

---

## Phase 7 — Ongoing Operations

### How deploys work going forward

Every `git push origin main` → Railway automatically:

1. Detects the push via GitHub webhook
2. Builds a new Docker image
3. Runs your entrypoint (migrations run every deploy — safe, idempotent)
4. Swaps old container for new one
5. Your data volume stays mounted throughout

### Monitoring

| What | Where |
|---|---|
| Real-time logs | Service → **Logs** tab |
| CPU / RAM usage | Service → **Metrics** tab |
| Disk usage | Service → **Volumes** tab |

### Backups

Railway volumes do not have automatic backups on the Hobby plan.
Download your database locally anytime with:

```bash
railway run -- cat /app/data/db/prod.db > backup-$(date +%Y%m%d).db
```

---

## Summary of All Files Changed

| File | Change |
|---|---|
| `lib/upload-dir.ts` | New — makes upload path configurable via env var |
| `app/uploads/[...path]/route.ts` | Use `getUploadDir()` instead of hardcoded path |
| `app/api/zapatos/route.ts` | Use `getUploadDir()` |
| `app/api/zapatos/[id]/fotos/route.ts` | Use `getUploadDir()` |
| `app/api/mantenimiento/marcas/route.ts` | Use `getUploadDir('marcas')` |
| `app/api/mantenimiento/marcas/[id]/route.ts` | Use `getUploadDir('marcas')` |
| `docker-entrypoint.sh` | Create uploads dir on volume at startup |
| `railway.toml` | New — Railway deployment configuration |
