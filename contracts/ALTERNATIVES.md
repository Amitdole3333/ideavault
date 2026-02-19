# Alternatives to 25-Word Mnemonic

If you don't have a 25-word Algorand mnemonic, here are **3 alternatives**:

## Option 1: Use Private Key Directly (Base64)

If you have a private key from another source (wallet export, etc.), you can use it directly.

### Get Private Key from Pera Wallet:
1. Open Pera Wallet
2. Go to Settings → Security → Export Private Key
3. Copy the base64-encoded private key

### Add to `backend/.env`:
```env
ALGORAND_DEPLOYER_PRIVATE_KEY=your_base64_encoded_private_key_here
```

### Deploy:
```powershell
python deploy.py --network testnet --update-env
```

---

## Option 2: Auto-Generate New Wallet

The deploy script can automatically generate a new wallet for you:

```powershell
python deploy.py --network testnet --auto-generate --update-env
```

This will:
- Generate a new Algorand account
- Display the 25-word mnemonic
- Deploy the contract
- Update your `.env` file

**⚠️ Important**: Save the mnemonic that's displayed! You'll need it later.

---

## Option 3: Generate Wallet Separately

Use the wallet generator script first:

```powershell
python generate_wallet.py
```

This will:
- Generate a new wallet
- Show you the address and 25-word mnemonic
- You can then add the mnemonic to `.env` and deploy normally

---

## Converting Between Formats

### Private Key → Mnemonic
If you have a private key and want to convert it to a mnemonic:

```python
from algosdk import mnemonic
import base64

# Your base64 private key
private_key_b64 = "your_base64_key_here"
private_key = base64.b64decode(private_key_b64)

# Convert to mnemonic
mnemonic_phrase = mnemonic.from_private_key(private_key)
print(f"Mnemonic: {mnemonic_phrase}")
```

### Mnemonic → Private Key
If you have a mnemonic and want the private key:

```python
from algosdk import mnemonic
import base64

mnemonic_phrase = "your 25 word mnemonic here"
private_key = mnemonic.to_private_key(mnemonic_phrase)
private_key_b64 = base64.b64encode(private_key).decode('utf-8')
print(f"Private Key (base64): {private_key_b64}")
```

---

## Security Notes

- **Never commit** `.env` files to git
- **Never share** your mnemonic or private key
- For **testnet only** - these methods are fine
- For **mainnet** - use proper key management (hardware wallet, secure storage)

---

## Quick Comparison

| Method | Pros | Cons |
|--------|------|------|
| **Mnemonic (25 words)** | Standard, easy to backup | Must have exactly 25 words |
| **Private Key (base64)** | Works if you have it | Harder to remember/backup |
| **Auto-generate** | No setup needed | Must save the generated mnemonic |

---

## Recommended Workflow

For **testnet development**, I recommend:

1. **Use `--auto-generate`** for quick testing:
   ```powershell
   python deploy.py --network testnet --auto-generate --update-env
   ```

2. **Save the displayed mnemonic** to `backend/.env`:
   ```
   ALGORAND_DEPLOYER_MNEMONIC=the 25 words shown
   ```

3. **Future deployments** will use the saved mnemonic automatically

This way you don't need to manually create a wallet first!
