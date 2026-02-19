# IdeaVault 🛡️

> **Blockchain-Powered Startup Idea Registry & Investor Connection Platform**  
> Built on **Algorand Testnet** using **AlgoKit** | RIFT Hackathon Submission

[![Algorand](https://img.shields.io/badge/Algorand-Testnet-blue)](https://testnet.algoexplorer.io)
[![AlgoKit](https://img.shields.io/badge/AlgoKit-v2-green)](https://github.com/algorandfoundation/algokit-cli)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🎯 Problem Statement

Startup founders face a critical gap: **no verifiable, immutable record of when their idea was conceived and by whom.** This leads to:
- Idea theft with no proof of prior art
- Disputes over IP ownership  
- Lack of trust between founders and investors
- No transparent verification mechanism for investors

**IdeaVault solves this with Algorand blockchain.**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│              Next.js 14 (TypeScript + Tailwind)                 │
│     Pera Wallet Integration │ Blockchain Certificate UI         │
└────────────────────┬────────────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────────────┐
│                         BACKEND                                 │
│              Node.js/Express + TypeScript                       │
│     JWT Auth │ IPFS Upload (Pinata) │ Algorand SDK              │
└──────────────┬──────────────────────────┬───────────────────────┘
               │                          │
┌──────────────▼───────────┐  ┌───────────▼───────────────────────┐
│   SQLite (via Prisma)    │  │          ALGORAND TESTNET          │
│  Users ─ Ideas ─ Msgs   │  │   IdeaRegistry Smart Contract      │
│  Shortlists              │  │   Box Storage for SHA-256 Hashes   │
└──────────────────────────┘  └────────────────────────────────────┘
                                          │
                              ┌───────────▼───────────────────────┐
                              │             IPFS                  │
                              │  Pinata Gateway for Documents      │
                              └────────────────────────────────────┘
```

---

## ⛓️ Blockchain Usage (What's On-Chain)

The `IdeaRegistry` smart contract (Algorand Python) stores:

| Data | Storage | Description |
|------|---------|-------------|
| `idea_hash` (SHA-256, 32 bytes) | **Box Storage (Key)** | Immutable hash of idea content |
| `founder_address` (32 bytes) | **Box Storage (Value)** | Algorand wallet of the founder |
| `timestamp` (8 bytes) | **Box Storage (Value)** | On-chain `Global.latest_timestamp` |
| `ipfs_cid` (variable) | **Box Storage (Value)** | CID of uploaded documents |
| `total_ideas` | **Global State** | Counter of all registered ideas |

### Smart Contract Methods
```python
register_idea(hash, ipfs_cid, title_preview) → uint64  # Returns timestamp
verify_idea(hash) → bool                               # Read-only on-chain check
get_idea(hash) → (address, uint64, string)             # Returns (founder, ts, cid)
get_total_ideas() → uint64                             # Global counter
```

### 4 Key Blockchain Improvements
1. **Event Logging** — `log(b"IDEA_REGISTERED:" + founder + ":" + timestamp)` for transparency
2. **Sender Verification** — `Txn.sender` stored as proof of authorship
3. **Global Counter** — `total_ideas` global state tracks all registrations
4. **Duplicate Prevention** — Box storage rejects identical hash at protocol level (not just app level)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contracts** | Algorand Python (AlgoKit), Box Storage |
| **Blockchain** | Algorand Testnet |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Wallet** | Pera Wallet Connect |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | SQLite (via Prisma ORM) |
| **Document Storage** | IPFS via Pinata API |
| **Auth** | JWT (jsonwebtoken) |
| **Testing** | pytest (AlgoKit LocalNet) |

---

## 📁 Project Structure

```
ideavault/
├── contracts/                          # Algorand smart contracts
│   ├── smart_contracts/
│   │   └── idea_registry/
│   │       └── contract.py             # IdeaRegistry contract (AlgoKit Python)
│   ├── tests/
│   │   └── test_idea_registry.py       # pytest unit tests
│   ├── deploy.py                       # Deployment script
│   └── pyproject.toml
├── backend/                            # Node.js API
│   ├── src/
│   │   ├── index.ts                    # Express server entry point
│   │   ├── routes/
│   │   │   ├── auth.ts                 # Auth: register/login/wallet
│   │   │   ├── ideas.ts                # Ideas CRUD + blockchain
│   │   │   └── messages.ts             # Founder-investor messaging
│   │   ├── services/
│   │   │   ├── algorand.ts             # Algorand SDK integration
│   │   │   └── ipfs.ts                 # Pinata IPFS service
│   │   └── middleware/
│   │       └── auth.ts                 # JWT + role-based access
│   ├── prisma/
│   │   └── schema.prisma               # Database schema
│   ├── package.json
│   └── .env.example
└── frontend/                           # Next.js app
    ├── app/
    │   ├── page.tsx                    # Landing page
    │   ├── layout.tsx                  # Root layout
    │   ├── login/page.tsx              # Login
    │   ├── signup/page.tsx             # Register (Founder/Investor)
    │   ├── browse/page.tsx             # Investor idea browser
    │   ├── founder/
    │   │   ├── dashboard/page.tsx      # Founder dashboard
    │   │   └── register-idea/page.tsx  # Multi-step registration
    │   └── idea/[id]/page.tsx          # Idea detail + certificate
    ├── src/
    │   ├── components/
    │   │   ├── BlockchainCertificate.tsx  # Live on-chain verification
    │   │   └── WalletConnectButton.tsx    # Pera Wallet connect
    │   └── services/
    │       └── api.ts                  # Backend API client
    └── .env.local
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.12+
- Node.js 20+
- AlgoKit v2+ (`pip install algokit`)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/ideavault
cd ideavault
```

### 2. Smart Contract Setup
```bash
cd contracts

# Create virtual env
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

# Install dependencies
pip install algokit-utils algorand-python pytest pytest-asyncio

# Start AlgoKit LocalNet (requires Docker)
algokit localnet start

# Run tests
pytest tests/

# Deploy to Testnet
export DEPLOYER_MNEMONIC="your 25 word mnemonic here"
python deploy.py --network testnet
# Note the App ID printed at the end!
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values:
#   ALGORAND_APP_ID=<your deployed App ID>
#   DEPLOYER_MNEMONIC=<your 25-word mnemonic>
#   PINATA_API_KEY=<from pinata.cloud>
#   PINATA_SECRET_API_KEY=<from pinata.cloud>

# Run database migrations
npx prisma generate
npx prisma migrate dev --name init

# Start development server
npm run dev
# API running at http://localhost:3001
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Install blockchain/wallet packages
npm install @perawallet/connect algosdk lucide-react

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start development server
npm run dev
# App running at http://localhost:3000
```

---

## 🧪 Usage

### Register a Startup Idea (Founder Flow)
1. Go to http://localhost:3000 → **Get Started**
2. Create account as **Founder**
3. Connect your Pera Wallet (optional but recommended)  
4. Click **Register New Idea**
5. Fill in idea details (title, description, category, stage)
6. Upload pitch deck (stored on IPFS)
7. Submit → Smart contract transaction created
8. Receive **Blockchain Certificate** with:
   - SHA-256 hash of your idea
   - Transaction ID (Algorand Testnet)
   - App ID of the smart contract
   - IPFS CID of uploaded document
   - On-chain timestamp

### Browse & Verify Ideas (Investor Flow)
1. Create account as **Investor**
2. Browse verified ideas at http://localhost:3000/browse
3. Click any idea → **Verify Live on Blockchain** button
4. Real-time `verify_idea()` call to Algorand Testnet
5. Contact founders via secure messaging

### Verify an Idea Hash (Anyone)
```bash
# Via API
curl -s "http://localhost:3001/api/ideas/{idea_id}/verify" \
  -X POST -H "Authorization: Bearer {token}" | jq

# Or check directly on Algorand Testnet
curl "https://testnet-idx.algonode.cloud/v2/applications/{APP_ID}"
```

---

## ⚠️ Limitations

1. **Testnet Only** — Currently deployed on Algorand Testnet. For production, deploy to Mainnet with proper account funding.
2. **Box Storage Minimum Balance** — Each idea registration requires a small MBR (Minimum Balance Requirement) increase of ~0.0025 ALGO per box. Service account covers this.
3. **IPFS Pinning** — Documents are pinned via Pinata. For production, consider dedicated IPFS nodes.
4. **SQLite** — Used for simplicity in hackathon. Production requires PostgreSQL.
5. **No Real NDA Enforcement** — NDA_REQUIRED visibility is a UI hint only; smart contract doesn't implement NDA signing flow.
6. **AVM 8 Gas Limits** — Idea descriptions > 4KB require additional storage handling.

---

## 👥 Team

| Name | Role |
|------|------|
| [Your Name] | Full-Stack Developer, Blockchain Engineer |

---

## 🔗 Links

- **Live Frontend**: [Link to be added after deployment]
- **Backend API**: [Link to be added after deployment]
- **App ID (Testnet)**: [To be added after testnet deployment]
- **GitHub**: https://github.com/YOUR_USERNAME/ideavault
- **Demo Video**: [LinkedIn post link]
- **Algorand Explorer**: https://testnet.algoexplorer.io/application/{APP_ID}

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

*Built for RIFT Hackathon 2026 | Powered by Algorand*
