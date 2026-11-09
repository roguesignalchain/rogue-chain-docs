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
