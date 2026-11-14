---
sidebar_position: 2
title: Using the Desktop Client
description: Complete user guide to installing and using Rogue Desktop Client—wallet, integrated node manager, RandomX CPU miner, local explorer, and console.
---

# Using the Rogue Desktop Client

The **`rogue-desktop-client`** is the official graphical wallet, local node manager, and RandomX CPU miner for the Rogue Signal blockchain. Built with **Tauri v2** (Rust) and **React**, it delivers native performance with a minimal memory footprint while embedding the `core-rogue` node binary directly as a managed sidecar.

---

## 🖥️ Platform Installers

Precompiled installers and portable packages are published on the [Rogue Desktop Client Releases](https://github.com/roguesignalchain/rogue-desktop-client/releases) page:

| Operating System | Available Formats | Notes |
| :--- | :--- | :--- |
| **Linux** | `.deb` (Debian/Ubuntu) & portable `.AppImage` | Make `.AppImage` executable with `chmod +x Rogue-Desktop*.AppImage` |
| **Windows** | `.msi` Installer & `.exe` (NSIS) | Requires Windows 10/11 (64-bit) with WebView2 Runtime |
| **macOS** | Universal `.dmg` (Apple Silicon & Intel) | Drag to Applications; if downloaded outside the App Store, allow via System Settings → Privacy & Security |

---

## 🚀 First Launch & Integrated Node Lifecycle

When you open **Rogue Desktop Client**, you do not need to configure a separate node manually:

1. **Automatic Binary Resolution:** The Rust backend (`process_manager.rs`) locates the bundled `core-rogue` sidecar next to the application executable (or falls back to a system `PATH` installation).
2. **Automatic Genesis Initialization:** If your configured data directory does not yet contain `geth/chaindata`, the client automatically runs `core-rogue --rogue --datadir <path> init` in the background to initialize Block 0 (`Chain ID 800055`).
3. **Reuse of Existing Local Nodes:** If a `core-rogue` node is already running and responding on your configured HTTP RPC port (default `38845`), the Desktop Client detects it and connects to that active instance instead of spawning a conflicting duplicate process.
4. **Clean Shutdown:** Closing the application gracefully terminates any sidecar node process it spawned, protecting the LevelDB chain database from corruption.

---

## 🧭 Interface Walkthrough

The left sidebar provides access to six core workspaces:

### 1. Dashboard
The **Dashboard** gives you an at-a-glance overview of your node, wallet, and mining status:
* **Node & Sync Telemetry:** Live indicator showing whether the local `core-rogue` process is running, its PID, connected P2P peer count, and current block height / sync percentage.
* **Active Wallet Balance:** Real-time `ROGUE` balance for the currently selected account.
* **On-Chain Miner Reputation:** Queries the `RogueMinerReputation` system contract (`0x0000000000000000000000000000000000000020`) directly via `eth_call` to display your current cyberpunk rank (e.g., *Unranked Runner* through *Rogue Singularity*), total blocks mined, and progress toward the next tier.
* **Recent Blocks:** Live feed of the latest blocks validated by your node.

---

### 2. Wallet
The **Wallet** view is a full self-custodial HD wallet backed by an encrypted local vault (`.rogue-wallet.vault`):

* **Create a New Wallet:** Generates a fresh **12-word or 24-word BIP-39 mnemonic** using a cryptographically secure random number generator (CSPRNG) and encrypts it with your master password.
* **Import an Existing Wallet:** Restore any existing BIP-39 seed phrase (12 or 24 words) and assign it a friendly label.
* **Multi-Wallet & HD Account Derivation:**
  * Store and switch between multiple independent wallets inside the same encrypted vault.
  * Derive additional addresses from the same seed phrase using the standard EVM BIP-44 derivation path: `m/44'/60'/0'/0/index`.
* **Sending `ROGUE` Transactions:**
  * Enter the recipient `0x...` address, amount in `ROGUE`, and review the gas fee (`1 Gwei` minimum gas price floor).
  * Transactions are signed locally in Rust using `secp256k1` and broadcast as **Legacy (`Type 0`)** raw transactions via `eth_sendRawTransaction`—your private keys never leave your machine.
* **Auto-Lock Security:** After a configurable period of inactivity (default **15 minutes**), the vault automatically locks in memory, requiring your master password to sign transactions or view sensitive seed material again.

---

### 3. Mining
The **Mining** tab turns your desktop into a full-node solo RandomX miner with zero external pool dependencies:

* **Hardware Diagnostics (`Check System Resources`):** Scans your CPU logical core count and available system RAM to calculate a safe, optimal thread count and memory profile.
* **Memory Mode Toggle (Light vs. Fast):**
  * **Light Mode (~256 MiB RAM, Default):** Ideal for background mining or machines with 4–8 GB RAM without impacting daily desktop responsiveness.
  * **Fast Mode (~2080 MiB RAM):** Allocates the full 2.08 GB RandomX dataset in RAM for maximum CPU hashrate. Recommended on systems with 16 GB+ RAM.
* **CPU Thread Slider:** Adjust how many threads to dedicate to RandomX hashing. For peak efficiency, match your CPU's L3 cache (`L3 Cache in MiB / 2`).
* **Payout Address (`Coinbase`):** Automatically uses your active unlocked wallet address (or any configured `etherbase` address) so **23.75 ROGUE** per mined block + 100% of block transaction fees go directly to you.
* **Sync-Gating Safety:** The Start Mining control ensures your node is running, connected to at least 1 peer, and synchronized with the chain tip before hashing begins, preventing wasted work on stale blocks.
* **Live Telemetry:** Displays real-time hashrate (`H/s`), active status, and recently mined blocks.

---

### 4. Explorer
The **Explorer** tab provides a built-in, trustless block and transaction browser backed directly by your local node's JSON-RPC API:
* Search or browse recent block numbers, block hashes, timestamps, miner (`coinbase`) addresses, gas used, and individual transaction receipts without relying on external web explorers.

---

### 5. Node Console
The **Node Console** streams live `stdout` and `stderr` log output directly from the managed `core-rogue` process:
* Monitor peer handshakes, block imports, RandomX dataset initialization, HugePages fallback notices, and mining block discoveries in real time.
* Useful for diagnosing firewall issues, bootnode connectivity, or custom flag behavior without opening a terminal.

---

### 6. Settings
The **Settings** tab exposes full control over the Desktop Client's RPC connection, auto-lock timer, local `core-rogue` node parameters, and database maintenance.

For a complete breakdown of every setting, default value, and security best practice, continue to [Desktop Configuration & Vault Security](./desktop-configuration.md).

