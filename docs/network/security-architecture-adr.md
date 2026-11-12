---
title: Security Architecture & ADRs
description: Comprehensive Consensus Security Architecture, Anti-51% Defenses, and Architecture Decision Records (ADR-001 through ADR-006) for Rogue Signal.
---

# Consensus Security Architecture & ADRs

This document serves as the official engineering and cryptoeconomic Architecture Decision Record (ADR) reference for **Rogue Signal (Chain ID `800055`)**. It details all protocol security layers, low-level consensus protections implemented in `rogue-core-chain` and `rogue-desktop-client`, mitigated attack vectors, evaluated design alternatives, and the mathematical and physical rationale behind every consensus rule.

---

## 1. Master Network & Consensus Security Matrix

| Parameter | Official Specification | Source Module | Security & Economic Purpose |
| :--- | :--- | :--- | :--- |
| **Network Name** | `Rogue Signal` | `params/config_rogue.go` | Production EVM Proof-of-Work Layer 1 |
| **Ticker** | `ROGUE` | Ecosystem-wide | Native asset (`18` decimals, `10^18 wei`) |
| **Chain ID / Network ID** | `800055` (`0xc3537`) | `params/config_rogue.go` | Strict Replay Protection (`EIP-155` active from Block 0) |
| **PoW Algorithm** | `RandomX (rx/0)` | `consensus/randomx/` | ASIC & GPU resistance via dynamic CPU execution & L3 cache |
| **Target Block Time (`T`)** | `30 seconds` | `DefaultTargetBlockTime` (`difficulty.go`) | Minimizes global P2P orphan rate (`< 0.5%`) under strict no-uncles rule |
| **Initial Base Reward** | `25 ROGUE` | `InitialBaseReward` (`rewards.go`) | Scaled `3x` for 30s cadence to preserve the 2-year emission curve |
| **Reward Split** | `95% Miner / 5% Treasury` | `SplitReward` (`rewards.go`) | `23.75 ROGUE` Miner / `1.25 ROGUE` Protocol Development Treasury |
| **Halving Interval** | `2,000,000 blocks` (~1.90 years) | `HalvingInterval` (`rewards.go`) | Reward halves every `2,000,000 * 30s` (~694.44 days (~1.90 years)) |
| **Maximum Supply Cap** | `100,000,000 ROGUE` | `MaxSupplyCap` (`rewards.go`) | Strict cap across 32 halving eras (`MaxHalvingEras = 32`), zero tail emission |
| **Difficulty Adjustment (DAA)** | `LWMA-1 (N = 60)` | `CalculateDifficulty` (`difficulty.go`) | 60-block (~30 min) linearly weighted window, `+-33%` per-block clamp |
| **Minimum / Genesis Difficulty** | `0x10000` (`65,536`) | `MinDifficulty` (`difficulty.go`) | Smooth genesis bootstrap for consumer CPUs (~2.1 KH/s) |
| **Past Timestamp Rule** | `Strict MTP-11` | `CalculateMTP11` (`difficulty.go`) | `header.Time > Median(last 11 blocks)` |
| **Max Future Clock Drift** | `30 seconds` | `MaxFutureDrift` (`difficulty.go`) | `header.Time <= time.Now() + 30s` |
| **Anti-51% Defense (Layer 1)** | `ECBP-1100 (MESS)` from Block 0 | `ECBP1100FBlock = 0` (`blockchain_af.go`) | Polynomial gravity curve requiring up to `31x` TD for late secret forks |
| **Anti-Selfish Mining (Layer 2)** | `Eyal-Sirer Tie-Breaking` | `ReorgNeeded` (`forkchoice.go`) | Preserves local mined block or breaks ties via `crypto/rand` (50/50) |
| **Uncle Block Policy** | `Forbidden (ErrUnclesNotAllowed)` | `VerifyUncles` / `verifyHeader` | Pure Bitcoin block tree model (`header.UncleHash == EmptyUncleHash`) |
| **RandomX Seed Rotation** | `2048 blocks` (~17.07 hours) | `EpochLength` (`epoch.go`) | Standard `rx/0` epoch with `SeedLag = 64` blocks (~32 min precompute) |
| **Max `ExtraData` Size** | `64 bytes` | `MaxExtraDataSize` (`randomx.go`) | Allows descriptive node tags while preventing Header Bloat DoS |
| **Block Gas Limit** | `50,000,000 gas` (`0x2faf080`) | `genesis_rogue.go` / `miner.go` | High EVM throughput per 30-second block |
| **EVM Fee Model** | `Classical PoW (100% to Miner)` | `config_rogue.go` / `ethconfig` | No EIP-1559 burn; legacy (type 0) tx only; 100% fees to miner |
| **Minimum Gas Price (TxPool)** | `1 Gwei` (`10^9 wei`) | `eth/ethconfig/config.go` | P2P mempool spam protection against zero-fee floods (128 MB max RAM cap) |
| **Genesis Block Hash (Block 0)** | `0xf30f172028b07950de58d2cb4d65593793c183fcd0f86c9c24c5d4a037b490b7` | `RogueGenesisHash` (`genesis_rogue.go`) | Hardcoded in `RequireBlockHashes[0]` for cryptographic P2P isolation |
| **Genesis Cryptic Inscription** | `ROGUE::800055 // THE_SILICON_BELONGS_TO_THE_MANY // 09.11.26` | `genesis.json` / `genesis_rogue.go` | 60-byte cypherpunk inscription permanently embedded in Block 0 |

