---
title: Minería con RandomX en CPU
description: Guía completa para minar ROGUE utilizando procesadores comerciales y RandomX.
---

# Minería con RandomX en CPU

La minería en **Rogue Signal** se sustenta en **RandomX** (`rx/0`), el algoritmo de referencia contra la centralización por ASICs. Al utilizar instrucciones y operaciones similares a las que ejecutan los ordenadores convencionales, los fabricantes de hardware especializado no pueden obtener ventajas desproporcionadas frente a las CPUs de consumo.

---

## ⛏️ Minería en Solitario con `core-rogue`

Puedes minar directamente desde el propio nodo hacia tu dirección:

```bash
./build/bin/core-rogue \
  --rogue \
  --mine \
  --miner.threads 8 \
  --miner.etherbase 0xTuDireccionRogueAqui
```

### Parámetros de Minado
* `--mine`: Activa los hilos de cálculo de minería RandomX internos.
* `--miner.threads <N>`: Asigna la cantidad de hilos de CPU dedicados al cálculo (100% configurable por el usuario; el punto óptimo de eficiencia es `Caché L3 (MiB) / 2`).
* `--miner.etherbase <0x...>`: Dirección de destino donde se depositarán las recompensas de bloque (**22.8 ROGUE** por bloque + 100% de las comisiones de gas del bloque).

---

## 💻 Minería Visual con Rogue Desktop Client

Si prefieres una experiencia gráfica:

1. Abre **Rogue Desktop Client**.
2. Ve a la pestaña **Miner**.
3. Selecciona la cantidad de núcleos con la barra deslizante y activa **Fast Mode (2080 MiB RAM)** si tu equipo dispone de memoria suficiente.
4. Pulsa **Start Mining**.
5. Podrás ver en tiempo real tu velocidad de cálculo (H/s), hashes completados y bloques minados.

---

## 🛡️ Arquitectura Anti-Granjas: Solo Minería con Nodo Completo (Sin Stratum / Sin `eth_getWork`)

Para proteger la descentralización de la red e impedir que granjas industriales o botnets conecten cientos de workers ligeros sin estado (`XMRig`) a un único servidor central:

* **Puentes Stratum Externos y `eth_getWork` Deshabilitados:** Los métodos RPC `eth_getWork`, `eth_submitWork` y `eth_submitHashrate` están deshabilitados permanentemente en la capa de consenso (`consensus/randomx/api.go`).
* **1 Nodo = 1 Minero Independiente:** Cada máquina que participe en el Proof-of-Work debe ejecutar un nodo EVM completo y sincronizado (`core-rogue`) con su propia base de datos de estado y su propio dataset RandomX de 2080 MiB en RAM.
* **Cero Penalizaciones Artificiales de Rendimiento:** Cada bloque PoW válido recibe el 100% de su emisión de **24 ROGUE** (`22.8 ROGUE` para el minero y `1.2 ROGUE` para la tesorería del protocolo) de forma inmediata.
