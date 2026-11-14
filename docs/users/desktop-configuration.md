---
sidebar_position: 3
title: Desktop Configuration & Vault Security
description: Complete reference for all Rogue Desktop Client settings, node parameters, database maintenance, and Argon2id + AES-256-GCM vault security.
---

# Desktop Configuration & Vault Security

This guide explains every configuration option available in the **Settings** tab of **Rogue Desktop Client**, how those settings map to the underlying `core-rogue` daemon, and how your private keys are protected on disk.

---

## ⚙️ Settings Reference

### 1. Local Node Manager Settings

These parameters control the embedded `core-rogue` sidecar process managed by the Desktop Client. Changes take effect the next time you stop and start the node.

| Setting | Default Value | Underlying CLI Flag | Description & Guidance |
| :--- | :--- | :--- | :--- |
| **P2P Port** | `38888` | `--port` | TCP/UDP port used to discover peers and gossip blocks/transactions. Forward this port on your router/firewall for stronger peer connectivity. |
| **HTTP RPC Port** | `38845` | `--http.port` | Local port (`127.0.0.1`) where `core-rogue` serves JSON-RPC 2.0 requests. Includes a quick-sync button to automatically update your **RPC Endpoint URL** to match. |
| **WebSocket Port** | `0` (Disabled) | `--ws.port` | Set to `0` by default to prevent port collisions if another node is running locally. Set to `38846` (or another free port != HTTP port) to enable `--ws` subscriptions. |
| **Data Directory (`datadir`)** | OS App Data / `./nodes-local/node-desktop` (dev) | `--datadir` | Filesystem path where `geth/chaindata` (blockchain state & blocks) is stored. Requires 100–200+ GB of free SSD/NVMe space as the chain grows. |
| **Bootnodes** | Default Rogue Signal seed `enode://...` | `--bootnodes` | Comma-separated list of `enode://<pubkey>@<ip>:<port>` URLs used to bootstrap P2P discovery on startup. Leave empty to fall back to `ROGUE_BOOTNODES` or built-in network defaults. |
| **Database Cache (MB)** | `256` | `--cache` | Memory (in MiB) allocated to LevelDB / state trie caching. Click **Check System Resources** in Settings to automatically detect your CPU cores and available RAM and apply a recommended cache size. |
| **Sync Mode** | `full` | `--syncmode` | **Full validation is enforced** (`full`). Even if `snap` is selected in the UI, the Desktop Client's process manager enforces `--syncmode full` to guarantee complete RandomX PoW verification and avoid snap-sync state corruption. |
| **Log Verbosity** | `3` (Info) | `--verbosity` | Controls `core-rogue` log detail streamed to the **Node Console**: `0` (Silent), `1` (Error), `2` (Warn), `3` (Info), `4` (Debug), `5` (Detail/Trace). |

:::tip Resetting to Defaults
You can click **Reset Defaults** at any time in Settings to restore the standard Rogue Signal ports (`38845` HTTP, `38846` WS, `38888` P2P), `256 MB` cache, `full` sync mode, verbosity `3`, and `15` minute auto-lock.
:::

---

### 2. RPC & Application Security Settings

| Setting | Default Value | Description & Guidance |
| :--- | :--- | :--- |
| **RPC Endpoint URL** | `http://127.0.0.1:38845` | The JSON-RPC endpoint used by the Wallet, Dashboard, Mining, and Explorer views. Point this to `http://127.0.0.1:<port>` for your local node, or enter a remote/VPS node URL (e.g., behind HTTPS) if you do not want to run a local node. |
| **Auto-Lock Timer (Minutes)** | `15` | Automatically locks the decrypted wallet in memory after `N` minutes of inactivity. Set a shorter interval (e.g., `5` minutes) on shared or portable machines. |

---

### 3. Node Control & Database Maintenance (Danger Zone)

At the top of Settings, you can manually **Start Node** or **Stop Node** without restarting the Desktop Client.

At the bottom of Settings, the **Danger Zone** provides **Clean Chaindata**:
* **What it does:** Stops the managed `core-rogue` process (if running) and deletes the `geth/chaindata` directory inside your configured `datadir`. On the next start, the node re-initializes Block 0 and re-synchronizes the blockchain from scratch.
* **When to use it:** Only if your local blockchain database becomes corrupted after an unexpected power loss, or when switching between incompatible local testnets.
* **What it NEVER touches:** **Clean Chaindata does NOT delete your `.rogue-wallet.vault` or your private keys.** Your funds and wallets remain completely intact.

---

## 🔐 Vault Security & Cryptographic Architecture

The security of your `ROGUE` funds depends on the secrecy and integrity of your private keys. The Desktop Client implements a strictly self-custodial, zero-knowledge local vault architecture:

1. **CSPRNG BIP-39 Mnemonic Generation:**
   * New wallets generate a 12-word (128-bit entropy) or 24-word (256-bit entropy) English BIP-39 mnemonic phrase using the operating system's cryptographically secure random number generator.
   * Accounts are derived deterministically via **HMAC-SHA512** along the standard EVM BIP-44 path: `m/44'/60'/0'/0/0` (and `.../1`, `.../2`, etc. for additional accounts).

2. **Argon2id + AES-256-GCM Disk Encryption:**
   * All wallets, labels, and mnemonics are stored locally in `.rogue-wallet.vault`.
   * Your master password is never stored on disk. Instead, it is combined with a random 16-byte salt and stretched through **Argon2id** (a memory-hard key derivation function resistant to GPU/ASIC brute-force attacks) to derive a 256-bit encryption key.
   * The vault payload is encrypted and authenticated using **AES-256-GCM** with a unique cryptographic nonce, protecting both confidentiality and tamper integrity.

3. **In-Memory Signing Only:**
   * Transactions are signed in memory inside the Rust backend (`secp256k1`) and transmitted to the node as signed Legacy (`Type 0`) hex payloads. Private keys are never exposed to RPC endpoints or network peers.

---

## ⚠️ Safe Backup Best Practices

> [!CAUTION]
> Never store your 12 or 24-word seed phrase unencrypted in email, cloud storage, screenshots, or chat applications. Anyone who obtains your seed phrase has immediate, irreversible access to all derived accounts and funds.

* **Physical Offline Backup:** Write your recovery phrase down on paper or stamp it onto a fireproof metal backup plate, and store it in a secure physical location.
* **Verify Recovery Before Large Transfers:** After creating a wallet, verify that you recorded every word in the exact order before sending significant `ROGUE` balances to it.
* **Strong Master Password:** Use a unique, high-entropy master password for `.rogue-wallet.vault` so that even if a local disk backup is exposed, the Argon2id + AES-256-GCM encryption cannot be brute-forced.
* **Back Up the Vault File (Optional):** You can safely back up `.rogue-wallet.vault` alongside your physical seed phrase backup, provided you remember your master password.

