---
title: RandomX Seed Epochs & Lag
description: Seed block rotation mechanism and epoch lag prevention in Rogue Signal.
---

# RandomX Seed Epochs & Lag

RandomX relies on a pseudo-random cryptographic key (the **seed hash**) derived from the blockchain history to generate its 2080 MiB dataset. To guarantee determinism across all participating nodes, Rogue Signal incorporates a periodic seed rotation mechanism.

---

## 🔄 Epoch Schedule & Parameters

| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Epoch Duration** | `2048 blocks` | Number of blocks between seed changes (~17.07 hours at 30s/block) |
| **Seed Lag** | `64 blocks` | Safety buffer (~32 minutes) preventing race conditions during dataset generation |
| **Dataset Size** | `2080 MiB` | Fast dataset stored in RAM (initialized with `runtime.NumCPU() / 2` workers) |
| **Scratchpad Size** | `2 MiB` | Fast L3 cache execution memory per thread |

---

## 🛡️ The 64-Block Lag & Reorg-Safe Seed Mechanism

Initializing the RandomX dataset takes several seconds even on modern multi-threaded processors. If the seed hash was selected from the immediate previous block (`H-1`), nodes would face severe latency and miss blocks while initializing the new dataset.

To resolve this:
* The seed for an epoch `E` beginning at block `H = E * 2048` is derived from the canonical block hash at:
  ```text
  Seed Block Number = (E * 2048) - 64
  ```
* This gives all mining nodes and validators a guaranteed **1,920-second (~32-minute / 64-block) window** to compute and prepare the new dataset in the background using `max(1, runtime.NumCPU() / 2)` threads before the epoch switchover block arrives.
* **Canonical Seed Cross-Checking:** Whenever `EpochManager.GetSeed` or `GetContext` is invoked, the node verifies that the cached seed hash for epoch `E` still matches `chain.GetHeaderByNumber(seedBlock)`. If a legitimate reorganization modifies the seed block, the stale context is safely closed (`defer ctx.mu.RUnlock()` CGo memory guard) and rebuilt automatically.
