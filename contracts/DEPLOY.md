# Deploying IdeaRegistry Smart Contract

## Prerequisites

1. **Get your Algorand Testnet mnemonic** (25 words)
   - Create a wallet at [Pera Algorand Wallet](https://perawallet.app/) or [Algorand Wallet](https://algorand.com/wallet)
   - Switch to **Testnet** mode
   - Go to Settings → Show Passphrase
   - Copy all 25 words

2. **Fund your account** (for testnet)
   - Visit [Algorand Testnet Dispenser](https://bank.testnet.algorand.network/)
   - Enter your wallet address
   - Request testnet ALGO

3. **Update `backend/.env`** with your mnemonic:
   ```
   ALGORAND_DEPLOYER_MNEMONIC=your twenty five word mnemonic phrase here
   ```

## Deployment

The deploy script automatically loads environment variables from `backend/.env`.

### Basic deployment:
```powershell
cd contracts
python deploy.py --network testnet
```

### Automatic .env update:
```powershell
python deploy.py --network testnet --update-env
```

This will:
1. Load `ALGORAND_DEPLOYER_MNEMONIC` from `backend/.env`
2. Deploy the contract to testnet
3. Automatically update `ALGORAND_APP_ID` in `backend/.env`

## After Deployment

The script will print:
- **App ID**: Copy this to `ALGORAND_APP_ID` in `backend/.env` (if not using `--update-env`)
- **App Address**: The contract's address on Algorand

## Troubleshooting

- **"ARC56 artifact not found"**: Run `algokit compile` first
- **"Mnemonic required"**: Make sure `ALGORAND_DEPLOYER_MNEMONIC` is set in `backend/.env`
- **"Insufficient balance"**: Fund your account using the testnet dispenser
