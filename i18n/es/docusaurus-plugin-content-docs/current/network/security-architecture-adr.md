---
title: Arquitectura de Seguridad y ADRs
description: Arquitectura integral de seguridad de consenso, defensas Anti-51% y Registro de Decisiones de Diseño (ADR-001 a ADR-006) de Rogue Signal.
---

# Arquitectura de Seguridad de Consenso y ADRs

Este documento constituye la referencia oficial de ingeniería, seguridad y criptoeconomía (Architecture Decision Records — ADR) de **Rogue Signal (Chain ID `800055`)**. Documenta en detalle todas las capas de protección del protocolo implementadas en `rogue-core-chain` y `rogue-desktop-client`, los vectores de ataque mitigados, las alternativas de diseño evaluadas y la justificación matemática y física de cada regla de consenso.

---

## 1. Matriz Maestra de Especificaciones de Red y Seguridad

| Parámetro | Especificación Oficial | Módulo en Código | Propósito Técnico y de Seguridad |
| :--- | :--- | :--- | :--- |
| **Nombre de la Red** | `Rogue Signal` | `params/config_rogue.go` | Red principal EVM Proof-of-Work de Capa 1 |
| **Ticker** | `ROGUE` | Todo el ecosistema | Moneda nativa (`18` decimales, `10^18 wei`) |
| **Chain ID / Network ID** | `800055` (`0xc3537`) | `params/config_rogue.go` | Protección estricta anti-Replay (`EIP-155` desde el Bloque 0) |
| **Algoritmo PoW** | `RandomX (rx/0)` | `consensus/randomx/` | Resistencia a ASICs y GPUs mediante ejecución en CPU y caché L3 |
| **Tiempo Objetivo de Bloque (`T`)** | `30 segundos` | `DefaultTargetBlockTime` (`difficulty.go`) | Minimiza bloques huérfanos (`< 0.5%`) en enlaces domésticos sin Uncles |
| **Recompensa Base Inicial** | `24 ROGUE` | `InitialBaseReward` (`rewards.go`) | Escalada `3x` para bloques de 30s preservando la curva bianual |
| **Distribución de Recompensa** | `95% Minero / 5% Tesorería` | `SplitReward` (`rewards.go`) | `22.8 ROGUE` al minero / `1.2 ROGUE` al fondo de desarrollo del protocolo |
| **Intervalo de Halving** | `2,100,000 bloques` (~2 años) | `HalvingInterval` (`rewards.go`) | Reducción a la mitad cada `2,100,000 * 30s` (~729.16 días) |
| **Suministro Máximo (Hard Cap)** | `100,000,000 ROGUE` (100.8M exacto) | `MaxSupplyCap` (`rewards.go`) | Techo estricto en 32 eras (`MaxHalvingEras = 32`), cero tail emission |
| **Ajuste de Dificultad (DAA)** | `LWMA-1 (N = 60)` | `CalculateDifficulty` (`difficulty.go`) | Ventana móvil ponderada de 60 bloques (~30 min), clamp `+-33%` por bloque |
| **Dificultad Mínima / Génesis** | `0x10000` (`65,536`) | `MinDifficulty` (`difficulty.go`) | Arranque fluido para CPUs domésticas (~2.1 KH/s) |
| **Regla Temporal Pasada** | `MTP-11 Estricto` | `CalculateMTP11` (`difficulty.go`) | `header.Time > Mediana(últimos 11 bloques)` |
| **Deriva Temporal Futura Máxima** | `15 segundos` | `MaxFutureDrift` (`difficulty.go`) | `header.Time <= time.Now() + 15s` |
| **Defensa Anti-51% (Capa 1)** | `MaxReorgDepth = 90 bloques` | `MaxRogueReorgDepth` (`forkchoice.go`) | Finalidad rodante dura (~45 min); rechaza reorganizaciones profundas |
| **Defensa Anti-51% (Capa 2)** | `ECBP-1100 (MESS)` desde Bloque 0 | `ECBP1100FBlock = 0` (`blockchain_af.go`) | Penalización polinómica exigiendo hasta `31x` TD a cadenas secretas |
| **Anti-Selfish Mining (Capa 3)** | `Desempate Eyal-Sirer` | `ReorgNeeded` (`forkchoice.go`) | Preserva bloque local o desempata con `crypto/rand` (50/50) |
| **Política de Bloques Uncle** | `Prohibidos (ErrUnclesNotAllowed)` | `VerifyUncles` (`randomx.go`) | Modelo Bitcoin puro; elimina vectores de Uncle Grinding |
| **Rotación de Semilla RandomX** | `2048 bloques` (~17.07 horas) | `EpochLength` (`epoch.go`) | Época estándar `rx/0` con `SeedLag = 64` bloques (~32 min precomputación) |
| **Tamaño Máximo de `ExtraData`** | `64 bytes` | `MaxExtraDataSize` (`randomx.go`) | Permite etiquetas descriptivas e impide ataques de Header Bloat DoS |
| **Límite de Gas por Bloque** | `60,000,000 gas` (`0x3938700`) | `genesis_rogue.go` / `miner.go` | Alta capacidad EVM por cada bloque de 30 segundos |
| **Modelo de Comisiones EVM** | `PoW Clásico (100% al Minero)` | `config_rogue.go` / `ethconfig` | Sin quema EIP-1559; las comisiones sostienen a los mineros a largo plazo |
| **Precio Mínimo de Gas (TxPool)** | `1 Gwei` (`10^9 wei`) | `eth/ethconfig/config.go` | Protección anti-spam de transacciones gratuitas en el mempool P2P |
| **Hash del Bloque Génesis (Bloque 0)** | `0xc6f7f29d6a23f1921f3e514401a82a60ffa1f21885497dbf6414e8bb2f22b91d` | `RogueGenesisHash` (`genesis_rogue.go`) | Fijado en `RequireBlockHashes[0]` para aislamiento criptográfico P2P |
| **Inscripción del Bloque Génesis** | `ROGUE::800055 // THE_SILICON_BELONGS_TO_THE_MANY // 09.11.26` | `genesis.json` / `genesis_rogue.go` | Inscripción fundacional de 60 bytes grabada en el Bloque 0 |