---

## 2. Architecture Decision Records (ADRs)

### ADR-001: Increasing Block Target Time from 10s to 30s & Monetary Scaling

#### Context & Problem Statement
In a global Proof-of-Work network enforcing a strict Bitcoin-style block tree (**zero Uncle/Ommer blocks allowed**, `ErrUnclesNotAllowed`), block discovery follows a memoryless Poisson process where the probability of discovering a block within `tau` seconds is:

```text
P(delta_t < tau) = 1 - exp(-tau / T)
```

* At `T = 10 seconds`, **18.1%** of all blocks are found within `< 2 seconds` and **9.5%** within `< 1 second`.
* Because intercontinental P2P propagation combined with RandomX CGo verification (~15-25 ms per hop in Light Mode) and EVM state execution takes `300 ms` to `1.5 seconds`, a 10-second interval without Uncle rewards causes frequent block collisions (*orphan/stale blocks*). This disproportionately penalizes home miners on residential connections compared to low-latency datacenter nodes.

#### Decision
1. **Increase `DefaultTargetBlockTime` from `10` to `30` seconds** in `consensus/randomx/difficulty.go`:
   * At `T = 30s`, the sub-1-second collision probability drops from `9.5%` to **`3.2%`**, reducing global orphan rates below **`< 0.5%`**.
2. **Proportional `3x` Monetary Scaling** in `consensus/randomx/rewards.go`:
   * **Initial Base Reward (`InitialBaseReward`)**: Scaled from `8 ROGUE` to **`25 ROGUE`** per block (`23.75 ROGUE` to the miner [95%] and `1.25 ROGUE` to the protocol treasury [5%]).
   * **Halving Interval (`HalvingInterval`)**: Adjusted from `6,300,000` blocks to **`2,000,000` blocks** (~1.90 years at 30s/block: `2,000,000 * 30s = 60,000,000 seconds` ~ `694.44 days`).
   * **Supply Cap Invariance**:
     ```text
     Total Supply = sum_{k=0..31} (25 / 2^k) * 2,000,000 = 100,000,000 ROGUE (100M Exact Hard Cap)
     ```
     The 2-year halving schedule and ~100M ROGUE maximum supply cap remain 100% invariant.

---

### ADR-002: Anti-Monopoly & Anti-Sybil Mining Architecture — Why the Proven Pure PoW Standard Was Selected Over Artificial Cooldowns

