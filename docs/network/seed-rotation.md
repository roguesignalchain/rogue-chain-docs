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
| **Epoch Duration** | `2048 blocks` | Number of blocks between seed changes (~5.7 hours) |
| **Seed Lag** | `64 blocks` | Safety buffer preventing race conditions during dataset generation |
| **Dataset Size** | `2080 MiB` | Fast dataset stored in RAM |
| **Scratchpad Size** | `2 MiB` | Fast L3 cache execution memory per thread |

---

## 🛡️ The 64-Block Lag Mechanism

Initializing the RandomX dataset takes several seconds even on modern multi-threaded processors. If the seed hash was selected from the immediate previous block ($H-1$), nodes would face severe latency and miss blocks while initializing the new dataset.

To resolve this:
* The seed for an epoch beginning at block `H` is derived from block hash at:
  ```text
  Seed Block Number = H - 64
  ```
* This gives all mining software and node validators a guaranteed **640-second (64-block) window** to compute and prepare the new dataset in the background before the epoch switchover block arrives.
