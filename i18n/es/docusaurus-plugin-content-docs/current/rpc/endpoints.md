---
title: Referencia de la API JSON-RPC
description: Especificación completa de los métodos estándar de Ethereum y RandomX.
---

# Referencia de la API JSON-RPC

El nodo `core-rogue` expone una interfaz **JSON-RPC 2.0** totalmente compatible con Ethereum sobre HTTP (puerto estandarizado `38845`, p. ej. `http://127.0.0.1:38845`) y WebSocket (`ws://127.0.0.1:38846`).

:::info Seguridad RPC y Limitación de Tasa
* **Solo Transacciones Heredadas:** `eth_sendRawTransaction` únicamente acepta transacciones Legacy (`Type 0`) en Rogue Signal; las transacciones tipadas (EIP-1559 / EIP-2930 / EIP-4844) son rechazadas.
* **Límite de Conexiones por IP:** El servidor RPC HTTP/WS aplica un límite de **100 peticiones concurrentes por IP** (`HTTP 429 Too Many Requests`).
* **Namespace `randomx` Protegido:** `randomx` está deshabilitado en los módulos públicos HTTP/WS por defecto (`eth,net,web3,rogue`) para evitar DoS de memoria sin autenticación mediante `randomx_setFastMode`. Usa `rogue_getConsensusStatus` por HTTP, o conéctate vía IPC local (`geth.ipc`) para administración con `randomx_*`.
:::

---

## 🔌 Métodos Principales de la Red

### `eth_chainId`
Devuelve el identificador único de la cadena en formato hexadecimal (`0xc3537` = `800055`).

#### Petición
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  http://127.0.0.1:38845
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
  http://127.0.0.1:38845
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
  http://127.0.0.1:38845
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
  http://127.0.0.1:38845
```

#### Respuesta
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x12"
}
```

---

## ⚡ Métodos de Consenso y Minería RandomX (`randomx_*`)

El motor de consenso RandomX expone métodos dedicados de diagnóstico y control bajo los namespaces `randomx` y `eth`. Nota: los métodos RPC de minería externa (`eth_getWork`, `eth_submitWork`, `eth_submitHashrate`) están deshabilitados permanentemente por diseño para garantizar la minería exclusiva con nodo completo.

### `randomx_getConsensusStatus`
Devuelve en tiempo real los parámetros de consenso, altura de bloque actual, dificultad activa, desglose de recompensa (`25 ROGUE`: `23.75` minero / `1.25` tesorería), cuenta regresiva para el halving, telemetría del pool de VMs (`vmPool`) y defensas Anti-51% activas (`ECBP-1100 (MESS)`).

#### Petición
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"randomx_getConsensusStatus","params":[],"id":1}' \
  http://127.0.0.1:38845
```

#### Respuesta
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
Devuelve los metadatos de la época de semilla RandomX actual, el bloque semilla (`E * 2048 - 64`), el hash de semilla activo de 256 bits y la ventana de precomputación de la siguiente época (`SeedLag = 64` bloques).

#### Petición
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"randomx_getEpochInfo","params":[],"id":1}' \
  http://127.0.0.1:38845
```

#### Respuesta
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
    "seedHash": "0xde4c5e747fbb072d39db2ece5a245e46b6164045e166301dfdba78f86cfbe4dd",
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
* `randomx_getHashrate`: Devuelve la tasa de hash interna del minero RandomX del nodo en hashes por segundo (`uint64`).
* `randomx_setFastMode(bool)`: Alterna entre **Light Mode** (~256 MiB en caché) y **Fast Mode** (~2080 MiB de dataset en RAM) para el siguiente contexto RandomX inicializado.
* `randomx_getFastMode()`: Devuelve `true` si el modo rápido está habilitado.

---

## 🏆 Reputación de Mineros On-Chain (`RogueMinerReputation` en `0x...0020`)

Los rangos, XP, progreso (`progressBps`), títulos localizados (`en`, `es`, `zh`) y URIs de medallas se sirven directamente on-chain desde el contrato de sistema `RogueMinerReputation` desplegado en el Bloque 0 (`0x0000000000000000000000000000000000000020`). El namespace legado `rogue_*` fue retirado en favor de `eth_call` estándar y composabilidad EVM mediante `STATICCALL`.

