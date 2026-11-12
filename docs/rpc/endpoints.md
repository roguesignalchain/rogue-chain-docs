---
title: JSON-RPC API Reference
description: Complete reference for standard Ethereum and RandomX RPC endpoints.
---

# JSON-RPC API Reference

The `core-rogue` node exposes a fully compliant **Ethereum JSON-RPC 2.0** API over HTTP (`http://127.0.0.1:8545`) and WebSocket (`ws://127.0.0.1:8546`).

---

## 🔌 Standard Network Endpoints

### `eth_chainId`
Returns the network's chain ID in hexadecimal format (`0xc3537` = `800055`).

#### Request
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  http://127.0.0.1:8545
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0xc3537"
}
```

---

### `eth_blockNumber`
Returns the current highest synced block number in hexadecimal.

#### Request
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://127.0.0.1:8545
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x4b20"
}
```

---

### `eth_getBalance`
Returns the balance of the given account in Wei.

#### Request
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x4290352A98018e61294F9c2794D0A50F59530590", "latest"],"id":1}' \
  http://127.0.0.1:8545
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x6f05b59d3b20000"
}
```

---

### `net_peerCount`
Returns the number of active P2P peers connected to your node.

#### Request
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  http://127.0.0.1:8545
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x12"
}
```

---

## ⚡ RandomX Consensus & Mining Endpoints (`randomx_*`)

The RandomX consensus engine exposes dedicated diagnostic and control methods under both the `randomx` and `eth` namespaces. Note that external pool/work RPCs (`eth_getWork`, `eth_submitWork`, `eth_submitHashrate`) are permanently disabled by design to enforce full-node solo mining.

### `randomx_getConsensusStatus`
Returns live consensus parameters, current block height, active difficulty, block reward breakdown (`25 ROGUE`: `23.75` miner / `1.25` treasury), halving countdown, VM pool telemetry (`vmPool`), and active anti-51% security defenses (`ECBP-1100 (MESS)`).

#### Request
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"randomx_getConsensusStatus","params":[],"id":1}' \
  http://127.0.0.1:8545
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "algorithm": "RandomX (rx/0)",
    "targetBlockTime": 30,
    "lwmaWindow": 60,
    "mtpWindow": 11,
    "maxFutureDrift": 30,
    "maxExtraDataSize": 64,
    "finalityMode": "ECBP-1100 (MESS)",
    "messActive": true,
    "unclesAllowed": false,
    "remoteMiningAllowed": false,
    "currentBlock": 120,
    "currentEra": 0,
    "halvingInterval": 2000000,
    "blocksUntilHalving": 1999880,
    "blockRewardWei": "25000000000000000000",
    "minerRewardWei": "23750000000000000000",
    "treasuryRewardWei": "1250000000000000000",
    "treasuryAddress": "0xe9aae535b7971a9ac8c6af0e4b524d02260d3a03",
    "fastMode": false,
    "localHashrate": 1450,
    "vmPool": {
      "totalVMs": 2,
      "activeVMs": 0,
      "mode": "light",
      "allocatedMemoryMB": 256
    }
  }
}
```

---

### `randomx_getEpochInfo`
Returns the current RandomX seed epoch metadata, seed block height (`E * 2048 - 64`), active 256-bit seed hash, and next epoch precomputation window (`SeedLag = 64` blocks).

#### Request
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"randomx_getEpochInfo","params":[],"id":1}' \
  http://127.0.0.1:8545
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "blockNumber": 120,
    "epoch": 0,
    "epochLength": 2048,
    "seedLag": 64,
    "seedBlock": 0,
    "seedHash": "0xf30f172028b07950de58d2cb4d65593793c183fcd0f86c9c24c5d4a037b490b7",
    "nextEpochBlock": 2048,
    "blocksRemaining": 1928,
    "nextSeedBlock": 1984,
    "nextSeedReady": false,
    "fastMode": false
  }
}
```

---

### `randomx_getHashrate` / `randomx_setFastMode` / `randomx_getFastMode`
* `randomx_getHashrate`: Returns the node's internal RandomX CPU mining rate in hashes per second (`uint64`).
* `randomx_setFastMode(bool)`: Toggles between **Light Mode** (~256 MiB cache) and **Fast Mode** (~2080 MiB RAM dataset) for the next initialized RandomX context.
* `randomx_getFastMode()`: Returns `true` if Fast Mode is enabled.

---

## 🎮 Protocol Gamification Endpoints (`rogue_`)

The `rogue` namespace exposes on-chain miner status, levels, titles, and XP calculations backed directly by the `StateDB` under system address `0x0000000000000000000000000000000000000020`.

### `rogue_getMinerLevel`
Returns the numeric rank level (from `0` to `6`) for any queried address.

#### Request
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"rogue_getMinerLevel","params":["0x2fB9D05d39A1eE37Fce2F00964D3B00C0a8677c7"],"id":1}' \
  http://127.0.0.1:8545
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": 1
}
```

---

### `rogue_getMinerStats`
Returns the complete on-chain gamification record, title, XP, and level progress.

#### Request
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"rogue_getMinerStats","params":["0x2fB9D05d39A1eE37Fce2F00964D3B00C0a8677c7"],"id":1}' \
  http://127.0.0.1:8545
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "address": "0x2fb9d05d39a1ee37fce2f00964d3b00c0a8677c7",
    "blocksMined": 14,
    "level": 1,
    "title": "Recon Runner",
    "currentXP": 14,
    "nextLevelXP": 25,
    "progressPercent": 54.17
  }
}
```

#### Progression Tiers Table

| Medal | Level | Title | Blocks Mined | Target XP |
|:---:|---|---|---|---|
| <img src="/img/badges/lvl0.png" width="56" height="56" className="badge-img zoomable" alt="Level 0 - Unranked Runner" title="Click to view large" /> | **0** | *Unranked Runner* | 0 | 1 |
| <img src="/img/badges/lvl1.png" width="56" height="56" className="badge-img zoomable" alt="Level 1 - Recon Runner" title="Click to view large" /> | **1** | *Recon Runner* | 1 – 24 | 25 |
| <img src="/img/badges/lvl2.png" width="56" height="56" className="badge-img zoomable" alt="Level 2 - Signal Scraper" title="Click to view large" /> | **2** | *Signal Scraper* | 25 – 99 | 100 |
| <img src="/img/badges/lvl3.png" width="56" height="56" className="badge-img zoomable" alt="Level 3 - Hash Warden" title="Click to view large" /> | **3** | *Hash Warden* | 100 – 499 | 500 |
| <img src="/img/badges/lvl4.png" width="56" height="56" className="badge-img zoomable" alt="Level 4 - Cipher Architect" title="Click to view large" /> | **4** | *Cipher Architect* | 500 – 2,499 | 2,500 |
| <img src="/img/badges/lvl5.png" width="56" height="56" className="badge-img zoomable" alt="Level 5 - Apex Operator" title="Click to view large" /> | **5** | *Apex Operator* | 2,500 – 9,999 | 10,000 |
| <img src="/img/badges/lvl6.png" width="56" height="56" className="badge-img zoomable" alt="Level 6 - Rogue Singularity" title="Click to view large" /> | **6** | *Rogue Singularity* | 10,000+ | 10,000 (Max) |

:::tip
Click on any medal thumbnail to view it in full high resolution.
:::

