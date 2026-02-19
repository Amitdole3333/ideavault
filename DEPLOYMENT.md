# IdeaVault — Deployment Guide

Deploy the **frontend** (Next.js) and **backend** (Express) to production. The Algorand contract and Pinata stay as-is (testnet + your keys).

**Repo structure:** Frontend is in `frontend/`, backend in `backend/`. When connecting to Vercel or Railway, set the **root directory** to `frontend` or `backend` so each service builds from the right folder.

---

## Overview

| Part | Where to deploy | Notes |
|------|-----------------|--------|
| **Frontend** | Vercel | Best for Next.js, free tier |
| **Backend** | Railway or Render | Node.js, env vars, optional DB |
| **Database** | SQLite (file) or switch to Postgres | Railway/Render can give you Postgres |
| **Blockchain** | Already on Algorand Testnet | Use same `ALGORAND_APP_ID` |
| **IPFS** | Pinata (unchanged) | Same keys |

---

## 1. Deploy backend (Railway or Render)

### Option A: Railway

1. Go to [railway.app](https://railway.app), sign in with GitHub.
2. **New Project** → **Deploy from GitHub repo** → select your `ideavault` repo.
3. **Root directory:** set to `backend` (so it runs the Node app).
4. **Settings** → **Variables** — add all env vars (see list below).  
   - Set `NODE_ENV=production`, `PORT` is usually set by Railway (e.g. `3001` or use `PORT` they provide).
5. **Build command:** `npm install && npx prisma generate && npm run build`
6. **Start command:** `npx prisma db push && npm start`
7. **Database:** For persistence, add Railway **Postgres** and set `DATABASE_URL` to the Postgres URL.  
   - If you keep SQLite, use a **volume** for the path where `dev.db` lives so data persists.
8. Deploy. Copy the public URL (e.g. `https://your-app.up.railway.app`).

### Option B: Render (recommended — uses `render.yaml`)

1. Go to [render.com](https://render.com), sign in with GitHub.
2. **New** → **Blueprint** (or **Web Service**). Connect your `ideavault` repo.
3. If using **Blueprint:** Render reads `render.yaml` at repo root. It will create a web service with **Root directory:** `backend`, **Build:** `npm install && npm run build`, **Start:** `npm start`, **Release command:** `npx prisma db push --skip-generate`, **Health check path:** `/health`.
4. If creating a **Web Service** manually: set **Root directory** to `backend`, **Build command** to `npm install && npm run build`, **Start command** to `npm start`, **Release command** to `npx prisma db push --skip-generate`, **Health check path** to `/health`.
5. **Environment** → add all variables (see table below). For Neon you need both **`DATABASE_URL`** (pooled) and **`DIRECT_URL`** (direct, for release command).
6. Deploy. Copy the service URL (e.g. `https://ideavault-api.onrender.com`).

### Backend environment variables (production)

Set these in the host’s dashboard (Railway/Render):

| Variable | Example / note |
|----------|-----------------|
| `NODE_ENV` | `production` |
| `PORT` | Usually set by host (e.g. `3001` or `PORT`) |
| `JWT_SECRET` | Long random string (generate new for production) |
| `JWT_EXPIRES_IN` | `7d` |
| `DATABASE_URL` | **PostgreSQL (Neon pooled):** `postgresql://USER:PASSWORD@HOST-POOLER/DB?sslmode=require` |
| `DIRECT_URL` | **Neon direct** (for Render release / migrations): `postgresql://USER:PASSWORD@HOST/DB?sslmode=require` (host *without* `-pooler`) |
| `ALGORAND_NETWORK` | `testnet` |
| `ALGORAND_NODE_URL` | `https://testnet-api.algonode.cloud` |
| `ALGORAND_INDEXER_URL` | `https://testnet-idx.algonode.cloud` |
| `ALGORAND_APP_ID` | Your deployed app ID (e.g. `755797073`) |
| `ALGORAND_DEPLOYER_MNEMONIC` | Your 25-word mnemonic (keep secret) |
| `PINATA_API_KEY` | Your Pinata key |
| `PINATA_SECRET_API_KEY` or `PINATA_JWT` | Your Pinata secret or JWT |
| `PINATA_GATEWAY` | `https://gateway.pinata.cloud` |
| `FRONTEND_URL` | Your deployed frontend URL (e.g. `https://ideavault.vercel.app`) |

---

## 2. Deploy frontend (Vercel)

1. Go to [vercel.com](https://vercel.com), sign in with GitHub.
2. **Add New** → **Project** → import your `ideavault` repo.
3. **Root directory:** leave as repo root, or set to `frontend` if you want.
4. **Framework:** Vercel should detect Next.js.
5. **Build command:** `cd frontend && npm install && npm run build`  
   (or if root is `frontend`: `npm run build`)
6. **Output directory:** `frontend/.next` (or default if root is `frontend`).
7. **Environment variables:**
   - `NEXT_PUBLIC_API_URL` = your **backend URL** (e.g. `https://your-app.up.railway.app` or `https://ideavault-api.onrender.com`)
8. Deploy. Copy the frontend URL (e.g. `https://ideavault.vercel.app`).

### Update backend CORS

After the frontend is live, set **`FRONTEND_URL`** on the backend to that URL (e.g. `https://ideavault.vercel.app`) and redeploy the backend so CORS allows the frontend.

---

## 3. Database in production

- **SQLite:** Works if the host gives you a **persistent disk** (e.g. Railway volume). Point `DATABASE_URL` to a path on that volume (e.g. `file:./data/dev.db`) and run `prisma db push` on startup.
- **Postgres (recommended for Railway/Render):** Create a Postgres service, set `DATABASE_URL` to its URL, and run:
  - `npx prisma migrate deploy` (after adding a migration for Postgres if needed), or
  - `npx prisma db push` if you’re not using migrations yet.

---

## 4. Checklist after deploy

- [ ] Backend health: open `https://YOUR_BACKEND_URL/api/health/check`
- [ ] Frontend: open your Vercel URL and log in / register
- [ ] Register an idea and confirm it hits the backend and blockchain
- [ ] Backend `FRONTEND_URL` and CORS list include your Vercel URL
- [ ] No `.env` or secrets committed to GitHub (use host’s env vars only)

---

## 5. Optional: run backend with Docker

If your host supports Docker, use the repo’s `backend/Dockerfile`. Build context: `backend/`. Start command: `npm start` (after `prisma generate` and `prisma db push` in the image or at startup).

---

## Quick reference

| Step | Action |
|------|--------|
| 1 | Deploy backend (Railway or Render), set env vars, copy backend URL |
| 2 | Deploy frontend (Vercel), set `NEXT_PUBLIC_API_URL` = backend URL |
| 3 | Set backend `FRONTEND_URL` = Vercel URL, redeploy backend |
| 4 | Test health and registration flow |

If you tell me your choice (e.g. “Railway + Vercel” or “Render + Vercel”), I can give you exact clicks and commands for that stack.
