---
title: Consensus Parameters & LWMA-1
description: Mathematical rules, difficulty adjustment, and supply emission model.
---

# Consensus Parameters & LWMA-1

Rogue Signal implements an institutional-grade consensus architecture designed to prevent timestamp manipulation, block withholding attacks, and violent hashrate oscillations.

---

## 📐 LWMA-1 Difficulty Adjustment Algorithm

Unlike Bitcoin's 2016-block difficulty window or Ethereum Classic's older difficulty bombs, Rogue Signal recalculates target difficulty on **every single block** using the **LWMA-1** (Linearly Weighted Moving Average) algorithm with window `N = 60`:

```text
Next Target = (Average Target * sum(i * delta_t_i)) / (0.5 * N * (N + 1) * T)
```

Where:
* `N = 60` (The number of sample past blocks, ~30-minute observation window)
* `T = 30s` (Target block confirmation interval)
* `delta_t_i = clamp(t_i - t_{i-1}, 1s, 6*T)` (Clamped solve time differences between `1s` and `180s`)
* Per-block difficulty adjustments are clamped between `67%` (`MaxClampDownFactor`) and `133%` (`MaxClampUpFactor`) of `parent.Difficulty`.

### Why LWMA-1?
* **Candidate Timestamp Independence:** Block `N` difficulty is computed exclusively from closed historical blocks (`N-k .. N-1`). A miner cannot manipulate their own candidate `header.Time` to lower their block's difficulty.
* **Deterministic Ancestor Verification:** If any intermediate ancestor block in the LWMA-1 observation window is missing, the engine deterministically rejects verification with `consensus.ErrUnknownAncestor` instead of falling back to stale difficulty values.
* **Instant response:** Adjusts smoothly to sudden hashing spikes or drops.
* **Resistance to rental & flash-mining attacks:** Hashpower rented for short intervals cannot game difficulty downward before leaving the network stranded.

---

## ⏱️ Strict Timestamp & Header Rules

To protect against "timewarp", difficulty manipulation, and header bloat attacks:

1. **MTP-11 (Past Median Time):**
   * The timestamp of block `H` must be strictly greater than the median timestamp of the preceding 11 blocks (`H-11` through `H-1`). During local block assembly (`Prepare`), if out-of-order timestamps cause `parent.Time + 1 <= MTP-11`, the node automatically advances `header.Time = MTP-11 + 1`.
2. **Future Drift Limit:**
   * A candidate block's timestamp cannot exceed the local node's current wall-clock time by more than **15 seconds**. Blocks drifting further into the future are rejected.
3. **Header `ExtraData` Cap (`64 bytes`) & Two-Phase Parallel Verification:**
   * `header.Extra` is strictly capped at `64 bytes` (`MaxExtraDataSize`). `VerifyHeaders` validates lightweight header rules in microseconds before dispatching RandomX `VerifySeal` across `runtime.NumCPU()` parallel workers.
4. **Strict Uncle Block Prohibition (`UncleHash == EmptyUncleHash`):**
   * `header.UncleHash` must strictly equal `types.EmptyUncleHash`. Rogue Signal adopts the pure Bitcoin single-chain tree model (`ErrUnclesNotAllowed`), eliminating uncle malleability and uncle-grinding vulnerabilities.

---

## 🛡️ Three-Layer Anti-51% Finality

1. **Hard Rolling Finality (`MaxReorgDepth = 90` blocks):**
   * Reorganizations deeper than `90 blocks` (~45 minutes) are unconditionally rejected in `ForkChoice.ReorgNeeded`.
2. **ECBP-1100 (MESS) from Block 0:**
   * Late secret forks of depth `1..90` face a cubic polynomial gravity penalty requiring up to **`31x` the local subchain difficulty**.
3. **Anti-Selfish Mining Tie-Breaking:**
   * Equal-difficulty ties preserve locally mined blocks or break external ties via cryptographic 50/50 randomization (`crypto/rand`).

---

## 💰 Emission Schedule & Halving

* **Initial Block Reward:** 25 ROGUE
* **Halving Cadence:** Every 2,000,000 blocks (~1.90 years / ~694.44 days at 30s per block)
* **Miner Share (95%):** 23.75 ROGUE initially (+ 100% of block transaction fees)
* **Treasury Share (5%):** 1.25 ROGUE initially
* **Total Supply Cap:** 100,000,000 ROGUE (exact mathematical limit across 32 halving eras: 25 * 2,000,000 * 2 = 100,000,000 ROGUE, zero tail emission)
