# BookLoop Whitepaper 📖
### *A Decentralized Peer-to-Peer Protocol for Physical Book Circulation*

**Version:** 1.0.0  
**Network:** Botchain Testnet (Chain ID: 968)  
**Smart Contract:** `0x37261E07640A9B2e394d44d2FF1a2100131Fd8d0`  
**Explorer:** [https://scan.bohr.life/address/0x37261E07640A9B2e394d44d2FF1a2100131Fd8d0#code](https://scan.bohr.life/address/0x37261E07640A9B2e394d44d2FF1a2100131Fd8d0#code)  
**Source Code:** [https://github.com/liljhnxn/bookloop](https://github.com/liljhnxn/bookloop)  
**Tagline:** *"Share a Book. Spread Knowledge."*

---

## 1. Executive Summary

Every year, hundreds of millions of physical books are printed, read once, and relegated to dusty bookshelves or landfills. Meanwhile, millions of passionate readers face economic barriers to acquiring books, and community libraries struggle with centralized overhead, inventory decay, and bureaucratic barriers.

**BookLoop** is a zero-fee, tokenless decentralized application (dApp) built on the Botchain network that transforms physical book gifting into a verifiable, peer-to-peer on-chain public good. By replacing centralized databases with an immutable Solidity smart contract (`BookLoop.sol`), BookLoop provides transparent provenance for physical literature without requiring tokens, subscriptions, or intrusive data collection.

---

## 2. Problem Statement

1. **Idle Knowledge & Physical Waste**: The average book sits untouched on a shelf for over 95% of its lifespan after its initial reading.
2. **Economic & Access Disparity**: Educational and literary texts remain prohibitively priced for students and avid readers across many global regions.
3. **Fragility of Centralized Platforms**: Existing book-swapping communities rely on centralized databases that monetize user data, charge platform fees, or shut down when hosting costs exceed revenues.
4. **Web3 Financialization Fatigue**: Most blockchain applications impose speculative tokens, volatile cryptocurrencies, or artificial NFT paywalls on everyday human interactions where financialization is counterproductive.

---

## 3. The BookLoop Solution

BookLoop operates on the principle that **information wants to circulate**. It provides:

- **Free, Tokenless Access**: Anyone with an EVM-compatible Web3 wallet (e.g., MetaMask) can list or claim books without buying platform tokens or minting costly NFTs.
- **100% On-Chain State**: All metadata (title, author, genre, owner, claimer, status, and chronological timestamps) is stored directly on the blockchain.
- **Immutable Provenance**: Every book carries an on-chain ledger showing its original lister, who claimed it, and when it was confirmed collected.
- **Warm, Human-Centric Interface**: Built with warm beige, espresso brown, cream, and burnt orange hues designed to feel like a cozy, collegiate reading room rather than a hyper-financialized crypto exchange.

---

## 4. Technical Architecture

```
┌────────────────────────────────────────────────────────┐
│                   BookLoop Frontend                    │
│     (Next.js 14 App Router + Tailwind CSS + Wagmi)      │
└───────────────────────────┬────────────────────────────┘
                            │ RPC Calls (read / write)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Botchain Testnet                     │
│               Chain ID: 968 | Currency: BOHR           │
├────────────────────────────────────────────────────────┤
│                   BookLoop.sol                         │
│  - listBook(...)                                       │
│  - claimBook(...)                                      │
│  - markAsCollected(...)                                │
│  - removeListing(...)                                  │
│  - State Machine: Available ➔ Claimed ➔ Collected      │
└────────────────────────────────────────────────────────┘
```

### 4.1 Smart Contract Specification (`BookLoop.sol`)
The protocol uses a singleton Solidity contract (`^0.8.20`) with strict deterministic state transitions:

```solidity
enum BookStatus {
    Available,  // 0: Listed and ready for reader claim
    Claimed,    // 1: Claimed by a reader; awaiting physical exchange
    Collected,  // 2: Confirmed received by original owner
    Removed     // 3: Withdrawn by owner before any claim
}
```

### 4.2 State Transition Machine
1. **Listing (`listBook`)**:
   - Owner invokes `listBook` with `title`, `author`, `description`, `category`.
   - Contract checks that fields are non-empty.
   - Emits `BookListed(bookId, owner, title, author, category, timestamp)`.
   - Increments `totalBooksListed`.
2. **Claiming (`claimBook`)**:
   - Prospective reader invokes `claimBook(bookId)`.
   - Guardrails:
     - `require(book.status == BookStatus.Available)` prevents race conditions and double claims.
     - `require(book.owner != msg.sender)` prohibits owners from claiming their own listings.
   - Updates status to `Claimed`, sets `claimer = msg.sender`, and records `claimedAt`.
   - Emits `BookClaimed(bookId, claimer, owner, timestamp)`.
3. **Collection Confirmation (`markAsCollected`)**:
   - Upon physical handover or delivery, the original owner calls `markAsCollected(bookId)`.
   - Guardrails:
     - `require(msg.sender == book.owner)` ensures only the donor can confirm handover.
     - `require(book.status == BookStatus.Claimed)` ensures orderly lifecycle.
   - Updates status to `Collected`, records `collectedAt`, and increments `totalBooksShared`.
   - Emits `BookCollected(bookId, owner, claimer, timestamp)`.
4. **Withdrawal (`removeListing`)**:
   - An owner may withdraw an unclaimed book via `removeListing(bookId)`.
   - Guardrails: Only possible while `status == Available` and caller is owner.
   - Decrements `totalBooksListed` and emits `BookRemoved`.

---

## 5. Security & Verification

- **Reentrancy Immunity**: No external asset transfers, native ether balances, or token interactions occur; reentrancy attack vectors are structurally non-existent.
- **Zero Arbitrary External Calls**: The contract acts as a closed, deterministic registry.
- **Formal Unit Testing**: 14 automated tests cover edge cases including self-claims, double claims, unauthorized withdrawals, and non-existent IDs.
- **Verified Source Code**: Bytecode and source code are permanently verified on BohrScan:
  `https://scan.bohr.life/address/0x37261E07640A9B2e394d44d2FF1a2100131Fd8d0#code`

---

## 6. Social Impact & Tokenless Economics

BookLoop rejects artificial tokenization. Knowledge is a public good, and physical book gifting thrives on reciprocal human trust. By maintaining a 100% on-chain record:
1. **Public Provenance**: Readers can observe the journey of a single copy as it travels between community members.
2. **Zero Platform Rent**: No middleman takes a percentage of book handovers.
3. **Sybil Resistance via Physicality**: The requirement to physically pass on the physical book grounds the digital contract in real-world community relationships.

---

## 7. Roadmap

- **Phase 1 (Completed)**: Core smart contract deployment, BohrScan verification, 14 unit tests, Next.js one-page dApp, MetaMask connectivity.
- **Phase 2**: Printable QR code bookplate bookmarks auto-generated per `bookId`, linking directly to the on-chain BohrScan provenance record.
- **Phase 3**: Physical campus and neighborhood drop box integrations ("Little Free Library" on-chain nodes).
- **Phase 4**: ENS & Lens Protocol social badge integration for reader recognition.

---

## 8. Conclusion

BookLoop proves that blockchain technology's greatest utility lies not in financial speculation, but in verifiable coordination for the common good. By joining on-chain immutability with physical book lending, BookLoop ensures that every book receives another reader.
