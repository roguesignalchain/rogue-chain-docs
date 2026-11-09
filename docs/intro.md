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
| **Target Block Time** | `10 seconds` | Rapid confirmation cadence |
| **Block Reward** | `8 ROGUE` | 95% Miner (7.6 ROGUE) / 5% Protocol Treasury (0.4 ROGUE) |
| **Halving Schedule** | `6,300,000 blocks` | Halving interval occurs approximately every 2 years |
| **Maximum Supply** | `100,000,000 ROGUE` | Hard cap, zero tail emission |
| **Difficulty Algorithm** | `LWMA-1 (N=60)` | Linearly Weighted Moving Average over 60 blocks |
| **Timestamp Validation** | `Strict MTP-11` | Block time > Median of last 11 blocks, max 15s future drift |
| **Seed Rotation** | `2048 blocks` | RandomX seed epoch rotation with a 64-block epoch lag |

---

## 🛡️ Architectural Pillars

### 1. True ASIC Resistance with RandomX
Rogue Signal implements the battle-tested `RandomX` (`rx/0`) proof-of-work algorithm natively inside the node consensus layer. RandomX executes random instruction sequences in a dedicated virtual machine, rendering specialized ASIC hardware economically and architecturally unviable. Anyone with a modern consumer CPU can mine and validate the chain.

### 2. High-Performance EVM Composability
Built on a high-throughput Core-Geth foundation, Rogue Signal offers 100% compatibility with the Ethereum Virtual Machine, Solidity toolchains, Web3 libraries (`ethers.js`, `viem`, `web3.js`), and existing developer tooling like Hardhat, Foundry, and MetaMask.

### 3. Responsive Difficulty: LWMA-1
Sudden hash rate fluctuations (hash jumps or rental attacks) are smoothly absorbed by the **LWMA-1** difficulty adjustment engine. By calculating a linearly weighted average over the previous 60 blocks, the network rapidly adapts to changes without the violent oscillations typical of legacy difficulty adjusters.

### 4. Sustainable Protocol Treasury
Every block minted splits rewards between the active block miner (95% / 7.6 ROGUE) and the multi-sig protocol treasury (5% / 0.4 ROGUE), ensuring perpetual developer funding, network maintenance, security audits, and ecosystem incentives without token pre-mines or ICO allocations.