#### Context & Evaluated Alternatives
We analyzed whether the protocol should enforce a per-machine hashrate cap or a per-address cooldown (`Coinbase Cooldown`) coupled with an account maturity requirement (`Anti-Sybil Bond / Historical Lookback`) to prevent powerful machines from dominating block production.

Three alternative designs were rigorously evaluated before reaching the final architecture decision:

1. **Evaluated Alternative A — Hard Sliding-Window `Coinbase Cooldown`**:
   * *Concept*: Reject in `VerifyHeader` any block whose `header.Coinbase` already mined `>= 2` blocks in the last `10` blocks (with a 90s liveness escape valve) and automatically pause the local CPU miner during cooldown.
   * *Reason for Rejection*: Because PoW is a memoryless Poisson process, even in a network of 10 identical home miners, an honest miner naturally finds 3 consecutive blocks by pure statistical variance. Pausing their CPU or rejecting valid PoW blocks wastes honest thermodynamic security, delays or withholds legitimate miner yields, and introduces liveness edge cases.
2. **Evaluated Alternative B — Zero-Balance Header-Lookback Maturity Quota & Auto-Bonding**:
   * *Question Explored*: How could an Anti-Sybil seniority/bond rule work if new miners start with `0 ROGUE` balance?
   * *Evaluated Mechanisms*:
     * **Header-Lookback Seniority (`[N-100, N-11]`)**: Instead of requiring a prior token balance in `StateDB` (which breaks stateless *Header Sync* and creates a "chicken-and-egg" barrier for new users), a miner address acquires "Seniority Status" automatically after mining just 1 block that matures beyond 10 blocks (`[N-100, N-11]`). Unseasoned (`0 ROGUE`) addresses are permitted to mine up to `50%` of any 10-block window (`MaxFreshMinerBlocksInWindow = 5`) after a 50-block genesis bootstrap, while seasoned addresses compete for 100% of blocks subject to per-address cooldown.
     * **In-Protocol Auto-Bonding**: Deducting a fraction of the first mined block reward into a temporary vault lock in `FinalizeAndAssemble`.
   * *Reason for Rejection*: Although Header-Lookback Seniority cleanly solves the `0 ROGUE` cold-start problem without breaking *Header Sync*, any hard quota on fresh miner addresses still throttles block production during legitimate waves of new home miners joining the network.
3. **Evaluated Alternative C — Soft Per-Miner Difficulty Dampening**:
   * *Concept*: Increase target difficulty by `+10%` for a `Coinbase` address that repeats blocks within a short window.
   * *Reason for Rejection*: Advanced operators trivially bypass per-address difficulty dampening by cycling HD wallet addresses, penalizing only casual users who mine to a single static address.

#### Decision: The Proven Pure PoW Standard (4-Layer Physical & Protocol Decentralization)
Following the battle-tested standards of **Monero, Bitcoin, and Ethereum Classic**, **all artificial miner pauses and yield restrictions were eliminated** (every valid PoW block receives 100% of its reward immediately, and users can allocate 100% of their CPU threads freely). Instead, datacenter farms and specialized hardware are neutralized through **4 structural barriers**:

1. **RandomX (`rx/0`) L3 Cache Physical Bottleneck**: Every mining thread requires **2 MiB of dedicated CPU L3 cache** and continuous random access to a **2080 MiB RAM dataset**. ASICs cannot synthesize random dynamic machine code, GPUs suffer severe branch-divergence latency penalties, and multi-socket server CPUs are bottlenecked by memory bus bandwidth.
2. **Complete Removal of Stratum & Remote Mining RPCs (`eth_getWork` Disabled)**: In `consensus/randomx/api.go`, the Stratum bridge and `eth_getWork` / `eth_submitWork` / `eth_submitHashrate` RPCs are permanently disabled. A mining farm cannot point 500 lightweight `XMRig` workers at a single node: **every machine that mines must run a fully synchronized EVM node (`core-rogue`)** with its own chain database and its own RandomX memory context.
3. **30-Second Block Interval**: Eliminates the P2P latency advantage of datacenter fiber over residential internet connections.
4. **LWMA-1 (`N=60`) + ECBP-1100 (MESS)**: Neutralizes rented cloud-CPU 51% and coin-hopping attacks.

