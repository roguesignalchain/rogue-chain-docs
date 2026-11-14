---
sidebar_position: 2
title: Local Devnets, Multi-Node Clusters & CLI
description: Developer reference for core-rogue CLI flags, bootnode resolution, multi-node local clusters, IPC administration, and protocol hardening.
---

# Local Devnets, Multi-Node Clusters & CLI

This guide covers advanced `core-rogue` CLI operations, dynamic bootnode resolution, spinning up multi-node local clusters for testing consensus/finality, and administering nodes over local IPC.

---

## 📋 Complete CLI Flag Reference

| Flag | Default / Standard | Description |
| :--- | :--- | :--- |
| `--rogue` | Required | Activates Rogue Signal network genesis (`Chain ID 800055`), RandomX consensus, LWMA-1, and ECBP-1100 MESS. |
| `--datadir <path>` | `~/.ethereum/rogue` | Blockchain data directory (`geth/chaindata` and `geth.ipc`). |
| `--port <port>` | `38888` | P2P TCP/UDP listening port. |
| `--bootnodes <enodes>` | `ROGUE_BOOTNODES` / `params.RogueBootnodes` | Comma-separated `enode://` URLs (highest priority). |
| `--syncmode <mode>` | `full` | Synchronization mode. Always use `full` for complete RandomX PoW verification. |
| `--cache <MB>` | `256` (or `1024`+) | Memory (MiB) allocated to LevelDB and state trie caching. |
| `--http` | `false` | Enables the HTTP JSON-RPC 2.0 server. |
| `--http.addr <ip>` | `127.0.0.1` | Listening interface for HTTP-RPC. |
| `--http.port <port>` | `38845` | Listening port for HTTP-RPC. |
| `--http.api <apis>` | `eth,net,web3,rogue` | Comma-separated RPC modules exposed over HTTP. |
| `--http.maxconnsperip <N>` | `100` | Per-IP concurrent HTTP/WS request limit (returns `HTTP 429` with `Retry-After: 1` when exceeded). |
| `--http.trustedproxies <cidrs>` | *(fail-closed)* | Comma-separated proxy CIDRs (e.g., `127.0.0.1/32`) for extracting real client IPs behind Nginx/Caddy/Cloudflare via Rightmost Untrusted IP. |
| `--ws` | `false` | Enables the WebSocket JSON-RPC server. |
| `--ws.port <port>` | `38846` | Listening port for WebSocket RPC. |
| `--authrpc.port <port>` | `8551` | Internal AuthRPC port (change per instance when running multiple nodes on one host). |
| `--verbosity <0..5>` | `3` | Log level (`0`=Silent, `1`=Error, `2`=Warn, `3`=Info, `4`=Debug, `5`=Trace). |
| `--mine` | `false` | Enables the internal RandomX CPU miner. |
| `--miner.threads <N>` | CPU-dependent | Number of RandomX hashing threads. |
| `--miner.etherbase <0x...>` | *(treasury fallback)* | Payout address for the 95% block reward (`23.75 ROGUE`) + tx fees. |
| `--miner.extradata "<tag>"` | `""` | Custom miner tag (up to `64` bytes) to differentiate `sealhash` targets. |
| `--randomx.fast` | `false` | Allocates the ~2.08 GB Fast Mode RandomX dataset (Light Mode ~256 MB when omitted). |

---

## 🌐 Bootnode Resolution Priority

When `--rogue` is active, `core-rogue` resolves bootstrap peers in strict order:

1. **`--bootnodes` CLI flag** — Highest priority; overrides all other sources.
2. **`ROGUE_BOOTNODES` environment variable** — Comma-separated `enode://` URLs evaluated dynamically when `--bootnodes` is omitted.
3. **`params.RogueBootnodes`** — Compiled mainnet bootnodes (intentionally empty during pre-mainnet development).
4. **Static / Manual Peers** — `<datadir>/geth/static-nodes.json` or `admin.addPeer(...)` over IPC.