---

## 2. Registro de Decisiones de Diseño (ADRs)

### ADR-001: Aumento del Tiempo Objetivo de Bloque de 10s a 30s y Escalado Monetario

#### Contexto y Problema
En una red Proof-of-Work global que aplica un árbol de bloques estricto estilo Bitcoin (**cero bloques Uncle/Ommer permitidos**, `ErrUnclesNotAllowed`), el hallazgo de bloques sigue un proceso de Poisson sin memoria donde la probabilidad de encontrar un bloque en menos de `tau` segundos es:

```text
P(delta_t < tau) = 1 - exp(-tau / T)
```

* Con `T = 10 segundos`, el **18.1%** de los bloques se descubren en `< 2 segundos` y el **9.5%** en `< 1 segundo`.
* Dado que la propagación P2P intercontinental sumada a la verificación CGo de RandomX (~15-25 ms por salto en Light Mode) y la ejecución de estado EVM requiere entre `300 ms` y `1.5 segundos`, un intervalo de 10 segundos sin recompensas Uncle genera colisiones frecuentes (*bloques huérfanos*). Esto penaliza desproporcionadamente a los mineros domésticos frente a nodos en centros de datos de baja latencia.

#### Decisión Adoptada
1. **Aumentar `DefaultTargetBlockTime` de `10` a `30` segundos** en `consensus/randomx/difficulty.go`:
   * Con `T = 30s`, la probabilidad de colisión en `< 1s` cae del `9.5%` al **`3.2%`**, reduciendo la tasa global de bloques huérfanos a **`< 0.5%`**.
2. **Escalado Monetario Proporcional (`3x`)** en `consensus/randomx/rewards.go`:
   * **Recompensa Base Inicial (`InitialBaseReward`)**: Sube de `8 ROGUE` a **`24 ROGUE`** por bloque (`22.8 ROGUE` para el minero [95%] y `1.2 ROGUE` para la tesorería del protocolo [5%]).
   * **Intervalo de Halving (`HalvingInterval`)**: Se ajusta de `6,300,000` bloques a **`2,100,000` bloques** (~2 años exactos a 30s/bloque: `2,100,000 * 30s = 63,000,000 segundos` ~ `729.16 días`).
   * **Invarianza del Suministro Total**:
     ```text
     Suministro Total = sum_{k=0..31} (24 / 2^k) * 2,100,000 = 100,800,000 ROGUE (100M Hard Cap)
     ```
     El calendario bianual de halvings y el suministro máximo de ~100M ROGUE permanecen 100% invariantes.

---

### ADR-002: Arquitectura Anti-Monopolio y Anti-Sybil — Por Qué se Adoptó el Estándar Puro Probado frente a Reglas de Enfriamiento (Cooldown) Artificiales

