---
title: Parámetros de Consenso y LWMA-1
description: Reglas matemáticas, ajuste de dificultad y modelo de emisión de ROGUE.
---

# Parámetros de Consenso y LWMA-1

Rogue Signal incorpora un motor de consenso diseñado para evitar manipulaciones de marcas temporales, ataques de retención de bloques y oscilaciones extremas de dificultad.

---

## 📐 Ajuste de Dificultad: LWMA-1

A diferencia de las ventanas estáticas de 2016 bloques de Bitcoin o las bombas de dificultad históricas de Ethereum, Rogue Signal ajusta su objetivo de dificultad en **cada bloque individual** mediante el algoritmo **LWMA-1** (Linearly Weighted Moving Average) con una ventana de `N = 60`:

```text
Nuevo Objetivo = (Objetivo Promedio * sum(i * delta_t_i)) / (0.5 * N * (N + 1) * T)
```

Donde:
* `N = 60` (Cantidad de bloques previos evaluados, ventana de ~30 minutos)
* `T = 30s` (Tiempo objetivo de confirmación por bloque)
* `delta_t_i = clamp(t_i - t_{i-1}, 1s, 6*T)` (Diferencias de tiempo acotadas entre `1s` y `180s`)
* El ajuste de dificultad por bloque se restringe entre el `67%` (`MaxClampDownFactor`) y el `133%` (`MaxClampUpFactor`) respecto a `parent.Difficulty`.

### Ventajas de LWMA-1
* **Independencia del Timestamp Candidato:** La dificultad del bloque `N` se calcula exclusivamente a partir de los bloques cerrados (`N-k .. N-1`). Un minero no puede manipular el `header.Time` de su propio bloque candidato para reducir su dificultad.
* **Verificación Determinista de Ancestros:** Si falta algún bloque ancestro intermedio en la ventana de observación de LWMA-1, el motor rechaza deterministamente la verificación con `consensus.ErrUnknownAncestor` en lugar de caer en fallbacks con dificultades desactualizadas.
* **Respuesta ágil:** Se equilibra suavemente ante incrementos o caídas repentinas de mineros.
* **Inmunidad ante ataques de alquiler y flash-mining:** La potencia alquilada temporalmente no puede hundir artificialmente la dificultad antes de desconectarse.

---

## ⏱️ Reglas Estrictas de Marcas de Tiempo y Cabeceras

Para proteger la red frente a ataques time-warp, manipulación de dificultad y cabeceras infladas:

1. **MTP-11 (Past Median Time):**
   * El tiempo del bloque `H` debe ser estrictamente mayor que la mediana de los 11 bloques anteriores (`H-11` a `H-1`). Al ensamblar un bloque local (`Prepare`), si marcas de tiempo desordenadas hacen que `parent.Time + 1 <= MTP-11`, el nodo adelanta automáticamente `header.Time = MTP-11 + 1`.
2. **Límite de Deriva Futura:**
   * La marca de tiempo de un bloque candidato no puede superar en más de **30 segundos** el reloj local del nodo receptor. Si el desfase es mayor, el bloque es descartado.
3. **Límite `ExtraData` (`64 bytes`) y Verificación Paralela en Dos Fases:**
   * `header.Extra` está limitado estrictamente a `64 bytes` (`MaxExtraDataSize`). `VerifyHeaders` valida las reglas ligeras en microsegundos antes de distribuir `VerifySeal` entre `runtime.NumCPU()` workers en paralelo.
4. **Prohibición Estricta de Bloques Tío (`UncleHash == EmptyUncleHash`):**
   * `header.UncleHash` debe ser exactamente igual a `types.EmptyUncleHash`. Rogue Signal adopta el modelo estricto de árbol simple de Bitcoin (`ErrUnclesNotAllowed`), eliminando vectores de maleabilidad y grinding de tíos.

---

## 🛡️ Finalidad Anti-51%

1. **ECBP-1100 (MESS) desde el Bloque 0:**
   * Las bifurcaciones secretas tardías enfrentan una curva de gravedad polinómica cúbica que exige hasta **`31x` la dificultad de la subcadena local**.
   * Calibrado con un **intervalo de seguridad de 15 minutos** (`artificialFinalitySafetyInterval = 900s`, equivalente a 30 bloques $\times$ 30s) para evitar falsas detecciones de cadenas obsoletas durante la varianza normal del PoW.
2. **Desempate Anti-Selfish Mining:**
   * En empates de dificultad total, el nodo preserva su bloque minado localmente o desempata entre bloques externos mediante selección aleatoria criptográfica 50/50 (`crypto/rand`).

---

## 💰 Modelo de Emisión y Halving