---

### ADR-003: Anti-51% Defense (`ECBP-1100 MESS` + Anti-Selfish Mining)

#### Context & Problem Statement
Early-stage CPU-mined PoW networks face the threat of an attacker renting cloud servers for an hour, mining a private fork in isolation (*Secret Shadow Chain*), and broadcasting it all at once to execute a deep reorganization (*Long-Range 51% Attack / Double Spend*).

#### Decision
We implemented **Pure ECBP-1100 (MESS) + Anti-Selfish Tie-Breaking Active from Block 0** across `core/forkchoice.go`, `core/blockchain.go`, and `params/config_rogue.go`:

1. **Layer 1 — ECBP-1100 (MESS) Artificial Finality**:
   * Late secret forks face a cubic polynomial gravity penalty requiring up to **`31x` the local subchain difficulty**, without hard-locking honest nodes out of legitimate deep syncs or partitions (`MaxReorgDepth` removed).
2. **Layer 2 — Modified Exponential Subjective Scoring (`ECBP-1100 MESS` in `core/blockchain_af.go` & `eth/sync.go`)**:
   * Activated from Block 0 (`ECBP1100FBlock = 0` in `RogueChainConfig` and enabled by default in `NewBlockChain`).
   * For forks of depth `1..90`, MESS applies a cubic polynomial gravity multiplier based on the age of the common ancestor (`delta_t = current.Time - commonAncestor.Time`), requiring a secret chain to accumulate up to **`31x` the local subchain difficulty** to be accepted.
   * Calibrated with `artificialFinalitySafetyInterval = 30 * 30 * time.Second` (**15 minutes** / 30 Rogue blocks), preventing false stale-chain detections during normal PoW block variance.
3. **Layer 3 — Anti-Selfish Mining Tie-Breaking (Eyal-Sirer Rule in `core/forkchoice.go`)**:
   * When `externTd == localTD`, the node preserves its own locally mined block (`currentPreserve`) or breaks ties between external blocks using a cryptographically seeded 50/50 random choice (`crypto/rand`).

---

### ADR-004: Time-Warp, Difficulty Manipulation & Flash-Mining Defenses

1. **Candidate Timestamp Independence in `LWMA-1`**:
   * In `consensus/randomx/difficulty.go`, `CalculateDifficulty(chain, time, parent)` computes block `N`'s difficulty exclusively from closed historical blocks `[N-k .. N-1]`. A miner cannot manipulate their own candidate `header.Time` to lower their block's difficulty.
2. **Deterministic Ancestor Verification**:
   * If any intermediate ancestor block in the LWMA-1 observation window is missing, `CalculateDifficulty` deterministically returns `consensus.ErrUnknownAncestor` instead of falling back to stale difficulty values.
3. **Solvetime Bounds & Per-Block Clamping (`+-33%`)**:
   * Individual solvetimes in the 60-block LWMA-1 window are bounded to `[1s, 6 * T = 180s]`, and per-block difficulty changes are clamped between **`67%`** (`MaxClampDownFactor`) and **`133%`** (`MaxClampUpFactor`) of `parent.Difficulty`.
4. **Strict `MTP-11` + `30s` Max Future Drift + `Prepare()` Timestamp Alignment**:
   * `VerifyHeaderTime` enforces `header.Time > CalculateMTP11(chain, parent)` and `header.Time <= now + 30`.
   * In `RandomX.Prepare` (`consensus/randomx/randomx.go`), if out-of-order timestamps in the last 11 blocks cause `header.Time <= CalculateMTP11(chain, parent)`, `Prepare` automatically advances `header.Time = mtp + 1` so local miners never seal a block that violates `ErrOlderBlockTime`.

---

### ADR-005: CGo Memory Safety, Context Concurrency & Two-Phase Parallel `VerifyHeaders`

