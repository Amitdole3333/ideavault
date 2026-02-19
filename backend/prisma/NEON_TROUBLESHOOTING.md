# Neon + Prisma P1001 "Can't reach database server"

## What we changed

1. **`directUrl`** — Prisma now uses `DIRECT_URL` for `db push` and migrations. Neon’s **direct** host (no `-pooler`) is often required for these commands.
2. **`.env`** — `DIRECT_URL` added (host without `-pooler`). Get the exact **Direct connection** string from the Neon dashboard if needed.

## If it still fails

### 1. Wake the database (free tier)

Neon can **suspend** the project after inactivity.

- Open [Neon Console](https://console.neon.tech), select your project.
- If it says suspended/paused, open the project or run a query to wake it.
- Wait a minute, then run `npx prisma db push` again.

### 2. Use the exact strings from Neon

- In Neon: **Connection details** (or **Dashboard** → your project).
- Copy the **Direct connection** string (not pooled) into `DIRECT_URL` in `.env`.
- Copy the **Pooled connection** string into `DATABASE_URL` in `.env`.
- Ensure both have `?sslmode=require` (or whatever Neon shows).

### 3. Network / firewall

- **Corporate network / school** may block port 5432 or cloud DBs. Try from another network or a VPN.
- From PowerShell:  
  `Test-NetConnection -ComputerName ep-shiny-haze-aiiat88p.c-4.us-east-1.aws.neon.tech -Port 5432`  
  If it fails, the host is unreachable from your machine.

### 4. Run again

```powershell
cd backend
npx prisma generate
npx prisma db push
```

If `DIRECT_URL` is wrong, get the **Direct** (non-pooler) URL from Neon and set it in `.env` as `DIRECT_URL`.