Para telemetría pública de consenso, usa `randomx_getConsensusStatus` (o `eth_call` contra `0x...0020` para reputación PoW).

### Consulta con Foundry `cast` (`eth_call`)

```bash
# Obtener nivel numérico (0..6)
cast call 0x0000000000000000000000000000000000000020 \
  "getMinerLevel(address)(uint32)" \
  0x2fB9D05d39A1eE37Fce2F00964D3B00C0a8677c7 \
  --rpc-url http://127.0.0.1:38845

# Obtener estadísticas completas localizadas ("en", "es", "zh")
cast call 0x0000000000000000000000000000000000000020 \
  "getMinerStats(address,string)((uint256,uint32,string,string,uint256,uint256,uint16))" \
  0x2fB9D05d39A1eE37Fce2F00964D3B00C0a8677c7 "es" \
  --rpc-url http://127.0.0.1:38845

# Comprobar elegibilidad de rango
cast call 0x0000000000000000000000000000000000000020 \
  "meetsLevel(address,uint32)(bool)" \
  0x2fB9D05d39A1eE37Fce2F00964D3B00C0a8677c7 3 \
  --rpc-url http://127.0.0.1:38845
```

### Consulta desde Contratos Inteligentes (`STATICCALL`)

```solidity
import {IRogueMinerReputation} from "./interfaces/IRogueMinerReputation.sol";

contract MinerGatedService {
    IRogueMinerReputation constant REPUTATION =
        IRogueMinerReputation(0x0000000000000000000000000000000000000020);

    function accessTieredFeature(address miner) external view returns (bool) {
        return REPUTATION.meetsLevel(miner, 3); // Requiere Hash Warden (100+ bloques)
    }
}
```

### Consulta desde TypeScript (`viem`)

```ts
const stats = await publicClient.readContract({
  address: "0x0000000000000000000000000000000000000020",
  abi: rogueReputationAbi,
  functionName: "getMinerStats",
  args: [minerAddress, "es"],
});
```

#### Tabla de Rangos y Medallas de Progresión

| Medalla | Nivel | Título | Bloques Minados | XP Objetivo |
|:---:|---|---|---|---|
| <img src="/img/badges/lvl0.png" width="56" height="56" className="badge-img zoomable" alt="Nivel 0 - Unranked Runner" title="Haz clic para ver en grande" /> | **0** | *Unranked Runner* | 0 | 1 |
| <img src="/img/badges/lvl1.png" width="56" height="56" className="badge-img zoomable" alt="Nivel 1 - Recon Runner" title="Haz clic para ver en grande" /> | **1** | *Recon Runner* | 1 – 24 | 25 |
| <img src="/img/badges/lvl2.png" width="56" height="56" className="badge-img zoomable" alt="Nivel 2 - Signal Scraper" title="Haz clic para ver en grande" /> | **2** | *Signal Scraper* | 25 – 99 | 100 |
| <img src="/img/badges/lvl3.png" width="56" height="56" className="badge-img zoomable" alt="Nivel 3 - Hash Warden" title="Haz clic para ver en grande" /> | **3** | *Hash Warden* | 100 – 499 | 500 |
| <img src="/img/badges/lvl4.png" width="56" height="56" className="badge-img zoomable" alt="Nivel 4 - Cipher Architect" title="Haz clic para ver en grande" /> | **4** | *Cipher Architect* | 500 – 2,499 | 2,500 |
| <img src="/img/badges/lvl5.png" width="56" height="56" className="badge-img zoomable" alt="Nivel 5 - Apex Operator" title="Haz clic para ver en grande" /> | **5** | *Apex Operator* | 2,500 – 9,999 | 10,000 |
| <img src="/img/badges/lvl6.png" width="56" height="56" className="badge-img zoomable" alt="Nivel 6 - Rogue Singularity" title="Haz clic para ver en grande" /> | **6** | *Rogue Singularity* | 10,000+ | 10,000 (Máx) |

:::tip
Haz clic en cualquier miniatura de medalla para verla en resolución completa ultra nítida.
:::

