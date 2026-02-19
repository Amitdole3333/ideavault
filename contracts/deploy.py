import argparse
import base64
import logging
import os
import json
from pathlib import Path

from algosdk import mnemonic as algo_mnemonic
from algosdk import account, transaction
from algosdk.v2client.algod import AlgodClient

logger = logging.getLogger(__name__)

def load_env_file(env_path: Path) -> dict[str, str]:
    """Load environment variables from a .env file"""
    env_vars = {}
    if not env_path.exists():
        return env_vars
    
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            # Skip empty lines and comments
            if not line or line.startswith("#"):
                continue
            # Parse KEY=VALUE format
            if "=" in line:
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip()
                # Remove quotes if present
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]
                env_vars[key] = value
    return env_vars

def deploy(network: str, mnemonic_phrase: str | None = None, private_key_b64: str | None = None, auto_generate: bool = False):
    """
    Deploy the IdeaRegistry smart contract.
    
    Args:
        network: Target network (localnet, testnet, mainnet)
        mnemonic_phrase: 25-word Algorand mnemonic (optional)
        private_key_b64: Base64-encoded private key (alternative to mnemonic)
        auto_generate: If True and no credentials provided, generate a new wallet
    """
    # Connect to Algod using AlgorandClient (handles fallbacks and headers better)
    from algokit_utils import AlgorandClient
    if network == "localnet":
        algorand = AlgorandClient.default_localnet()
    elif network == "testnet":
        algorand = AlgorandClient.testnet()
    elif network == "mainnet":
        algorand = AlgorandClient.mainnet()
    else:
        raise ValueError(f"Unknown network: {network}")

    algod_client = algorand.client.algod

    # Get account - try multiple methods
    private_key = None
    sender = None
    
    # If auto-generate is requested, skip other methods
    if auto_generate:
        # Option 3: Auto-generate new wallet
        print("Auto-generate enabled. Generating new wallet...")
        private_key, sender = account.generate_account()
        mnemonic_phrase = algo_mnemonic.from_private_key(private_key)
        print(f"Generated new account: {sender}")
        print(f"\n[IMPORTANT] Save this mnemonic securely!")
        print(f"Mnemonic ({len(mnemonic_phrase.split())} words):")
        print(mnemonic_phrase)
        print(f"\nAdd to backend/.env as:")
        print(f"ALGORAND_DEPLOYER_MNEMONIC={mnemonic_phrase}")
        print()
    elif private_key_b64:
        # Option 1: Use private key directly (base64 encoded)
        try:
            private_key = base64.b64decode(private_key_b64)
            sender = account.address_from_private_key(private_key)
            print(f"Using account from private key: {sender}")
        except Exception as e:
            raise ValueError(f"Invalid private key format: {e}")
    elif mnemonic_phrase:
        # Option 2: Use mnemonic (validate first)
        try:
            # Quick validation - check word count
            words = mnemonic_phrase.strip().split()
            if len(words) != 25:
                raise ValueError(f"Mnemonic has {len(words)} words, but Algorand requires exactly 25 words")
            private_key = algo_mnemonic.to_private_key(mnemonic_phrase)
            sender = account.address_from_private_key(private_key)
            print(f"Using account from mnemonic: {sender}")
        except Exception as e:
            raise ValueError(f"Invalid mnemonic: {e}")
    else:
        raise ValueError(
            "No credentials provided. Use one of:\n"
            "  - ALGORAND_DEPLOYER_MNEMONIC (25-word mnemonic)\n"
            "  - ALGORAND_DEPLOYER_PRIVATE_KEY (base64-encoded private key)\n"
            "  - --auto-generate flag to create a new wallet"
        )

    print(f"Deploying to {network} with account: {sender}")

    # Load artifacts
    # We use arc56.json because it contains pre-compiled bytecode
    # This avoids the 403 Forbidden error on the /v2/teal/compile endpoint
    artifacts_dir = Path(__file__).parent / "smart_contracts" / "idea_registry" / "artifacts"
    arc56_path = artifacts_dir / "IdeaRegistry.arc56.json"

    if not arc56_path.exists():
        raise FileNotFoundError(f"ARC56 artifact not found at {arc56_path}. Did you compile first?")

    print(f"Loading bytecode from {arc56_path.name}...")
    with open(arc56_path, "r") as f:
        arc56_data = json.load(f)
    
    try:
        approval_b64 = arc56_data["byteCode"]["approval"]
        clear_b64 = arc56_data["byteCode"]["clear"]
    except KeyError:
        raise ValueError("Bytecode not found in arc56.json. Ensure the contract was compiled with bytecode output.")

    approval_bytes = base64.b64decode(approval_b64)
    clear_bytes = base64.b64decode(clear_b64)

    # Suggested params
    params = algod_client.suggested_params()

    # ARC4 selector for create_application()void is 0x752c3ac0
    app_args = [base64.b16decode("752C3AC0")] 

    # Create transaction
    print("Creating ApplicationCreate transaction...")
    txn = transaction.ApplicationCreateTxn(
        sender=sender,
        sp=params,
        on_complete=transaction.OnComplete.NoOpOC,
        approval_program=approval_bytes,
        clear_program=clear_bytes,
        global_schema=transaction.StateSchema(num_uints=8, num_byte_slices=8),
        local_schema=transaction.StateSchema(num_uints=0, num_byte_slices=0),
        app_args=app_args
    )

    # Sign and send
    signed_txn = txn.sign(private_key)
    txid = algod_client.send_transaction(signed_txn)

    print(f"Transaction ID: {txid}")
    print("Waiting for confirmation...")

    result = transaction.wait_for_confirmation(algod_client, txid, 4)

    app_id = result["application-index"]
    print(f"Deployed successfully! App ID: {app_id}")
    
    # Get app address
    from algosdk import logic
    app_address = logic.get_application_address(app_id)
    print(f"App Address: {app_address}")
    
    return app_id

