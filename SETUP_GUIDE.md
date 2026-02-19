# IdeaVault Setup Guide

## 1. Getting Your Algorand Testnet Mnemonic (25 words)

### Option A: Using Pera Wallet (Recommended)

1. **Download Pera Wallet**
   - Mobile: [iOS App Store](https://apps.apple.com/app/pera-algorand-wallet/id1489892968) or [Google Play](https://play.google.com/store/apps/details?id=com.algorand.android)
   - Desktop: [Pera Web](https://web.perawallet.app/)

2. **Create a New Wallet**
   - Open Pera Wallet
   - Tap "Create new account" or "Add account"
   - Choose "Create new wallet"

3. **Save Your Passphrase**
   - You'll see 25 words - **WRITE THEM DOWN SECURELY**
   - Tap each word to confirm you've saved them
   - ⚠️ **NEVER share these words with anyone!**

4. **Switch to Testnet**
   - Go to Settings → Developer Options → Testnet Mode
   - Enable Testnet Mode
   - Your wallet address will change (this is normal for testnet)

5. **Get Your Address**
   - Copy your wallet address (starts with a letter/number)
   - You'll need this for the testnet dispenser

6. **Fund Your Testnet Account**
   - Visit: https://bank.testnet.algorand.network/
   - Paste your wallet address
   - Request testnet ALGO (free)
   - Wait a few seconds for the transaction

### Option B: Using Algorand Wallet (Official)

1. Visit: https://algorandwallet.com/
2. Click "Create New Wallet"
3. Follow the prompts to generate your 25-word mnemonic
4. Save it securely
5. Switch to Testnet in settings

### Option C: Generate Programmatically (Advanced)

```python
from algosdk import account, mnemonic

# Generate new account
private_key, address = account.generate_account()
mnemonic_phrase = mnemonic.from_private_key(private_key)

print(f"Address: {address}")
print(f"Mnemonic: {mnemonic_phrase}")
```

⚠️ **Security Warning**: Only use this for testnet! Never use generated keys for mainnet without proper security.

---

## 2. Getting Pinata API Keys

### Step-by-Step:

1. **Sign Up for Pinata**
   - Go to: https://pinata.cloud/
   - Click "Sign Up" (free account available)
   - Verify your email

2. **Create API Key**
   - Log in to Pinata
   - Go to **Dashboard** → **API Keys** (or https://app.pinata.cloud/developers/api-keys)
   - Click **"New Key"** button

3. **Configure Key Permissions**
   - **Key Name**: `ideavault` (or any name you prefer)
   - **Admin**: Leave unchecked (not needed)
   - **Pin File to IPFS**: ✅ **Check this**
   - **Pin JSON to IPFS**: ✅ **Check this**
   - **Unpin**: Optional (for removing files)
   - Click **"Create Key"**

4. **Copy Your Keys**
   - You'll see:
     - **API Key**: Long string (starts with something like `a1b2c3d4...`)
     - **Secret API Key**: Even longer string (starts with something like `eyJhbGc...`)
   - ⚠️ **Copy these immediately** - the secret key is only shown once!
   - Click "Copy" for each key

5. **Add to Your `.env` File**
   ```
   PINATA_API_KEY=your_api_key_here
   PINATA_SECRET_API_KEY=your_secret_key_here
   ```

---

## 3. Getting ALGORAND_APP_ID (After Deployment)

The App ID is generated automatically when you deploy the contract. You don't need to get it manually - the deploy script handles it!

### After Running Deployment:

```powershell
cd contracts
python deploy.py --network testnet --update-env
```

The script will:
1. Deploy your contract
2. Print: `Deployed successfully! App ID: 12345`
3. Automatically update `backend/.env` with `ALGORAND_APP_ID=12345`

### If You Need to Find an Existing App ID:

1. **From Deployment Output**
   - Check your terminal/console where you ran the deploy command
   - Look for: `Deployed successfully! App ID: [number]`

2. **From Algorand Explorer**
   - Go to: https://testnet.explorer.perawallet.app/
   - Search for your deployer wallet address
   - Find the "Application Create" transaction
   - The App ID is shown in the transaction details

3. **From Your Wallet**
   - Open Pera Wallet
   - Go to your account
   - Check transaction history
   - Find the "Application Create" transaction
   - App ID is displayed there

---

## Quick Checklist

- [ ] Created Algorand testnet wallet
- [ ] Saved 25-word mnemonic securely
- [ ] Added mnemonic to `backend/.env` as `ALGORAND_DEPLOYER_MNEMONIC`
- [ ] Funded testnet account (from dispenser)
- [ ] Created Pinata account
- [ ] Generated Pinata API keys
- [ ] Added keys to `backend/.env`
- [ ] Deployed contract: `python deploy.py --network testnet --update-env`
- [ ] Verified `ALGORAND_APP_ID` is updated in `backend/.env`

---

## Troubleshooting

### "Invalid mnemonic"
- Make sure you copied all 25 words
- Check for typos
- Ensure words are separated by single spaces

### "Insufficient balance"
- Visit https://bank.testnet.algorand.network/
- Request more testnet ALGO

### "Pinata API error"
- Verify your API keys are correct
- Check that you enabled "Pin File to IPFS" permission
- Make sure you're using the right keys (API Key vs Secret API Key)

### "Contract not compiled"
- Run: `algokit compile` in the contracts directory
- Make sure `IdeaRegistry.arc56.json` exists in `contracts/smart_contracts/idea_registry/artifacts/`