* **Recompensa Inicial:** 25 ROGUE por bloque
* **Frecuencia de Halving:** Cada 2,000,000 bloques (~1.90 años / ~694.44 días a 30s por bloque)
* **Porción del Minero (95%):** 23.75 ROGUE al inicio (+ 100% de las comisiones de gas del bloque)
* **Porción de Tesorería (5%):** 1.25 ROGUE al inicio
* **Límite Total de Emisión:** 100,000,000 ROGUE (límite matemático exacto en 32 eras de halving: `25 * 2,000,000 * 2 = 100,000,000 ROGUE`, cero tail emission). En el bloque final de cada era de halving (`blockNumber % 2,000,000 == 0`), se suma `EraRemainderWei` (`727,595,761,750,000` wei) para compensar el truncamiento de desplazamiento de bits entero, de modo que el suministro acumulado sea exactamente `100,000,000.000000000000000000 ROGUE` al wei exacto.
* **Formato de Transacciones:** Transacciones heredadas (`Type 0`) con protección estricta contra repetición EIP-155 desde el Bloque 0 (las transacciones tipadas EIP-2718/1559/2930/4844 son rechazadas).

---

import BadgeGallery from '@site/src/components/BadgeGallery';

## 🏆 Gamificación a Nivel de Protocolo y Niveles de Mineros

Para incentivar la minería en solitario sostenible y descentralizada sin alterar el límite monetario de la red ni la dificultad de consenso, Rogue Signal rastrea el conteo de bloques minados nativamente dentro del árbol de estado (*canonical state trie*):

* **Contrato de Sistema (`RogueMinerReputation`):** Desplegado de forma nativa en el Bloque 0 (`Genesis.Alloc`) en la dirección `0x0000000000000000000000000000000000000020` con `Nonce = 1` (sobreviviendo la poda de cuentas vacías de EIP-158) y propietario inicial `Ownable` configurado en `RogueTreasuryAddress` (`0xe9aaE535B7971A9AC8C6af0e4B524D02260D3a03`).
* **Persistencia de Estado:** Incrementado tras la finalización de cada bloque en `core/state_processor.go` usando el slot de almacenamiento `1` del `mapping(address => uint256)` de Solidity: `keccak256(abi.encode(miner, uint256(1)))`.
* **Única Fuente de Verdad:** Los rangos, umbrales, `progressBps`, títulos localizados (`en`, `es`, `zh`, ampliables por gobernanza) y URIs de medallas se calculan directamente on-chain por `RogueMinerReputation` y son legibles vía `eth_call` o `STATICCALL` desde cualquier contrato inteligente.
* **Seguridad ante Reorganizaciones Deterministas:** Las reorganizaciones de cadena bajo `ECBP-1100 (MESS)` revierten automáticamente los conteos de bloques de los mineros junto con los bloques de la cadena revertida.

### Galería de Rangos y Medallas

<BadgeGallery />

### Especificaciones de Progresión

| Medalla | Nivel | Título | Bloques Minados | XP Objetivo |
|:---:|---|---|---|---|
| <img src="/img/badges/lvl0.png" width="64" height="64" className="badge-img zoomable" alt="Nivel 0 - Unranked Runner" title="Haz clic para ver en grande" /> | **Nivel 0** | *Unranked Runner* | 0 | 1 |
| <img src="/img/badges/lvl1.png" width="64" height="64" className="badge-img zoomable" alt="Nivel 1 - Recon Runner" title="Haz clic para ver en grande" /> | **Nivel 1** | *Recon Runner* | 1 – 24 | 25 |
| <img src="/img/badges/lvl2.png" width="64" height="64" className="badge-img zoomable" alt="Nivel 2 - Signal Scraper" title="Haz clic para ver en grande" /> | **Nivel 2** | *Signal Scraper* | 25 – 99 | 100 |
| <img src="/img/badges/lvl3.png" width="64" height="64" className="badge-img zoomable" alt="Nivel 3 - Hash Warden" title="Haz clic para ver en grande" /> | **Nivel 3** | *Hash Warden* | 100 – 499 | 500 |
| <img src="/img/badges/lvl4.png" width="64" height="64" className="badge-img zoomable" alt="Nivel 4 - Cipher Architect" title="Haz clic para ver en grande" /> | **Nivel 4** | *Cipher Architect* | 500 – 2,499 | 2,500 |
| <img src="/img/badges/lvl5.png" width="64" height="64" className="badge-img zoomable" alt="Nivel 5 - Apex Operator" title="Haz clic para ver en grande" /> | **Nivel 5** | *Apex Operator* | 2,500 – 9,999 | 10,000 |
| <img src="/img/badges/lvl6.png" width="64" height="64" className="badge-img zoomable" alt="Nivel 6 - Rogue Singularity" title="Haz clic para ver en grande" /> | **Nivel 6** | *Rogue Singularity* | 10,000+ | 10,000 (Máx) |

:::tip ZOOM INTERACTIVO DE MEDALLAS
Haz clic en cualquier medalla de la galería o de la tabla para inspeccionarla en ultra-alta resolución, ver los requisitos del rango y su descripción cyberpunk.
:::
