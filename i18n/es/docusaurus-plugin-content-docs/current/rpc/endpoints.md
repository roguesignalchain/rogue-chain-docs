---
title: Referencia de la API JSON-RPC
description: Especificación completa de los métodos estándar de Ethereum y RandomX.
---

# Referencia de la API JSON-RPC

El nodo `core-rogue` expone una interfaz **JSON-RPC 2.0** compatible con Ethereum sobre HTTP (`http://127.0.0.1:8545`) y WebSocket (`ws://127.0.0.1:8546`).

---

## 🔌 Métodos Principales de la Red

### `eth_chainId`
Devuelve el identificador único de la cadena en formato hexadecimal (`0xc3537` = `800055`).

#### Petición
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  http://127.0.0.1:8545
```

#### Respuesta
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0xc3537"
}
```

---

### `eth_blockNumber`
Devuelve el número del bloque más reciente sincronizado en formato hexadecimal.

#### Petición
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://127.0.0.1:8545
```

#### Respuesta
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x4b20"
}
```

---

### `eth_getBalance`
Devuelve el saldo disponible en la dirección indicada expresado en Wei.

#### Petición
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x4290352A98018e61294F9c2794D0A50F59530590", "latest"],"id":1}' \
  http://127.0.0.1:8545
```

#### Respuesta
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x6f05b59d3b20000"
}
```

---

### `net_peerCount`
Devuelve el número de pares (peers) P2P conectados actualmente al nodo.

#### Petición
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  http://127.0.0.1:8545
```

#### Respuesta
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x12"
}
```
