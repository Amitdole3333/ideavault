"""
IdeaVault — IdeaRegistry Smart Contract Tests
Uses AlgoKit's pytest testing framework with LocalNet.
"""

import pytest
import hashlib
from algokit_utils import (
    AlgorandClient,
    PayParams,
)
from algokit_utils.beta.account_manager import AddressAndSigner
from smart_contracts.idea_registry.contract import IdeaRegistry


@pytest.fixture(scope="session")
def algorand() -> AlgorandClient:
    """Connect to AlgoKit LocalNet."""
    return AlgorandClient.default_local_net()


@pytest.fixture(scope="session")
def founder(algorand: AlgorandClient) -> AddressAndSigner:
    """Create and fund test founder account."""
    account = algorand.account.random()
    algorand.send.payment(
        PayParams(
            sender=algorand.account.localnet_dispenser().address,
            receiver=account.address,
            amount=10_000_000,  # 10 ALGO
        )
    )
    return account


@pytest.fixture(scope="session")
def other_user(algorand: AlgorandClient) -> AddressAndSigner:
    """Create a second test account."""
    account = algorand.account.random()
    algorand.send.payment(
        PayParams(
            sender=algorand.account.localnet_dispenser().address,
            receiver=account.address,
            amount=10_000_000,
        )
    )
    return account


@pytest.fixture(scope="session")
def idea_hash() -> bytes:
    """Generate a deterministic test idea hash."""
    content = "My Amazing AI Startup Idea 2026-02-19T18:00:00"
    return hashlib.sha256(content.encode()).digest()  # 32 bytes


@pytest.fixture(scope="session")
def app_client(algorand: AlgorandClient, founder: AddressAndSigner):
    """Deploy IdeaRegistry contract to LocalNet and return client."""
    from algokit_utils.beta.composer import AppCreateParams
    # Deploy the contract
    client = algorand.client.get_typed_app_client(
        IdeaRegistry,
        default_signer=founder.signer,
        default_sender=founder.address,
    )
    client.create.create_application()
    return client