def update_env_file(app_id: int, env_path: Path | None = None):
    """Update ALGORAND_APP_ID in the backend .env file"""
    if env_path is None:
        # Find backend .env file relative to contracts directory
        backend_env = Path(__file__).parent.parent / "backend" / ".env"
    else:
        backend_env = Path(env_path)
    
    if not backend_env.exists():
        print(f"Warning: .env file not found at {backend_env}. App ID not updated.")
        return False
    
    # Read the file
    with open(backend_env, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    # Update ALGORAND_APP_ID line
    updated = False
    for i, line in enumerate(lines):
        if line.startswith("ALGORAND_APP_ID="):
            lines[i] = f"ALGORAND_APP_ID={app_id}\n"
            updated = True
            break
    
    if updated:
        # Write back
        with open(backend_env, "w", encoding="utf-8") as f:
            f.writelines(lines)
        print(f"[OK] Updated {backend_env} with ALGORAND_APP_ID={app_id}")
        return True
    else:
        print(f"Warning: ALGORAND_APP_ID not found in {backend_env}. Please update manually.")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Deploy IdeaRegistry Smart Contract",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Authentication Methods (choose one):
  1. Mnemonic: Set ALGORAND_DEPLOYER_MNEMONIC in .env (25 words)
  2. Private Key: Set ALGORAND_DEPLOYER_PRIVATE_KEY in .env (base64-encoded)
  3. Auto-generate: Use --auto-generate to create a new wallet

Examples:
  # Using mnemonic from .env
  python deploy.py --network testnet --update-env
  
  # Using private key from .env
  python deploy.py --network testnet --update-env
  
  # Generate new wallet automatically
  python deploy.py --network testnet --auto-generate --update-env
        """
    )
    parser.add_argument("--network", default="localnet", choices=["localnet", "testnet", "mainnet"], help="Target network")
    parser.add_argument("--update-env", action="store_true", help="Automatically update backend .env file with App ID")
    parser.add_argument("--env-file", type=str, help="Path to .env file to load/update (default: backend/.env)")
    parser.add_argument("--load-env", action="store_true", default=True, help="Load environment variables from backend/.env file")
    parser.add_argument("--auto-generate", action="store_true", help="Auto-generate a new wallet if no credentials provided")
    args = parser.parse_args()
    
    logging.basicConfig(level=logging.INFO)
    
    # Try to load .env file if requested
    if args.load_env:
        backend_env_path = Path(__file__).parent.parent / "backend" / ".env"
        if backend_env_path.exists():
            print(f"Loading environment from {backend_env_path}...")
            env_vars = load_env_file(backend_env_path)
            # Set environment variables (don't override existing ones)
            for key, value in env_vars.items():
                if key not in os.environ:
                    os.environ[key] = value
    
    # Check for credentials - try multiple methods
    # If auto-generate is enabled, skip loading credentials (will generate new wallet)
    if args.auto_generate:
        mnemonic = None
        private_key_b64 = None
    else:
        mnemonic = os.getenv("ALGORAND_DEPLOYER_MNEMONIC") or os.getenv("DEPLOYER_MNEMONIC")
        private_key_b64 = os.getenv("ALGORAND_DEPLOYER_PRIVATE_KEY")
    
    try:
        app_id = deploy(
            args.network, 
            mnemonic_phrase=mnemonic,
            private_key_b64=private_key_b64,
            auto_generate=args.auto_generate
        )
        
        # Optionally update .env file
        if args.update_env or args.env_file:
            env_path = Path(args.env_file) if args.env_file else None
            update_env_file(app_id, env_path)
        else:
            print(f"\n💡 Tip: Run with --update-env to automatically update backend/.env file")
            print(f"   Or manually set ALGORAND_APP_ID={app_id} in backend/.env")
            
    except Exception as e:
        print(f"Deployment failed: {e}")
        import traceback
        traceback.print_exc()
