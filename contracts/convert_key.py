"""
Convert between Algorand private key (base64) and mnemonic (25 words).
Useful if you have one format and need the other.
"""

import argparse
import base64
from algosdk import mnemonic

def key_to_mnemonic(private_key_b64: str):
    """Convert base64 private key to 25-word mnemonic"""
    try:
        private_key = base64.b64decode(private_key_b64)
        mnemonic_phrase = mnemonic.from_private_key(private_key)
        words = mnemonic_phrase.split()
        
        print("="*60)
        print("PRIVATE KEY → MNEMONIC")
        print("="*60)
        print(f"\nMnemonic ({len(words)} words):")
        print("-" * 60)
        for i, word in enumerate(words, 1):
            print(f"{i:2d}. {word}")
        print("-" * 60)
        print(f"\nFull mnemonic:")
        print(mnemonic_phrase)
        print("\n" + "="*60)
        
        return mnemonic_phrase
    except Exception as e:
        print(f"Error converting key to mnemonic: {e}")
        raise

def mnemonic_to_key(mnemonic_phrase: str):
    """Convert 25-word mnemonic to base64 private key"""
    try:
        private_key = mnemonic.to_private_key(mnemonic_phrase)
        private_key_b64 = base64.b64encode(private_key).decode('utf-8')
        
        from algosdk import account
        address = account.address_from_private_key(private_key)
        
        print("="*60)
        print("MNEMONIC → PRIVATE KEY")
        print("="*60)
        print(f"\nAddress: {address}")
        print(f"\nPrivate Key (base64):")
        print(private_key_b64)
        print("\n" + "="*60)
        print("\n⚠️  Keep this private key secure!")
        print("="*60)
        
        return private_key_b64
    except Exception as e:
        print(f"Error converting mnemonic to key: {e}")
        raise

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convert between Algorand private key and mnemonic",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert private key to mnemonic
  python convert_key.py --key-to-mnemonic "base64_encoded_key"
  
  # Convert mnemonic to private key
  python convert_key.py --mnemonic-to-key "word1 word2 ... word25"
        """
    )
    
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--key-to-mnemonic", type=str, help="Convert base64 private key to mnemonic")
    group.add_argument("--mnemonic-to-key", type=str, help="Convert mnemonic to base64 private key")
    
    args = parser.parse_args()
    
    try:
        if args.key_to_mnemonic:
            key_to_mnemonic(args.key_to_mnemonic)
        elif args.mnemonic_to_key:
            mnemonic_to_key(args.mnemonic_to_key)
    except Exception as e:
        print(f"\nConversion failed: {e}")
        import traceback
        traceback.print_exc()
