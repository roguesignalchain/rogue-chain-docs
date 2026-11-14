---
sidebar_position: 4
title: RandomX CPU Mining Guide
description: Complete guide to solo mining ROGUE on consumer CPUs using RandomX (rx/0) via core-rogue CLI or Rogue Desktop Client.
---

# RandomX CPU Mining Guide

Mining on **Rogue Signal** is built around **RandomX (`rx/0`)**, an ASIC-resistant Proof-of-Work algorithm designed to execute random instruction sequences on general-purpose CPUs. Because RandomX relies on CPU branch prediction, floating-point units, L3 cache, and high-bandwidth system memory, specialized ASICs and GPUs cannot achieve meaningful efficiency advantages over commodity processors.

---

## 🛡️ Anti-Farm Architecture: Full-Node Solo Mining Only

To protect network decentralization and prevent industrial mining farms or botnets from pointing thousands of stateless workers (`XMRig`) at a single node:

* **External Stratum Bridges & `eth_getWork` Are Permanently Disabled:** The `eth_getWork`, `eth_submitWork`, and `eth_submitHashrate` RPC methods are disabled at the consensus layer (`consensus/randomx/api.go`).
* **1 Node = 1 Independent Miner:** Every machine participating in Proof-of-Work must run a fully synchronized `core-rogue` node with its own EVM state and its own RandomX memory context.
* **Block Reward Split:** Every valid mined block mints **25 ROGUE** (`23.75 ROGUE` / 95% to the miner's `etherbase` + `1.25 ROGUE` / 5% to the Protocol Treasury) plus **100% of block transaction fees** to the miner.

---

## 💻 Option 1: GUI Mining with Rogue Desktop Client

For users who prefer a graphical interface:

1. Open **Rogue Desktop Client** and ensure your wallet is created or unlocked.
2. Wait for the node status in the sidebar to show connected peers and `100%` synchronization.
3. Navigate to the **Mining** tab.
4. Click **Check System Resources** (optional) to inspect your logical CPU cores and available RAM.
5. Choose your memory profile:
   * **Light Mode (~256 MiB RAM, Default):** Best for background mining or systems with 4–8 GB RAM.
   * **Fast Mode (~2080 MiB RAM):** Allocates the full 2.08 GB RandomX dataset for maximum CPU hashrate. Recommended for dedicated mining or systems with 16 GB+ RAM.
6. Set your **CPU Threads** slider (optimal efficiency is typically `L3 Cache (MiB) / 2`).
7. Click **Start Mining**. Live hashrate (`H/s`), active status, and discovered blocks will update in real time.

---

## ⛏️ Option 2: CLI Solo Mining with `core-rogue`

To mine directly from the command line:

```bash
./core-rogue \
  --rogue \
  --datadir ~/.local/share/rogue-signal/chaindata \
  --syncmode full \
  --mine \
  --miner.threads 8 \
  --miner.etherbase 0xYourRogueAddressHere \
  --miner.extradata "my-rig-01" \
  --randomx.fast
```

### Mining CLI Flags

| Flag | Purpose | Notes |
| :--- | :--- | :--- |
| `--mine` | Enables the internal RandomX CPU miner | Required for mining |
| `--miner.threads <N>` | Number of CPU hashing threads | Optimal: `L3 Cache (MiB) / 2` |
| `--miner.etherbase <0x...>` | Payout address for `23.75 ROGUE` + tx fees | If omitted, mining starts without blocking, logs a brief warning, and routes the 95% miner reward to the treasury until set via `--miner.etherbase` or `miner_setEtherbase` |
| `--miner.extradata "<tag>"` | Optional miner tag (max `64` bytes) | Ensures distinct `sealhash` targets if you run multiple independent nodes with the same `etherbase` |
| `--randomx.fast` | Enables Fast Mode (~2.08 GB dataset) | Omit for Light Mode (~256 MB) |

:::tip Running Multiple Independent Miners
If you run two separate full nodes on different machines paying out to the same `--miner.etherbase`, give each node a unique `--miner.extradata` string (e.g., `"rig-alpha"`, `"rig-beta"`) so they do not duplicate identical `sealhash` work.
:::

---

## 🧠 Memory & Concurrency Behavior

* **Zero-Redundancy Fast Mode RAM:** Once the ~2.08 GB `FastDataset` is initialized for an epoch, the temporary 256 MB `LightCache` is immediately released, saving 256 MB per epoch context.
* **Bounded Context Cache:** `EpochManager` retains up to `3` contexts in Light Mode (~768 MB max) and caps `FastMode` to `2` contexts (`MaxCachedContextsFast = 2`, ~4.16 GB max during 64-block seed transitions) to prevent out-of-memory (OOM) spikes.
* **Non-Blocking Asynchronous Sealing:** `Seal()` executes epoch context initialization and parallel `PrewarmVMs` asynchronously so the miner worker never stalls on epoch transitions or shutdown signals.
* **W^X / Kernel Fallback:** If a host kernel restricts JIT memory execution (`RANDOMX_FLAG_JIT`), `core-rogue` logs a clear warning and degrades gracefully to `RANDOMX_FLAG_SECURE` or interpreter mode.

---

## 🔗 Next Steps

* Maximize your CPU hashrate by enabling OS Huge Pages: [Huge Pages & CPU Tuning](./hugepages-tuning.md).
* Track your on-chain miner rank and XP progression (`Unranked Runner` → `Rogue Singularity`) in the Desktop Client Dashboard or via [JSON-RPC & `RogueMinerReputation`](../rpc/endpoints.md).