#### Contexto y Alternativas Evaluadas
Se analizó si el protocolo debía imponer un tope de hashrate por máquina o una regla de enfriamiento por dirección (`Coinbase Cooldown`) acompañada de un requisito de antigüedad (`Bond Anti-Sybil / Historical Lookback`) para evitar que máquinas potentes acaparen la minería.

Se evaluaron en detalle tres diseños alternativos antes de tomar la decisión arquitectónica final:

1. **Alternativa Evaluada A — Enfriamiento Duro por Ventana Deslizante (`Coinbase Cooldown`)**:
   * *Concepto*: Rechazar en `VerifyHeader` cualquier bloque cuya dirección `header.Coinbase` ya hubiera minado `>= 2` bloques en los últimos `10` bloques (con válvula de escape tras 90s de inactividad) y pausar automáticamente el minero local durante el enfriamiento.
   * *Razón de Descarte*: Dado que PoW es un proceso de Poisson sin memoria, incluso en una red con 10 mineros domésticos idénticos, un minero honesto encuentra naturalmente 3 bloques consecutivos por pura varianza estadística. Pausar su CPU o rechazar bloques válidos desperdicia seguridad termodinámica honesta, retrasa o retiene rendimientos legítimos e introduce casos borde de vivacidad (*liveness*).
2. **Alternativa Evaluada B — Cuota de Antigüedad por Mirada Histórica de Cabeceras (`Header-Lookback`) y Auto-Bonding sin Saldo Previo**:
   * *Interrogante Explorada*: ¿Cómo podría exigirse antigüedad o garantía Anti-Sybil si los nuevos mineros entran a la red con saldo `0 ROGUE`?
   * *Mecanismos Evaluados*:
     * **Antigüedad por Cabeceras (`[N-100, N-11]`)**: En lugar de exigir saldo previo en el `StateDB` (lo cual rompe el *Header Sync* sin estado e impone una barrera de entrada imposible para usuarios nuevos), una dirección adquiere estatus de "Cuenta con Antigüedad" automáticamente tras minar 1 solo bloque que madure más allá de 10 bloques (`[N-100, N-11]`). Las direcciones nuevas (`0 ROGUE`) tienen permitido minar hasta el `50%` de cualquier ventana de 10 bloques (`MaxFreshMinerBlocksInWindow = 5`) tras un arranque inicial de 50 bloques, mientras las cuentas con antigüedad compiten por el 100% de los bloques bajo el enfriamiento por dirección.
     * **Auto-Bonding en Protocolo**: Retener automáticamente una fracción del primer bloque minado en el contrato de bóveda durante `FinalizeAndAssemble`.
   * *Razón de Descarte*: Aunque la mirada histórica `[N-100, N-11]` resuelve limpiamente el problema del saldo cero sin tocar el `StateDB`, cualquier cuota artificial sobre direcciones nuevas sigue estrangulando la producción de bloques cuando se incorporan oleadas legítimas de nuevos mineros domésticos.
3. **Alternativa Evaluada C — Amortiguación Suave de Dificultad por Minero**:
   * *Concepto*: Incrementar un `+10%` la dificultad objetivo para una dirección `Coinbase` que repita bloques dentro de una ventana corta.
   * *Razón de Descarte*: Los operadores avanzados eluden trivialmente el recargo rotando direcciones de su billetera HD, penalizando únicamente al usuario doméstico que mina hacia una sola dirección fija.

#### Decisión Adoptada: El Estándar Puro Probado (Descentralización Física y de Protocolo en 4 Capas)
Siguiendo los estándares probados en combate de **Monero, Bitcoin y Ethereum Classic**, **se eliminaron todas las pausas artificiales y restricciones de rendimiento** (cada bloque PoW válido recibe el 100% de su recompensa de inmediato y el usuario puede asignar libremente el 100% de los hilos de su CPU). En su lugar, las granjas de servidores y el hardware especializado quedan neutralizados mediante **4 barreras estructurales**:

1. **Cuello de Botella Físico de Caché L3 en RandomX (`rx/0`)**: Cada hilo de minería exige **2 MiB de caché L3 exclusiva en la CPU** y acceso aleatorio constante a un **dataset de 2080 MiB en RAM**. Los ASICs no pueden sintetizar código máquina dinámico aleatorio, las GPUs sufren penalizaciones severas por divergencia de ramificación, y los servidores multi-socket ven limitada su eficiencia por el ancho de banda del bus de memoria.
2. **Eliminación Total de Stratum y RPCs de Minería Remota (`eth_getWork` Deshabilitado)**: En `consensus/randomx/api.go`, el puente Stratum y los métodos `eth_getWork`, `eth_submitWork` y `eth_submitHashrate` están deshabilitados permanentemente. Una granja no puede conectar 500 workers ligeros (`XMRig`) a un solo nodo central: **cada máquina que mine debe ejecutar un nodo EVM completo sincronizado (`core-rogue`)** con su propia base de datos y su propio dataset RandomX en memoria.
3. **Intervalo de Bloque de 30 Segundos**: Elimina la ventaja de latencia P2P de la fibra óptica de centros de datos frente a conexiones domésticas.
4. **LWMA-1 (`N=60`) + ECBP-1100 (MESS) + `MaxReorgDepth = 90`**: Neutraliza ataques del 51% con CPUs alquiladas en la nube y ataques de *coin-hopping*.

---

### ADR-003: Defensa Anti-51% de Tres Capas (`MaxReorgDepth = 90` + `ECBP-1100 MESS` + Anti-Selfish Mining)

#### Contexto y Problema
Las redes PoW jóvenes minadas por CPU enfrentan la amenaza de que un atacante alquile servidores en la nube durante una hora, mine una bifurcación privada en aislamiento (*Secret Shadow Chain*) y la transmita de golpe para ejecutar una reorganización profunda (*Long-Range 51% Attack / Doble Gasto*).

#### Decisión Adoptada
Implementamos una **Defensa de Elección de Bifurcación (Fork-Choice) de Tres Capas Activa desde el Bloque 0** en `core/forkchoice.go`, `core/blockchain.go` y `params/config_rogue.go`:

1. **Capa 1 — Finalidad Rodante Dura (`MaxRogueReorgDepth = 90` bloques en `core/forkchoice.go`)**:
   * Antes de aceptar cualquier reorganización de cadena en RandomX, `ForkChoice.ReorgNeeded` calcula la profundidad de retroceso desde la cabeza canónica actual (`current`) hasta el ancestro común (`commonHeader`):
     ```text
     reorgDepth = current.Number - commonHeader.Number
     ```
   * Si `reorgDepth > 90` bloques (~45 minutos a 30s/bloque), la reorganización es **rechazada incondicionalmente**, sin importar la dificultad total de la cadena atacante.
   * La sincronización normal hacia adelante tiene `commonHeader == current` (`reorgDepth == 0`) y jamás se ve afectada.
2. **Capa 2 — Penalización Exponencial Subjetiva (`ECBP-1100 MESS` en `core/blockchain_af.go`)**:
   * Activada desde el Bloque 0 (`ECBP1100FBlock = 0` en `RogueChainConfig` y habilitada por defecto en `NewBlockChain`).
   * Para bifurcaciones de profundidad `1..90`, MESS aplica un multiplicador de gravedad polinómico cúbico basado en la antigüedad del ancestro común (`delta_t = current.Time - commonAncestor.Time`), exigiendo que una cadena secreta acumule hasta **`31x` la dificultad de la subcadena local** para ser aceptada.
3. **Capa 3 — Desempate Anti-Selfish Mining (Regla Eyal-Sirer en `core/forkchoice.go`)**:
   * Cuando `externTd == localTD`, el nodo preserva su propio bloque minado localmente (`currentPreserve`) o desempata entre bloques externos mediante selección aleatoria criptográfica 50/50 (`crypto/rand`).

---

### ADR-004: Defensas contra Time-Warp, Manipulación de Dificultad Propia y Flash-Mining

1. **Independencia del Timestamp Candidato en `LWMA-1`**:
   * En `consensus/randomx/difficulty.go`, `CalculateDifficulty(chain, time, parent)` calcula la dificultad del bloque `N` exclusivamente a partir de los bloques históricos cerrados `[N-k .. N-1]`. Un minero no puede manipular el `header.Time` de su bloque candidato para reducir su propia dificultad.
2. **Acotamiento de Solvetime y Clamping por Bloque (`+-33%`)**:
   * Los tiempos de resolución individuales en la ventana LWMA-1 de 60 bloques se acotan a `[1s, 6 * T = 180s]`, y el cambio de dificultad por bloque se restringe entre el **`67%`** (`MaxClampDownFactor`) y el **`133%`** (`MaxClampUpFactor`) de `parent.Difficulty`.
