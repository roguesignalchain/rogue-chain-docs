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

Once built or downloaded from the official release page, launch the node using the standard CLI:

```bash
# Launch the node connected to Rogue Signal mainnet
./build/bin/core-rogue --rogue --http --http.api "eth,net,web3,miner,randomx"
```

### Essential CLI Flags

| Flag | Purpose | Default |
| :--- | :--- | :--- |
| `--rogue` | Connects to the Rogue Signal mainnet consensus rules and genesis | Required |
| `--datadir <path>` | Specifies custom blockchain data directory | `~/.ethereum/rogue` |
| `--http` | Enables the HTTP-RPC server | `false` |
| `--http.addr <ip>` | HTTP-RPC listening interface | `127.0.0.1` |
| `--http.port <port>` | HTTP-RPC listening port | `8545` |
| `--http.api <apis>` | Comma-separated list of enabled APIs (`eth,net,web3,miner,randomx`) | `eth,net,web3` |
| `--ws` | Enables WebSocket RPC server | `false` |
| `--ws.port <port>` | WebSocket listening port | `8546` |
| `--port <port>` | Network P2P listening port | `30303` |

---

## 🔍 Verifying Node Synchronization

You can check whether your node is synchronized by executing a simple JSON-RPC call using `curl`:

```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
  http://127.0.0.1:8545
```

* If the node is synchronized, it returns `false`.
* If syncing is in progress, an object with `startingBlock`, `currentBlock`, and `highestBlock` is returned.
