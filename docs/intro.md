---
sidebar_position: 1
title: Overview & Specifications
description: Introduction to the Rogue Signal (ROGUE) Proof-of-Work blockchain protocol.
---

# Rogue Signal (ROGUE)

**Rogue Signal** is a decentralized, Proof-of-Work (PoW), EVM-compatible Layer 1 blockchain engineered for ASIC-resistant decentralization. By utilizing the **RandomX** proof-of-work algorithm alongside an Ethereum Virtual Machine (EVM) execution environment, Rogue Signal democratizes block validation and mining on standard consumer CPUs while preserving full smart-contract composability.

---

## ⚡ Core Network Parameters

| Parameter | Specification | Description |
| :--- | :--- | :--- |
| **Network Name** | `Rogue Signal` | Official network designation |
| **Ticker** | `ROGUE` | Native protocol token symbol |
| **Chain ID** | `800055` | EIP-155 replay protection chain ID |
| **Consensus Algorithm** | `RandomX (rx/0)` | General-purpose CPU-hard Proof-of-Work |
| **Target Block Time** | `30 seconds` | Low-orphan global confirmation cadence (`< 0.5%` orphan rate) |
| **Block Reward** | `25 ROGUE` | 95% Miner (23.75 ROGUE) / 5% Protocol Treasury (1.25 ROGUE) |
| **Halving Schedule** | `2,000,000 blocks` | Halving interval occurs approximately every 1.90 years (~694.44 days) at 30s cadence |
| **Maximum Supply** | `100,000,000 ROGUE` | Exact mathematical hard cap across 32 eras, zero tail emission |
| **Difficulty Algorithm** | `LWMA-1 (N=60)` | Linearly Weighted Moving Average over 60 blocks (~30 min window) |
| **Timestamp Validation** | `Strict MTP-11` | Block time > Median of last 11 blocks, max 30s future drift |
| **Anti-51% Finality** | `ECBP-1100 (MESS)` | Pure ECBP-1100 polynomial gravity (up to 31x TD, 15m safety interval) from Block 0 |
| **Seed Rotation** | `2048 blocks` | RandomX seed epoch rotation (~17.07h) with a 64-block (~32m) epoch lag |
| **Max ExtraData Size** | `64 bytes` | Header bloat DoS protection |
| **Block Gas Limit** | `50,000,000 gas` | High-throughput EVM block capacity (`1 Gwei` min TxPool floor, 128 MB RAM cap) |
| **Genesis Block Hash** | `0xf30f172028b07950de58d2cb4d65593793c183fcd0f86c9c24c5d4a037b490b7` | Cryptographically anchored in `RequireBlockHashes[0]` |

---

## 🛡️ Architectural Pillars

### 1. True ASIC & Farm Resistance with Full-Node RandomX
Rogue Signal implements the battle-tested `RandomX` (`rx/0`) proof-of-work algorithm natively inside the node consensus layer. RandomX executes random instruction sequences in a dedicated virtual machine requiring 2 MiB of CPU L3 cache per thread and a 2080 MiB RAM dataset, rendering ASICs and GPUs unviable. Furthermore, external Stratum bridges and `eth_getWork` RPCs are permanently disabled: every mining machine must run a full validating `core-rogue` node.

### 2. High-Performance EVM Composability
Built on a high-throughput Core-Geth foundation, Rogue Signal offers 100% compatibility with the Ethereum Virtual Machine, Solidity toolchains, Web3 libraries (`ethers.js`, `viem`, `web3.js`), and existing developer tooling like Hardhat, Foundry, and MetaMask.

### 3. Responsive Difficulty & Three-Layer Anti-51% Security
Sudden hash rate fluctuations (hash jumps or rental attacks) are smoothly absorbed by the **LWMA-1** (`N=60`) difficulty adjustment engine with `+-33%` per-block clamping and candidate timestamp independence. Deep reorganization attacks are neutralized from Block 0 via **ECBP-1100 (MESS)** exponential scoring.

### 4. Sustainable Protocol Treasury
Every block minted splits rewards between the active block miner (95% / 23.75 ROGUE) and the protocol treasury (5% / 1.25 ROGUE), ensuring perpetual developer funding, network maintenance, security audits, and ecosystem incentives without token pre-mines or ICO allocations.