3. **Regla Estricta `MTP-11` + `15s` de Deriva Futura Máxima + Alineación en `Prepare()`**:
   * `VerifyHeaderTime` exige `header.Time > CalculateMTP11(chain, parent)` y `header.Time <= now + 15`.
   * En `RandomX.Prepare` (`consensus/randomx/randomx.go`), si marcas de tiempo desordenadas en los últimos 11 bloques provocan que `header.Time <= CalculateMTP11(chain, parent)`, `Prepare` adelanta automáticamente `header.Time = mtp + 1` para que el minero local jamás selle un bloque que viole `ErrOlderBlockTime`.

---

### ADR-005: Seguridad de Memoria CGo, Invalidación de Semilla ante Reorgs y `VerifyHeaders` Paralelo en Dos Fases

1. **Corrección del Bug CGo `Use-After-Free` en `RxContext.CalculateHash` (`consensus/randomx/rx_cgo.go`)**:
   * `ctx.mu.RLock()` se mantiene activo mediante `defer ctx.mu.RUnlock()` durante toda la ejecución de `CalculateHash`, impidiendo que `ctx.Close()` libere la memoria C++ del dataset/cache mientras algún hilo continúa calculando un hash.
2. **Validación Cruzada Canónica de Semilla ante Reorgs en `EpochManager.GetSeed` (`consensus/randomx/epoch.go`)**:
   * `GetSeed` verifica que la semilla en caché para la época `E` coincida con el hash canónico actual en `SeedBlockNumber(E) = E * 2048 - 64`. Si una reorganización legítima modifica el bloque semilla, el contexto obsoleto se cierra y reconstruye automáticamente.
3. **Precomputación de Dataset Amigable con la CPU (`NewFastDataset`)**:
   * La inicialización del dataset de 2080 MiB utiliza `max(1, runtime.NumCPU() / 2)` goroutines para que la precomputación en segundo plano durante la ventana `SeedLag` de 64 bloques (~32 minutos) deje libre el 50% de la CPU para la red P2P y el minado activo.
4. **`VerifyHeaders` Paralelo Fail-Fast en Dos Fases y `MaxExtraDataSize = 64` Bytes**:
   * **Fase 1 (Fail-Fast en microsegundos)**: Valida las reglas ligeras (`len(header.Extra) <= 64`, `MTP-11 + 15s drift`, dificultad `LWMA-1`, `GasUsed <= GasLimit`) antes de invocar CGo.
   * **Fase 2 (Pool Paralelo de Workers)**: Distribuye `VerifySeal` entre `runtime.NumCPU()` goroutines en paralelo, acelerando la sincronización inicial de cabeceras y mitigando ataques DoS de agotamiento de CPU.

---

### ADR-006: Anclaje Génesis P2P, Protección Anti-Spam del Mempool y Blindaje RPC en Desktop

1. **Anclaje Criptográfico del Bloque Génesis (`RequireBlockHashes[0]`)**:
   * El Bloque 0 (timestamp `1762711936` / `0x6910d980`, inscripción `"ROGUE::800055 // THE_SILICON_BELONGS_TO_THE_MANY // 09.11.26"`) produce el hash canónico:
     ```text
     0xc6f7f29d6a23f1921f3e514401a82a60ffa1f21885497dbf6414e8bb2f22b91d
     ```
   * Anclado en `RogueChainConfig.RequireBlockHashes[0]` (`params/config_rogue.go`).
2. **Suelo Anti-Spam del Mempool (`TxPool`)**:
   * `TxPool.PriceLimit` y el `GasPrice` del minero se fijan por defecto en **`1 Gwei` (`10^9 wei`)** con `GasCeil = 60,000,000` (`eth/ethconfig/config.go`, `miner/miner.go`).
3. **Blindaje RPC y CORS en `rogue-desktop-client`**:
   * En `rogue-desktop-client/src-tauri/src/process_manager.rs`, `--http.corsdomain` y `--ws.origins` se restringen a `tauri://localhost,http://tauri.localhost,http://localhost:1420,http://127.0.0.1:1420` y se elimina el módulo legado `personal`.
4. **Diagnóstico de Consenso en Tiempo Real vía RPC**:
   * Se añadieron `randomx_getEpochInfo` y `randomx_getConsensusStatus` (`consensus/randomx/api.go`) exponiendo métricas en vivo de consenso, época, recompensas y finalidad.

