---
sidebar_position: 4
title: Guía de Minería CPU RandomX
description: Guía completa para minar ROGUE en solitario con CPUs de consumo usando RandomX (rx/0) mediante core-rogue CLI o Rogue Desktop Client.
---

# Guía de Minería CPU RandomX

La minería en **Rogue Signal** está basada en **RandomX (`rx/0`)**, un algoritmo Proof-of-Work resistente a ASIC diseñado para ejecutar secuencias aleatorias de instrucciones en CPUs de propósito general. Debido a que RandomX depende de la predicción de saltos de la CPU, unidades de punto flotante, caché L3 y memoria del sistema de alto ancho de banda, los ASICs y GPUs especializados no pueden lograr ventajas significativas de eficiencia frente a procesadores convencionales.

---

## 🛡️ Arquitectura Anti-Granja: Solo Minería en Solitario con Nodo Completo

Para proteger la descentralización de la red y evitar que granjas industriales de minería o botnets apunten miles de trabajadores sin estado (`XMRig`) a un único nodo:

* **Los Puentes Stratum Externos y `eth_getWork` Están Permanentemente Deshabilitados:** Los métodos RPC `eth_getWork`, `eth_submitWork` y `eth_submitHashrate` están deshabilitados en la capa de consenso (`consensus/randomx/api.go`).
* **1 Nodo = 1 Minero Independiente:** Cada máquina que participa en Proof-of-Work debe ejecutar un nodo `core-rogue` completamente sincronizado con su propio estado EVM y su propio contexto de memoria RandomX.
* **Distribución de Recompensa por Bloque:** Cada bloque válido minado acuña **25 ROGUE** (`23.75 ROGUE` / 95% al `etherbase` del minero + `1.25 ROGUE` / 5% a la Tesorería del Protocolo) más el **100% de las comisiones de transacción del bloque** para el minero.

---

## 💻 Opción 1: Minería Gráfica con Rogue Desktop Client

Para usuarios que prefieren una interfaz gráfica:

1. Abre **Rogue Desktop Client** y asegúrate de que tu billetera esté creada o desbloqueada.
2. Espera a que el estado del nodo en la barra lateral muestre pares conectados y `100%` de sincronización.
3. Ve a la pestaña **Mining**.
4. Haz clic en **Check System Resources** (opcional) para inspeccionar tus núcleos lógicos de CPU y RAM disponible.
5. Elige tu perfil de memoria:
   * **Modo Ligero (~256 MiB RAM, Por Defecto):** Ideal para minería en segundo plano o sistemas con 4–8 GB de RAM.
   * **Modo Rápido (~2080 MiB RAM):** Asigna el dataset completo de RandomX de 2.08 GB para obtener el máximo hashrate de CPU. Recomendado para minería dedicada o sistemas con 16 GB+ de RAM.
6. Ajusta el control deslizante de **CPU Threads** (la eficiencia óptima suele ser `Caché L3 (MiB) / 2`).
7. Haz clic en **Start Mining**. El hashrate en vivo (`H/s`), estado activo y bloques descubiertos se actualizarán en tiempo real.

---

## ⛏️ Opción 2: Minería en Solitario por CLI con `core-rogue`

Para minar directamente desde la línea de comandos:

```bash
./core-rogue \
  --rogue \
  --datadir ~/.local/share/rogue-signal/chaindata \
  --syncmode full \
  --mine \
  --miner.threads 8 \
  --miner.etherbase 0xTuDireccionRogueAqui \
  --miner.extradata "mi-rig-01" \
  --randomx.fast
```

### Flags CLI de Minería

| Flag | Propósito | Notas |
| :--- | :--- | :--- |
| `--mine` | Activa el minero CPU RandomX interno | Requerido para minar |
| `--miner.threads <N>` | Número de hilos CPU dedicados al hashing | Óptimo: `Caché L3 (MiB) / 2` |
| `--miner.etherbase <0x...>` | Dirección de pago para `23.75 ROGUE` + comisiones | Si se omite, la minería inicia sin bloquearse, registra una breve advertencia y enruta el 95% de recompensa a la tesorería hasta que se configure vía `--miner.etherbase` o `miner_setEtherbase` |
| `--miner.extradata "<tag>"` | Etiqueta opcional del minero (máx. `64` bytes) | Garantiza objetivos `sealhash` distintos si ejecutas múltiples nodos independientes con el mismo `etherbase` |
| `--randomx.fast` | Activa el Modo Rápido (dataset de ~2.08 GB) | Omitir para Modo Ligero (~256 MB) |

:::tip Ejecutar Múltiples Mineros Independientes
Si ejecutas dos nodos completos separados en máquinas distintas pagando al mismo `--miner.etherbase`, asigna a cada nodo una cadena `--miner.extradata` única (ej. `"rig-alpha"`, `"rig-beta"`) para que no dupliquen trabajo idéntico de `sealhash`.
:::

---

## 🧠 Comportamiento de Memoria y Concurrencia

* **RAM Cero-Redundancia en Modo Rápido:** Una vez inicializado el `FastDataset` de ~2.08 GB para una época, la `LightCache` temporal de 256 MB se libera inmediatamente, ahorrando 256 MB por contexto de época.
* **Caché de Contextos Acotada:** `EpochManager` conserva hasta `3` contextos en Modo Ligero (~768 MB máx.) y limita `FastMode` a `2` contextos (`MaxCachedContextsFast = 2`, ~4.16 GB máx. durante transiciones de semilla de 64 bloques) para evitar picos OOM (Out of Memory).
* **Sellado Asíncrono No Bloqueante:** `Seal()` ejecuta la inicialización del contexto de época y `PrewarmVMs` en paralelo de forma asíncrona para que el worker de minería nunca se bloquee en transiciones de época o señales de apagado.
* **Fallback ante W^X / Kernel:** Si el kernel del host restringe la ejecución de memoria JIT (`RANDOMX_FLAG_JIT`), `core-rogue` registra una advertencia clara y degrada suavemente a `RANDOMX_FLAG_SECURE` o modo intérprete.

---

## 🔗 Siguientes Pasos

* Maximiza el hashrate de tu CPU habilitando Huge Pages del sistema operativo: [Huge Pages y Optimización de CPU](./hugepages-tuning.md).
* Sigue tu rango de minero on-chain y progresión de XP (`Unranked Runner` → `Rogue Singularity`) en el Dashboard del Cliente Desktop o mediante [JSON-RPC y `RogueMinerReputation`](../rpc/endpoints.md).

