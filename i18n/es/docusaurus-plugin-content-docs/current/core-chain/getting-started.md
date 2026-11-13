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
# 1. Inicializar el estado génesis (inicialización headless sin fricción para Rogue Signal)
./build/bin/core-rogue --rogue --datadir ~/.ethereum/rogue init

# 2. Iniciar el nodo conectado a Rogue Signal usando los puertos estandarizados
./build/bin/core-rogue --rogue \
  --datadir ~/.ethereum/rogue \
  --port 38888 \
  --http --http.port 38845 --http.api "eth,net,web3,rogue"
```

### Opciones de Línea de Comandos Principales

| Flag | Función | Estándar Rogue Signal / Predeterminado |
| :--- | :--- | :--- |
| `--rogue` | Activa las reglas de consenso y el bloque génesis de Rogue Signal | Requerido |
| `--datadir <ruta>` | Especifica el directorio de datos de la cadena | `~/.ethereum/rogue` |
| `--port <puerto>` | Puerto de escucha P2P de la red | `38888` (genérico por defecto: `30303`) |
| `--bootnodes <enodes>` | URLs `enode://` separadas por comas (sobrescribe la variable `ROGUE_BOOTNODES`) | `ROGUE_BOOTNODES` / `params.RogueBootnodes` |
| `--http` | Habilita el servidor HTTP-RPC | `false` |
| `--http.addr <ip>` | Interfaz de escucha para HTTP-RPC | `127.0.0.1` |
| `--http.port <puerto>`| Puerto de escucha HTTP-RPC | `38845` (genérico por defecto: `8545`) |
| `--http.api <apis>` | Lista de APIs habilitadas separadas por comas (`eth,net,web3,rogue`) | `eth,net,web3,rogue` |
| `--ws` | Habilita el servidor WebSocket RPC | `false` |
| `--ws.port <puerto>` | Puerto de escucha para WebSocket | `38846` (genérico por defecto: `8546`) |
| `--mine` | Habilita la minería interna de CPU RandomX | `false` |
| `--randomx.fast` | Habilita Fast Mode (~2.08 GB de dataset) cuando `--mine` está activo | `false` (Light Mode ~256 MB) |

:::tip Bootnodes Dinámicos y Seguridad
* **Bootnodes Dinámicos:** Mientras `RogueBootnodes` esté vacío durante el desarrollo, puedes inyectar bootnodes mediante la variable de entorno `ROGUE_BOOTNODES` o `--bootnodes`. Consulta [Configuración del Nodo y Bootnodes](./configuration.md) para más detalles.
* **Endurecimiento RPC:** El namespace administrativo `randomx` (por ejemplo, `randomx_setFastMode`) está excluido de los módulos HTTP/WS por defecto para evitar DoS de asignación de memoria sin autenticación. Usa IPC local (`geth.ipc`) para llamadas administrativas, o consulta `rogue_getConsensusStatus` por HTTP.
:::

---

## 🔍 Comprobación del Estado de Sincronización

Puedes comprobar si tu nodo ya está al día con la red ejecutando una llamada JSON-RPC mediante `curl`:

```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
  http://127.0.0.1:38845
```

* Si el nodo está totalmente sincronizado, responderá `false`.
* Si está descargando bloques, devolverá un objeto con `startingBlock`, `currentBlock` y `highestBlock`.