---

## 🧪 Running a Multi-Node Local Cluster

To enforce anti-eclipse protection (`defaultMinSyncPeers = 3`) and full **ECBP-1100 (MESS)** artificial finality (`minArtificialFinalityPeers = 3`), staging and test topologies should run **at least 3 connected nodes**.

*(Note: Isolated 1-node or 2-node local devnets still sync and mine blocks normally via the 10-second `forceSyncCycle` ticker; MESS re-activates automatically once 3+ peers connect.)*

### Example: 3-Node Local Test Cluster

When running multiple nodes on the same machine, assign unique `--datadir`, `--port`, `--http.port`, and `--authrpc.port` values to avoid port collisions:

#### 1. Initialize All 3 Data Directories
```bash
./build/bin/core-rogue --rogue --datadir ./nodes-local/node1 init
./build/bin/core-rogue --rogue --datadir ./nodes-local/node2 init
./build/bin/core-rogue --rogue --datadir ./nodes-local/node3 init
```

#### 2. Start Node 1 (Seed / Miner)
```bash
./build/bin/core-rogue --rogue \
  --datadir ./nodes-local/node1 \
  --port 38888 \
  --http --http.port 38845 --http.api eth,net,web3,randomx \
  --authrpc.port 8551 \
  --mine --miner.threads 2 --miner.etherbase 0xYourTestAddress --miner.extradata "node-1"
```

#### 3. Retrieve Node 1's `enode://` URL via IPC
```bash
./build/bin/core-rogue attach ./nodes-local/node1/geth.ipc --exec "admin.nodeInfo.enode"
```

#### 4. Start Node 2 & Node 3 Pointing to Node 1
```bash
export ROGUE_BOOTNODES="enode://<node1-pubkey>@127.0.0.1:38888"

# Node 2
./build/bin/core-rogue --rogue \
  --datadir ./nodes-local/node2 \
  --port 38889 \
  --http --http.port 38847 --http.api eth,net,web3,randomx \
  --authrpc.port 8552

# Node 3
./build/bin/core-rogue --rogue \
  --datadir ./nodes-local/node3 \
  --port 38890 \
  --http --http.port 38849 --http.api eth,net,web3,randomx \
  --authrpc.port 8553
```

---

## 🔒 Administrative IPC Console (`geth.ipc`)

The `randomx` administrative namespace (including `randomx_setFastMode`) and `admin` / `miner` controls are intentionally excluded from default public HTTP/WS modules to prevent unauthenticated memory-allocation DoS attacks.

Use local IPC (`<datadir>/geth.ipc`) for trusted local administration:

```bash
# Attach an interactive JavaScript console
./build/bin/core-rogue attach ~/.local/share/rogue-signal/chaindata/geth.ipc
```

Common IPC commands:
```js
// Inspect node identity and connected peers
admin.nodeInfo.enode
admin.peers.length

// Dynamically set or update miner payout address
miner.setEtherbase("0xYourRogueAddressHere")

// Query live RandomX consensus & VM pool telemetry
randomx.getConsensusStatus()

// Toggle Fast Mode (~2.08 GB dataset) for the next epoch context
randomx.setFastMode(true)
```

---

## 🌐 Production Reverse Proxy Hardening

If you expose a node's HTTP-RPC behind **Nginx**, **Caddy**, **Traefik**, or **Cloudflare**, keep `--http.addr 127.0.0.1` and configure `--http.trustedproxies`:

```bash
./build/bin/core-rogue --rogue \
  --http --http.addr 127.0.0.1 --http.port 38845 \
  --http.trustedproxies "127.0.0.1/32" \
  --http.maxconnsperip 100
```

`core-rogue` fails closed by default (using direct socket IP) and only parses `X-Forwarded-For` (using the **Rightmost Untrusted IP** algorithm, with `X-Real-IP` fallback) from explicitly trusted proxy CIDRs, preventing rate-limit bypasses via header spoofing.

