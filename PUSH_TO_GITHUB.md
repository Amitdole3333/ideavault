# Push IdeaVault to GitHub

Follow these steps to put your project on GitHub.

---

## 1. Create a new repository on GitHub

1. Go to [github.com](https://github.com) and sign in.
2. Click **"+"** (top right) → **"New repository"**.
3. Set:
   - **Repository name:** `ideavault` (or any name you like).
   - **Description:** e.g. `Blockchain-powered startup idea registry on Algorand`.
   - **Public** (or Private if you prefer).
   - **Do not** check "Add a README" (you already have one).
4. Click **"Create repository"**.

---

## 2. Initialize Git and push (first time)

Open a terminal in the project folder and run:

```powershell
cd c:\Users\amitd\.gemini\antigravity\scratch\ideavault

# Initialize git (if not already)
git init

# Add all files (respects .gitignore)
git add .

# First commit
git commit -m "Initial commit: IdeaVault - Algorand idea registry"

# Add your GitHub repo as remote (replace YOUR_USERNAME and REPO_NAME with yours)
git remote add origin https://github.com/YOUR_USERNAME/ideavault.git

# Push (main branch)
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username and `ideavault` with your repo name if different.

---

## 3. If the repo already has a remote

If you already ran `git init` and added a remote:

```powershell
git add .
git commit -m "Your message"
git push -u origin main
```

---

## 4. What is NOT pushed (safe)

Thanks to `.gitignore`, these are **not** uploaded:

- `.env` and `.env.local` (secrets, API keys, mnemonics)
- `node_modules/`
- `.next/`, `build/`
- `*.db` (SQLite database)
- `.venv/` (Python virtual env)
- IDE and OS junk files

So your Pinata keys, Algorand mnemonic, and JWT secret stay only on your machine.

---

## 5. After pushing

- Clone on another machine: `git clone https://github.com/YOUR_USERNAME/ideavault.git`
- Then copy `.env` and `.env.local` manually (or use a secrets manager); never commit them.

Need a step tailored to your GitHub username/repo name? Share them and we can fill in the exact commands.
