---
sidebar_position: 2
title: Devnets Locales, Clústeres Multi-Nodo y CLI
description: Referencia para desarrolladores de flags CLI de core-rogue, resolución de bootnodes, clústeres locales multi-nodo, administración IPC y endurecimiento del protocolo.
---

# Devnets Locales, Clústeres Multi-Nodo y CLI

Esta guía cubre operaciones avanzadas de la CLI de `core-rogue`, resolución dinámica de bootnodes, despliegue de clústeres locales multi-nodo para pruebas de consenso/finalidad y administración de nodos mediante IPC local.

---

## 📋 Referencia Completa de Flags CLI

| Flag | Valor por Defecto / Estándar | Descripción |
| :--- | :--- | :--- |
| `--rogue` | Requerido | Activa el génesis de la red Rogue Signal (`Chain ID 800055`), consenso RandomX, LWMA-1 y ECBP-1100 MESS. |
| `--datadir <ruta>` | `~/.ethereum/rogue` | Directorio de datos de la blockchain (`geth/chaindata` y `geth.ipc`). |
| `--port <puerto>` | `38888` | Puerto de escucha P2P TCP/UDP. |
| `--bootnodes <enodes>` | `ROGUE_BOOTNODES` / `params.RogueBootnodes` | URLs `enode://` separadas por comas (máxima prioridad). |
| `--syncmode <modo>` | `full` | Modo de sincronización. Usa siempre `full` para verificación completa de PoW RandomX. |
| `--cache <MB>` | `256` (o `1024`+) | Memoria (MiB) asignada a LevelDB y caché del trie de estado. |
| `--http` | `false` | Habilita el servidor HTTP JSON-RPC 2.0. |
| `--http.addr <ip>` | `127.0.0.1` | Interfaz de escucha para HTTP-RPC. |
| `--http.port <puerto>` | `38845` | Puerto de escucha para HTTP-RPC. |
| `--http.api <apis>` | `eth,net,web3,rogue` | Módulos RPC separados por comas expuestos por HTTP. |
| `--http.maxconnsperip <N>` | `100` | Límite de peticiones HTTP/WS concurrentes por IP (devuelve `HTTP 429` con `Retry-After: 1` al superarse). |
| `--http.trustedproxies <cidrs>` | *(fail-closed)* | CIDRs de proxies de confianza separados por comas (ej. `127.0.0.1/32`) para extraer la IP real del cliente detrás de Nginx/Caddy/Cloudflare mediante Rightmost Untrusted IP. |
| `--ws` | `false` | Habilita el servidor WebSocket JSON-RPC. |
| `--ws.port <puerto>` | `38846` | Puerto de escucha para WebSocket RPC. |
| `--authrpc.port <puerto>` | `8551` | Puerto interno AuthRPC (cámbialo por instancia al ejecutar múltiples nodos en un mismo host). |
| `--verbosity <0..5>` | `3` | Nivel de log (`0`=Silencioso, `1`=Error, `2`=Warn, `3`=Info, `4`=Debug, `5`=Trace). |
| `--mine` | `false` | Habilita el minero CPU RandomX interno. |
| `--miner.threads <N>` | Dependiente de CPU | Número de hilos de hashing RandomX. |
| `--miner.etherbase <0x...>` | *(fallback tesorería)* | Dirección de pago para el 95% de recompensa de bloque (`23.75 ROGUE`) + comisiones. |
| `--miner.extradata "<tag>"` | `""` | Etiqueta personalizada del minero (hasta `64` bytes) para diferenciar objetivos `sealhash`. |
| `--randomx.fast` | `false` | Asigna el dataset RandomX de Modo Rápido (~2.08 GB) (Modo Ligero ~256 MB si se omite). |

---

## 🌐 Prioridad de Resolución de Bootnodes

Cuando `--rogue` está activo, `core-rogue` resuelve los pares bootstrap en orden estricto:

1. **Flag CLI `--bootnodes`** — Máxima prioridad; sobrescribe todas las demás fuentes.
2. **Variable de entorno `ROGUE_BOOTNODES`** — URLs `enode://` separadas por comas evaluadas dinámicamente cuando se omite `--bootnodes`.
3. **`params.RogueBootnodes`** — Bootnodes compilados de mainnet (vacío intencionalmente durante el desarrollo pre-mainnet).
4. **Pares Estáticos / Manuales** — `<datadir>/geth/static-nodes.json` o `admin.addPeer(...)` por IPC.

---

