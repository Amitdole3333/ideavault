# IdeaVault — Development Guide

Quick reference for running, debugging, and extending the project.

---

## Run the app locally

### 1. Backend
```powershell
cd backend
npm install
npx prisma generate
npx prisma db push
# Copy backend/.env.example to .env and fill in values
npm run dev
```
Runs at **http://localhost:3001**

### 2. Frontend
```powershell
cd frontend
npm install
# Ensure .env.local has NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```
Runs at **http://localhost:3000**

### 3. (Optional) Smart contracts
```powershell
cd contracts
poetry install
# Deploy (after funding deployer + app account):
python deploy.py --network testnet --update-env
```

---

## Environment checklist

| Variable | Where | Purpose |
|----------|--------|---------|
| `ALGORAND_DEPLOYER_MNEMONIC` | backend/.env | 25-word Algorand testnet wallet |
| `ALGORAND_APP_ID` | backend/.env | Set after deploying contract (or use 755797073 if already deployed) |
| `PINATA_API_KEY` / `PINATA_SECRET_API_KEY` or `PINATA_JWT` | backend/.env | IPFS uploads |
| `JWT_SECRET` | backend/.env | Auth tokens |
| `DATABASE_URL` | backend/.env | SQLite: `file:./dev.db` |
| `NEXT_PUBLIC_API_URL` | frontend/.env.local | Backend URL, e.g. `http://localhost:3001` |

---

## Key URLs (local)

| What | URL |
|------|-----|
| App | http://localhost:3000 |
| API | http://localhost:3001 |
| Health (full) | http://localhost:3001/api/health/check |
| Health (Pinata) | http://localhost:3001/api/health/pinata |
| Health (Algorand) | http://localhost:3001/api/health/algorand |
| Funding info | http://localhost:3001/api/health/funding |
| Testnet dispenser | https://bank.testnet.algorand.network/ |

---

## Project layout (where to edit)

| Area | Path | Notes |
|------|------|--------|
| API routes | backend/src/routes/ | auth, ideas, messages, health |
| Algorand logic | backend/src/services/algorand.ts | register/verify idea on-chain |
| IPFS/Pinata | backend/src/services/ipfs.ts | upload JSON + file |
| DB schema | backend/prisma/schema.prisma | Then `npx prisma generate` |
| Frontend pages | frontend/app/ | App Router (Next.js) |
| API client | frontend/src/services/api.ts | Calls to backend |
| Smart contract | contracts/smart_contracts/idea_registry/ | AlgoKit Python |

---

## Common tasks

- **Add a new API route** — Create in `backend/src/routes/`, mount in `backend/src/index.ts`.
- **Add a DB field** — Edit `backend/prisma/schema.prisma`, run `npx prisma db push` (or migrate), then `npx prisma generate`.
- **Change blockchain call** — Edit `backend/src/services/algorand.ts` and/or contract in `contracts/`.
- **New frontend page** — Add under `frontend/app/`, use `frontend/src/services/api.ts` for API calls.
- **Debug “balance 0 below min”** — Fund app or deployer; see `/api/health/funding` and [bank.testnet.algorand.network](https://bank.testnet.algorand.network/).
- **Debug Pinata 429** — Backend retries; if it still fails, wait and retry (60 req/min on free tier).

---

## Testing

- **Backend:** No test script in root; you can add Jest/Vitest and run from `backend/`.
- **Contracts:** From `contracts/`: `poetry run pytest` (uses AlgoKit LocalNet).
- **Health checks:** Use the `/api/health/*` endpoints to verify Pinata and Algorand.

---

## Next feature ideas

1. **Investor shortlist** — UI for shortlist + notes (backend shortlist already exists).
2. **Pera Wallet connect** — Sign registration from wallet (optional; backend can still submit with deployer).
3. **Idea search/filters** — Use existing API params; add UI in frontend.
4. **Notifications** — When an investor messages or shortlists (e.g. polling or later WebSocket).
5. **Blockchain certificate PDF** — Generate from `blockchainProof` after registration.

Tell me what you want to work on next (e.g. “add shortlist UI” or “fix X”) and we can do it step by step.
