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
Returns live consensus parameters, current block height, active difficulty, block reward breakdown (`24 ROGUE`: `22.8` miner / `1.2` treasury), halving countdown, and active anti-51% security defenses (`MaxReorgDepth = 90`, `ECBP-1100 MESS`).

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
    "blockNumber": 120,
    "currentDifficulty": "68420",
    "targetBlockTime": 30,
    "lwmaWindow": 60,
    "mtpWindow": 11,
    "maxFutureDrift": 15,
    "maxReorgDepth": 90,
    "maxExtraDataSize": 64,
    "messEnabled": true,
    "halvingInterval": 2100000,
    "currentEra": 0,
    "nextHalvingBlock": 2100000,
    "blocksUntilHalving": 2099880,
    "baseRewardWei": "24000000000000000000",
    "minerRewardWei": "22800000000000000000",
    "treasuryRewardWei": "1200000000000000000",
    "treasuryAddress": "0xe9aae535b7971a9ac8c6af0e4b524d02260d3a03",
    "fastMode": false,
    "hashrate": 1450
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
    "seedHash": "0xc6f7f29d6a23f1921f3e514401a82a60ffa1f21885497dbf6414e8bb2f22b91d",
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
