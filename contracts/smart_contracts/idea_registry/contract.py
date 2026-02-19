"""
IdeaVault — IdeaRegistry Smart Contract
Algorand Python (AlgoKit) Contract for registering and verifying startup ideas with immutable proof of ownership.
"""

from algopy import (
    ARC4Contract,
    Bytes,
    Global,
    UInt64,
    String,
    Txn,
    subroutine,
    log,
    # op,  # Removed: op is not available in algopy
    BoxMap,
)


class IdeaRegistry(ARC4Contract):
    """
    IdeaRegistry — Blockchain-backed idea registration and verification.
    
    Storage Model:
    - Global State: total_ideas counter
    - Box Storage: Maps idea_hash (32 bytes) → (founder_address, timestamp, ipfs_cid, title)
    
    Key Methods:
    - register_idea(hash, ipfs_cid, title_preview) → timestamp
    - verify_idea(hash) → bool
    - get_idea(hash) → (founder, timestamp, cid)
    - get_total_ideas() → total count
    """

    # Global state
    total_ideas: UInt64 = UInt64(0)

    # Box storage: idea_hash (32 bytes) → Bytes (packed data)
    # We use BoxMap to store idea metadata
    # Format: founder_address(32) + timestamp(8) + ipfs_cid_len(2) + ipfs_cid + title_len(2) + title
    idea_storage: BoxMap[Bytes, Bytes] = BoxMap(Bytes, Bytes)

    @ARC4Contract.abimethod(create="require")
    def create_application(self) -> None:
        """Initialize the contract."""
        self.total_ideas = UInt64(0)

    @ARC4Contract.abimethod
    def register_idea(
        self,
        idea_hash: Bytes,
        ipfs_cid: String,
        title_preview: String,
    ) -> UInt64:
        """
        Register a new idea on-chain.
        
        Args:
            idea_hash: SHA-256 hash of idea content (32 bytes)
            ipfs_cid: IPFS CID of uploaded document
            title_preview: Short title preview (for transparency)
        
        Returns:
            Unix timestamp of registration
        
        Side Effects:
            - Stores (founder_address, timestamp, ipfs_cid, title) in box storage
            - Increments total_ideas counter
            - Emits IDEA_REGISTERED event
            - Rejects if hash already exists
        """
        # Validate hash is 32 bytes
        assert len(idea_hash) == 32, "Idea hash must be 32 bytes (SHA-256)"
        
        # Check for duplicates
        assert not self.idea_storage[idea_hash].exists(), "Idea hash already registered"
        
        # Get sender (founder) and current timestamp
        founder = Txn.sender
        timestamp = Global.latest_timestamp
        
        # Pack data: founder(32) | timestamp(8) | ipfs_cid_len(2) | ipfs_cid | title_len(2) | title
        ipfs_bytes = ipfs_cid.encode()
        title_bytes = title_preview.encode()
        
        # Build packed value
        packed_value = Bytes("")
        packed_value += founder  # 32 bytes — Algorand account address
        packed_value += timestamp.to_bytes(8)  # 8 bytes — Unix timestamp
        packed_value += len(ipfs_bytes).to_bytes(2)  # 2 bytes — CID length
        packed_value += ipfs_bytes  # Variable — IPFS CID
        packed_value += len(title_bytes).to_bytes(2)  # 2 bytes — Title length
        packed_value += title_bytes  # Variable — Title preview
        
        # Store in box
        self.idea_storage[idea_hash] = packed_value
        
        # Increment counter
        self.total_ideas += UInt64(1)
        
        # Emit event (for transparency in logs)
        log_msg = Bytes("IDEA_REGISTERED:") + founder + Bytes(":") + timestamp.to_bytes(8)
        log(log_msg)
        
        return timestamp

    @ARC4Contract.abimethod(readonly=True)
    def verify_idea(self, idea_hash: Bytes) -> bool:
        """
        Verify if an idea is registered on-chain.
        
        Args:
            idea_hash: SHA-256 hash to verify (32 bytes)
        
        Returns:
            True if idea exists, False otherwise
        """
        assert len(idea_hash) == 32, "Idea hash must be 32 bytes"
        return self.idea_storage[idea_hash].exists()

    @ARC4Contract.abimethod(readonly=True)
    def get_idea(
        self,
        idea_hash: Bytes,
    ) -> tuple[String, UInt64, String]:
        """
        Retrieve idea metadata from on-chain storage.
        
        Args:
            idea_hash: SHA-256 hash of idea (32 bytes)
        
        Returns:
            (founder_address, timestamp, ipfs_cid)
        
        Raises:
            Assertion error if idea not found
        """
        assert len(idea_hash) == 32, "Idea hash must be 32 bytes"
        
        # Get packed data from box
        assert self.idea_storage[idea_hash].exists(), "Idea not found on-chain"
        packed = self.idea_storage[idea_hash].value
        
        # Unpack: founder(32) | timestamp(8) | ipfs_cid_len(2) | ipfs_cid | title_len(2) | title
        founder = packed[0:32]
        timestamp_bytes = packed[32:40]
        timestamp = UInt64.from_bytes(timestamp_bytes)
        
        cid_len_bytes = packed[40:42]
        cid_len = Bytes.btoi(cid_len_bytes)
        cid_start = 42
        cid_end = cid_start + cid_len
        ipfs_cid = packed[cid_start:cid_end].decode()
        
        # Convert founder bytes to address string (Algorand format)
        # For simplicity, we return it as bytes and let client decode
        founder_str = founder.decode()
        
        return (founder_str, timestamp, ipfs_cid)

    @ARC4Contract.abimethod(readonly=True)
    def get_total_ideas(self) -> UInt64:
        """
        Get total number of ideas registered.
        
        Returns:
            Total count of unique ideas on-chain
        """
        return self.total_ideas

    @ARC4Contract.abimethod
    def delete_idea(self, idea_hash: Bytes) -> None:
        """
        Delete an idea from storage (only callable by contract creator).
        
        Args:
            idea_hash: 32-byte SHA-256 hash to remove
        """
        assert Txn.sender == Global.creator_address(), "Only creator can delete"
        assert len(idea_hash) == 32, "Idea hash must be 32 bytes"
        assert self.idea_storage[idea_hash].exists(), "Idea not found"
        
        # Delete from box storage
        del self.idea_storage[idea_hash]
        
        # Decrement counter
        self.total_ideas -= UInt64(1)