1. **CGo `Use-After-Free` Fix & Nil-VM Defense in `RxContext.CalculateHash` (`consensus/randomx/rx_cgo.go`)**:
   * `ctx.mu.RLock()` is held via `defer ctx.mu.RUnlock()` across the entire VM pool checkout and `C.randomx_calculate_hash` call, preventing `ctx.Close()` from freeing C++ dataset/cache memory while any thread is actively hashing.
   * `CalculateHash` verifies interface typing and non-nil C VM pointers defensively (`!ok || vm == nil || vm.raw == nil`), returning a structured error rather than triggering a segmentation fault or panic under memory pressure.
2. **Epoch Concurrency Limiting & Context Bounding (`consensus/randomx/epoch.go`)**:
   * `EpochManager` uses an internal semaphore (`allocSem`, capacity 2) to limit concurrent CGo dataset allocations, protecting nodes against memory exhaustion DoS when peers announce conflicting headers.
   * Cached contexts are strictly bounded to `MaxCachedContexts = 3` with LRU epoch eviction.
   * Premature context deletion across competing branch seeds in `GetSeed` is eliminated, ensuring local mining threads are never interrupted by incoming side-fork sync batches.
3. **CPU-Friendly Dataset Precomputation (`NewFastDataset`)**:
   * Dataset initialization uses `max(1, runtime.NumCPU() / 2)` worker goroutines so background precomputation during the 64-block `SeedLag` window (~32 minutes) leaves 50% of CPU capacity available for P2P networking and active mining.
4. **Two-Phase Fail-Fast Parallel `VerifyHeaders`, ExtraData Cap & Uncle Prohibition**:
   * **Phase 1 (Fail-Fast in microseconds)**: Validates lightweight rules (`len(header.Extra) <= 64`, `header.UncleHash == EmptyUncleHash`, `MTP-11 + 30s drift`, `LWMA-1 difficulty`, `GasUsed <= GasLimit`, and non-nil optional fork field rejection) before touching CGo.
   * **Phase 2 (Parallel Worker Pool)**: Dispatches `VerifySeal` across `runtime.NumCPU()` worker goroutines, accelerating initial header sync and mitigating CPU exhaustion DoS attacks.

---

### ADR-006: P2P Genesis Anchoring, Mempool Spam Protection & Desktop RPC Hardening

1. **Cryptographic Genesis Anchoring (`RequireBlockHashes[0]`)**:
   * Block 0 (timestamp `1762711936` / `0x6910d980`, inscription `"ROGUE::800055 // THE_SILICON_BELONGS_TO_THE_MANY // 09.11.26"`) produces the canonical hash:
     ```text
     0xf30f172028b07950de58d2cb4d65593793c183fcd0f86c9c24c5d4a037b490b7
     ```
   * Locked in `RogueChainConfig.RequireBlockHashes[0]` (`params/config_rogue.go`) and synchronized in `genesis.json`.
2. **Mempool (`TxPool`) Anti-Spam Floor**:
   * Default `TxPool.PriceLimit` and miner `GasPrice` are set to **`1 Gwei` (`10^9 wei`)** with `GasCeil = 50,000,000` (`eth/ethconfig/config.go`, `miner/miner.go`).
3. **Desktop Client RPC & CORS Lockdown**:
   * In `rogue-desktop-client/src-tauri/src/process_manager.rs`, `--http.corsdomain` and `--ws.origins` are restricted to `tauri://localhost,http://tauri.localhost,http://localhost:1420,http://127.0.0.1:1420` and the legacy `personal` namespace is removed.
4. **Real-Time Consensus Diagnostics & Idempotent Mode Controls**:
   * Added `randomx_getEpochInfo` and `randomx_getConsensusStatus` (`consensus/randomx/api.go`) exposing full live consensus, epoch, reward, and finality metrics.
   * Node controls such as `randomx_setFastMode` are verified for idempotence across `RandomX`, `EpochManager`, and `API`.

