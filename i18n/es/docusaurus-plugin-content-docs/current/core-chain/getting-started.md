---
title: Primeros Pasos con el Nodo Core
description: Guía rápida para ejecutar el demonio rogue-core-chain.
---

# Primeros Pasos con el Nodo Core

El ejecutable **`rogue-core-chain`** (`core-rogue`) es el software principal para operar un nodo en la red Rogue Signal. Derivado de Core-Geth e integrado con librerías estáticas C++ de RandomX, gestiona la red P2P, la validación del consenso, la ejecución de transacciones y el servicio JSON-RPC.

---

## 💻 Requisitos del Sistema

### Hardware Recomendado
* **CPU:** Procesador moderno de 64 bits multi-núcleo (Intel Core 10ª gen+ o AMD Ryzen 3000+ con soporte para AVX2 y AES-NI)
* **RAM:** 8 GB DDR4/DDR5 (16 GB recomendados si se ejecuta el dataset de minería activo)
* **Almacenamiento:** 200 GB+ SSD NVMe
* **Conexión:** Red de banda ancha estable (10+ Mbps)
* **SO:** Linux (Ubuntu 22.04+ / Debian 12+), macOS (Apple Silicon o Intel) o Windows 10/11 (64 bits)

---

## 🚀 Ejecución del Nodo

Una vez compilado o descargado desde las releases oficiales, puedes iniciar el nodo con el siguiente comando:

```bash
# Iniciar el nodo conectado a la red principal de Rogue Signal
./build/bin/core-rogue --rogue --http --http.api "eth,net,web3,miner,randomx"
```

### Opciones de Línea de Comandos Principales

| Flag | Función | Predeterminado |
| :--- | :--- | :--- |
| `--rogue` | Activa las reglas de consenso y el bloque génesis de Rogue Signal | Requerido |
| `--datadir <ruta>` | Especifica el directorio de datos de la cadena | `~/.ethereum/rogue` |
| `--http` | Habilita el servidor HTTP-RPC | `false` |
| `--http.addr <ip>` | Interfaz de escucha para HTTP-RPC | `127.0.0.1` |
| `--http.port <puerto>`| Puerto de escucha HTTP-RPC | `8545` |
| `--http.api <apis>` | APIs expuestas separadas por comas (`eth,net,web3,miner,randomx`) | `eth,net,web3` |
| `--ws` | Habilita el servidor WebSocket RPC | `false` |
| `--ws.port <puerto>` | Puerto de escucha para WebSocket | `8546` |
| `--port <puerto>` | Puerto de escucha P2P de la red | `30303` |

---

## 🔍 Comprobación del Estado de Sincronización

Puedes comprobar si tu nodo ya está al día con la red ejecutando una llamada JSON-RPC mediante `curl`:

```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
  http://127.0.0.1:8545
```

* Si el nodo está totalmente sincronizado, responderá `false`.
* Si está descargando bloques, devolverá un objeto con `startingBlock`, `currentBlock` y `highestBlock`.
