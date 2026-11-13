---
title: Node Configuration & Systemd
description: Configuring core-rogue as a persistent background service.
---

# Node Configuration & Systemd

Running a persistent node on a Linux server is best managed using a `systemd` service unit. This guarantees automatic restart upon crashes, graceful shutdown on server reboot, and structured log management via `journalctl`.

---

## ⚙️ Example `systemd` Service File

Create `/etc/systemd/system/rogue-node.service`:

```ini
[Unit]
Description=Rogue Signal Core Blockchain Node
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=rogue
Group=rogue
WorkingDirectory=/var/lib/rogue
ExecStart=/usr/local/bin/core-rogue \
  --rogue \
  --datadir /var/lib/rogue/data \
  --http \
  --http.addr 127.0.0.1 \
  --http.port 38845 \
  --http.api eth,net,web3,rogue \
  --port 38888 \
  --maxpeers 50 \
  --metrics

# Optional: inject dynamic bootnodes via environment variable (comma-separated enodes)
# Environment="ROGUE_BOOTNODES=enode://<pubkey1>@<ip1>:38888,enode://<pubkey2>@<ip2>:38888,enode://<pubkey3>@<ip3>:38888"

Restart=always
RestartSec=10
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

---

## 🚀 Enabling and Starting the Service

Reload `systemd` daemon, enable automatic start at boot, and launch the service:

```bash
# Reload systemd configuration
sudo systemctl daemon-reload

# Enable service at system startup
sudo systemctl enable rogue-node

# Start the node
sudo systemctl start rogue-node

# Inspect live logs
sudo journalctl -u rogue-node -f
```

---

## 🌐 P2P Bootnodes & Dynamic Peer Discovery

Rogue Signal (`core-rogue`) supports dynamic bootnode injection so networks can be bootstrapped cleanly during development and multi-VPS staging before mainnet bootnodes are hardcoded into `params.RogueBootnodes`.

### Resolution Priority

When `--rogue` is enabled, `core-rogue` resolves bootstrap nodes in the following order:

1. **`--bootnodes` CLI flag** (highest priority; overrides all other sources).
2. **`ROGUE_BOOTNODES` environment variable** (comma-separated `enode://` URLs; evaluated dynamically when `--bootnodes` is omitted).
3. **`params.RogueBootnodes`** (compiled mainnet bootnodes; empty during pre-mainnet development).
4. **Manual / Static Peers** (`<datadir>/geth/static-nodes.json` or `admin.addPeer(...)` over IPC).

### Development & Multi-Validator Bootstrap (`ROGUE_BOOTNODES`)

During pre-launch development, `params.RogueBootnodes` is intentionally kept empty. To enforce anti-eclipse protection (`defaultMinSyncPeers = 3`) and continuous **ECBP-1100 (MESS)** artificial finality (`minArtificialFinalityPeers = 3`), production topologies should deploy **at least 3 initial validator/seed nodes** on separate VPS instances.

1. **Retrieve each validator's enode URL** via IPC:
   ```bash
   ./build/bin/core-rogue attach /var/lib/rogue/data/geth.ipc --exec "admin.nodeInfo.enode"
   ```
2. **Inject the bootnode list dynamically** via `ROGUE_BOOTNODES`:
   ```bash
   ROGUE_BOOTNODES="enode://<pubkey1>@<vps1-ip>:38888,enode://<pubkey2>@<vps2-ip>:38888,enode://<pubkey3>@<vps3-ip>:38888" \
     ./build/bin/core-rogue --rogue --datadir /var/lib/rogue/data --port 38888 --http --http.port 38845
   ```

:::note Small Testnet Topologies (< 3 Peers)
If you run an isolated 1-node or 2-node local testnet, initial sync still proceeds via the 10-second `forceSyncCycle` ticker, while `minArtificialFinalityPeers = 3` ensures full MESS re-activation threshold once 3+ peers are connected.
:::

---

## 🛡️ Protocol Hardening & EVM Profile (Block 0)

`RogueChainConfig` activates a hardened, modern EVM baseline from Block 0 while preserving legacy-only (`Type 0`) transaction simplicity and predictable gas fees:

* **Berlin & London Security EIPs:** `EIP-2565` (ModExp), `EIP-2929` (cold/warm state access gas repricing against I/O DoS on 50M gas blocks), `EIP-3529` (gas refund cap), and `EIP-3541` (rejection of `0xEF` contract bytecode).
* **Shanghai & Cancun Opcodes:** `EIP-3651` (Warm `COINBASE`), `EIP-3855` (`PUSH0`), `EIP-3860` (initcode size limit & metering), `EIP-6049`, `EIP-5656` (`MCOPY`), and `EIP-1153` (`TSTORE`/`TLOAD`).
* **TxPool & RPC Anti-DoS:** `TxPool` bounded to `3072` global slots / `1024` queue (~128 MB max RAM cap), `PriceLimit = 1 GWei`, and configurable per-IP HTTP/WebSocket concurrency limiting (`--http.maxconnsperip`, default `100`, returning `HTTP 429` with `Retry-After: 1`).
* **Reverse Proxy Hardening (`--http.trustedproxies`):** Fail-closed by default (uses direct peer IP). When deployed behind Nginx, Caddy, Traefik, or Cloudflare, configure `--http.trustedproxies "127.0.0.1/32"` (or your proxy CIDRs) to extract the real client IP via the **Rightmost Untrusted IP** algorithm on `X-Forwarded-For` (with `X-Real-IP` fallback), preventing header-spoofing bypasses.
* **Batch Header Verification Cache:** `MaxResolvedSeedCache = 2048` (~80 KB RAM) prevents LRU thrashing during parallel `VerifyHeaders` sync batches.