## 🧪 Ejecutar un Clúster Local Multi-Nodo

Para aplicar protección anti-eclipse (`defaultMinSyncPeers = 3`) y finalidad artificial completa **ECBP-1100 (MESS)** (`minArtificialFinalityPeers = 3`), las topologías de staging y prueba deben ejecutar **al menos 3 nodos conectados**.

*(Nota: Las devnets locales aisladas de 1 o 2 nodos siguen sincronizando y minando bloques normalmente mediante el ticker `forceSyncCycle` de 10 segundos; MESS se reactiva automáticamente en cuanto se conectan 3+ pares.)*

### Ejemplo: Clúster Local de Pruebas de 3 Nodos

Al ejecutar múltiples nodos en la misma máquina, asigna valores únicos de `--datadir`, `--port`, `--http.port` y `--authrpc.port` para evitar colisiones de puertos:

#### 1. Inicializar los 3 Directorios de Datos
```bash
./build/bin/core-rogue --rogue --datadir ./nodes-local/node1 init
./build/bin/core-rogue --rogue --datadir ./nodes-local/node2 init
./build/bin/core-rogue --rogue --datadir ./nodes-local/node3 init
```

#### 2. Iniciar el Nodo 1 (Semilla / Minero)
```bash
./build/bin/core-rogue --rogue \
  --datadir ./nodes-local/node1 \
  --port 38888 \
  --http --http.port 38845 --http.api eth,net,web3,randomx \
  --authrpc.port 8551 \
  --mine --miner.threads 2 --miner.etherbase 0xTuDireccionDePrueba --miner.extradata "node-1"
```

#### 3. Obtener la URL `enode://` del Nodo 1 mediante IPC
```bash
./build/bin/core-rogue attach ./nodes-local/node1/geth.ipc --exec "admin.nodeInfo.enode"
```

#### 4. Iniciar el Nodo 2 y Nodo 3 Apuntando al Nodo 1
```bash
export ROGUE_BOOTNODES="enode://<node1-pubkey>@127.0.0.1:38888"

# Nodo 2
./build/bin/core-rogue --rogue \
  --datadir ./nodes-local/node2 \
  --port 38889 \
  --http --http.port 38847 --http.api eth,net,web3,randomx \
  --authrpc.port 8552

# Nodo 3
./build/bin/core-rogue --rogue \
  --datadir ./nodes-local/node3 \
  --port 38890 \
  --http --http.port 38849 --http.api eth,net,web3,randomx \
  --authrpc.port 8553
```

---

## 🔒 Consola Administrativa IPC (`geth.ipc`)

El namespace administrativo `randomx` (incluyendo `randomx_setFastMode`) y los controles `admin` / `miner` se excluyen intencionalmente de los módulos HTTP/WS públicos por defecto para evitar ataques DoS de asignación de memoria sin autenticar.

Usa IPC local (`<datadir>/geth.ipc`) para administración local de confianza:

```bash
# Adjuntar una consola JavaScript interactiva
./build/bin/core-rogue attach ~/.local/share/rogue-signal/chaindata/geth.ipc
```

Comandos IPC comunes:
```js
// Inspeccionar identidad del nodo y pares conectados
admin.nodeInfo.enode
admin.peers.length

// Establecer o actualizar dinámicamente la dirección de pago del minero
miner.setEtherbase("0xTuDireccionRogueAqui")

// Consultar telemetría en vivo del consenso RandomX y del pool de VMs
randomx.getConsensusStatus()

// Activar Modo Rápido (dataset de ~2.08 GB) para el siguiente contexto de época
randomx.setFastMode(true)
```

---

## 🌐 Endurecimiento con Reverse Proxy en Producción

Si expones el HTTP-RPC de un nodo detrás de **Nginx**, **Caddy**, **Traefik** o **Cloudflare**, mantén `--http.addr 127.0.0.1` y configura `--http.trustedproxies`:

```bash
./build/bin/core-rogue --rogue \
  --http --http.addr 127.0.0.1 --http.port 38845 \
  --http.trustedproxies "127.0.0.1/32" \
  --http.maxconnsperip 100
```

`core-rogue` falla de forma segura (fail-closed) por defecto usando la IP directa del socket y solo analiza `X-Forwarded-For` (mediante el algoritmo **Rightmost Untrusted IP**, con fallback a `X-Real-IP`) desde CIDRs de proxies explícitamente autorizados, evitando el bypass de límites de tasa mediante falsificación de cabeceras.