class TestIdeaRegistry:

    def test_initial_total_is_zero(self, app_client):
        """Contract should start with total_ideas = 0."""
        result = app_client.send.get_total_ideas()
        assert result.return_value == 0, "Initial total_ideas should be 0"

    def test_register_idea_success(self, app_client, founder, idea_hash):
        """
        Registering a new idea should:
        - Return a non-zero timestamp
        - Increment total_ideas to 1
        """
        result = app_client.send.register_idea(
            args=(
                list(idea_hash),  # 32-byte array
                "QmTestIPFSCIDHash123456789abcdef",  # ipfs_cid
                "My Amazing AI Startup Idea",         # title preview
            ),
            # Box reference needed for Box storage writes
            boxes=[(app_client.app_id, idea_hash)],
        )
        timestamp = result.return_value
        assert timestamp > 0, "Timestamp should be > 0"

        # Verify counter incremented
        total = app_client.send.get_total_ideas()
        assert total.return_value == 1

    def test_duplicate_hash_rejected(self, app_client, idea_hash):
        """
        Submitting the same hash twice should fail with ERR:DUPLICATE_HASH.
        This is the core anti-theft protection.
        """
        with pytest.raises(Exception, match="Idea hash already registered"):
            app_client.send.register_idea(
                args=(
                    list(idea_hash),
                    "QmDifferentCID",
                    "Same idea title",
                ),
                boxes=[(app_client.app_id, idea_hash)],
            )

    def test_verify_registered_idea_returns_true(self, app_client, idea_hash):
        """verify_idea should return True for a registered hash."""
        result = app_client.send.verify_idea(
            args=(list(idea_hash),),
            boxes=[(app_client.app_id, idea_hash)],
        )
        assert result.return_value is True

    def test_verify_unknown_hash_returns_false(self, app_client):
        """verify_idea should return False for an unregistered hash."""
        unknown_hash = hashlib.sha256(b"some unknown idea").digest()
        result = app_client.send.verify_idea(
            args=(list(unknown_hash),),
            boxes=[(app_client.app_id, unknown_hash)],
        )
        assert result.return_value is False

    def test_get_idea_returns_correct_data(self, app_client, founder, idea_hash):
        """get_idea should return (founder_address, timestamp, ipfs_cid)."""
        result = app_client.send.get_idea(
            args=(list(idea_hash),),
            boxes=[(app_client.app_id, idea_hash)],
        )
        addr, timestamp, cid = result.return_value
        assert addr == founder.address
        assert timestamp > 0
        assert cid == "QmTestIPFSCIDHash123456789abcdef"

    def test_get_nonexistent_idea_fails(self, app_client):
        """get_idea on unknown hash should fail with ERR:IDEA_NOT_FOUND."""
        missing_hash = hashlib.sha256(b"not registered").digest()
        with pytest.raises(Exception, match="ERR:IDEA_NOT_FOUND"):
            app_client.send.get_idea(
                args=(list(missing_hash),),
                boxes=[(app_client.app_id, missing_hash)],
            )

    def test_second_idea_increments_counter(self, app_client):
        """Registering a second idea should increment counter to 2."""
        new_hash = hashlib.sha256(b"Second Unique Idea 2026").digest()
        app_client.send.register_idea(
            args=(
                list(new_hash),
                "QmSecondIdeaCID",
                "Second Startup Idea",
            ),
            boxes=[(app_client.app_id, new_hash)],
        )
        total = app_client.send.get_total_ideas()
        assert total.return_value == 2

    def test_duplicate_hash_rejected(self, app_client, idea_hash):
        """
        Submitting the same hash twice should fail with ERR:DUPLICATE_HASH.
        This is the core anti-theft protection.
        """
        with pytest.raises(Exception, match="Idea hash already registered"):
            app_client.send.register_idea(
                args=(
                    list(idea_hash),
                    "QmDifferentCID",
                    "Same idea title",
                ),
                boxes=[(app_client.app_id, idea_hash)],
            )    def test_verify_registered_idea_returns_true(self, app_client, idea_hash):
        """verify_idea should return True for a registered hash."""
        result = app_client.send.verify_idea(
            args=(list(idea_hash),),
            boxes=[(app_client.app_id, idea_hash)],
        )
        assert result.return_value is True

    def test_verify_unknown_hash_returns_false(self, app_client):
        """verify_idea should return False for an unregistered hash."""
        unknown_hash = hashlib.sha256(b"some unknown idea").digest()
        result = app_client.send.verify_idea(
            args=(list(unknown_hash),),
            boxes=[(app_client.app_id, unknown_hash)],
        )
        assert result.return_value is False

    def test_get_idea_returns_correct_data(self, app_client, founder, idea_hash):
        """get_idea should return (founder_address, timestamp, ipfs_cid)."""
        result = app_client.send.get_idea(
            args=(list(idea_hash),),
            boxes=[(app_client.app_id, idea_hash)],
        )
        addr, timestamp, cid = result.return_value
        assert addr == founder.address
        assert timestamp > 0
        assert cid == "QmTestIPFSCIDHash123456789abcdef"

    def test_get_nonexistent_idea_fails(self, app_client):
        """get_idea on unknown hash should fail with ERR:IDEA_NOT_FOUND."""
        missing_hash = hashlib.sha256(b"not registered").digest()
        with pytest.raises(Exception, match="ERR:IDEA_NOT_FOUND"):
            app_client.send.get_idea(
                args=(list(missing_hash),),
                boxes=[(app_client.app_id, missing_hash)],
            )

    def test_second_idea_increments_counter(self, app_client):
        """Registering a second idea should increment counter to 2."""
        new_hash = hashlib.sha256(b"Second Unique Idea 2026").digest()
        app_client.send.register_idea(
            args=(
                list(new_hash),
                "QmSecondIdeaCID",
                "Second Startup Idea",
            ),
            boxes=[(app_client.app_id, new_hash)],
        )
        total = app_client.send.get_total_ideas()
        assert total.return_value == 2
