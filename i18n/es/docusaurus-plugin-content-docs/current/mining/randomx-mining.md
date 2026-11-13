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
  --miner.etherbase 0xTuDireccionRogueAqui \
  --miner.extradata "miner-tag"
```

### Parámetros de Minado
* `--mine`: Activa los hilos de cálculo de minería RandomX internos.
* `--miner.threads <N>`: Asigna la cantidad de hilos de CPU dedicados al cálculo (100% configurable por el usuario; el punto óptimo de eficiencia es `Caché L3 (MiB) / 2`).
* `--miner.etherbase <0x...>`: Dirección de destino donde se depositarán todas las recompensas de bloque (**23.75 ROGUE** por bloque + 100% de las comisiones de transacciones del bloque). *(Opcional para inicio rápido: si se omite, la minería comienza sin bloquearse, registra una única advertencia breve y dirige la recompensa del 95% del minero a la tesorería del protocolo hasta que se configure una dirección mediante `--miner.etherbase` o `miner_setEtherbase`.)*
* `--miner.extradata "<tag>"`: Identificador opcional del minero (hasta 64 bytes) para asegurar objetivos `sealhash` distintos al ejecutar múltiples mineros.

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
* **Cero Penalizaciones Artificiales de Rendimiento:** Cada bloque PoW válido recibe el 100% de su emisión de **25 ROGUE** (`23.75 ROGUE` para el minero y `1.25 ROGUE` para la tesorería del protocolo) de forma inmediata.

---

## 🧠 Endurecimiento de Memoria y Concurrencia

* **RAM en Fast Mode sin Redundancia:** Una vez inicializado el `FastDataset` de ~2.08 GB para una época, la `LightCache` temporal de 256 MB se libera de inmediato, ahorrando 256 MB por contexto de época.
* **Caché de Contextos Acotada:** `EpochManager` retiene hasta `3` contextos en Light Mode (~768 MB máx.) y limita `FastMode` a `2` contextos (`MaxCachedContextsFast = 2`, ~4.16 GB máx. durante transiciones de semilla de 64 bloques) para evitar picos OOM.
* **Sellado Asíncrono No Bloqueante:** `Seal()` ejecuta la inicialización del contexto de época y `PrewarmVMs` en paralelo de forma asíncrona dentro de la goroutine de sellado, de modo que `miner/worker` nunca se bloquea en transiciones de época o señales `stop`.
* **Visibilidad de Fallback W^X / Kernel:** Si el kernel del sistema bloquea JIT (`RANDOMX_FLAG_JIT`), `core-rogue` registra una advertencia clara y degrada de forma controlada a `RANDOMX_FLAG_SECURE` o modo intérprete manteniendo en caché los flags efectivos.
