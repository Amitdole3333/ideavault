"""
Generate a new Algorand testnet wallet with 25-word mnemonic.
Use this if you only have 24 words or need a fresh wallet.
"""

from algosdk import account, mnemonic

def generate_algorand_wallet():
    """Generate a new Algorand account with 25-word mnemonic"""
    print("Generating new Algorand wallet...")
    
    # Generate new account
    private_key, address = account.generate_account()
    mnemonic_phrase = mnemonic.from_private_key(private_key)
    
    # Split into words to verify it's 25 words
    words = mnemonic_phrase.split()
    
    print("\n" + "="*60)
    print("NEW ALGORAND WALLET GENERATED")
    print("="*60)
    print(f"\nAddress: {address}")
    print(f"\nMnemonic ({len(words)} words):")
    print("-" * 60)
    
    # Print words in a numbered list
    for i, word in enumerate(words, 1):
        print(f"{i:2d}. {word}")
    
    print("-" * 60)
    print(f"\nFull mnemonic phrase:")
    print(mnemonic_phrase)
    print("\n" + "="*60)
    print("\n⚠️  IMPORTANT:")
    print("1. Save this mnemonic securely - you'll need all 25 words!")
    print("2. This is for TESTNET - fund it at: https://bank.testnet.algorand.network/")
    print("3. Add to backend/.env as:")
    print(f'   ALGORAND_DEPLOYER_MNEMONIC={mnemonic_phrase}')
    print("="*60)
    
    return address, mnemonic_phrase

if __name__ == "__main__":
    try:
        generate_algorand_wallet()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
