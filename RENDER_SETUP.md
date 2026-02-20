# Deploy Backend on Render — Quick Setup

The backend is configured for Render (Node 20, Prisma + Neon, health check). After pushing this repo to GitHub, deploy as follows.

---

## 1. Create Web Service on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect your **GitHub** account and select the **ideavault** repo.
3. **Name:** `ideavault-api` (or any name).
4. **Root Directory:** `backend` (required — app lives in this folder).
5. **Runtime:** Node (Render will use Node 20 from `backend/.node-version`).
6. **Build Command:** Type or paste exactly (use straight quotes only, no “smart” quotes):
   ```
   npm install && npm run build
   ```
   *(Do not use: `npm install && npx prisma generate && npm run build` — our `npm run build` already runs Prisma generate.)*
7. **Start Command:** `npm start`
8. **Release Command:** `npx prisma db push --skip-generate`
9. **Health Check Path:** `/health`

**If you see “unexpected EOF while looking for matching '''”:** Re-type the Build Command in Render (do not copy from Word/rich text). Use only the line above.
10. **Instance type:** Free (or paid if you prefer).

---

## 2. Environment Variables

In **Environment** → **Add Environment Variable**, add:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | *(generate a long random string for production)* |
| `JWT_EXPIRES_IN` | `7d` |
| `DATABASE_URL` | Your **Neon pooled** URL (with `-pooler` in host) |
| `DIRECT_URL` | Your **Neon direct** URL (host *without* `-pooler`) — **required** for Prisma migrations / `db push` |
| `ALGORAND_NETWORK` | `testnet` |
| `ALGORAND_NODE_URL` | `https://testnet-api.algonode.cloud` |
| `ALGORAND_INDEXER_URL` | `https://testnet-idx.algonode.cloud` |
| `ALGORAND_APP_ID` | `755797073` (or your app ID) |
| `ALGORAND_DEPLOYER_MNEMONIC` | Your 25-word mnemonic |
| `PINATA_API_KEY` | Your Pinata API key |
| `PINATA_SECRET_API_KEY` | Your Pinata secret (or use `PINATA_JWT`) |
| `PINATA_GATEWAY` | `https://gateway.pinata.cloud` |
| `FRONTEND_URL` | Your Vercel frontend URL (e.g. `https://ideavault.vercel.app`) — set after deploying frontend |

**Do not** set `PORT` — Render sets it automatically.

---

## 3. Deploy

Click **Create Web Service**. Render will:

1. Clone the repo
2. Run **Build:** `npm install && npm run build` (includes `prisma generate`)
3. Run **Release:** `npx prisma db push --skip-generate` (syncs schema to Neon using `DIRECT_URL`)
4. Run **Start:** `npm start`
5. Health check on `/health`

---

## 4. After deploy

- Copy the service URL (e.g. `https://ideavault-api.onrender.com`).
- Use it as **`NEXT_PUBLIC_API_URL`** in your Vercel frontend.
- Set **`FRONTEND_URL`** on Render to your Vercel URL and **Save** (then redeploy if needed) so CORS works.

---

## Optional: Use Blueprint (`render.yaml`)

If you use **New +** → **Blueprint** and connect the repo, Render will read `render.yaml` and create the web service with the settings above. You still need to add all **Environment** variables in the Render dashboard.

---

## Backend “ready for Render” checklist

- **Root:** `backend/` (monorepo)
- **Node:** 20 (via `backend/.node-version` and `NODE_VERSION` in Blueprint)
- **Build:** `npm install && npm run build` (includes `tsc` + `prisma generate`)
- **Release:** `npx prisma db push --skip-generate` (Neon via `DIRECT_URL`)
- **Start:** `npm start` → `node dist/index.js`
- **Health:** `GET /health` and `GET /` return 200
- **Listen:** `0.0.0.0` so Render can reach the server
- **Prisma:** `directUrl` set in `schema.prisma` for Neon migrations
