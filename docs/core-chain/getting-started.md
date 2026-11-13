---
title: Getting Started with Core Node
description: Quickstart guide to running the rogue-core-chain daemon.
---

# Getting Started with Core Node

The **`rogue-core-chain`** daemon (`core-rogue`) is the primary node software for the Rogue Signal network. Derived from Core-Geth and enhanced with native C++ RandomX static bindings, it handles peer-to-peer gossip, consensus verification, state execution, and JSON-RPC serving.

---

## 💻 System Requirements

### Recommended Hardware
* **CPU:** Modern 64-bit multi-core CPU (Intel Core 10th+ gen or AMD Ryzen 3000+ with AVX2 & AES-NI support)
* **RAM:** 8 GB DDR4/DDR5 (16 GB recommended if running an active RandomX miner dataset)
* **Storage:** 200 GB+ NVMe SSD
* **Network:** Stable broadband connection (10+ Mbps)
* **OS:** Linux (Ubuntu 22.04+ / Debian 12+), macOS (Apple Silicon or Intel), or Windows 10/11 (64-bit)

---

## 🚀 Running the Node

Once built or downloaded from the official release page, initialize and launch the node using the standard CLI:

```bash
# 1. Initialize genesis state (zero-friction headless init for Rogue Signal)
./build/bin/core-rogue --rogue --datadir ~/.ethereum/rogue init

# 2. Launch the node connected to Rogue Signal using standardized ports
./build/bin/core-rogue --rogue \
  --datadir ~/.ethereum/rogue \
  --port 38888 \
  --http --http.port 38845 --http.api "eth,net,web3,rogue"
```

### Essential CLI Flags

| Flag | Purpose | Rogue Signal Standard / Default |
| :--- | :--- | :--- |
| `--rogue` | Connects to the Rogue Signal network consensus rules and genesis | Required |
| `--datadir <path>` | Specifies custom blockchain data directory | `~/.ethereum/rogue` |
| `--port <port>` | Network P2P listening port | `38888` (generic default: `30303`) |
| `--bootnodes <enodes>` | Comma-separated `enode://` URLs (overrides `ROGUE_BOOTNODES` env var) | `ROGUE_BOOTNODES` / `params.RogueBootnodes` |
| `--http` | Enables the HTTP-RPC server | `false` |
| `--http.addr <ip>` | HTTP-RPC listening interface | `127.0.0.1` |
| `--http.port <port>` | HTTP-RPC listening port | `38845` (generic default: `8545`) |
| `--http.api <apis>` | Comma-separated list of enabled APIs (`eth,net,web3,rogue`) | `eth,net,web3,rogue` |
| `--ws` | Enables WebSocket RPC server | `false` |
| `--ws.port <port>` | WebSocket listening port | `38846` (generic default: `8546`) |
| `--mine` | Enables internal RandomX CPU mining | `false` |
| `--randomx.fast` | Enables Fast Mode (~2.08 GB dataset) when `--mine` is active | `false` (Light Mode ~256 MB) |

:::tip Dynamic Bootnodes & Security
* **Dynamic Bootnodes:** While `RogueBootnodes` is empty during development, you can inject bootnodes via the `ROGUE_BOOTNODES` environment variable or `--bootnodes`. See [Node Configuration & Bootnodes](./configuration.md) for details.
* **RPC Hardening:** The `randomx` administrative namespace (e.g., `randomx_setFastMode`) is excluded from default HTTP/WS modules to prevent unauthenticated memory-allocation DoS. Use local IPC (`geth.ipc`) for administrative calls, or query `rogue_getConsensusStatus` over HTTP.
:::

---

## 🔍 Verifying Node Synchronization

You can check whether your node is synchronized by executing a simple JSON-RPC call using `curl`:

```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
  http://127.0.0.1:38845
```

* If the node is synchronized, it returns `false`.
* If syncing is in progress, an object with `startingBlock`, `currentBlock`, and `highestBlock` is returned.
